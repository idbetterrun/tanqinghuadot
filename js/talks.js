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
  function lang() { return (window.I18N && window.I18N.current) || "en"; }
  function t(k) { return (STR[lang()] || STR.en)[k]; }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }

  function fetchPosts() {
    return fetch("/talks/posts.json").then(function (r) {
      if (!r.ok) throw new Error("posts.json " + r.status);
      return r.json();
    });
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
      var titleObj = p.title || {};
      return '<li class="talks-item"><a class="talks-item-link" href="/talks/'
        + encodeURIComponent(p.slug) + '">'
        + '<span class="talks-item-date">' + esc(fmtDate(p.date, l)) + "</span>"
        + '<span class="talks-item-title">' + esc(titleObj[l] || titleObj.en || "") + "</span>"
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
    document.addEventListener("langchange", function () { renderList(listEl); });
    fetchPosts().then(function (posts) {
      listState.posts = posts.slice().sort(byDateDesc);
      renderList(listEl);
      bindChips(listEl);
    }).catch(function (err) {
      console.error("[talks] failed to load posts:", err);
      listEl.innerHTML = '<li class="talks-empty">' + esc(t("empty")) + "</li>";
    });
  }

  /* ---------- 详情页(Task 4 填充) ---------- */
  function setupLike(slug, root) { /* Task 7 */ }
  function setupStars(scope) { /* Task 9 */ }
  function initDetail(root) { /* Task 4 */ }

  document.addEventListener("DOMContentLoaded", function () {
    var listEl = document.querySelector("[data-talks-list]");
    var detailEl = document.querySelector("[data-talks-detail]");
    if (listEl) initList(listEl);
    if (detailEl) initDetail(detailEl);
  });
})();
