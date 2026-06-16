/* tanqinghua. — shared behaviour
   1) 注入共享左列导航
   2) 按当前文件名判 active（works 子页强制高亮 works）
   3) works 列表 hover → data-theme 预览代表色
   必须经本地服务器跑（fetch + file:// 会被 CORS 挡）。 */

(function () {
  "use strict";

  function markActive() {
    var path = location.pathname;
    var file = path.split("/").pop() || "index.html";
    var inWorks = path.indexOf("/works/") !== -1;   // app 详情页

    document.querySelectorAll(".nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var hrefFile = href.split("/").pop();
      if (hrefFile === file || (inWorks && hrefFile === "works.html")) {
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

  /* 每页底部注入版权页脚 */
  function addFooter() {
    var page = document.querySelector(".page");
    if (!page || page.querySelector(".site-footer")) return;
    var f = document.createElement("footer");
    f.className = "site-footer";
    f.textContent = "Copyright © 2026 tanqinghua. All Rights Reserved.";
    page.appendChild(f);
  }

  function injectNav() {
    var slot = document.getElementById("nav-placeholder");
    if (!slot) { markActive(); return; }

    fetch("/partials/nav.html")
      .then(function (res) { return res.text(); })
      .then(function (html) {
        slot.innerHTML = html;
        markActive();
      })
      .catch(function (err) {
        console.error("nav inject failed:", err);
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectNav();
    bindWorksHover();
    bindDegreeEasterEgg();
    addFooter();
  });

  // 图片（含失败）全部 settle 后再清理空画廊
  window.addEventListener("load", hideEmptyShots);
})();
