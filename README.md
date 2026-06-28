# tanqinghua. 🎨

> 一个手绘风格的极简个人网站
> A hand-drawn, minimalist personal website
>
> 🌐 **在线访问 / Live** · <https://tanqinghua.asia>

---

## ✨ 简介 / About

`tanqinghua.` 是一个**纯手写、零框架**的多页面个人网站，调性是 **手绘 + 极简**：一个强签名（手写字体的网站名 + 手绘涂鸦 + 每个作品的代表色主题），其余全部安静、克制、留白。

`tanqinghua.` is a **hand-written, framework-free** multi-page personal website. The vibe is **hand-drawn + minimalist**: one strong signature (a handwritten site name + doodles + a signature color per project), with everything else kept quiet, restrained, and full of whitespace.

---

## 🌟 特性 / Features

- 🖌️ **手绘涂鸦** —— 睡觉的小人、飘动的 z、咖啡热气、散步的猫、碰杯……都是轻量的 `transform / opacity` 动画
  **Hand-drawn doodles** — a sleeping figure, floating z's, coffee steam, a walking cat, clinking cups… all lightweight `transform / opacity` animations

- 🌗 **代表色主题** —— works 列表 hover 预览作品配色，进入详情页即整页变成那个颜色（Dreamland 暗色还会把涂鸦反白）
  **Signature color themes** — hover a work to preview its palette; open its detail page and the whole page becomes that color (Dreamland's dark theme even inverts the doodles)

- 🌍 **中 / En 双语** —— 跟随浏览器语言，可手动切换并记忆（`localStorage`）
  **中 / En bilingual** — follows the browser language, switchable and remembered via `localStorage`

- ♿ **无障碍友好** —— 键盘可聚焦、`alt` 文本、尊重 `prefers-reduced-motion`
  **Accessible** — keyboard focusable, `alt` text, respects `prefers-reduced-motion`

- 📱 **响应式** —— 桌面优先，窄屏自适应
  **Responsive** — desktop first, adapts to narrow screens

---

## 🗂️ 目录结构 / Structure

```
/
├── index.html          # 首页 home（焦点是涂鸦，刻意留白）/ home (the doodle is the focus)
├── about.html          # 关于 + 履历 / about + résumé
├── works.html          # 四个作品列表（2×2 网格）/ four projects in a 2×2 grid
├── contact.html        # 联系方式 / contact links
├── works/              # 作品详情页（每页写死一个代表色主题）/ project detail pages
│   ├── notiee.html     #   #09C576
│   ├── dreamland.html  #   #121212（暗色 / dark）
│   ├── artista.html    #   #F5DFF3
│   └── tomanotes.html  #   #EAE7E1
├── partials/nav.html   # 共享左列导航（JS 注入到每一页）/ shared nav, injected via JS
├── resume/             # 简历页 / résumé page
├── css/style.css
├── js/
│   ├── main.js         # 导航注入、active 高亮、涂鸦交互 / nav injection, active highlight, doodles
│   └── i18n.js         # 双语引擎 / bilingual engine
└── assets/             # 字体、涂鸦 PNG、作品图、favicon / fonts, doodles, images, favicon
```

---

## 🛠️ 技术栈 / Tech stack

- **Vanilla HTML + CSS + JS** —— 不用任何框架或构建工具
  **Vanilla HTML + CSS + JS** — no framework, no build step

- **手写字体** `tanqinghuafont.woff2`（只用于网站名 / 导航 / 作品名），正文用 **Inter**
  **Custom handwritten font** `tanqinghuafont.woff2` (site name / nav / project names only); body text in **Inter**

- 共享导航用 `fetch` 注入，按当前文件名判断 active 并画上黄色手绘波浪线
  Shared nav injected with `fetch`, active link detected by filename and underlined with a yellow hand-drawn squiggle

- 部署在 **Vercel**（含 Vercel Web Analytics），留言用 **Tally** 弹窗
  Deployed on **Vercel** (with Vercel Web Analytics); notes collected via a **Tally** popup

---

## 🚀 本地预览 / Run locally

因为共享导航是用 `fetch` 注入的，`file://` 会被 CORS 拦截，**必须走本地服务器**：
The shared nav is injected with `fetch`, so `file://` is blocked by CORS — **you need a local server**:

```bash
cd mypersonalwebsite
python3 -m http.server 8000
# 打开 / open http://localhost:8000
```

> 💡 VS Code 的 Live Server 插件同样可以。/ VS Code's Live Server extension works too.

---

## 🌐 双语维护说明 / i18n notes

`js/i18n.js` 以 HTML 里的英文为唯一来源，字典只写中文：
`js/i18n.js` treats the English in the HTML as the single source of truth; the dictionary only holds Chinese:

- `data-i18n="key"` 替换元素文本（该元素必须**只含纯文本、无子元素**）
  `data-i18n="key"` replaces an element's text (the element must contain **plain text only, no children**)

- `data-i18n-attr="attr:key"` 替换属性（如 `aria-label`）
  `data-i18n-attr="attr:key"` replaces an attribute (e.g. `aria-label`)

> 调用顺序：`init()` 定语言 → 内容就位 → `apply()`（先采集英文再渲染）→ 之后才能 `setLang()`。
> Call order: `init()` (set language) → content in place → `apply()` (capture English, then render) → only then `setLang()`.

---

## 📮 联系 / Contact

邮件最快，也能在网上各处找到我。
Mail's the fastest way to reach me — or find me scattered around the internet.

- 📧 **Mail** · <woxiantao@icloud.com>
- 📷 **Instagram** · <https://www.instagram.com/idbetterrun>
- 💼 **LinkedIn** · <https://cn.linkedin.com/in/%E6%B8%85%E8%8F%AF-%E8%AD%9A-b73110278>
- 📕 **Rednote / 小红书** · <https://xhslink.com/m/xy3yXF6OmK>
- 🎵 **Douyin / 抖音** · <https://v.douyin.com/9Ga_apWjjQg/>
- 👾 **Reddit** · <https://www.reddit.com/u/No-Town-2478/s/V2FxtbRhFr>
- 🐙 **GitHub** · <https://github.com/idbetterrun>
- 👋 **bonjour!** · <https://bonjour.bio/idbetterrun>

---

<p align="center">made with ☕ and a few doodles · 用咖啡和几张涂鸦做成 🐱</p>
