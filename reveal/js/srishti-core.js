/**
 * Srishti 2K26 — Core enhancements
 * Lenis smooth scroll, hero FX, story night sky, UI chrome, a11y
 */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── Lenis smooth scroll ─── */
  let lenis = null;
  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.srishtiLenis = lenis;
  }

  /* ─── Navbar scroll state ─── */
  function initNavbar() {
    const nav = document.getElementById("navbar");
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
      nav.classList.toggle("nav-hidden", false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ─── Scroll progress ─── */
  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ─── Back to top ─── */
  function initBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => btn.classList.toggle("visible", window.scrollY > 600),
      { passive: true },
    );
    btn.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ─── Announcement banner ─── */
  function initAnnouncement() {
    const bar = document.getElementById("announcementBar");
    if (!bar) return;
    if (localStorage.getItem("srishti-announce-dismiss") === "1") {
      bar.remove();
      return;
    }
    bar.querySelector(".announce-close")?.addEventListener("click", () => {
      localStorage.setItem("srishti-announce-dismiss", "1");
      bar.classList.add("dismissed");
      setTimeout(() => bar.remove(), 400);
    });
  }

  /* ─── Hero: stars + parallax + gyro ─── */
  function initHeroFx() {
    const canvas = document.getElementById("heroStarsCanvas");
    const hero = document.querySelector(".hero");
    if (!canvas || !hero) return;
    const ctx = canvas.getContext("2d");
    let w, h, stars = [];
    const count = prefersReduced ? 40 : 120;

    function resize() {
      w = canvas.width = hero.offsetWidth;
      h = canvas.height = hero.offsetHeight;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        sp: Math.random() * 0.02 + 0.005,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    }

    let mx = 0.5,
      my = 0.5,
      gx = 0,
      gy = 0;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    });
    if (window.DeviceOrientationEvent && !prefersReduced) {
      window.addEventListener(
        "deviceorientation",
        (e) => {
          gx = ((e.gamma || 0) / 45) * 0.5;
          gy = ((e.beta || 0) / 45) * 0.5;
        },
        { passive: true },
      );
    }

    const layers = hero.querySelectorAll(".parallax-layer");
    function draw() {
      if (!prefersReduced) {
        ctx.clearRect(0, 0, w, h);
        stars.forEach((s) => {
          s.a += s.sp;
          if (s.a > 1) s.a = 0;
          const tw = 0.35 + Math.abs(Math.sin(s.a * Math.PI)) * 0.65;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196, 132, 252, ${tw * 0.85})`;
          ctx.fill();
          s.x += s.vx + gx * 0.02;
          s.y += s.vy + gy * 0.02;
          if (s.x < 0) s.x = w;
          if (s.x > w) s.x = 0;
          if (s.y < 0) s.y = h;
          if (s.y > h) s.y = 0;
        });
      }
      const px = (mx + gx) * 18;
      const py = (my + gy) * 12;
      layers.forEach((l, i) => {
        const d = (i + 1) * 0.35;
        l.style.transform = `translate3d(${px * d}px, ${py * d}px, 0)`;
      });
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    if (!prefersReduced) draw();
  }

  /* ─── Story strip: cinematic night sky ─── */
  function initStorySky() {
    const strip = document.querySelector(".story-strip");
    const canvas = document.getElementById("storySkyCanvas");
    if (!strip || !canvas || prefersReduced) return;
    const ctx = canvas.getContext("2d");
    let w, h;
    const stars = [];
    const shooting = [];
    const STAR_N = 180;

    function resize() {
      w = canvas.width = strip.offsetWidth;
      h = canvas.height = strip.offsetHeight;
      stars.length = 0;
      for (let i = 0; i < STAR_N; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.02,
        });
      }
    }

    function spawnShooting() {
      if (shooting.length > 2 || Math.random() > 0.012) return;
      shooting.push({
        x: Math.random() * w * 0.6,
        y: Math.random() * h * 0.35,
        len: 80 + Math.random() * 120,
        vx: 8 + Math.random() * 6,
        vy: 3 + Math.random() * 3,
        life: 1,
      });
    }

    function draw() {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.7);
      g.addColorStop(0, "rgba(88, 28, 135, 0.22)");
      g.addColorStop(0.45, "rgba(49, 10, 101, 0.08)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      stars.forEach((s) => {
        s.phase += s.speed;
        const a = 0.25 + (Math.sin(s.phase) + 1) * 0.35;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 220, 255, ${a})`;
        ctx.fill();
      });

      spawnShooting();
      for (let i = shooting.length - 1; i >= 0; i--) {
        const sh = shooting[i];
        sh.life -= 0.025;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const grad = ctx.createLinearGradient(
          sh.x,
          sh.y,
          sh.x - sh.len * 0.6,
          sh.y - sh.len * 0.3,
        );
        grad.addColorStop(0, `rgba(255,255,255,${sh.life * 0.9})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.len * 0.6, sh.y - sh.len * 0.3);
        ctx.stroke();
        if (sh.life <= 0) shooting.splice(i, 1);
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  /* ─── PWA service worker ─── */
  function registerSW() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }

  /* ─── Focus / skip link a11y ─── */
  function initA11y() {
    document.body.addEventListener("keydown", (e) => {
      if (e.key === "Tab") document.body.classList.add("user-tabbing");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLenis();
    initNavbar();
    initScrollProgress();
    initBackToTop();
    initAnnouncement();
    initHeroFx();
    initStorySky();
    initA11y();
    registerSW();
  });
})();
