# tanqinghua. 个人网站 — 施工方案（英文版打样）

> 这份文档是给 **Claude Code** 的施工图，也给你自己看。
> 中文是讲解，英文 / 代码块是要落地的真实数值。先做**全英文版**，中文版（中/En 切换）留到第二期。
> 整体调性：**手绘 + 极简**。一个强签名（手写字体的网站名/标题 + 手绘涂鸦 + works 代表色主题），其余全部安静、克制。
> 架构：**多页面**（home / about / works / contact 各自独立页），works 下每个 app 还有自己的详情单页。

---

## Part 1 ｜ 技术选型 & 文件结构

- **不用框架**，纯 `HTML + CSS + JS`，**多页面**（每个大页一个 .html）。
- 左列导航（name / about / works / contact / 中/En）每页都要有 → 做成**共享 partial**，用一小段 JS 注入，避免每页复制（见 Part 5 active 逻辑）。
- 先**本地跑**，满意了再部署。

```
/
├── index.html          ← home
├── about.html
├── works.html          ← 四个 app 列表
├── contact.html
├── works/
│   ├── notiee.html     ← app 详情单页（主题色 = #09C576）
│   ├── dreamland.html  ← 主题色 #121212（暗色）
│   ├── artista.html    ← 主题色 #F5DFF3
│   └── tomanotes.html  ← 主题色 #EAE7E1
├── partials/nav.html   ← 共享左列导航
├── css/style.css
├── js/main.js
└── assets/
    ├── fonts/tanqinghuafont.woff2
    └── doodles/        ← 透明 PNG
        ├── home-person.png
        ├── home-z.png
        ├── about-notebook.png
        ├── about-coffee.png
        ├── about-steam.png
        ├── works-tree.png
        ├── works-cat.png
        └── contact-cups.png
```

---

## Part 2 ｜ 字体（手写体只管标题，正文用 sans）

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
```
```css
@font-face {
  font-family: "tanqinghua";
  src: url("/assets/fonts/tanqinghuafont.woff2") format("woff2");
  font-display: swap;
}
:root {
  --font-hand: "tanqinghua", system-ui, sans-serif;          /* 网站名 + 标题 */
  --font-body: "Inter", "Work Sans", system-ui, sans-serif;  /* 正文 / 其余一切 */
}
body { font-family: var(--font-body); }
.site-name, .nav a, .app-title { font-family: var(--font-hand); }
```
> 手写体 = 网站名、左列导航、works 的 app 名（含详情页大标题）。其余全用 Inter。`中/En` 也用 Inter 占位。

正文排版：
```css
.about-copy { font-size: 1.05rem; line-height: 1.8; max-width: 64ch; }
```

---

## Part 3 ｜ 布局系统（隐形网格，每页通用）

```
┌─────────────────────────────────────────────────────────┐
│  tanqinghua.   ← 链到 index.html（回首页） [涂鸦 · 右上锚定] │
│                                                           │
│  about ·                                                  │
│  works     ← 导航固定左列          ┌──────────────────┐     │
│  contact                          │   内容区          │     │
│                                   │ (固定左线起,       │     │
│                                   │  max-width 收口)  │     │
│  中/En (Inter 占位)               └──────────────────┘     │
└─────────────────────────────────────────────────────────┘
```
- 左列固定：宽约 `180px`，离左 `48px`。
- 内容区从约 `260px` 起，`max-width: 560px`，右侧留白给涂鸦当配重。
- 间距用 8 的倍数；`body` `max-width: 1200px` 居中。
- 每页加一个轻微的**进场淡入**（多页面没有 section 切换了，用 load 时 `opacity` 0→1，约 0.4s 顶替）：
```css
body { animation: pageIn .4s ease both; }
@keyframes pageIn { from{opacity:0} to{opacity:1} }
```

---

## Part 4 ｜ 配色 & 主题

### 基础主题（home / about / works列表 / contact）
```css
:root {
  --bg: #FFFFFF; --ink: #1A1A1A; --accent: #FFC83D;
  --transition: 0.6s cubic-bezier(.4,0,.2,1);
}
body { background: var(--bg); color: var(--ink);
       transition: background-color var(--transition), color var(--transition); }
