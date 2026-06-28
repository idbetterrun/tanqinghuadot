# tanqinghua. 双语切换（汉化）— 设计文档

> 给现有纯静态多页站加「中 / En」双语切换。机制：`data-i18n` 属性 + 集中字典 + JS 替换。
> 默认跟随浏览器语言，手动切换后记住选择。中文走系统字体，导航保持英文。
> 语调基准：**平、白、诚实，不修饰**（沿用站主给的 about 译文风格）。

---

## 1. 决策汇总

| 项 | 决定 |
|---|---|
| 实现机制 | `data-i18n="key"` 标记 + `js/i18n.js` 集中字典 + JS 替换 textContent / 属性 |
| 默认语言 | 跟随浏览器：`navigator.language` 以 `zh` 开头 → 中文，否则英文 |
| 记忆 | 手动切换后写 `localStorage['lang']`，下次直接用，不再看浏览器 |
| 中文字体 | 系统字体栈，不加载任何 web 字体 |
| 导航 | `tanqinghua.` / `about` / `works` / `contact` 永远英文（留住手写签名感） |
| 社交标签 | 全部保持英文（`rednote`/`douyin` 不译） |
| 浏览器标签 `<title>` | 保持英文（与导航一致） |
| 页脚 | 中文模式译为中文 |

## 2. 单一来源原则

英文是 HTML 内联文本本身，**不在字典里再写一遍**。`I18N.apply()` 首次运行时「采集」每个 `[data-i18n]` 元素的现有 textContent 作为英文原文缓存；字典里只手写中文。切回英文 = 还原缓存。杜绝中英不同步。

页脚与首页气泡问候语由 JS 生成，不走 HTML 标记：页脚元素创建时带 `data-i18n="footer"` + 英文原文（会被采集）；气泡问候语从 `I18N.greetings()` 取当前语言数组。

## 3. 字体回落（已知取舍）

手写体 `tanqinghua` 仅含英文字形。以下平时用手写体的标题，显示中文时回落到中文系统字体（可接受，主签名 = 导航仍英文）。CSS 在 `html[lang="zh"]` 下给这些标题显式挂中文系统栈，保证回落干净：

- `.contact-title`（say hi. → 打个招呼）
- `.modal-q`（弹窗问题）
- `.note-bubble-text`（气泡问候语）
- `.resume-head`（英文词仍手写，后缀中文回落）

`.detail-title` / `.app-title` / `.site-name` 始终英文，不受影响。

中文系统字体栈：
```
"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif
```

## 4. 切换开关

`partials/nav.html` 里把死文字 `<span class="lang-toggle">中 / En</span>` 改成：

```html
<div class="lang-toggle" role="group" aria-label="language">
  <button type="button" class="lang-btn" data-lang="zh">中</button>
  <span class="lang-sep" aria-hidden="true">/</span>
  <button type="button" class="lang-btn" data-lang="en">En</button>
</div>
```

- 当前语言按钮 `.active`（opacity 1 + 略加粗）；另一个变暗（opacity .5）。
- 点击非当前语言 → `I18N.setLang()`。
- CSS：`.lang-btn` 去掉 button 默认边框/背景，继承字号，`cursor: pointer`；替换现有 `.lang-toggle{cursor:default}`。
- 键盘可聚焦，复用现有 `:focus-visible` 黄框。

## 5. JS 架构

### 新增 `js/i18n.js` — `window.I18N`

```
ZH          中文字典 { key: "中文" }
GREETINGS   { en: [...], zh: [...] }
enCache     采集到的英文原文 { key: "原文" }
current     'en' | 'zh'

init()        探测语言（localStorage 优先，否则 navigator.language），
              设 document.documentElement.lang。不动 DOM。
apply(root)   采集 root 内 [data-i18n] 的英文原文（仅首见）→ 按 current 渲染
              文本与属性。
setLang(lang) 设 current、写 localStorage、document.documentElement.lang、
              render(document)、updateToggle()、派发 'langchange' 事件。
greetings()   返回 GREETINGS[current]。
bindToggle(r) 给 r 内 .lang-btn 绑 click → setLang。
```

属性翻译用 `data-i18n-attr="aria-label:key.x;alt:key.y"` 形式（分号分隔多个），采集与渲染同文本逻辑。

### 改 `js/main.js`

