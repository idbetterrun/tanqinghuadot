# 双语切换（汉化）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给现有纯静态多页站加「中 / En」双语切换，默认跟随浏览器语言、手动切换记 localStorage、中文走系统字体、导航保持英文。

**Architecture:** 新增 `js/i18n.js`（`window.I18N` 引擎：探测语言 / 采集英文原文 / 按语言替换文本与属性 / 切换并派发事件）。元素打 `data-i18n` / `data-i18n-attr` 标记，英文原文即 HTML 内联文本（单一来源），字典里只写中文。`js/main.js` 负责集成（init → 建页脚 → 挑问候语 → apply），nav 注入后绑定开关。

**Tech Stack:** vanilla HTML / CSS / JS（无框架、无构建）。**本仓库没有单元测试框架**——验证一律用浏览器：`python3 -m http.server` 起本地服务（fetch 注入 nav 要求走 http），用 preview 工具 eval / snapshot / screenshot 确认。每个任务末尾提交。

**全局缓存破除：** 涉及的静态资源版本号统一从 `?v=1` 提到 `?v=2`（`i18n.js` 直接用 `?v=2`，`main.js` / `style.css` / `partials/nav.html` 改为 `?v=2`）。各任务编辑相应行时一并改。

---

### Task 1: i18n 引擎 + 字典 + 各页引入

**Files:**
- Create: `js/i18n.js`
- Modify: `index.html`、`about.html`、`works.html`、`contact.html`、`works/notiee.html`、`works/dreamland.html`、`works/artista.html`、`works/tomanotes.html`（共 8 个页面，各 head 加 i18n.js 引用 + 把 main.js/style.css 的 `?v=1` 改 `?v=2`）

- [ ] **Step 1: 创建 `js/i18n.js`**

