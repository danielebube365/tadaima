/* Tadaima v2 — interaction + motion (vanilla JS) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());

  /* sticky nav */
  var nav = $("#nav");
  var onScroll = function () { if (nav) nav.classList.toggle("is-scrolled", window.pageYOffset > 30); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile menu */
  var toggle = $("#navToggle"), ov = $("#menuOv");
  if (toggle && ov) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      ov.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    $$("a", ov).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* reveal */
  var reveals = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* parallax: wall cards via --py; cups via inner-img transform (so CSS bob keeps working) */
  var layers = $$("[data-parallax]");
  if (!reduce && layers.length) {
    var ticking = false, vh = window.innerHeight;
    var clear = function () {
      layers.forEach(function (el) {
        if (el.classList.contains("wcard")) el.style.removeProperty("--py");
        else { var im = el.querySelector("img"); if (im) im.style.transform = ""; }
      });
    };
    var apply = function () {
      ticking = false;
      if (window.innerWidth <= 620) { clear(); return; }
      var mid = vh / 2;
      layers.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return;
        var val = (mid - (r.top + r.height / 2)) * (parseFloat(el.getAttribute("data-parallax")) || 0);
        if (el.classList.contains("wcard")) el.style.setProperty("--py", val.toFixed(1) + "px");
        else { var im = el.querySelector("img"); if (im) im.style.transform = "translateY(" + val.toFixed(1) + "px)"; }
      });
    };
    var req = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(apply); } };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", function () { vh = window.innerHeight; req(); });
    apply();
  }
})();
