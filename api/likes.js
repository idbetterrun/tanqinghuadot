const { kv } = require("@vercel/kv");

// 只允许「日期前缀 slug」,防止往 KV 写任意 key
const SLUG_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/;

module.exports = async function handler(req, res) {
  const slug = req.method === "POST"
    ? (req.body && req.body.slug)
    : (req.query && req.query.slug);

  if (!slug || !SLUG_RE.test(slug)) {
    return res.status(400).json({ error: "invalid slug" });
  }

  const key = "likes:" + slug;
  try {
    if (req.method === "POST") {
      const count = await kv.incr(key);
      return res.status(200).json({ count: count });
    }
    const count = (await kv.get(key)) || 0;
    return res.status(200).json({ count: count });
  } catch (e) {
    return res.status(500).json({ error: "kv error" });
  }
};
