const { Redis } = require("@upstash/redis");

// 复用 Vercel 注入的 KV_ 前缀变量(Upstash 库的 REST 凭证)
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// 只允许「日期前缀 slug」,防止往 KV 写任意 key
const SLUG_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;

// 合法 slug 必须是已发布的帖子(防止往 KV 写任意 key)
const POSTS = require("../talks/posts.json");
const VALID_SLUGS = new Set(POSTS.map(function (p) { return p.slug; }));

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const slug = req.method === "POST"
    ? (req.body && req.body.slug)
    : (req.query && req.query.slug);

  if (typeof slug !== "string" || !SLUG_RE.test(slug) || !VALID_SLUGS.has(slug)) {
    return res.status(400).json({ error: "invalid slug" });
  }

  const key = "likes:" + slug;
  try {
    if (req.method === "POST") {
      const count = await redis.incr(key);
      return res.status(200).json({ count: count });
    }
    const count = (await redis.get(key)) || 0;
    return res.status(200).json({ count: count });
  } catch (e) {
    console.error("[likes] kv error:", e);
    return res.status(500).json({ error: "kv error" });
  }
};
