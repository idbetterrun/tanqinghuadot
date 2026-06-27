# talks 板块 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在导航 works/contact 之间新增 talks 板块——列表页 + Markdown 详情页,支持产品 tag 筛选、双语、全局点赞、talks 专属 doodle 动画与星星拖拽彩蛋。

**Architecture:** 延续全站「纯静态 HTML + 浏览器端 fetch/渲染、无构建步骤」。帖子正文存为 `.zh.md`/`.en.md`,`posts.json` 当清单,详情页用一个模板 + `?p=<slug>` 查询参数(对外经 `vercel.json` 重写成漂亮 URL `/talks/<slug>`)。唯一的服务端是点赞:一个 Vercel Serverless Function + Upstash(Vercel KV)。

**Tech Stack:** 原生 HTML/CSS/ES5 风格 JS(同现有 `main.js`/`i18n.js`)、`marked`(本地 vendored 的 markdown 库)、`@vercel/kv`、Upstash Redis、Vercel rewrites。

**验证方式说明:** 仓库无单元测试框架,且站点靠浏览器实测验收。本计划每个任务用 `vercel dev`(本地同时跑静态页 + serverless function + vercel.json 重写)+ 浏览器 preview 验证;纯逻辑(点赞 API)用 `curl`。实现期用 `preview_*` 工具加载本地 URL 截图/查 console。

**spec:** [docs/superpowers/specs/2026-06-27-talks-section-design.md](../specs/2026-06-27-talks-section-design.md)

---

## 文件结构

| 文件 | 责任 | 动作 |
|---|---|---|
| `partials/nav.html` | 共享左列导航 | 改:加 talks 链接 |
| `js/main.js` | 共享行为 | 改:`markActive` 支持 `/talks/` 子页高亮 |
| `talks.html` | 列表页骨架 | 建 |
| `talks/detail.html` | 详情页模板 | 建 |
| `talks/posts.json` | 帖子清单(元数据 + 双语标题/摘要) | 建 |
| `talks/2026-06-28-what-is-talks.zh.md` / `.en.md` | 种子帖子正文 | 建 |
| `js/talks.js` | 列表渲染 + 详情渲染 + 点赞 + 星星拖拽 | 建(分任务逐步充实) |
| `js/vendor/marked.min.js` | markdown 库 | 建(vendored) |
| `api/likes.js` | 点赞读/写 serverless function | 建 |
| `vercel.json` | 漂亮 URL 重写 | 建 |
| `package.json` | 加 `@vercel/kv` 依赖 | 改 |
| `css/style.css` | talks 样式 + 动画 | 改(分任务追加段落) |
| `assets/doodles/talks-bagstars.png` | 已被拆分取代 | 删(Task 10) |

---

## Task 1: 导航加 talks + 子页高亮

**Files:**
- Modify: `partials/nav.html`
- Modify: `js/main.js`(`markActive` 函数,约 14-24 行)

- [ ] **Step 1: nav.html 在 works 和 contact 之间插入 talks 链接**

在 `partials/nav.html` 中 works 的 `</a>` 之后、contact 的 `<a>` 之前,插入:

```html
  <a href="/talks.html">
    talks
    <svg class="active-mark" viewBox="0 0 60 12" fill="none" aria-hidden="true">
      <path d="M2 6 Q10 1 18 6 T34 6 T50 6 T58 5" stroke="#FFC83D" stroke-width="3" stroke-linecap="round"/>
    </svg>
  </a>
```

- [ ] **Step 2: main.js 让 talks 详情子页高亮 talks 导航**

在 `js/main.js` 的 `markActive()` 内,把 `inWorks` 那段扩展。找到:

```js
    var inWorks = path.indexOf("/works/") !== -1;   // app 详情页

    document.querySelectorAll(".nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var hrefFile = href.split("/").pop();
      if (hrefFile === file || (inWorks && hrefFile === "works.html")) {
        a.classList.add("active");
      }
    });
```

替换为:

```js
    var inWorks = path.indexOf("/works/") !== -1;   // app 详情页
    var inTalks = path.indexOf("/talks/") !== -1;   // talks 详情页

    document.querySelectorAll(".nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var hrefFile = href.split("/").pop();
      if (hrefFile === file
          || (inWorks && hrefFile === "works.html")
          || (inTalks && hrefFile === "talks.html")) {
        a.classList.add("active");
      }
    });
```

- [ ] **Step 3: 验证(列表页骨架要 Task 3 才有,这里先验证导航不报错)**

启动本地服务:`vercel dev`(若未 link 过先 `vercel link` 选 tanqinghuadot)。访问 `http://localhost:3000/about.html`,确认导航现在多出 talks 一项、其它页正常(此时点 talks 会 404,正常)。