- `DOMContentLoaded`：
  1. `I18N.init()`
  2. `addFooter()` —— 页脚带 `data-i18n="footer"` + 英文原文
  3. `setupNoteBubble()` —— 从 `I18N.greetings()` 随机挑一句
  4. `I18N.apply(document)` —— 采集（此时页脚已存在）+ 渲染
- `injectNav()` 注入完成后：`I18N.bindToggle(slot)` + `I18N.updateToggle()` + `markActive()`（nav 本身无 `data-i18n`，无需采集）。
- 监听 `document` 的 `langchange`：重跑 `setupNoteBubble()`（按新语言重挑问候语）。
- 首屏闪烁：body 现有 0.4s `pageIn` 淡入正好遮住英→中替换。

### 引入顺序

8 个页面 head 在 `main.js` 之前加：
```html
<script src="/js/i18n.js?v=1" defer></script>
```
`defer` 保证执行顺序。统一把所有 `?v=1` 提到 `?v=2`（i18n.js / main.js / style.css / nav.html）以破缓存。

## 6. 改动文件清单（12）

`js/i18n.js`(新) · `js/main.js` · `partials/nav.html` · `css/style.css` ·
`index.html` · `about.html` · `works.html` · `contact.html` ·
`works/notiee.html` · `works/dreamland.html` · `works/artista.html` · `works/tomanotes.html`

## 7. 不翻译

站点名、导航三项、app 名、邮箱、社交标签、`<title>`。技术词原样：`iOS` `mac` `swift` `swiftui` `webkit` `json` `api key` `ocr` `latex` `mit` `github` `tiptap` `markdown` `electron` `fastapi` `python` `react` 等。

## 8. 译文全表

### 首页气泡问候语（中文随机库）
```
你好呀 ：）
嘿，是你呀
你来啦
嘘——给我留句话？
咚咚咚
说点什么？
在想什么呢？
给我留个言吧
哈喽哈喽
跟我说点什么吧
```
气泡 `aria-label`：`leave me a note` → 给我留个言

### about 独白（10 句，站主定稿，原样）
```
一个普通人
喜欢动手，会搞点小app的开发
喜欢听歌，看电影，只会说好看不好看，文笔太差不会写影评
喜欢旅行，但是还没去过多少地方
学的英语但是英语自认为不太好
有时特别自信，有时感觉一切都完蛋了
有时会做一些很美的梦，有时感觉一切完蛋了
我看到别人的个人网站都会写点，我也学着这样写了一点。
其实当时我应该买idbetter.run这个域名的
谢谢你看到这里：）
```

### about 履历
| 英文 | 中文 |
|---|---|
| education | education 教育经历 |
| internship | internship 实习经历 |
| business english | 商务英语 |
| xiangnan university | 湘南学院 |
| business English（隐藏项） | 商务英语 |
| hunan industry polytechnic | 湖南工业职业技术学院 |
| admin assistant (office paperwork, basically) | 行政助理（基本就是处理办公室文书） |
| changsha zhongbiaoyi information technology co., ltd. | 长沙中标易信息技术有限公司 |

### about 弹窗
| 英文 | 中文 |
|---|---|
| you're not gonna judge me for my degree, right? | 你不会因为我的学历看不起我吧？ |
| nope, never | 不会，绝对不会 |
| ...honestly, no clue | ……说实话，我也不好说 |

笔记本 `aria-label`：`click the pen` → 点一下笔

### works 列表介绍
| app | 中文 |
|---|---|
| notiee | 一个住在你日历里的 iOS 笔记 app |
| artista | 像做幻灯片一样做网页，mac 原生 app |
| dreamland | 一个能戳一戳的文字小世界，由大模型驱动 |
| tomanotes | 一个我做出来的桌面笔记 app，没想到真有人用 |

### 详情页 · notiee
- 标语：一个住在你日历里的 iOS 笔记 app
- meta（`coming soon to App Store · from may 2026`）：即将上架 App Store · 2026 年 5 月起
- 正文：
  1. 一个 iOS app，把白板、幻灯片、会议记录的照片自动变成结构化的笔记。
  2. 拍张照，ai 读懂它（ocr + latex），再整理成标题、摘要、要点和待办。它还知道你的日程：会看你的日历，自动把每条笔记关联到你当下正在上的课或开的会。内置一个叫 spark 的 ai 助手，是真能干活的那种——搜笔记、管待办、查日历。你当前的日程甚至会实时显示在灵动岛上，还带倒计时。
  3. 离线也能用（联网后自动同步），所有东西都留在你手机上。用 swift + swiftui 写的。