```js
/* tanqinghua. — 双语（中 / En）引擎
   data-i18n 替换文本；data-i18n-attr="attr:key;attr:key" 替换属性。
   英文原文采集自 HTML（单一来源），字典只写中文。
   跟随浏览器语言；手动切换记 localStorage['lang']。 */
(function () {
  "use strict";

  var ZH = {
    /* footer */
    "footer": "© 2026 tanqinghua. 保留所有权利。",

    /* home */
    "home.bubbleAria": "给我留个言",

    /* about 独白 */
    "about.l1": "一个普通人",
    "about.l2": "喜欢动手，会搞点小app的开发",
    "about.l3": "喜欢听歌，看电影，只会说好看不好看，文笔太差不会写影评",
    "about.l4": "喜欢旅行，但是还没去过多少地方",
    "about.l5": "学的英语但是英语自认为不太好",
    "about.l6": "有时特别自信，有时感觉一切都完蛋了",
    "about.l7": "有时会做一些很美的梦，有时感觉一切完蛋了",
    "about.l8": "我看到别人的个人网站都会写点，我也学着这样写了一点。",
    "about.l9": "其实当时我应该买idbetter.run这个域名的",
    "about.l10": "谢谢你看到这里：）",

    /* about 履历 */
    "resume.eduHead": "education 教育经历",
    "resume.internHead": "internship 实习经历",
    "resume.be1": "商务英语",
    "resume.org1": "湘南学院",
    "resume.be2": "商务英语",
    "resume.org2": "湖南工业职业技术学院",
    "resume.role": "行政助理（基本就是处理办公室文书）",
    "resume.org3": "长沙中标易信息技术有限公司",

    /* about 弹窗 + 笔 */
    "modal.q": "你不会因为我的学历看不起我吧？",
    "modal.yes": "不会，绝对不会",
    "modal.no": "……说实话，我也不好说",
    "about.penAria": "点一下笔",

    /* 标语（works 列表 + 详情页共用） */
    "blurb.notiee": "一个住在你日历里的 iOS 笔记 app",
    "blurb.artista": "像做幻灯片一样做网页，mac 原生 app",
    "blurb.dreamland": "一个能戳一戳的文字小世界，由大模型驱动",
    "blurb.tomanotes": "一个我做出来的桌面笔记 app，没想到真有人用",

    /* 详情 notiee */
    "d.notiee.meta": "即将上架 App Store · 2026 年 5 月起",
    "d.notiee.p1": "一个 iOS app，把白板、幻灯片、会议记录的照片自动变成结构化的笔记。",
    "d.notiee.p2": "拍张照，ai 读懂它（ocr + latex），再整理成标题、摘要、要点和待办。它还知道你的日程：会看你的日历，自动把每条笔记关联到你当下正在上的课或开的会。内置一个叫 spark 的 ai 助手，是真能干活的那种——搜笔记、管待办、查日历。你当前的日程甚至会实时显示在灵动岛上，还带倒计时。",
    "d.notiee.p3": "离线也能用（联网后自动同步），所有东西都留在你手机上。用 swift + swiftui 写的。",
    "d.notiee.store": "即将上架 app store",
    "d.notiee.storeAria": "即将上架 App Store",
    "d.notiee.web": "官网",
    "d.notiee.webAria": "官网敬请期待",
    "d.notiee.soon": "敬请期待",
    "d.notiee.iconAlt": "notiee 应用图标",
    "d.notiee.shotAlt": "notiee 截图",

    /* 详情 dreamland */
    "d.dreamland.meta": "还在早期阶段 · 2026 年 6 月起",
    "d.dreamland.p1": "一个由大模型驱动的文字世界模拟器。你把一个世界写进 json 文件——它的法则、它的组织、它的地理、它的人物——引擎就会自己一回合一回合地把这个世界的历史演下去。",
    "d.dreamland.p2": "好玩的地方在于那些你没去写的东西。角色有真实的动机（一个 npc 破产了，它就真的会去偷另一个 npc 仓库里的东西），而世界记录下来的是真实发生过的事，不是 ai 想象出来的。所以你可能在酒馆里听到一条残缺的传闻，走到仓库，发现账对不上，然后自己把整件事拼出来。信息差是真实的，不是假的。",
    "d.dreamland.p3": "有几个我挺得意的想法：每回合只有「主角」级别的角色才烧 token，所以世界能低成本地铺得很大。还有，存档不是用来「继续」的——它是一段已经发生过的历史的记录。换一天、或者换一个模型重新加载，你会得到一条不一样的时间线。这是特性，不是 bug。",
    "d.dreamland.p4": "python + fastapi 后端，react + electron 前端。目前还是 mvp 阶段——引擎能跑，有些部分还在接。",
    "d.dreamland.iconAlt": "dreamland 应用图标",
    "d.dreamland.shotAlt": "dreamland 截图",

    /* 详情 artista */
    "d.artista.meta": "还在早期阶段 · 2026 年 6 月起",
    "d.artista.p1": "一个 mac 原生 app，靠拖拽来搭网页——有点像做幻灯片，只不过画布自始至终都是真正的 html。",
    "d.artista.p2": "你放下的每一个元素都是真实的 dom 节点。导出时，ai 会读懂你的布局，把它变成干净、响应式的 html/css。反过来也行——把 chatgpt 或 claude 给的 html 贴进来，可视化地改一改，再更干净地导出去。你也可以直接用大白话告诉 ai 要改什么，看着画布跟着变。",
    "d.artista.p3": "自带 api key（支持六家），所有东西都留在你本机。用 swiftui + webkit 写的。",
    "d.artista.iconAlt": "artista 应用图标",
    "d.artista.shotAlt": "artista 截图",

    /* 详情 tomanotes */
    "d.tomanotes.meta": "2026 年 3 月起",
    "d.tomanotes.p1": "一个免费、开源、本地优先的 mac 笔记 app。做它是为了配 notiee（我那个 iOS 拍照笔记 app）——它俩共用同一种 .tmn 文件格式，笔记在两边来回搬也不会丢东西。",
    "d.tomanotes.p2": "两种编辑器合一：富文本（tiptap）或纯 markdown，看你心情。笔记可以用触控 id 锁起来，还能一条一条单独加密。五套主题、三种语言，所有东西都留在你本机。",
    "d.tomanotes.p3": "mit 协议。代码在 github 上。",
    "d.tomanotes.download": "↓ 下载",
    "d.tomanotes.iconAlt": "tomanotes 应用图标",
    "d.tomanotes.shotAlt": "tomanotes 截图",

    /* contact */
    "contact.title": "打个招呼",
    "contact.intro": "邮件是找我最快的方式——或者在网上各个角落也能找到我。"
  };

  var GREETINGS = {
    en: [
      "hi there :)", "oh, hey!", "you made it", "psst — leave me a note?",
      "knock knock", "say something?", "what's on your mind?", "drop me a line",
      "hello hello", "tell me something"
    ],
    zh: [
      "你好呀 ：）", "嘿，是你呀", "你来啦", "嘘——给我留句话？",
      "咚咚咚", "说点什么？", "在想什么呢？", "给我留个言吧",
      "哈喽哈喽", "跟我说点什么吧"
    ]
  };

  var enCache = {};      // 采集到的英文原文（文本 key 与 "@attr@key" 属性 key）
  var current = "en";

  function detectLang() {
    try {
      var saved = localStorage.getItem("lang");
      if (saved === "zh" || saved === "en") return saved;
    } catch (_) {}
    var nav = (navigator.language || navigator.userLanguage || "").toLowerCase();
    return nav.indexOf("zh") === 0 ? "zh" : "en";
  }

  function eachAttr(el, fn) {
    el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
      var bits = pair.split(":");
      fn(bits[0].trim(), bits[1].trim());
    });
  }

  function harvest(root) {
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!(key in enCache)) enCache[key] = el.textContent;
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      eachAttr(el, function (attr, key) {
        var ck = "@" + attr + "@" + key;
        if (!(ck in enCache)) enCache[ck] = el.getAttribute(attr) || "";
      });
    });
  }

  function render(root) {
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.textContent = (current === "zh" && ZH[key] != null)
        ? ZH[key] : (enCache[key] != null ? enCache[key] : el.textContent);
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      eachAttr(el, function (attr, key) {
        var ck = "@" + attr + "@" + key;
        var val = (current === "zh" && ZH[key] != null)
          ? ZH[key] : (enCache[ck] != null ? enCache[ck] : el.getAttribute(attr));
        el.setAttribute(attr, val);
      });
    });
  }

  function updateToggle() {
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      var on = b.getAttribute("data-lang") === current;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  var I18N = {
    get current() { return current; },
    init: function () {
      current = detectLang();
      document.documentElement.lang = current;
    },
    apply: function (root) {
      root = root || document;
      harvest(root);
      render(root);
    },
    setLang: function (lang) {
      if (lang !== "zh" && lang !== "en") return;
      current = lang;
      try { localStorage.setItem("lang", lang); } catch (_) {}
      document.documentElement.lang = lang;
      render(document);
      updateToggle();
      document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
    },
    greetings: function () { return GREETINGS[current] || GREETINGS.en; },
    bindToggle: function (root) {
      (root || document).querySelectorAll(".lang-btn").forEach(function (b) {
        b.addEventListener("click", function () { I18N.setLang(b.getAttribute("data-lang")); });
      });
      updateToggle();
    }
  };

  window.I18N = I18N;
})();
```

