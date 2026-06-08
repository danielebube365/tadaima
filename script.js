/* Tadaima — interaction + motion (vanilla JS, no deps) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* year */
  var y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());

  /* sticky nav (drops the on-dark hero treatment once scrolled) */
  var nav = $("#nav");
  function onScroll() { if (nav) nav.classList.toggle("is-scrolled", window.pageYOffset > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile menu overlay */
  var toggle = $("#navToggle"), overlay = $("#menuOverlay");
  if (toggle && overlay) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      overlay.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    $$("a", overlay).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* autoplay kick for muted videos (and pause for reduced-motion) */
  $$("video[autoplay]").forEach(function (v) {
    if (reduce) { v.removeAttribute("autoplay"); try { v.pause(); } catch (e) {} return; }
    v.muted = true;
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (v.readyState >= 2) play(); else v.addEventListener("loadeddata", play, { once: true });
    document.addEventListener("visibilitychange", function () { if (!document.hidden && v.paused) play(); });
  });

  /* scroll reveal */
  var reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* parallax (cutouts + wall cards) — sets --py, combined with base transforms in CSS */
  var layers = $$("[data-parallax]");
  if (!reduce && layers.length) {
    var ticking = false, vh = window.innerHeight;
    var apply = function () {
      ticking = false;
      if (window.innerWidth <= 620) { layers.forEach(function (el) { el.style.removeProperty("--py"); }); return; }
      var mid = vh / 2;
      layers.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var center = r.top + r.height / 2;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
        el.style.setProperty("--py", ((mid - center) * speed).toFixed(1) + "px");
      });
    };
    var request = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(apply); } };
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", function () { vh = window.innerHeight; request(); });
    apply();
  }
})();
