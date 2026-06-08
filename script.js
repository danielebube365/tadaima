/* Tadaima v3 — interaction (vanilla JS) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());

  /* sticky nav */
  var nav = $("#nav");
  var onScroll = function () { if (nav) nav.classList.toggle("is-scrolled", window.pageYOffset > 40); };
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

  /* autoplay kick for muted videos; pause for reduced motion */
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
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* scroll-scrubbed video (the shake clip): scroll down = forward, up = reverse */
  var scrub = $("video[data-scrub]");
  if (scrub) {
    var section = scrub.closest(".craft") || scrub.parentElement;
    var canScrub = !reduce && window.matchMedia("(min-width: 981px)").matches && !("ontouchstart" in window);
    if (!canScrub) {
      scrub.setAttribute("loop", ""); scrub.muted = true;
      var pf = scrub.play(); if (pf && pf.catch) pf.catch(function () {});
    } else {
      scrub.muted = true; scrub.pause();
      var dur = 0, primed = false, ticking = false;
      var setDur = function () { dur = scrub.duration || 2; };
      if (scrub.readyState >= 1) setDur(); else scrub.addEventListener("loadedmetadata", setDur);
      var prime = function () { if (primed) return; primed = true; var p = scrub.play(); if (p && p.then) p.then(function () { scrub.pause(); }).catch(function () {}); };
      var update = function () {
        ticking = false;
        if (!dur) return;
        var rect = section.getBoundingClientRect(), vh = window.innerHeight;
        var total = rect.height - vh;
        var prog = total > 40 ? (-rect.top) / total : (vh - rect.top) / (vh + rect.height);
        prog = Math.max(0, Math.min(1, prog));
        try { scrub.currentTime = prog * (dur - 0.04); } catch (e) {}
        section.classList.toggle("is-scrubbing", prog > 0.02 && prog < 0.98);
      };
      var req = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
      window.addEventListener("scroll", req, { passive: true });
      window.addEventListener("resize", req);
      if ("IntersectionObserver" in window) {
        var pio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { prime(); req(); } }); }, { threshold: 0.02 });
        pio.observe(scrub);
      } else { prime(); }
      scrub.addEventListener("loadeddata", req);
    }
  }
})();