- [ ] **Step 2: 7 个页面 head 加引用并破缓存**

每个 `.html` 的 head 里，找到现有这一行：
```html
  <script src="/js/main.js?v=1" defer></script>
```
替换为（在前面加 i18n.js，两者都 v=2，defer 保证顺序）：
```html
  <script src="/js/i18n.js?v=2" defer></script>
  <script src="/js/main.js?v=2" defer></script>
```
同页把样式表行：
```html
  <link rel="stylesheet" href="/css/style.css?v=1">
```
改为：
```html
  <link rel="stylesheet" href="/css/style.css?v=2">
```
对 8 个文件全部执行：`index.html`、`about.html`、`works.html`、`contact.html`、`works/notiee.html`、`works/dreamland.html`、`works/artista.html`、`works/tomanotes.html`。

- [ ] **Step 3: 启动本地服务并验证引擎加载**

Run: `preview_start`（命令 `python3 -m http.server 8000`，根目录为项目根）
然后 `preview_eval`: `typeof window.I18N + " / " + (window.I18N && I18N.greetings().length)`
Expected: `"object / 10"`（zh/en 任一环境下 greetings 都有 10 条；object 表示引擎已加载）
再 `preview_console_logs`：Expected 无报错。

- [ ] **Step 4: 提交**

```bash
git add js/i18n.js index.html about.html works.html contact.html works/notiee.html works/dreamland.html works/artista.html works/tomanotes.html
git commit -m "feat(i18n): 新增双语引擎与字典，各页引入 i18n.js"
```

---

### Task 2: 切换开关（nav + CSS + main.js 集成）

**Files:**
- Modify: `partials/nav.html`、`css/style.css`、`js/main.js`

- [ ] **Step 1: nav.html 改造开关**

