/* tanqinghua. — 双语（中 / En）引擎
   data-i18n 替换文本；data-i18n-attr="attr:key;attr:key" 替换属性。
   英文原文采集自 HTML（单一来源），字典只写中文。
   跟随浏览器语言；手动切换记 localStorage['lang']。

   两条约定（维护者注意）：
   1) render() 用 textContent 改写，故 data-i18n 元素必须只含文本、无子元素
      （要带图标/SVG 时，把 data-i18n 打在内层纯文本 span 上，别打在外层）。
   2) 调用顺序：先 init()（定语言）→ 内容就位 → apply()（先采集英文再渲染）→
      之后才可 setLang()；apply 之前 setLang 会因 enCache 为空而无文可还原。 */
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
    "about.l9b": "（不过我已经拿下啦）",
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
    "contact.intro": "邮件是找我最快的方式——或者在网上各个角落也能找到我。",

    /* talks */
    "talks.filterAria": "按产品筛选",
    "talks.likeAria": "点个赞",

    /* contact 致谢 */
    "credits.head": "致谢",
    "credits.velour": "网页中的插画在这个账号得到的灵感",
    "credits.warren": "在新版中文适配中使用了这位作者的寒蝉手拙体"
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
      if (bits.length < 2 || !bits[0].trim()) return;   // 跳过空段 / 漏冒号的写法
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