- 按钮：`coming soon to app store` → 即将上架 app store；`website` → 官网；`.soon coming soon` → 敬请期待
- 按钮 aria：`coming soon to App Store` → 即将上架 App Store；`website coming soon` → 官网敬请期待

### 详情页 · dreamland
- 标语：一个能戳一戳的文字小世界，由大模型驱动
- meta（`still in the early stages · from june 2026`）：还在早期阶段 · 2026 年 6 月起
- 正文：
  1. 一个由大模型驱动的文字世界模拟器。你把一个世界写进 json 文件——它的法则、它的组织、它的地理、它的人物——引擎就会自己一回合一回合地把这个世界的历史演下去。
  2. 好玩的地方在于那些你没去写的东西。角色有真实的动机（一个 npc 破产了，它就真的会去偷另一个 npc 仓库里的东西），而世界记录下来的是真实发生过的事，不是 ai 想象出来的。所以你可能在酒馆里听到一条残缺的传闻，走到仓库，发现账对不上，然后自己把整件事拼出来。信息差是真实的，不是假的。
  3. 有几个我挺得意的想法：每回合只有「主角」级别的角色才烧 token，所以世界能低成本地铺得很大。还有，存档不是用来「继续」的——它是一段已经发生过的历史的记录。换一天、或者换一个模型重新加载，你会得到一条不一样的时间线。这是特性，不是 bug。
  4. python + fastapi 后端，react + electron 前端。目前还是 mvp 阶段——引擎能跑，有些部分还在接。

### 详情页 · artista
- 标语：像做幻灯片一样做网页，mac 原生 app
- meta（`still in the early stages · from june 2026`）：还在早期阶段 · 2026 年 6 月起
- 正文：
  1. 一个 mac 原生 app，靠拖拽来搭网页——有点像做幻灯片，只不过画布自始至终都是真正的 html。
  2. 你放下的每一个元素都是真实的 dom 节点。导出时，ai 会读懂你的布局，把它变成干净、响应式的 html/css。反过来也行——把 chatgpt 或 claude 给的 html 贴进来，可视化地改一改，再更干净地导出去。你也可以直接用大白话告诉 ai 要改什么，看着画布跟着变。
  3. 自带 api key（支持六家），所有东西都留在你本机。用 swiftui + webkit 写的。

### 详情页 · tomanotes
- 标语：一个我做出来的桌面笔记 app，没想到真有人用
- meta（`from march 2026`）：2026 年 3 月起
- 正文：
  1. 一个免费、开源、本地优先的 mac 笔记 app。做它是为了配 notiee（我那个 iOS 拍照笔记 app）——它俩共用同一种 .tmn 文件格式，笔记在两边来回搬也不会丢东西。
  2. 两种编辑器合一：富文本（tiptap）或纯 markdown，看你心情。笔记可以用触控 id 锁起来，还能一条一条单独加密。五套主题、三种语言，所有东西都留在你本机。
  3. mit 协议。代码在 github 上。
- 链接：`↓ Download` → ↓ 下载；`GitHub` 不译

### 详情页通用属性
| 英文 | 中文 |
|---|---|
| {app} app icon | {app} 应用图标 |
| {app} screenshot | {app} 截图 |

### contact
| 英文 | 中文 |
|---|---|
| say hi. | 打个招呼 |
| mail's the fastest way to reach me — or find me scattered around the internet. | 邮件是找我最快的方式——或者在网上各个角落也能找到我。 |

### 页脚
| 英文 | 中文 |
|---|---|
| Copyright © 2026 tanqinghua. All Rights Reserved. | © 2026 tanqinghua. 保留所有权利。 |

## 9. 验证

本地 `python3 -m http.server` 跑起来，逐项确认：
- 浏览器语言为中文时首屏即中文；英文环境首屏英文。
- 点「中 / En」即时换文、`<html lang>` 跟着变、高亮正确。
- 刷新后记住上次手动选择（localStorage）。
- 中文模式下手写体标题回落干净（无方块/丢字）。
- 导航、app 名、邮箱、社交标签在两种语言下都保持英文。
- 各页淡入正常，无明显闪烁；reduced-motion 仍受尊重。
- nav 注入失败时不报错（沿用现有 catch）。
```