把 `partials/nav.html` 末尾这一行：
```html
  <span class="lang-toggle" role="note">中 / En</span>
```
替换为：
```html
  <div class="lang-toggle" role="group" aria-label="language">
    <button type="button" class="lang-btn" data-lang="zh">中</button>
    <span class="lang-sep" aria-hidden="true">/</span>
    <button type="button" class="lang-btn" data-lang="en">En</button>
  </div>
```

- [ ] **Step 2: CSS 开关样式 + 中文字体回落**

`css/style.css` 里把现有这段：
```css
/* 中/En 占位：Inter，本期不接逻辑 */
.nav .lang-toggle {
  font-family: var(--font-body);
  font-size: .9rem;
  opacity: .5;
  margin-top: 24px;
  cursor: default;
}
```
替换为：
```css
/* 中/En 切换开关 */
.nav .lang-toggle {
  font-family: var(--font-body);
  font-size: .9rem;
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.lang-btn {
  font: inherit;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  cursor: pointer;
  opacity: .45;
  transition: opacity .2s ease;
}
.lang-btn.active { opacity: 1; font-weight: 500; }
.lang-btn:hover { opacity: .8; }
.lang-sep { opacity: .4; }
```
然后在该文件「Reset-ish」区块之后、`a { color: inherit; }` 那一行下面，新增中文字体回落规则：
```css
/* 中文模式：正文与几个原本手写体的标题回落到中文系统字体 */
html[lang="zh"] body,
html[lang="zh"] .contact-title,
html[lang="zh"] .modal-q,
html[lang="zh"] .note-bubble-text,
html[lang="zh"] .resume-head {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif;
}
```

- [ ] **Step 3: main.js 集成 i18n**

改 `js/main.js`：

(a) `setupNoteBubble` 里删掉内联英文 greetings 数组，改用 I18N。把函数体改为：
```js
  function setupNoteBubble() {
    var el = document.querySelector(".note-bubble-text");
    if (!el) return;
    var g = window.I18N ? I18N.greetings() : [];
    if (!g.length) return;
    el.textContent = g[Math.floor(Math.random() * g.length)];
  }
```

(b) `addFooter` 里给 footer 加 `data-i18n`。把：
```js
    f.className = "site-footer";
    f.textContent = "Copyright © 2026 tanqinghua. All Rights Reserved.";
```
改为：
```js
    f.className = "site-footer";
    f.setAttribute("data-i18n", "footer");
    f.textContent = "Copyright © 2026 tanqinghua. All Rights Reserved.";
```

(c) `injectNav` 的 `.then` 里，`markActive();` 之后加一行绑定开关。把：
```js
        slot.innerHTML = html;
        markActive();
```
改为：
```js
        slot.innerHTML = html;
        markActive();
        if (window.I18N) I18N.bindToggle(slot);
```

(d) nav fetch 破缓存：把 `fetch("/partials/nav.html?v=1")` 改为 `fetch("/partials/nav.html?v=2")`。

(e) `DOMContentLoaded` 回调改为（init 最前、apply 在建页脚与挑问候语之后、并监听 langchange）：
```js
  document.addEventListener("DOMContentLoaded", function () {
    if (window.I18N) I18N.init();
    injectNav();
    bindWorksHover();
    bindDegreeEasterEgg();
    addFooter();
    setupCatDrag();
    setupNoteBubble();
    if (window.I18N) {
      I18N.apply(document);
      document.addEventListener("langchange", setupNoteBubble);
    }
  });
```

- [ ] **Step 4: 验证切换**

Run: `preview_eval`: `window.location.reload()`，随后：
- `preview_eval`: `document.documentElement.lang`（记下初始值，取决于浏览器语言）
- `preview_eval`: `document.querySelectorAll('.lang-btn').length`，Expected: `2`
- `preview_eval`: `(function(){var b=[].find.call(document.querySelectorAll('.lang-btn'),function(x){return x.dataset.lang==='zh'});b.click();return document.documentElement.lang+' / '+localStorage.getItem('lang')+' / '+document.querySelector('.site-footer').textContent;})()`
  Expected: `"zh / zh / © 2026 tanqinghua. 保留所有权利。"`（点中文后 lang=zh、localStorage 记住、页脚已译）
- `preview_eval`: `(function(){var b=[].find.call(document.querySelectorAll('.lang-btn'),function(x){return x.dataset.lang==='en'});b.click();return document.documentElement.lang+' / '+document.querySelector('.site-footer').textContent;})()`
  Expected: `"en / Copyright © 2026 tanqinghua. All Rights Reserved."`（切回英文，页脚还原）
