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
    "resume.role2": "小满摘星计划 AI 实习生（实习中）",
    "resume.org4": "度小满科技（北京）有限公司",

    /* about 弹窗 + 笔 */
    "modal.q": "你不会因为我的学历看不起我吧？",
    "modal.yes": "不会，绝对不会",
    "modal.no": "……说实话，我也不好说",
    "about.penAria": "点一下笔",

    /* 标语（works 列表 + 详情页共用）
       注：blurb.artista / blurb.tomanotes 已随两页详情页删除——
       这两个项目停更、撤出列表，现在只由右下角苹果的弹窗介绍（见 retired.*） */
    "blurb.notiee": "把拍照、录音和文字攒成能搜索、能追问的知识库的 iOS 笔记 app",
    "blurb.dreamland": "用 AI 搭建和推演虚构世界的 macOS app",
    "blurb.nsad": "想接手一家开在异世界夹缝里的中立食堂吗？那就来试试这款第一视角、粗糙 3D 的喜剧经营游戏吧",
    "blurb.dongdong": "一款面向儿童的运动激励 App",

    /* 作品名（只有中英不同名的才进字典，其余同名的不进） */
    "title.dongdong": "动动星球",

    /* 详情 notiee */
    "d.notiee.meta": "即将上架 App Store · 本期 TestFlight 测试已结束 · iOS 18.0+",
    "d.notiee.p1": "照片会被读成标题、摘要、要点和关键词，藏在里面的待办也一并拎出来；录音在手机上实时转成文字，能暂停续录、倍速回放，点一句跳到那一句；Markdown 保存即完成。",
    "d.notiee.p2": "AI 负责 OCR、摘要、详细内容、要点、名词定义和待办提取。认出来的待办和日程直接进入任务列表和日历——系统日历、notiee 事件、AI 排的日程和导入的课表在同一条时间线上，到点提醒，锁屏和灵动岛显示倒计时。只记得大概意思，也能用全文搜索或语义检索翻出来。",
    "d.notiee.p3": "Notti 是住在资料库里的 AI 伴侣，一共十八项能力：找笔记、整理要点、建待办、改记录、查日程、上网搜索。删除类操作会先问过你，每一步都能撤销；它记住的偏好和长期目标也只留在设备上。",
    "d.notiee.p4": "数据默认只存在 iPhone 上：单条笔记可加密（加密内容不进搜索也不进同步），支持密码和 Face ID 应用锁，一条笔记能导出成 .tmn（文字图片都带走），整个资料库也能手动备份到 iCloud Drive。免费版每月 30 篇云端 AI，订阅后 300 篇，用尽自动退回本机 OCR；notiee+ 一次性购买，填自己的 Endpoint 和 Key 直连服务商，没有月度上限。支持简体中文、繁體中文和 English。",
    "d.notiee.tf": "TestFlight 测试",
    "d.notiee.tfAria": "TestFlight 测试 — 本期已结束",
    "d.notiee.tfNotice": "本期测试已结束，请等待下期测试。",
    "d.notiee.store": "即将上架 app store",
    "d.notiee.storeAria": "即将上架 App Store",
    "d.notiee.web": "官网",
    "d.notiee.webAria": "官网敬请期待",
    "d.notiee.soon": "敬请期待",
    "d.notiee.iconAlt": "notiee 应用图标",
    "d.notiee.shotAlt": "notiee 截图",

    /* 详情 dreamland */
    "d.dreamland.download": "下载 dreamland 测试版",
    "d.dreamland.meta": "还在早期阶段 · 2026 年 6 月起",
    "d.dreamland.p1": "世界和故事是慢慢生长出来的。",
    "d.dreamland.p2": "dreamland 是一个本地优先的 macOS app，给喜欢构想世界、写故事的人用。你可以一点点搭出人物、势力和规则，再看看一件事发生后，整个世界会怎么回应。",
    "d.dreamland.p3": "从一个世界种子开始。AI 会追问，帮你整理出初稿：这个世界的规则、主要势力、当下的张力，以及故事能从哪里开始。你审过、确认，世界才成形。",
    "d.dreamland.p4": "之后，你可以补充设定，也可以发起推演：谁会作出反应，什么会改变，又留下了什么麻烦。结果先等你审阅，可以勾选，也可以丢弃；确认进去的才算数。你补充内容、发起推演或推动时间，世界才往前走。",
    "d.dreamland.p5": "人物、事件、事实和关系都会留下来。你可以翻看它们，沿着时间线回顾，也能查看每个世界版本的变化；之后推演时，再从这些记录里找相关的背景。想修改过去的事件或事实，还能逐层检查影响，决定哪些保留、改写或移除，旧记录也有迹可循。",
    "d.dreamland.p6": "世界数据存在你的 Mac 上。AI 服务商由你自己接入，生成时会把你的输入和相关世界背景发给它。用 Tauri、Rust、SQLite 和 React 做成，还在早期阶段。",
    "d.dreamland.iconAlt": "dreamland 应用图标",
    "d.dreamland.shotAlt": "dreamland 截图",

    /* 详情 nsad（no smiting at the diner） */
    "d.nsad.meta": "还在早期阶段 · 2026年10月起",
    "d.nsad.p1": "勇者、魔王、加班的幽灵和来采购的外星人，总得找个地方吃饭。你的小店开在他们各自世界的夹缝里，只有一条店规：禁止施法和斗殴。这是一款第一视角的喜剧经营游戏，3D 刻意做得粗糙、低多边形，热闹之外也留一点温柔。",
    "d.nsad.p2": "顾客很少把想要什么说得明明白白。你要听出线索，再用一道菜回答：切多碎、火多大、放什么、怎么摆盘，这些动作会变成风味、熟度和呈现标签。有时一道菜字面上完全正确，却读错了对方的心事；这次误会也可能打开另一条故事。",
    "d.nsad.p3": "厨房只是工作的一半。你得端着一盘菜穿过拥挤的大厅，顾客会串桌，饭菜会变凉，死对头也可能开始互相瞪眼。小摩擦可以靠一句话或一盘合适的菜化解；真打起来了，就拿灭火器。泡沫能换来几秒冷静，但容量有限，喷错人还会伤感情。",
    "d.nsad.p4": "留意谁走向收银台，谁总在瞟门口。追出去拦人，锅里的饭可能就糊了；误抓正准备付钱的顾客，也会扣关系。碰到确实付不起的人，则要换一种聊法：听听缘由，给对方一个台阶，也许他会留下洗碗抵债，成为店里的员工。",
    "d.nsad.p5": "每位员工都有一项本事，也带着一个麻烦。恶魔能跳过加热，却容易把菜弄出焦味；勇者送餐快，但可能撞翻人；幽灵能穿墙，有时盘子也一起穿过去。每晚从名册里挑一小队人上班，要考虑工资、疲劳和谁跟谁合得来。他们可能误解指令，也会摸鱼，不过都有预兆，出了岔子还能补救。",
    "d.nsad.p6": "开店前，手机里是供应商消息、排班和昨天的外卖评价。砍价最多三回合，可以见好就收，也能直接原价下单；食材和升级次日到货。趁堂食还没忙起来，集中做好几份外卖，打包送进传送门。一行订单备注里藏着需求，至于做得对不对，得等明天的评价。",
    "d.nsad.p7": "打烊后，算算收入，也看看每位顾客记住了什么。饭菜、误会和小小的善意会改变关系，让后面的夜晚解锁故事和专属货源。吵吵闹闹之下，也许有个魔王，只想吃一碗妈妈做的那种普通蛋炒饭。每一道菜都是回答，每一次选择都会留下痕迹。",
    "d.nsad.p8": "AI 负责理解诉求和指令，也负责角色的台词、评价和借口。金钱、成败、关系和事件能否触发，都由游戏规则判定；角色能做的事也有固定范围。没有网络或模型配额时，会退回预写对白和固定行为，让核心玩法仍然完整可玩。",
    "d.nsad.iconAlt": "no smiting at the diner 游戏图标",
    "d.nsad.shotAlt": "no smiting at the diner 截图",

    /* 详情 动动星球：仅介绍产品体验，不公开具体技术实现 */
    "d.dongdong.meta": "TestFlight 测试开启中，2026 年 7 月至今",
    "d.dongdong.tf": "加入 TestFlight 测试",
    "d.dongdong.p1": "今天动一动，就离下一颗星球近一点。",
    "d.dongdong.p2": "动动星球是一款面向儿童的 iPhone 运动养成 app，把每天的运动串成一场星球探索。完成活动、获得能量，再用积攒的能量解锁下一颗星球，让每天的努力都变成看得见的旅程进度。",
    "d.dongdong.p3": "每天从三个任务开始，有跟着做的运动，也有适合一家人参与的亲子活动。有的可以由孩子独立完成，有的需要大人陪在身边，运动也可以成为一起度过的一段时间。",
    "d.dongdong.p4": "旅程从启航星出发，接着走向珊瑚星、金辉星、蓝风星和青芽星。星图里能看到已经走过的路，也能看看下一站在哪里；小伙伴点点会陪着孩子一起探索。",
    "d.dongdong.p5": "运动场里有跳绳测试、每周挑战和跳绳里程碑。运动获得的碎片可以在每周商店兑换收藏和装扮物品，回顾页则留下过往的运动记录，让孩子能翻一翻自己已经完成了什么。",
    "d.dongdong.p6": "家长有单独的入口，可以管理孩子的资料、查看运动计划和处理隐私设置。授权和敏感设置交给大人，孩子的空间则保持简单：动起来、去探索，攒下自己的小小成就。",
    "d.dongdong.iconAlt": "动动星球 应用图标",
    "d.dongdong.shotAlt": "动动星球 截图",

    /* 停更项目（works 右下角的苹果 + 点开的弹窗）
       注：苹果的填充色和弹窗底色不走这里，写死在 works.html 的
       .apple[data-retired] 与 .modal-box--retired 上 */
    "retired.tomanotes.open": "tomanotes — 已停更",
    "retired.tomanotes.desc": "一个免费、本地优先的 mac 笔记 app，也是我第一个真有陌生人下载的东西。",
    "retired.tomanotes.why": "停更原因：它会被并进以后的 notiee desktop，所以它在那儿继续活着，不在这儿了。",
    "retired.artista.open": "artista — 已停更",
    "retired.artista.desc": "一个 mac 原生 app，靠拖拽来搭网页，有点像做幻灯片。",
    "retired.artista.why": "停更原因：后来发现自己远没有这种能力，而且 codex 已经做了很接近的事。",
    "retired.lastVersion": "最后维护版本",
    "retired.close": "关闭",

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
