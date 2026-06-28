# talks 板块设计

日期:2026-06-27
状态:已确认,待落实现计划

## 目标

在导航 `works` 和 `contact` 之间新增 `talks` 板块,用来发布:app 更新、远期计划、个人碎碎念。包含一个列表页和一个详情页。延续全站"纯静态 HTML + 浏览器端 fetch/渲染、无构建步骤"的现状,只在点赞这一处引入一个 serverless function + Upstash(Vercel KV)。

## 范围内 / 范围外

**范围内**:导航项、列表页、详情页、Markdown 帖子内容模型、双语、产品 tag 筛选、全局点赞计数、talks 专属 doodle 与动画。

**范围外(YAGNI)**:评论、RSS、全文搜索、分页、标签管理后台、富文本编辑器、Markdown 内容的 XSS 净化(内容均为站长本人撰写,可信)。

## 信息架构 / 文件

```
talks.html                     列表页(对标 works.html)
talks/detail.html              详情页模板,用 ?p=<slug> 定位帖子
talks/posts.json               帖子清单(元数据,语言无关 + 中英标题/摘要)
talks/<slug>.zh.md             帖子正文,中文
talks/<slug>.en.md             帖子正文,英文
js/talks.js                    列表渲染 + 详情渲染 + markdown + 点赞
js/vendor/marked.min.js        本地 vendored 的 markdown 库
api/likes.js                   serverless function:点赞读/写
vercel.json                    漂亮 URL 重写规则(新增)
partials/nav.html              新增 talks 导航项(改)
css/style.css                  talks 样式 + 动画(改)
js/main.js                     markActive 支持 talks 子页高亮(改)
assets/doodles/talks-*.png     已就绪(见下)
```

### slug 命名:日期前缀

slug 采用「日期 + 短关键词」,例如 `2026-06-27-notiee-1-0-5`。好处:文件名/清单天然按时间排序;ascii、可读、利于分享;非中文标题;加日期短词避免同天撞名。md 文件即 `talks/2026-06-27-notiee-1-0-5.zh.md` / `.en.md`。

### 漂亮 URL

对外链接用 `/talks/<slug>`(无 `.html`、无 `?p=`)。靠 `vercel.json` 重写实现:

```json
{ "rewrites": [{ "source": "/talks/:slug", "destination": "/talks/detail.html?p=:slug" }] }
```

详情页 JS 仍从 `?p=` 读 slug(重写对用户透明);列表页卡片 `href` 指向漂亮路径 `/talks/<slug>`。需排除已有静态文件(`detail.html`、`posts.json`、`*.md`)被规则吞掉——`:slug` 仅匹配单段、且这些文件有自己的真实路径,Vercel 优先命中真实文件,故安全。

### 为什么用 `posts.json` 清单

没有构建步骤,浏览器无法"列出目录里有哪些 md 文件",因此需要一份手动维护的清单。发新帖 = 往 `posts.json` 加一条 + 放两个 md 文件。

### posts.json 结构

```json
[
  {
    "slug": "2026-06-27-notiee-1-0-5",
    "date": "2026-06-27",
    "tags": ["notiee"],
    "title": { "zh": "notiee 1.0.5 更新说明", "en": "notiee 1.0.5 update info" },
    "summary": { "zh": "一句话摘要", "en": "one-line summary" }
  }
]
```

- `tags`:0 个或多个产品标签(`notiee` / `dreamland` / `artista` / `tomanotes`)。碎碎念通常为 `[]`;若碎碎念里提到某产品想法,可打上对应 tag。
- 日期、tags 为语言无关,放清单;标题、摘要双语。
- 渲染时按 `date` 倒序排列。

### Markdown 文件

- 每帖两个文件:`<slug>.zh.md` / `<slug>.en.md`,纯正文(不需要 front-matter,元数据都在清单里),保持文件干净好写。
- 站长每次更新自行撰写两种语言,系统不做机器翻译。

## 导航

- `partials/nav.html` 在 `works` 与 `contact` 之间插入 `talks` 链接,沿用现有结构(含黄色 `active-mark` SVG squiggle)。
- `js/main.js` 的 `markActive()`:当路径含 `/talks/`(详情页)时,强制高亮 `talks.html` 导航项,与现有 works 子页逻辑一致。

## 列表页(talks.html)

- 结构对标 [works.html](../../../works.html):注入共享导航 + `main.content`。
- **产品筛选 chip**:一排 `notiee / dreamland / artista / tomanotes`,每个带对应 app 的 icon(引用 `assets/works/<app>/` 现有图,不算新 doodle)。
- **筛选逻辑**:默认无选中 = 显示全部帖子(含无 tag 的碎碎念);点某个产品 chip = 只显示带该 tag 的帖子;再点取消。
- **帖子卡片**:日期 + 标题(链到 `talks/detail.html?p=<slug>`)+ 一句摘要 + tag 标记。标题用 `--font-hand`,其余 `--font-body`。
- chip 可复用 works 列表的 `data-theme` hover 预览代表色机制(可选润色)。
- 右上角 doodle:`talks-tree`(静止)+ `talks-brid`(自由浮动)。

## 详情页(talks/detail.html)