- `preview_console_logs`：Expected 无报错。

- [ ] **Step 5: 提交**

```bash
git add partials/nav.html css/style.css js/main.js
git commit -m "feat(i18n): 切换开关接入逻辑，集成 main.js 与中文字体回落"
```

---

### Task 3: about 页标记

**Files:**
- Modify: `about.html`

- [ ] **Step 1: 给独白十句加 data-i18n**

把 `.about-copy` 块的十个 `<p>` 依次改为（顺序对应 l1–l10）：
```html
      <div class="about-copy">
        <p data-i18n="about.l1">just a regular person</p>
        <p data-i18n="about.l2">likes building stuff, makes little apps here and there</p>
        <p data-i18n="about.l3">loves music and movies — can only tell you if it's good or not, writing's too rough for actual reviews</p>
        <p data-i18n="about.l4">loves to travel, just haven't been many places yet</p>
        <p data-i18n="about.l5">studying english, still don't think i'm any good at it</p>
        <p data-i18n="about.l6">some days i feel unstoppable, some days everything's falling apart</p>
        <p data-i18n="about.l7">some nights i dream the most beautiful things, some days it all feels over</p>
        <p data-i18n="about.l8">saw other people writing little things on their own sites, so i figured i'd try too</p>
        <p data-i18n="about.l9">honestly should've grabbed idbetter.run back when i had the chance</p>
        <p data-i18n="about.l10">thanks for making it this far :)</p>
      </div>
```

- [ ] **Step 2: 履历小标题与条目加标记**

把两个 `.resume-head` 及条目改为：
```html
        <h2 class="resume-head" data-i18n="resume.eduHead">education</h2>
```
```html
              <span class="resume-title" data-i18n="resume.be1">business english</span>
              <span class="resume-org" data-i18n="resume.org1">xiangnan university</span>
```
```html
              <span class="resume-title" data-i18n="resume.be2">business English</span>
              <span class="resume-org" data-i18n="resume.org2">hunan industry polytechnic</span>
```
```html
        <h2 class="resume-head" data-i18n="resume.internHead">internship</h2>
```
```html
              <span class="resume-title" data-i18n="resume.role">admin assistant (office paperwork, basically)</span>
              <span class="resume-org" data-i18n="resume.org3">changsha zhongbiaoyi information technology co., ltd.</span>
```

- [ ] **Step 3: 笔 aria + 弹窗加标记**

笔记本涂鸦：在 `data-degree-trigger` 那个 `<img>` 上加 `data-i18n-attr`：
```html
      <img class="doodle notebook" src="/assets/doodles/about-notebook.png"
           alt="" data-degree-trigger role="button" tabindex="0"
           aria-label="click the pen" data-i18n-attr="aria-label:about.penAria">
```
弹窗问题与两个按钮：
```html
        <p id="degree-q" class="modal-q" data-i18n="modal.q">you're not gonna judge me for my degree, right?</p>
        <div class="modal-actions">
          <button type="button" class="modal-btn" data-reveal data-i18n="modal.yes">nope, never</button>
          <button type="button" class="modal-btn" data-dismiss data-i18n="modal.no">...honestly, no clue</button>
        </div>
```

- [ ] **Step 4: 验证 about 双语**

Run: `preview_eval`: `window.location.href='http://localhost:8000/about.html'` 后 reload，再：
- 切到中文：`preview_eval`: `[].find.call(document.querySelectorAll('.lang-btn'),x=>x.dataset.lang==='zh').click(); [].map.call(document.querySelectorAll('.about-copy p'),p=>p.textContent).join(' | ')`
  Expected: 以 `一个普通人 | 喜欢动手，会搞点小app的开发 | ...` 开头、共 10 段中文。
- `preview_eval`: `document.querySelector('.resume-head').textContent`，Expected: `"education 教育经历"`
- `preview_eval`: `document.querySelector('[data-degree-trigger]').getAttribute('aria-label')`，Expected: `"点一下笔"`
- 切回英文确认 `.about-copy p` 第一段恢复 `just a regular person`。
- `preview_snapshot`：确认中文模式下文案完整、无方块字。

- [ ] **Step 5: 提交**

```bash
git add about.html
git commit -m "feat(i18n): about 页文案、履历、弹窗双语标记"
```

---

### Task 4: works 列表标记

**Files:**
- Modify: `works.html`

