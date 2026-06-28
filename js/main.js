/* tanqinghua. — shared behaviour
   1) 注入共享左列导航
   2) 按当前文件名判 active（works / talks 子页分别强制高亮对应项）
   3) works 列表 hover → data-theme 预览代表色
   必须经本地服务器跑（fetch + file:// 会被 CORS 挡）。 */

(function () {
  "use strict";

  function markActive() {
    var path = location.pathname;
    var file = path.split("/").pop() || "index.html";
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
    // home (index.html) 不是导航项，不标 active —— 自然不会匹配。
  }

  function bindWorksHover() {
    document.querySelectorAll(".app-card[data-theme]").forEach(function (card) {
      var theme = card.getAttribute("data-theme");
      card.addEventListener("mouseenter", function () {
        document.body.dataset.theme = theme;
      });
      card.addEventListener("mouseleave", function () {
        document.body.dataset.theme = "";
      });
    });
  }

  /* about 彩蛋：点笔 → 弹窗 → 选 “nope, never” 解锁 hnip 学历 */
  function bindDegreeEasterEgg() {
    var trigger = document.querySelector("[data-degree-trigger]");
    var modal = document.getElementById("degree-modal");
    if (!trigger || !modal) return;

    var hidden = modal.parentNode.querySelector(".edu-hidden");
    var revealBtn = modal.querySelector("[data-reveal]");
    var opener = null;

    function open() {
      opener = document.activeElement;
      modal.hidden = false;
      if (revealBtn) revealBtn.focus();
    }
    function close() {
      modal.hidden = true;
      if (opener && opener.focus) opener.focus();
    }
    function reveal() {
      if (hidden) hidden.hidden = false;
      close();
    }

    trigger.addEventListener("click", open);
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
    if (revealBtn) revealBtn.addEventListener("click", reveal);
    modal.querySelectorAll("[data-dismiss]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) close();
    });
  }

  /* 截图全部加载失败时，彻底隐藏空画廊（onerror 已删除 .shot，这里收尾去掉残留间距） */
  function hideEmptyShots() {
    document.querySelectorAll(".shots").forEach(function (group) {
      if (!group.querySelector(".shot")) group.hidden = true;
    });
  }

  /* 截图画廊：包 .gallery、加左右箭头、点击放大 */
  function setupGalleries() {
    var lightbox = null;
    function openLightbox(src, alt) {
      if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.hidden = true;
        lightbox.innerHTML = '<img alt="">';
        lightbox.addEventListener("click", function () { lightbox.hidden = true; });
        document.body.appendChild(lightbox);
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && lightbox && !lightbox.hidden) lightbox.hidden = true;
        });
      }
      var img = lightbox.querySelector("img");
      img.src = src; img.alt = alt || "";
      lightbox.hidden = false;
    }

    document.querySelectorAll(".shots").forEach(function (shots) {
      if (!shots.querySelector(".shot")) return;       // 空画廊跳过

      shots.querySelectorAll(".shot img").forEach(function (img) {
        img.addEventListener("click", function () {
          openLightbox(img.currentSrc || img.src, img.alt);
        });
      });

      var gallery = document.createElement("div");
      gallery.className = "gallery";
      shots.parentNode.insertBefore(gallery, shots);
      gallery.appendChild(shots);

      var prev = document.createElement("button");
      prev.type = "button"; prev.className = "gallery-arrow prev";
      prev.setAttribute("aria-label", "previous"); prev.textContent = "‹";
      var next = document.createElement("button");
      next.type = "button"; next.className = "gallery-arrow next";
      next.setAttribute("aria-label", "next"); next.textContent = "›";
      gallery.appendChild(prev); gallery.appendChild(next);

      function step() {
        var first = shots.querySelector(".shot");
        return first ? first.getBoundingClientRect().width + 16 : 300;
      }
      function fit() {
        // 详情页破例：画廊伸进右侧空白，宽屏一次铺开所有截图（窄屏回到列宽）
        if (window.innerWidth <= 768) { gallery.style.width = ""; return; }
        var left = gallery.getBoundingClientRect().left;
        gallery.style.width = Math.max(320, window.innerWidth - left - 48) + "px";
      }
      function update() {
        var scrollable = shots.scrollWidth - shots.clientWidth > 2;
        prev.hidden = next.hidden = !scrollable;
        if (scrollable) {
          prev.disabled = shots.scrollLeft <= 1;
          next.disabled = shots.scrollLeft >= shots.scrollWidth - shots.clientWidth - 1;
        }
      }
      function refresh() { fit(); update(); }
      prev.addEventListener("click", function () { shots.scrollBy({ left: -step(), behavior: "smooth" }); });
      next.addEventListener("click", function () { shots.scrollBy({ left: step(), behavior: "smooth" }); });
      shots.addEventListener("scroll", update);
      window.addEventListener("resize", refresh);
      refresh();
      requestAnimationFrame(refresh);    // 移动 .shots 后等布局刷新再量一次
      shots.querySelectorAll("img").forEach(function (im) {
        if (!im.complete) im.addEventListener("load", refresh);
      });
    });
  }

  /* works 小猫：全页拖动，松手后一蹦一跳回到树下 */
  function setupCatDrag() {
    var cat = document.querySelector(".works-doodles .cat");
    if (!cat) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dragging = false, grabX = 0, grabY = 0, home = null, raf = null;

    function down(e) {
      e.preventDefault();
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      var loose = cat.classList.contains("loose");
      var r;
      if (!loose) {
        // 停在树下：先关走路动画量出“家”的基准坐标
        cat.style.animation = "none";
        cat.style.transform = "none";
        r = cat.getBoundingClientRect();
        home = { x: r.left, y: r.top };
        cat.classList.add("loose");
        cat.style.position = "fixed";
        cat.style.margin = "0";
        cat.style.right = "auto";
        cat.style.bottom = "auto";
        cat.style.left = r.left + "px";
        cat.style.top = r.top + "px";
      } else {
        // 半路被重新抓住：保留原来的家，从当前位置继续
        cat.style.transform = "none";
        r = cat.getBoundingClientRect();
        cat.style.left = r.left + "px";
        cat.style.top = r.top + "px";
      }
      cat.classList.add("dragging");
      grabX = e.clientX - r.left;
      grabY = e.clientY - r.top;
      dragging = true;
      try { cat.setPointerCapture(e.pointerId); } catch (_) {}
    }
    function move(e) {
      if (!dragging) return;
      cat.style.left = (e.clientX - grabX) + "px";
      cat.style.top = (e.clientY - grabY) + "px";
    }
    function reset() {
      cat.classList.remove("loose");
      cat.style.position = "";
      cat.style.left = cat.style.top = cat.style.right = cat.style.bottom = "";
      cat.style.margin = "";
      cat.style.transform = "";
      cat.style.animation = "";          // 走路动画恢复
    }
    function up(e) {
      if (!dragging) return;
      dragging = false;
      cat.classList.remove("dragging");
      try { cat.releasePointerCapture(e.pointerId); } catch (_) {}
      hopHome();
    }
    function hopHome() {
      var startX = parseFloat(cat.style.left) || 0;
      var startY = parseFloat(cat.style.top) || 0;
      var dx = home.x - startX, dy = home.y - startY;
      var dist = Math.hypot(dx, dy);
      if (reduce || dist < 4) { reset(); return; }
      var dur = Math.min(1300, Math.max(650, dist * 1.6));
      var hops = Math.max(2, Math.round(dist / 150));
      var hopH = Math.min(80, 26 + dist * 0.05);
      var face = dx < 0 ? -1 : 1;
      var t0 = performance.now();
      function frame(now) {
        var t = Math.min(1, (now - t0) / dur);
        var ease = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;  // easeInOutQuad
        var hopPhase = Math.abs(Math.sin(t * Math.PI * hops));
        var hop = hopPhase * hopH * (1 - t);
        cat.style.left = (startX + dx * ease) + "px";
        cat.style.top = (startY + dy * ease - hop) + "px";
        cat.style.transform = "scaleX(" + face + ") scale(" + (1 + 0.05 * hopPhase) + ")";
        if (t < 1) { raf = requestAnimationFrame(frame); }
        else { raf = null; reset(); }
      }
      raf = requestAnimationFrame(frame);
    }

    cat.addEventListener("pointerdown", down);
    cat.addEventListener("pointermove", move);
    cat.addEventListener("pointerup", up);
    cat.addEventListener("pointercancel", up);
  }

  /* home 聊天气泡：随机一句手写打招呼 */
  function setupNoteBubble() {
    var el = document.querySelector(".note-bubble-text");
    if (!el) return;
    var g = window.I18N ? I18N.greetings() : [];
    if (!g.length) return;
    el.textContent = g[Math.floor(Math.random() * g.length)];
  }

  /* 每页底部注入版权页脚 */
  function addFooter() {
    var page = document.querySelector(".page");
    if (!page || page.querySelector(".site-footer")) return;
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.setAttribute("data-i18n", "footer");
    f.textContent = "Copyright © 2026 tanqinghua. All Rights Reserved.";
    page.appendChild(f);
  }

  function injectNav() {
    var slot = document.getElementById("nav-placeholder");
    if (!slot) { markActive(); return; }

    fetch("/partials/nav.html?v=3")
      .then(function (res) { return res.text(); })
      .then(function (html) {
        slot.innerHTML = html;
        markActive();
        if (window.I18N) I18N.bindToggle(slot);
      })
      .catch(function (err) {
        console.error("nav inject failed:", err);
      });
  }

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

  // 图片（含失败）全部 settle 后：清理空画廊，再装箭头/灯箱
  window.addEventListener("load", function () {
    hideEmptyShots();
    setupGalleries();
  });
})();
