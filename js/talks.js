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
  function setupLike(slug, root) {
    var box = root.querySelector("[data-talks-like]");
    if (!box) return;
    var btn = box.querySelector(".like-btn");
    var countEl = box.querySelector("[data-talks-likecount]");
    if (!btn || !countEl) return;
    var likedKey = "liked:" + slug;
    var liked = false;
    try { liked = localStorage.getItem(likedKey) === "1"; } catch (_) {}
    if (liked) btn.classList.add("liked");

    var posted = false;
    fetch("/api/likes?slug=" + encodeURIComponent(slug))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("likes " + r.status)); })
      .then(function (d) { if (!posted && typeof d.count === "number") countEl.textContent = d.count; })
      .catch(function () { if (!posted) countEl.textContent = "0"; });

    btn.addEventListener("click", function () {
      if (liked) return;
      liked = true;
      posted = true;
      btn.classList.add("liked");
      try { localStorage.setItem(likedKey, "1"); } catch (_) {}
      fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug })
      })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("likes " + r.status)); })
        .then(function (d) { if (typeof d.count === "number") countEl.textContent = d.count; })
        .catch(function () {});
    });
  }
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
  var CAL_MON = ["jan", "feb", "mar", "apr", "may", "jun",
                 "jul", "aug", "sep", "oct", "nov", "dec"];

  function renderHead(post, root) {
    var l = lang();
    var titleObj = post.title || {};
    var dEl = root.querySelector("[data-talks-date]");
    var tEl = root.querySelector("[data-talks-title]");
    var mEl = root.querySelector("[data-talks-month]");
    var dayEl = root.querySelector("[data-talks-day]");
    var cd = new Date(post.date + "T00:00:00");
    if (mEl) mEl.textContent = CAL_MON[cd.getMonth()];     /* 日历上侧:月份简写 jan/feb… */
    if (dayEl) dayEl.textContent = cd.getDate();           /* 日历下侧:日期数字 */
    if (dEl) dEl.textContent = fmtDate(post.date, l);
    if (tEl) tEl.textContent = titleObj[l] || titleObj.en || "";
    document.title = (titleObj[l] || titleObj.en || "talks") + " — tanqinghua.";
  }

  function loadBody(post, root) {
    var bodyEl = root.querySelector("[data-talks-body]");
    if (!bodyEl) return;
    fetch("/talks/" + encodeURIComponent(post.slug) + "." + lang() + ".md")
      .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error("md " + r.status)); })
      .then(function (md) {
        bodyEl.innerHTML = window.marked ? window.marked.parse(md) : esc(md);
      })
      .catch(function (err) { console.error("[talks] failed to load body:", err); bodyEl.textContent = t("empty"); });
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
      renderHead(post, root);
      loadBody(post, root);
      setupLike(post.slug, root);
      setupStars(document);
      document.addEventListener("langchange", function () {
        renderHead(post, root);
        loadBody(post, root);
      });
    }).catch(function (err) {
      console.error("[talks] failed to load post:", err);
      var tEl = root.querySelector("[data-talks-title]");
      if (tEl) tEl.textContent = t("empty");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var listEl = document.querySelector("[data-talks-list]");
    var detailEl = document.querySelector("[data-talks-detail]");
    if (listEl) initList(listEl);
    if (detailEl) initDetail(detailEl);
  });
})();