- [ ] **Step 1: 四个 app 介绍加 data-i18n**

把四个 `.app-blurb` 改为（app 名 `.app-title` 不动，保持英文）：
```html
          <p class="app-blurb" data-i18n="blurb.notiee">an ios notes app that lives in your calendar</p>
```
```html
          <p class="app-blurb" data-i18n="blurb.artista">build web pages the way you'd build slides, native on mac</p>
```
```html
          <p class="app-blurb" data-i18n="blurb.dreamland">a little text world you can poke at, run by an llm</p>
```
```html
          <p class="app-blurb" data-i18n="blurb.tomanotes">a desktop notes app i shipped, somehow people actually found it</p>
```

- [ ] **Step 2: 验证**

Run: `preview_eval`: `window.location.href='http://localhost:8000/works.html'` reload，切中文后：
`preview_eval`: `[].map.call(document.querySelectorAll('.app-blurb'),p=>p.textContent).join(' | ')`
Expected: `一个住在你日历里的 iOS 笔记 app | 像做幻灯片一样做网页，mac 原生 app | 一个能戳一戳的文字小世界，由大模型驱动 | 一个我做出来的桌面笔记 app，没想到真有人用`
`preview_eval`: `[].map.call(document.querySelectorAll('.app-title'),a=>a.textContent).join(',')` Expected: `notiee,artista,dreamland,tomanotes`（app 名仍英文）。

- [ ] **Step 3: 提交**

```bash
git add works.html
git commit -m "feat(i18n): works 列表介绍双语标记"
```

---

### Task 5: 四个详情页标记

**Files:**
- Modify: `works/notiee.html`、`works/dreamland.html`、`works/artista.html`、`works/tomanotes.html`

- [ ] **Step 1: notiee.html**

```html
      <div class="detail-head">
        <img class="app-icon" src="/assets/works/notiee/icon.webp" alt="notiee app icon" data-i18n-attr="alt:d.notiee.iconAlt" onerror="this.remove()">
        <h1 class="detail-title">notiee</h1>
      </div>
      <p class="detail-tagline" data-i18n="blurb.notiee">an ios notes app that lives in your calendar</p>
      <p class="detail-meta" data-i18n="d.notiee.meta">coming soon to App Store · from may 2026</p>

      <div class="detail-body">
        <p data-i18n="d.notiee.p1">an ios app that turns photos of whiteboards, slides, or meeting notes into structured notes — automatically.</p>
        <p data-i18n="d.notiee.p2">snap a photo and the ai reads it (ocr + latex), then organizes everything into a title, summary, key points, and todos. it also knows your schedule: it checks your calendar and auto-links each note to whatever class or meeting you're in right now. there's a built-in ai assistant called spark that can actually do things — search your notes, manage todos, check your calendar. your current event even shows up live in the dynamic island with a countdown.</p>
        <p data-i18n="d.notiee.p3">works offline (syncs when you're back online), keeps everything on your phone. built in swift + swiftui.</p>
      </div>
```
三张截图 img 各加 `data-i18n-attr="alt:d.notiee.shotAlt"`：
```html
        <figure class="shot"><img src="/assets/works/notiee/01.webp" alt="notiee screenshot" data-i18n-attr="alt:d.notiee.shotAlt" loading="lazy" onerror="this.closest('.shot').remove()"></figure>
```
（02、03 同样加 `data-i18n-attr="alt:d.notiee.shotAlt"`。）
两个 store 按钮：
```html
        <span class="store-btn filled" role="note" aria-label="coming soon to App Store" data-i18n-attr="aria-label:d.notiee.storeAria">
          <svg viewBox="0 0 384 512" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
          <span data-i18n="d.notiee.store">coming soon to app store</span>
        </span>
        <span class="store-btn outline" role="note" aria-label="website coming soon" data-i18n-attr="aria-label:d.notiee.webAria">
          <svg class="icon-globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>
          <span data-i18n="d.notiee.web">website</span>
          <span class="soon" data-i18n="d.notiee.soon">coming soon</span>
        </span>
```

- [ ] **Step 2: dreamland.html**