```

### 代表色主题（用 data-theme，两处都用）
```css
body[data-theme="tomanotes"] { --bg:#EAE7E1; --ink:#1A1A1A; }
body[data-theme="notiee"]    { --bg:#09C576; --ink:#0A2A1B; }
body[data-theme="artista"]   { --bg:#F5DFF3; --ink:#2A1A28; }
body[data-theme="dreamland"] { --bg:#121212; --ink:#F5F5F5; }  /* 暗色，文字翻白 */
```

**两处用法：**
1. **works 列表页（hover 预览）**：鼠标移到某 app 上 → 给 `<body>` 设对应 `data-theme`，背景泛起代表色；移开还原白。
   ```js
   appEl.addEventListener('mouseenter', () => document.body.dataset.theme = 'notiee');
   appEl.addEventListener('mouseleave', () => document.body.dataset.theme = '');
   ```
2. **app 详情页（固定主题）**：该页 `<body data-theme="notiee">` 写死，整页就是它的代表色。

> ⚠️ 这是把你最初「点击变色」升级成了「hover 预览 + 点击进入详情页（详情页即该色）」。想要纯「点击当场变色」就改这里。

### Dreamland 暗色必做
①文字已翻白；②黑线涂鸦深底会消失 → Part 6 用 `filter:invert()` 翻白。

### 黄色 active 标记（你不用画）
```html
<svg class="active-mark" viewBox="0 0 60 12" fill="none" aria-hidden="true">
  <path d="M2 6 Q10 1 18 6 T34 6 T50 6 T58 5" stroke="#FFC83D" stroke-width="3" stroke-linecap="round"/>
</svg>
```
```css
.active-mark { width:48px; height:10px; display:none; margin-top:2px; }
.nav a.active .active-mark { display:block; }
```

---

## Part 5 ｜ 逐页规格

**通用**：
- `tanqinghua.` 大标题永远链到 `index.html`（回首页）。
- 共享导航 + active 判断（多页面靠当前文件名）：
  ```js
  // 注入 partials/nav.html 后执行
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href').endsWith(path)) a.classList.add('active');
  });
  ```
- home 不是导航项，不标 active。

### Home (`index.html`)
- 左列 + 涂鸦（睡觉小人 + 飘 z）。内容区基本空，焦点是涂鸦，留白是对的别填。

### About (`about.html`)
- 涂鸦右上：笔记本+笔、咖啡杯（飘热气）。
- 内容区：小写文案，`.about-copy`（Inter）。active：about。

文案（以你确认为准）：
```
just a regular person
likes building stuff, makes little apps here and there
loves music and movies — can only tell you if it's good or not, writing's too rough for actual reviews
loves to travel, just haven't been many places yet
studying english, still don't think i'm any good at it
some days i feel unstoppable, some days everything's falling apart
some nights i dream the most beautiful things, some days it all feels over
saw other people writing little things on their own sites, so i figured i'd try too
honestly should've grabbed idbetter.run back when i had the chance
thanks for making it this far :)
```

### Works 列表 (`works.html`)
- 涂鸦右上：树+栅栏+猫（猫会走）。
- 四个 app：**2×2 网格**（左列 notiee / dreamland，右列 artista / tomanotes）。每个 = **app 名（手写体，是个链接 → 对应详情页）+ 下面一行 Inter 小字介绍**。
- 交互：**hover → 背景泛起该 app 代表色（预览）**；**click → 跳到 `works/xxx.html` 详情页**。
- 介绍默认半透明，hover 浮现，保持「轻」。
- active：works。

### App 详情页 (`works/notiee.html` 等，共 4 个，同一模板)
- `<body data-theme="该app">`，整页 = 代表色（Dreamland 暗色＋涂鸦 invert）。
- 内容模板：
  ```
  ← works                        (返回链接，左上或导航处)

  [app 名 · 手写体大标题]
  [一句话介绍 · Inter]

  [一段更长的介绍 · 占位，以后填]
  [截图 / mockup 占位]
  [链接：App Store / GitHub / 试用 · 占位]
  ```
- 左列导航保留，works 仍高亮 active。

### Contact (`contact.html`)
- 涂鸦右上：**两个杯子碰杯**（旁边碰杯动感线；想动就让两杯轻碰一下）。
- 列表（label 可手写体，值用 Inter）：
  ```
  mail :       woxiantao@icloud.com   → mailto:
  instagram :  idbetterrun            → https://instagram.com/idbetterrun
  linkedin :   —                      填 / 隐藏
  rednote :    —
  douyin :     —
  ```
  邮箱底下保留手绘黄色下划线感觉。active：contact。

---

## Part 6 ｜ 涂鸦 & 动画（给 Claude Code）

### 白底处理
- 首选透明 PNG。偷懒法 `mix-blend-mode: multiply`（**仅永远白底的 home/about/contact**；works 列表/详情禁用，背景会变深）。

### 暗色翻白
```css
body[data-theme="dreamland"] .doodle { filter: invert(1); }
```

### 原则
只用 `transform` / `opacity`；循环慢而轻（3–4s）；进场只播一次；尊重 reduced-motion；别全屏乱动。

### 各动画
```css
/* ① z 飘 (home) */
@keyframes floatZ {0%{transform:translateY(0) scale(1);opacity:0}20%{opacity:1}100%{transform:translateY(-40px) scale(1.3);opacity:0}}
.z{animation:floatZ 3.5s ease-out infinite}
.z:nth-child(2){animation-delay:1.1s}.z:nth-child(3){animation-delay:2.2s}

/* ② 咖啡热气 (about) */
@keyframes steam {0%{transform:translateY(0) translateX(0);opacity:0}30%{opacity:.7}100%{transform:translateY(-30px) translateX(4px);opacity:0}}
.steam{animation:steam 4s ease-in-out infinite}

/* ③ 猫走两步 (works) */
@keyframes catWalk {0%,100%{transform:translateX(0) translateY(0)}50%{transform:translateX(20px) translateY(-2px)}}
.cat{animation:catWalk 6s ease-in-out infinite}

/* ④ 小人呼吸 (home) */
@keyframes breathe {0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}
.person{animation:breathe 4s ease-in-out infinite;transform-origin:bottom center}

/* ⑤ 碰杯 (contact)，需两杯分开两张图；只有一张图就跳过 */
@keyframes clinkL {0%,100%{transform:rotate(0)}50%{transform:rotate(6deg)}}
@keyframes clinkR {0%,100%{transform:rotate(0)}50%{transform:rotate(-6deg)}}
.cup-left {animation:clinkL 5s ease-in-out infinite;transform-origin:bottom center}
.cup-right{animation:clinkR 5s ease-in-out infinite;transform-origin:bottom center}
```

**进场「自己画出来」效果**：本期跳过（需矢量 SVG，PNG 做不了）。

---

## Part 7 ｜ 本地预览 & 质量底线

### 本地预览（先这个）
```bash
cd 项目根目录
python3 -m http.server 8000
# 打开 http://localhost:8000
```
> 多页面 + 共享 nav 用 `fetch` 注入，必须走本地服务器（`file://` 会被 CORS 挡）。VS Code 的 Live Server 也行。

### 响应式
桌面优先。窄屏：左列导航改顶部 / 汉堡；涂鸦缩小别溢出；works 2×2 改单列；内容单列。断点 `@media (max-width:768px)`。

### 无障碍 / reduced-motion
```css
@media (prefers-reduced-motion: reduce){
  *,.z,.steam,.cat,.person,.cup-left,.cup-right{animation:none!important;transition:none!important}
}
```
键盘可聚焦、focus 可见、图片加 `alt`。

### 以后部署
满意后推 GitHub Pages / Vercel / Netlify，免费。

---

## 附：第二期（中文版）预留
- 中/En：两套文案，JS 切 `lang`（多页面可每页备中英两版或参数化）。
- 中文正文：**霞鹜文楷（LXGW WenKai）**，开源可商用、手写暖感，用前子集化压体积。
- 中文手写 AI 造字有空再折腾。

---

### 一句话总结给 Claude Code
vanilla HTML/CSS/JS **多页面**站（home/about/works/contact + works 下 4 个 app 详情页）；共享左列导航用 JS 注入、按文件名判 active（黄色 SVG 波浪线）；手写体 `tanqinghua` 只贴网站名/导航/app 名，正文 Inter；点 `tanqinghua.` 回首页；works 列表 hover 用 `data-theme` 预览代表色、click 进详情页，详情页 `<body data-theme>` 写死该色（Dreamland 暗色翻白 + 涂鸦 invert）；涂鸦 transform/opacity 轻量动画（含碰杯）；守 reduced-motion 与移动端；先本地 `http.server` 预览。