- [ ] **Step 4: Commit**

```bash
git add partials/nav.html js/main.js
git commit -m "feat(talks): 导航新增 talks 项 + 子页高亮"
```

---

## Task 2: 种子内容(清单 + 两篇 md)

**Files:**
- Create: `talks/posts.json`
- Create: `talks/2026-06-28-what-is-talks.zh.md`
- Create: `talks/2026-06-28-what-is-talks.en.md`

- [ ] **Step 1: 建 posts.json**

`talks/posts.json`:

```json
[
  {
    "slug": "2026-06-28-what-is-talks",
    "date": "2026-06-28",
    "tags": [],
    "title": {
      "zh": "talks 是什么",
      "en": "what talks is"
    },
    "summary": {
      "zh": "给我的小网站加了个博客角落——这是它的第一篇。",
      "en": "i gave my little site a blog-ish corner. this is its first note."
    }
  }
]
```

> 这篇是 talks 自我介绍,`tags` 为空——正好作为「无 tag 碎碎念」的样例(默认列表显示、任何产品 chip 都会把它筛掉)。

- [ ] **Step 2: 建中文正文 `talks/2026-06-28-what-is-talks.zh.md`**

```markdown
前几天做出了 notiee 1.0.5,想到没有什么地方能放 notiee 的更新日志,还有这几天状态不是这么好,想写点什么但是又不想放到社媒,于是就想到可以给我的小网站做一个博客类型的功能。所以,talks 出现了。

talks 以后会出现各种东西,包括但不限于某个 app 的更新日志或者是一些远期计划,亦或是我自己个人的一些思考和 idea 记录,也会有一些偏向强烈情感性的东西(当然如果比较负面,我会在点进详情页之前出现弹窗提示「此篇文章具有较强的负面情绪,可能会影响心情」之类巴拉巴拉的)。

最后也谢谢和感恩每个访问我的网站的人,谢谢你愿意了解我,了解我的不算很厉害的经历、不怎么惊艳的产品,还有我的普普通通小世界。

再次感谢。

idbetterrun
```

- [ ] **Step 3: 建英文正文 `talks/2026-06-28-what-is-talks.en.md`**

(英文按站点整体语气:全小写、温和、略自嘲)

```markdown
a few days ago i finished notiee 1.0.5, and realized there was nowhere to put its changelog. and lately i haven't been in great shape — i wanted to write something down, but didn't want to put it on social media. so it hit me that i could give my little site a blog-ish corner. and that's how talks came to be.

talks will hold all kinds of things from here on — changelogs for some app, longer-term plans, or just my own thoughts and stray ideas. some of it will lean more emotional, too (and if a piece runs pretty negative, i'll put up a little heads-up before you open it — something like "this one carries some heavy feelings, it might weigh on you," that sort of thing).

and finally, thank you — really — to everyone who stops by my site. thank you for wanting to know me: my not-so-impressive story, my not-so-dazzling little products, and my plain, ordinary little world.

thank you, again.

idbetterrun
```

- [ ] **Step 4: 验证 JSON 合法**

Run: `node -e "JSON.parse(require('fs').readFileSync('talks/posts.json','utf8')); console.log('posts.json OK')"`
Expected: 打印 `posts.json OK`

- [ ] **Step 5: Commit**

```bash
git add talks/posts.json talks/2026-06-28-what-is-talks.zh.md talks/2026-06-28-what-is-talks.en.md
git commit -m "feat(talks): 种子帖子「talks 是什么」(清单 + 中英 md)"
```

---

## Task 3: 列表页 + talks.js 列表渲染与筛选

**Files:**
- Create: `talks.html`
- Create: `js/talks.js`
- Modify: `css/style.css`(末尾追加 talks 列表样式)

- [ ] **Step 1: 建 talks.html**