- 骨架对标 [works/notiee.html](../../../works/notiee.html):`← talks` 返回链接 → 日历 doodle + 日期 → 标题 → 点赞 → 正文。
- `js/talks.js` 从 URL 读 `?p=<slug>`(漂亮 URL 经 vercel 重写后参数透明传入),在 `posts.json` 找到该帖,按当前语言 fetch 对应 `.md`,用 marked 渲染进正文容器。
- **字体**:标题、日历旁的日期文字用 `--font-hand`(tanqinghuafont);正文、按钮、tag 用 `--font-body`。
- **点赞爱心**:放在标题正下方。
- 语言切换(`langchange` 事件)时重新 fetch 当前帖的另一语言 md 并重渲染正文。
- 不强制 `data-theme`,保持中性(碎碎念也一致);因此 doodle 不会被 dreamland 主题反色。
- 右上角 doodle:`talks-bag`(缓慢摇摆)+ `talks-bagstars`(彩蛋,见下)。

## Markdown 渲染

- 用 `marked`(本地 vendored 到 `js/vendor/marked.min.js`),仅在详情页加载。
- 内容均为站长撰写,可信,先不引入 DOMPurify 等净化库,保持轻量。

## i18n

- 页面外壳(导航、按钮、tag 文案、空状态等)沿用现有 `data-i18n` / `I18N` 机制。
- 帖子正文走"按当前语言 fetch 对应 md"的方式,不进 i18n key 字典(长文不适合 key 化)。
- 列表卡片的标题/摘要从 `posts.json` 的 `title[lang]` / `summary[lang]` 取,`langchange` 时重渲染。

## 点赞功能

### 后端 `api/likes.js`(Vercel Serverless Function)

- 依赖 `@vercel/kv`(加入 package.json),零配置读取环境变量 `KV_REST_API_URL` / `KV_REST_API_TOKEN`(Upstash「talks-likes」库已建好并 Connect 到项目,前缀 `KV`)。
- KV key:`likes:<slug>`。
- `GET /api/likes?slug=<slug>` → `{ count }`(读 `kv.get`,空则 0)。
- `POST /api/likes` body `{ slug }` → `kv.incr` 后返回 `{ count }`。
- 校验 slug 必须存在于已知帖子集合(防止任意写入新 key)。

### 前端

- 详情页加载时 `GET` 当前帖赞数并显示。
- 点击爱心:若 `localStorage` 无 `liked:<slug>`,则 `POST` +1、填充爱心、写入 `localStorage`(软防重,不做登录);已点过则不再 +1。
- 单向点赞,不做取消(与"+1"约定一致)。

## doodle 与动画

素材已就绪于 `assets/doodles/`,统一规格:透明背景 + 纯黑线稿、@2x。

| 文件 | 页面 / 位置 | 动画 |
|---|---|---|
| `talks-tree.png` | 列表页右上 | 静止(同 works-tree) |
| `talks-brid.png` | 列表页、树旁 | 自由浮动:轻微上下平移 + 偏头(`@keyframes`,缓动、循环、alternate) |
| `talks-bag.png` | 详情页右上 | 极缓慢摇摆(小角度 rotate 往复,像被风吹) |
| `talks-star-1/2/3.png` | 详情页、袋子周围 | **彩蛋**:三颗各自逐帧旋转 + 可分别拖拽(见下) |
| `talks-calendar.png` | 详情页日期旁 inline | 静止 |

> `talks-star-1/2/3.png` 由原 `talks-bagstars.png` 程序拆分而来(连通域裁剪,各保留手绘原貌);原图已被取代、不再引用,可删。

### 星星彩蛋

- **三颗独立**:`talks-star-1`(大)、`-2`(中)、`-3`(小),摆在袋子周围不同位置,各自是独立 DOM 元素。
- **逐帧旋转**:`animation: <spin> 0.7s steps(N) infinite;`,用 `steps()` 做一格一格的定格转动观感(周期取 0.6–0.8s,如 0.7s);三颗用不同 `animation-delay` / 步数错开,不同步。
- **可分别拖拽**:沿用 [js/main.js](../../../js/main.js) 小猫 `setupCatDrag` 的指针拖拽机制,但**落在哪停哪、不蹦回原位**(去掉 hopHome 逻辑),每颗星独立绑定。拖动中保持旋转。
- 抽成 `js/talks.js` 里可复用的拖拽函数(对一组元素逐个绑定)。

## 字体落点

- `--font-hand`(tanqinghuafont,已有 `@font-face`):列表/详情标题、详情页日期文字。
- `--font-body`(Inter / 苹方):正文、摘要、按钮、tag、其余文字。

## 测试

- 列表页:无 tag 默认全显;点 chip 正确过滤;空过滤结果有兜底文案。
- 详情页:`?p=<slug>` 正确加载对应帖;中英切换正文跟随;marked 渲染正常。
- 点赞:GET 显示数;首次点击 +1 并持久(刷新仍填充);同浏览器重复点击不再 +1;serverless function 在 preview/production 环境读到 KV 变量。
- doodle:brid 浮动、bag 摇摆、三颗星各自逐帧转 + 可分别拖拽落定;dreamland 主题下 talks 页 doodle 不被反色(因不设 theme)。
- 漂亮 URL:`/talks/<slug>` 经 vercel 重写正确加载;`posts.json`、`*.md` 等真实文件不被重写规则误吞。
- 响应式:窄屏 doodle 收起 / 缩放,沿用现有 `@media` 断点处理。