```html
        <img class="app-icon" src="/assets/works/dreamland/icon.webp" alt="dreamland app icon" data-i18n-attr="alt:d.dreamland.iconAlt" onerror="this.remove()">
```
```html
      <p class="detail-tagline" data-i18n="blurb.dreamland">a little text world you can poke at, run by an llm</p>
      <p class="detail-meta" data-i18n="d.dreamland.meta">still in the early stages · from june 2026</p>

      <div class="detail-body">
        <p data-i18n="d.dreamland.p1">a text-based world simulator powered by llms. you write a world into a json file — its laws, its organizations, its geography, its characters — and the engine plays out that world's history on its own, turn by turn.</p>
        <p data-i18n="d.dreamland.p2">the fun part is what you don't script. characters have real motives (an npc goes broke, so it actually steals from another npc's warehouse), and the world records what really happened as fact — not what the ai imagines. so you might overhear a half-broken rumor in a tavern, walk to the warehouse, notice the books don't add up, and piece the whole thing together yourself. the information gaps are real, not faked.</p>
        <p data-i18n="d.dreamland.p3">a couple of ideas i'm proud of: only the "protagonist" characters burn tokens each turn, so worlds can scale cheaply. and a save file isn't something you resume — it's a record of a history that happened. reload it on a different day or a different model and you get a different timeline. that's the point, not a bug.</p>
        <p data-i18n="d.dreamland.p4">python + fastapi backend, react + electron frontend. currently mvp-ish — engine runs, some pieces still being wired in.</p>
      </div>
```
三张截图 img 各加 `data-i18n-attr="alt:d.dreamland.shotAlt"`。

- [ ] **Step 3: artista.html**

```html
        <img class="app-icon" src="/assets/works/artista/icon.webp" alt="artista app icon" data-i18n-attr="alt:d.artista.iconAlt" onerror="this.remove()">
```
```html
      <p class="detail-tagline" data-i18n="blurb.artista">build web pages the way you'd build slides, native on mac</p>
      <p class="detail-meta" data-i18n="d.artista.meta">still in the early stages · from june 2026</p>

      <div class="detail-body">
        <p data-i18n="d.artista.p1">a native mac app for building web pages by dragging stuff around — kind of like making slides, except the canvas is real html the whole time.</p>
        <p data-i18n="d.artista.p2">every element you place is an actual dom node. when you export, an llm reads your layout and turns it into clean, responsive html/css. works both ways too — paste in html from chatgpt or claude, tweak it visually, export it back out cleaner. you can also just tell the ai what to change in plain words and watch the canvas update.</p>
        <p data-i18n="d.artista.p3">bring your own api key (six providers supported), everything stays on your machine. built in swiftui + webkit.</p>
      </div>
```
三张截图 img 各加 `data-i18n-attr="alt:d.artista.shotAlt"`。

- [ ] **Step 4: tomanotes.html**

```html
        <img class="app-icon" src="/assets/works/tomanotes/icon.webp" alt="tomanotes app icon" data-i18n-attr="alt:d.tomanotes.iconAlt" onerror="this.remove()">
```
```html
      <p class="detail-tagline" data-i18n="blurb.tomanotes">a desktop notes app i shipped, somehow people actually found it</p>
      <p class="detail-meta" data-i18n="d.tomanotes.meta">from march 2026</p>

      <div class="detail-body">
        <p data-i18n="d.tomanotes.p1">a free, open-source, local-first note app for mac. built it to pair with notiee (my ios photo-notes app) — they share the same .tmn file format so notes move between them without losing anything.</p>
        <p data-i18n="d.tomanotes.p2">two editors in one: rich text (tiptap) or plain markdown, whichever mood you're in. notes can be locked behind touch id and encrypted one by one. five themes, three languages, everything stays on your machine.</p>
        <p data-i18n="d.tomanotes.p3">mit licensed. code's on github.</p>
      </div>
```
三张截图 img 各加 `data-i18n-attr="alt:d.tomanotes.shotAlt"`。下载按钮（GitHub 链接不动）：
```html
        <a class="detail-download" href="https://github.com/idbetterrun/TomaNotes/releases" target="_blank" rel="noopener" data-i18n="d.tomanotes.download">↓ Download</a>
```

- [ ] **Step 5: 验证四个详情页**

对 notiee / dreamland / artista / tomanotes 各执行：`preview_eval`: `window.location.href='http://localhost:8000/works/notiee.html'` reload，切中文后：
- `preview_eval`: `document.querySelector('.detail-tagline').textContent + ' || ' + document.querySelector('.detail-meta').textContent`
  notiee Expected: `一个住在你日历里的 iOS 笔记 app || 即将上架 App Store · 2026 年 5 月起`