`talks.html`(head 照搬现有页,额外加载 `/js/talks.js`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>talks — tanqinghua.</title>
  <link rel="icon" type="image/png" href="/assets/favicon/favicon-96x96.png" sizes="96x96">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg">
  <link rel="shortcut icon" href="/assets/favicon/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png">
  <link rel="manifest" href="/assets/favicon/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css?v=2">
  <script src="/js/i18n.js?v=2" defer></script>
  <script src="/js/main.js?v=2" defer></script>
  <script src="/js/talks.js?v=1" defer></script>
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <div class="page">
    <div id="nav-placeholder"></div>

    <main class="content">
      <div class="talks-filters" role="group" aria-label="filter by product">
        <button type="button" class="talks-chip" data-tag="notiee">notiee</button>
        <button type="button" class="talks-chip" data-tag="dreamland">dreamland</button>
        <button type="button" class="talks-chip" data-tag="artista">artista</button>
        <button type="button" class="talks-chip" data-tag="tomanotes">tomanotes</button>
      </div>
      <ul class="talks-list" data-talks-list></ul>
    </main>

    <div class="doodles talks-doodles" aria-hidden="true">
      <img class="doodle tree" src="/assets/doodles/talks-tree.png" alt="">
      <img class="doodle brid" src="/assets/doodles/talks-brid.png" alt="">
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 2: 建 js/talks.js(列表部分,含详情/点赞/星星留空待后续任务补)**

`js/talks.js`:

```js
/* talks. — 列表 + 详情 + 点赞 + 星星彩蛋
   纯静态:posts.json 当清单,正文 .zh.md / .en.md 运行时 fetch 渲染。
   依赖 window.I18N(语言)与 window.marked(详情页 markdown)。 */
(function () {
  "use strict";

  /* talks 专属动态文案(页面外壳走 i18n;这里只放列表/详情里 JS 生成的少量字) */
  var STR = {
    en: { empty: "nothing here yet." },
    zh: { empty: "这里还什么都没有。" }
  };
  function lang() { return (window.I18N && I18N.current) || "en"; }
  function t(k) { return (STR[lang()] || STR.en)[k]; }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }

  function fetchPosts() {
    return fetch("/talks/posts.json").then(function (r) { return r.json(); });
  }

  function byDateDesc(a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  }

  function fmtDate(iso, l) {
    var d = new Date(iso + "T00:00:00");
    if (l === "zh") {
      return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
    }
    var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return m[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  /* ---------- 列表页 ---------- */
  var listState = { posts: [], filter: null };

  function matches(post) {
    if (!listState.filter) return true;
    return (post.tags || []).indexOf(listState.filter) !== -1;
  }

  function renderList(listEl) {
    var l = lang();
    var items = listState.posts.filter(matches);
    if (!items.length) {
      listEl.innerHTML = '<li class="talks-empty">' + esc(t("empty")) + "</li>";
      return;
    }
    listEl.innerHTML = items.map(function (p) {
      var tags = (p.tags || []).map(function (tg) {
        return '<span class="talks-tag">' + esc(tg) + "</span>";
      }).join("");
      var summary = (p.summary && (p.summary[l] || p.summary.en)) || "";
      return '<li class="talks-item"><a class="talks-item-link" href="/talks/'
        + encodeURIComponent(p.slug) + '">'
        + '<span class="talks-item-date">' + esc(fmtDate(p.date, l)) + "</span>"
        + '<span class="talks-item-title">' + esc(p.title[l] || p.title.en) + "</span>"
        + '<span class="talks-item-summary">' + esc(summary) + "</span>"
        + '<span class="talks-item-tags">' + tags + "</span>"
        + "</a></li>";
    }).join("");
  }

  function bindChips(listEl) {
    document.querySelectorAll(".talks-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var tag = chip.getAttribute("data-tag");
        listState.filter = (listState.filter === tag) ? null : tag;
        document.querySelectorAll(".talks-chip").forEach(function (c) {
          c.classList.toggle("active", c.getAttribute("data-tag") === listState.filter);
        });
        renderList(listEl);
      });
    });
  }

  function initList(listEl) {
    fetchPosts().then(function (posts) {
      listState.posts = posts.slice().sort(byDateDesc);
      renderList(listEl);
      bindChips(listEl);
      document.addEventListener("langchange", function () { renderList(listEl); });
    });
  }

  /* ---------- 详情页(Task 4 填充) ---------- */
  function initDetail(root) { /* Task 4 */ }

  document.addEventListener("DOMContentLoaded", function () {
    var listEl = document.querySelector("[data-talks-list]");
    var detailEl = document.querySelector("[data-talks-detail]");
    if (listEl) initList(listEl);
    if (detailEl) initDetail(detailEl);
  });
})();
```

- [ ] **Step 3: css/style.css 末尾追加列表样式**

在 `css/style.css` 末尾(reduced-motion 块之前或文件最末)追加:

```css
/* ============================================================
   Talks 列表 + 筛选 chip
   ============================================================ */
.talks-filters { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 36px; }
.talks-chip {
  font-family: var(--font-hand);
  font-size: 1.15rem;
  padding: 5px 18px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: .55;
  transition: background-color .2s ease, color .2s ease, opacity .2s ease, transform .1s ease;
}
.talks-chip:hover { opacity: .85; }
.talks-chip.active {
  opacity: 1;
  background: var(--accent);
  border-color: var(--accent);
  color: #1A1A1A;
}
.talks-chip:active { transform: translateY(1px); }

.talks-list { list-style: none; padding: 0; margin: 0; }
.talks-item { margin: 0 0 30px; }
.talks-item-link { display: block; text-decoration: none; }
.talks-item-date {
  display: block;
  font-family: var(--font-body);
  font-size: .8rem;
  opacity: .5;
  margin-bottom: 4px;
}
.talks-item-title {
  display: block;
  font-family: var(--font-hand);
  font-size: 1.8rem;
  line-height: 1.15;
}
.talks-item-summary {
  display: block;
  font-family: var(--font-body);
  font-size: 1rem;
  opacity: .45;
  margin-top: 6px;
  max-width: 48ch;
  transition: opacity .3s ease;
}
.talks-item-link:hover .talks-item-summary { opacity: .8; }
.talks-item-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.talks-tag {
  font-family: var(--font-body);
  font-size: .72rem;
  opacity: .55;
  padding: 2px 10px;
  border: 1px solid currentColor;
  border-radius: 999px;
}
.talks-empty { font-family: var(--font-body); opacity: .5; }

/* talks 列表涂鸦:树(静) + 小鸟(浮动) */
.talks-doodles .tree { top: 0; right: 0; width: 240px; }
.talks-doodles .brid {
  top: 24px; right: 250px; width: 64px;
  transform-origin: center;
  animation: bridFloat 3.6s ease-in-out infinite;
}
@keyframes bridFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50%      { transform: translateY(-10px) rotate(-6deg); }
}
```

- [ ] **Step 4: 验证列表渲染与筛选**

`vercel dev` 跑起来,浏览器开 `http://localhost:3000/talks.html`:
- 看到种子帖卡片(日期 + 标题「what talks is / talks 是什么」+ 摘要;此篇无 tag,卡片不显示 tag)。
- 点任意产品 chip(如 `notiee`):因这篇无 tag,列表变空、显示 "nothing here yet.";再点同一 chip 取消、卡片回来。
- 切中/En:标题、摘要、日期跟随语言变化。
- 右上出现树 + 浮动的小鸟。
- console 无报错。

- [ ] **Step 5: Commit**

```bash
git add talks.html js/talks.js css/style.css
git commit -m "feat(talks): 列表页 + 产品 tag 筛选 + 列表涂鸦"
```

---

## Task 4: vendored marked + 详情页渲染

**Files:**
- Create: `js/vendor/marked.min.js`
- Create: `talks/detail.html`
- Modify: `js/talks.js`(填充 `initDetail`)
- Modify: `css/style.css`(追加详情样式)

- [ ] **Step 1: vendored marked**

```bash
mkdir -p js/vendor
curl -L https://cdn.jsdelivr.net/npm/marked@12/marked.min.js -o js/vendor/marked.min.js
```

Run: `node -e "require('./js/vendor/marked.min.js'); console.log('size', require('fs').statSync('js/vendor/marked.min.js').size)"`
Expected: 打印一个非零 size(约 3 万+ 字节);不报错。

- [ ] **Step 2: 建 talks/detail.html**

`talks/detail.html`(注意 marked 在 talks.js 之前加载,使 `window.marked` 就绪):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>talks — tanqinghua.</title>
  <link rel="icon" type="image/png" href="/assets/favicon/favicon-96x96.png" sizes="96x96">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon/favicon.svg">
  <link rel="shortcut icon" href="/assets/favicon/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicon/apple-touch-icon.png">
  <link rel="manifest" href="/assets/favicon/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css?v=2">
  <script src="/js/i18n.js?v=2" defer></script>
  <script src="/js/main.js?v=2" defer></script>
  <script src="/js/vendor/marked.min.js" defer></script>
  <script src="/js/talks.js?v=1" defer></script>
  <script defer src="/_vercel/insights/script.js"></script>
</head>
<body>
  <div class="page">
    <div id="nav-placeholder"></div>

    <main class="content" data-talks-detail>
      <a class="back-link" href="/talks.html">← talks</a>

      <p class="talks-date">
        <img class="talks-cal" src="/assets/doodles/talks-calendar.png" alt="" aria-hidden="true" onerror="this.remove()">
        <span class="talks-date-text" data-talks-date></span>
      </p>

      <h1 class="detail-title" data-talks-title></h1>

      <div class="talks-like" data-talks-like>
        <button type="button" class="like-btn" aria-label="like this post">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-10-9.2C.6 8.9 2 5.5 5.2 5.5c2 0 3.2 1.2 3.8 2.2.6-1 1.8-2.2 3.8-2.2 3.2 0 4.6 3.4 3.2 6.3C19.5 16.4 12 21 12 21z"/>
          </svg>
          <span class="like-count" data-talks-likecount>·</span>
        </button>
      </div>

      <div class="detail-body talks-body" data-talks-body></div>
    </main>

    <div class="doodles talks-detail-doodles" aria-hidden="true">
      <img class="doodle bag" src="/assets/doodles/talks-bag.png" alt="">
      <img class="doodle star s1" src="/assets/doodles/talks-star-1.png" alt="">
      <img class="doodle star s2" src="/assets/doodles/talks-star-2.png" alt="">
      <img class="doodle star s3" src="/assets/doodles/talks-star-3.png" alt="">
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 3: js/talks.js 填充 initDetail**

把 `js/talks.js` 里这一行:

```js
  function initDetail(root) { /* Task 4 */ }
```

替换为:

```js
  function renderHead(post, root) {
    var l = lang();
    var dEl = root.querySelector("[data-talks-date]");
    var tEl = root.querySelector("[data-talks-title]");
    if (dEl) dEl.textContent = fmtDate(post.date, l);
    if (tEl) tEl.textContent = post.title[l] || post.title.en;
  }

  function loadBody(post, root) {
    var bodyEl = root.querySelector("[data-talks-body]");
    if (!bodyEl) return;
    fetch("/talks/" + encodeURIComponent(post.slug) + "." + lang() + ".md")
      .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
      .then(function (md) {
        bodyEl.innerHTML = window.marked ? window.marked.parse(md) : esc(md);
      })
      .catch(function () { bodyEl.textContent = t("empty"); });
  }

  function initDetail(root) {
    var slug = new URLSearchParams(location.search).get("p");
    fetchPosts().then(function (posts) {
      var post = posts.filter(function (p) { return p.slug === slug; })[0];
      if (!post) {
        var tEl = root.querySelector("[data-talks-title]");
        if (tEl) tEl.textContent = t("empty");
        return;
      }
      document.title = (post.title.en || "talks") + " — tanqinghua.";
      renderHead(post, root);
      loadBody(post, root);
      setupLike(post.slug, root);   /* Task 7 定义;Task 4 阶段为空函数占位 */
      setupStars(document);         /* Task 9 定义;Task 4 阶段为空函数占位 */
      document.addEventListener("langchange", function () {
        renderHead(post, root);
        loadBody(post, root);
      });
    });
  }
```

并在 `initDetail` 上方(`/* ---------- 详情页 ---------- */` 注释下)添加两个占位函数,后续任务替换:

```js
  function setupLike(slug, root) { /* Task 7 */ }
  function setupStars(scope) { /* Task 9 */ }
```

- [ ] **Step 4: css/style.css 追加详情样式**

```css
/* ============================================================
   Talks 详情
   ============================================================ */
.talks-date { display: flex; align-items: center; gap: 12px; margin: 0 0 6px; }
.talks-cal { width: 46px; height: auto; }
.talks-date-text {
  font-family: var(--font-hand);
  font-size: 1.35rem;
  opacity: .85;
}
.talks-body { margin-top: 28px; }
.talks-body h2 { font-family: var(--font-hand); font-size: 1.6rem; margin: 1.6em 0 .5em; }
.talks-body h3 { font-family: var(--font-hand); font-size: 1.3rem; margin: 1.4em 0 .4em; }
.talks-body ul { padding-left: 1.2em; }
.talks-body li { margin: .3em 0; }
.talks-body blockquote {
  margin: 1.2em 0;
  padding: 4px 0 4px 16px;
  border-left: 3px solid var(--accent);
  opacity: .8;
}
.talks-body a { text-decoration: underline; text-underline-offset: 2px; }
.talks-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: .9em;
  background: rgba(0,0,0,.06);
  padding: 1px 5px;
  border-radius: 5px;
}
body[data-theme="dreamland"] .talks-body code { background: rgba(255,255,255,.12); }

/* 详情涂鸦:袋子(摇摆) + 三颗星(逐帧转,Task 8/9) */
.talks-detail-doodles .bag {
  top: 0; right: 0; width: 180px;
  transform-origin: top center;
  animation: bagSway 5s ease-in-out infinite;
}
@keyframes bagSway {
  0%, 100% { transform: rotate(-2.5deg); }
  50%      { transform: rotate(2.5deg); }
}
```

- [ ] **Step 5: 验证详情页**

`vercel dev` 下访问 `http://localhost:3000/talks/detail.html?p=2026-06-28-what-is-talks`:
- 看到 `← talks`、日历图 + 日期、标题、心形按钮(数字暂为 `·`)、markdown 正文(标题/列表/引用都渲染了)。
- 切中/En:标题、日期、正文整体切换语言。
- 右上看到袋子在缓慢摇摆(星星样式/动画 Task 8 才完整)。
- console 无报错。

- [ ] **Step 6: Commit**

```bash
git add js/vendor/marked.min.js talks/detail.html js/talks.js css/style.css
git commit -m "feat(talks): 详情页 + marked 渲染 + 双语正文切换"
```

---

## Task 5: 漂亮 URL 重写

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: 建 vercel.json**

`vercel.json`:

```json
{
  "rewrites": [
    { "source": "/talks/:slug", "destination": "/talks/detail.html?p=:slug" }
  ]
}
```

> Vercel 先匹配文件系统再走 rewrites:`/talks/posts.json`、`/talks/*.md`、`/talks/detail.html` 都是真实文件,不会被吞;只有无对应文件的 `/talks/<slug>` 才重写到详情模板。

- [ ] **Step 2: 验证重写(本地 vercel dev 会应用 vercel.json)**

重启 `vercel dev`,访问漂亮 URL `http://localhost:3000/talks/2026-06-28-what-is-talks`:
- 详情页正常渲染(与 `?p=` 版一致)。
- 同时 `http://localhost:3000/talks/posts.json` 仍返回 JSON 原文(未被重写)。
- 列表页卡片链接已是 `/talks/<slug>`(Task 3 已如此),点击能跳到漂亮 URL。

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat(talks): vercel 重写漂亮 URL /talks/<slug>"
```

---

## Task 6: 点赞后端 api/likes.js

**Files:**
- Create: `api/likes.js`
- Modify: `package.json`(加 `@vercel/kv` 依赖)

前置:Upstash「talks-likes」已建并 Connect 到项目,环境变量 `KV_REST_API_URL` / `KV_REST_API_TOKEN` 已注入。本地需 `vercel env pull .env.development.local` 拉到这些变量(`vercel dev` 会自动加载)。

- [ ] **Step 1: 安装 @vercel/kv**

```bash
npm install @vercel/kv
```

Run: `node -e "require('@vercel/kv'); console.log('kv sdk OK')"`
Expected: 打印 `kv sdk OK`

- [ ] **Step 2: 建 api/likes.js(CommonJS,匹配 package.json type:commonjs)**

`api/likes.js`:

```js
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
```

- [ ] **Step 3: 验证 API(curl 打本地 vercel dev)**

`vercel dev` 跑着(已 `vercel env pull`)。另开终端:

```bash
# 读(初始应为 0)
curl -s "http://localhost:3000/api/likes?slug=2026-06-28-what-is-talks"
# 写 +1
curl -s -X POST "http://localhost:3000/api/likes" -H "Content-Type: application/json" -d '{"slug":"2026-06-28-what-is-talks"}'
# 再读(应比上一步大 1)
curl -s "http://localhost:3000/api/likes?slug=2026-06-28-what-is-talks"
# 非法 slug(应 400)
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/likes?slug=../evil"
```

Expected:第一条 `{"count":0}`(或当前值);POST 后 count +1;最后一条非法 slug 返回 `400`。

- [ ] **Step 4: Commit**

```bash
git add api/likes.js package.json package-lock.json
git commit -m "feat(talks): 点赞 serverless function(@vercel/kv,slug 校验)"
```

---

## Task 7: 点赞前端(标题下爱心)

**Files:**
- Modify: `js/talks.js`(填充 `setupLike`)
- Modify: `css/style.css`(追加爱心样式)

- [ ] **Step 1: js/talks.js 填充 setupLike**

把占位:

```js
  function setupLike(slug, root) { /* Task 7 */ }
```

替换为:

```js
  function setupLike(slug, root) {
    var box = root.querySelector("[data-talks-like]");
    if (!box) return;
    var btn = box.querySelector(".like-btn");
    var countEl = box.querySelector("[data-talks-likecount]");
    var likedKey = "liked:" + slug;
    var liked = false;
    try { liked = localStorage.getItem(likedKey) === "1"; } catch (_) {}
    if (liked) btn.classList.add("liked");

    fetch("/api/likes?slug=" + encodeURIComponent(slug))
      .then(function (r) { return r.json(); })
      .then(function (d) { if (typeof d.count === "number") countEl.textContent = d.count; })
      .catch(function () { countEl.textContent = "0"; });

    btn.addEventListener("click", function () {
      if (liked) return;
      liked = true;
      btn.classList.add("liked");
      try { localStorage.setItem(likedKey, "1"); } catch (_) {}
      fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (typeof d.count === "number") countEl.textContent = d.count; })
        .catch(function () {});
    });
  }
```

- [ ] **Step 2: css/style.css 追加爱心样式**

```css
/* talks 点赞爱心(标题下) */
.talks-like { margin: 0 0 34px; }
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 12px;
  border: 1.5px solid var(--ink);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color .2s ease, transform .1s ease;
}
.like-btn svg {
  width: 20px; height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  transition: fill .2s ease, transform .15s ease;
}
.like-btn .like-count { font-family: var(--font-body); font-size: .95rem; }
.like-btn:hover { transform: translateY(-1px); }
.like-btn.liked svg { fill: #ff5a7a; stroke: #ff5a7a; transform: scale(1.12); }
.like-btn:active { transform: translateY(1px); }
```

- [ ] **Step 3: 验证点赞**

`vercel dev` + `vercel env pull` 已就绪。访问 `http://localhost:3000/talks/2026-06-28-what-is-talks`:
- 爱心旁显示当前赞数(数字,非 `·`)。
- 点爱心:填红 + 数字 +1。
- 刷新页面:爱心仍是已赞态(localStorage),数字保持。
- 再点爱心:不再增加。
- 用 curl `GET /api/likes?slug=...` 复核数字与页面一致。

- [ ] **Step 4: Commit**

```bash
git add js/talks.js css/style.css
git commit -m "feat(talks): 标题下全局点赞爱心(GET/POST + localStorage 防重)"
```

---

## Task 8: 三颗星样式 + 逐帧旋转动画 + 字体/响应式收尾

**Files:**
- Modify: `css/style.css`(追加星星样式与响应式)

- [ ] **Step 1: css/style.css 追加星星逐帧旋转 + 定位**

```css
/* talks 详情:三颗星,各自逐帧旋转(steps),可拖拽(Task 9 绑定) */
.talks-detail-doodles .star {
  pointer-events: auto;        /* .doodles 默认 none,星星单独打开 */
  cursor: grab;
  touch-action: none;          /* 触屏拖动不滚页 */
  animation: starSpin 0.7s steps(8) infinite;
}
.talks-detail-doodles .star.dragging { cursor: grabbing; }
.talks-detail-doodles .star.loose { z-index: 60; }   /* 拖出后浮在最上层 */
.talks-detail-doodles .star.s1 { top: 120px; right: 24px;  width: 50px; animation-duration: 0.7s; }
.talks-detail-doodles .star.s2 { top: 56px;  right: 140px; width: 40px; animation-duration: 0.8s; animation-delay: -.2s; }
.talks-detail-doodles .star.s3 { top: 168px; right: 108px; width: 34px; animation-duration: 0.6s; animation-delay: -.45s; }
@keyframes starSpin { to { transform: rotate(360deg); } }
```

- [ ] **Step 2: css/style.css 响应式段补充 talks 窄屏处理**

在 `@media (max-width: 768px) { ... }` 块内追加:

```css
  .talks-item-title { font-size: 1.5rem; }
  .talks-detail-doodles .star { display: none; }   /* 窄屏不放可拖星,避免挡正文 */
  .talks-cal { width: 38px; }
```

> 字体已自动到位:`.detail-title`、`.talks-date-text`、`.talks-item-title`、`.talks-chip` 都已用 `var(--font-hand)`(tanqinghuafont);正文/摘要/tag/日期小字用 `var(--font-body)`,符合「标题+日历用手写体,其余照旧」。reduced-motion 的全局 `*` 规则已自动停掉 bridFloat/bagSway/starSpin,无需额外改。

- [ ] **Step 3: 验证视觉**

`vercel dev` 下开详情页:三颗星出现在袋子周围、大小不同、各自一格一格地转(不同步)。开列表页与详情页分别切换 dreamland 主题无关(talks 不设 theme,doodle 不反色)。缩到窄屏(preview_resize 375 宽):导航转顶部、涂鸦成块、星星隐藏、标题字号缩小。

- [ ] **Step 4: Commit**

```bash
git add css/style.css
git commit -m "feat(talks): 三颗星逐帧旋转 + 字体落点 + 窄屏响应式"
```

---

## Task 9: 星星拖拽彩蛋(落地不回弹)

**Files:**
- Modify: `js/talks.js`(填充 `setupStars`)

- [ ] **Step 1: js/talks.js 填充 setupStars**

把占位:

```js
  function setupStars(scope) { /* Task 9 */ }
```

替换为(沿用 main.js 小猫的指针拖拽,但落哪停哪、不蹦回;旋转动画用 transform,拖拽只改 left/top,两者不冲突):

```js
  function setupStars(scope) {
    (scope || document).querySelectorAll(".talks-detail-doodles .star").forEach(function (star) {
      var dragging = false, grabX = 0, grabY = 0;

      star.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var r = star.getBoundingClientRect();
        if (!star.classList.contains("loose")) {
          star.classList.add("loose");
          star.style.position = "fixed";
          star.style.margin = "0";
          star.style.right = "auto";
        }
        star.style.left = r.left + "px";
        star.style.top = r.top + "px";
        star.classList.add("dragging");
        grabX = e.clientX - r.left;
        grabY = e.clientY - r.top;
        dragging = true;
        try { star.setPointerCapture(e.pointerId); } catch (_) {}
      });

      star.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        star.style.left = (e.clientX - grabX) + "px";
        star.style.top = (e.clientY - grabY) + "px";
      });

      function end(e) {
        if (!dragging) return;
        dragging = false;
        star.classList.remove("dragging");
        try { star.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      star.addEventListener("pointerup", end);
      star.addEventListener("pointercancel", end);
    });
  }
```

- [ ] **Step 2: 验证拖拽**

详情页(宽屏)用 preview 模拟拖动每颗星到页面不同位置:松手后停在落点、不回弹;拖动中仍在逐帧旋转;三颗可分别拖、互不影响。console 无报错。

- [ ] **Step 3: Commit**

```bash
git add js/talks.js
git commit -m "feat(talks): 星星可分别拖拽落定彩蛋"
```

---

## Task 10: 清理 + 整页验收

**Files:**
- Delete: `assets/doodles/talks-bagstars.png`
- (提交此前未跟踪的 talks doodle 基础图)

- [ ] **Step 1: 删除已被拆分取代的原图**

```bash
git rm assets/doodles/talks-bagstars.png 2>/dev/null || rm -f assets/doodles/talks-bagstars.png
```

- [ ] **Step 2: 提交所有 talks doodle 资源**

```bash
git add assets/doodles/talks-tree.png assets/doodles/talks-brid.png assets/doodles/talks-bag.png assets/doodles/talks-calendar.png
git status --short
```

确认 `talks-star-1/2/3.png` 已在更早提交中;此处补齐 tree/brid/bag/calendar,并确认 bagstars 已删。

- [ ] **Step 3: 整页验收(给站长看)**

`vercel dev` 下逐项走查并截图:
1. 列表页:卡片、chip 筛选、中/En 切换、树+小鸟动画。
2. 漂亮 URL `/talks/2026-06-28-what-is-talks` 打开详情。
3. 详情页:日历+日期(手写体)、标题(手写体)、点赞 +1 与持久、markdown 正文、袋子摇摆、三颗星逐帧转 + 可拖。
4. 导航:talks 高亮(列表页与详情页都高亮)。
5. 窄屏(375):布局正常、星星隐藏。
6. dreamland 主题下其它页 doodle 仍反色、talks 页不反色(预期)。

> 按站长偏好:此步用 preview 起本地前端给站长亲自过目确认,再继续。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(talks): 删除已拆分的 bagstars,补齐 doodle 资源"
```

---

## 自检(写完计划回看 spec)

**Spec 覆盖:**
- 导航项 + 子页高亮 → Task 1 ✓
- 文件结构 / posts.json / 双语两 md → Task 2 ✓
- slug 日期前缀 → Task 2(slug 字段)✓
- 列表页 + chip 筛选(默认全显、无 tag 碎碎念在主流)→ Task 3 ✓
- 详情页骨架 + marked 渲染 + 双语正文切换 → Task 4 ✓
- 漂亮 URL + vercel 重写 → Task 5 ✓
- 点赞后端(@vercel/kv、slug 校验、GET/POST)→ Task 6 ✓
- 点赞前端(标题下、localStorage 防重、单向)→ Task 7 ✓
- doodle 动画(tree 静 / brid 浮 / bag 摆 / 三星逐帧转)→ Task 3、4、8 ✓
- 字体落点(标题+日期手写体)→ Task 8(说明)✓
- 星星拖拽彩蛋(落定不回弹)→ Task 9 ✓
- 响应式 / reduced-motion → Task 8 ✓
- 清理原 bagstars → Task 10 ✓

**占位符扫描:** 计划内 `setupLike`/`setupStars` 在 Task 4 先以空函数占位、Task 7/9 给出完整实现,非「TBD」——属有意的增量实现,代码均已写全。无其它占位。

**类型/命名一致性:** `data-talks-list` / `data-talks-detail` / `data-talks-date` / `data-talks-title` / `data-talks-body` / `data-talks-like` / `data-talks-likecount` 在 HTML 与 talks.js 中一致;`setupLike(slug, root)`、`setupStars(scope)`、`renderHead(post, root)`、`loadBody(post, root)`、`fetchPosts`、`byDateDesc`、`fmtDate`、`lang`、`t`、`esc` 跨任务签名一致;CSS 类 `.talks-chip/.talks-item/.talks-tag/.talks-detail-doodles .star.s1/s2/s3` 与 HTML 一致;KV 变量名 `KV_REST_API_URL`/`KV_REST_API_TOKEN` 与建库时一致。