- `preview_eval`: `[].map.call(document.querySelectorAll('.detail-body p'),p=>p.textContent.slice(0,8)).join(' | ')` 确认每段为对应中文开头。
- notiee 额外：`preview_eval`: `document.querySelector('.store-btn.filled span:last-child').textContent` Expected `即将上架 app store`。
- tomanotes 额外：`preview_eval`: `document.querySelector('.detail-download').textContent` Expected `↓ 下载`；`document.querySelector('.detail-links a:last-child').textContent` Expected `GitHub`（不译）。
- `preview_eval`: `document.querySelector('.detail-title').textContent`，Expected 仍为英文 app 名。
- `preview_console_logs`：无报错。

- [ ] **Step 6: 提交**

```bash
git add works/notiee.html works/dreamland.html works/artista.html works/tomanotes.html
git commit -m "feat(i18n): 四个详情页正文、按钮、图片 alt 双语标记"
```

---

### Task 6: contact 页 + 首页气泡 aria

**Files:**
- Modify: `contact.html`、`index.html`

- [ ] **Step 1: contact.html 标题与引语**

```html
      <h1 class="contact-title" data-i18n="contact.title">say hi.</h1>
      <p class="contact-intro" data-i18n="contact.intro">mail's the fastest way to reach me — or find me scattered around the internet.</p>
```
（邮箱、六个 `.social-chip` 不动，保持英文。）

- [ ] **Step 2: index.html 气泡 aria**

把首页气泡按钮的 `aria-label="leave me a note"` 行加 `data-i18n-attr`：
```html
            data-tally-emoji-text="👋" data-tally-emoji-animation="wave"
            aria-label="leave me a note" data-i18n-attr="aria-label:home.bubbleAria">
```

- [ ] **Step 3: 验证**

Run: contact 页 reload 切中文：
- `preview_eval`: `document.querySelector('.contact-title').textContent + ' || ' + document.querySelector('.contact-intro').textContent`
  Expected: `打个招呼 || 邮件是找我最快的方式——或者在网上各个角落也能找到我。`
- `preview_eval`: `[].map.call(document.querySelectorAll('.social-chip'),a=>a.textContent).join(',')` Expected: `instagram,linkedin,rednote,douyin,github,bonjour!`（全英文）。
- 首页 reload 切中文：`preview_eval`: `document.querySelector('.note-bubble').getAttribute('aria-label')` Expected `给我留个言`；`document.querySelector('.note-bubble-text').textContent` Expected 为中文问候语之一。

- [ ] **Step 4: 提交**

```bash
git add contact.html index.html
git commit -m "feat(i18n): contact 文案与首页气泡 aria 双语标记"
```

---

### Task 7: 全站收尾验证

**Files:** 无改动（纯验证；如发现问题回到对应任务修）

- [ ] **Step 1: 浏览器语言探测**

`preview_eval`: `localStorage.removeItem('lang'); navigator.language` 记录当前浏览器语言。reload 首页：`preview_eval`: `document.documentElement.lang`
Expected: 浏览器中文环境 → `zh` 且页面首屏即中文；英文环境 → `en`。

- [ ] **Step 2: 记忆持久化**

切到与默认相反的语言，`preview_eval`: `localStorage.getItem('lang')` Expected 为所选语言。reload，`preview_eval`: `document.documentElement.lang` Expected 仍为所选语言（记住手动选择，覆盖浏览器探测）。

- [ ] **Step 3: 字体回落检查**

中文模式下 `preview_screenshot` 首页 + about + contact，肉眼确认：无方块 / 缺字；contact 标题「打个招呼」、about 弹窗、气泡问候语均为干净中文系统字体；导航、app 名、详情页大标题仍是英文手写体。

- [ ] **Step 4: 导航英文恒定 + reduced-motion**

`preview_eval`: `[].map.call(document.querySelectorAll('.nav a'),a=>a.textContent.trim()).join(',')` 中英两种模式下 Expected 均含 `about,works,contact`。
`preview_resize` 到窄屏（如 390px）`preview_screenshot` 确认开关在顶部导航行内正常、可点。

- [ ] **Step 5: 控制台零报错 + nav 失败兜底**

逐页 `preview_console_logs` Expected 无报错。

- [ ] **Step 6: 收尾提交（若验证中有修则已在对应任务提交，此处仅在有遗留微调时用）**

```bash
git add -A
git commit -m "chore(i18n): 收尾验证微调" || echo "无改动，跳过"
```
