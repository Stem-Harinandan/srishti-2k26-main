/**
 * Premium finale particles + morph divider scroll reveal
 */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initDividerReveal() {
    document.querySelectorAll(".morph-divider__label").forEach((label) => {
      const wrap = label.closest(".morph-divider");
      if (!wrap) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              label.classList.add("is-visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 },
      );
      obs.observe(wrap);
    });
  }

  function initFinaleParticles() {
    const canvas = document.getElementById("finaleParticles");
    const finale = document.querySelector(".premium-finale");
    if (!canvas || !finale || reduced) return;

    const ctx = canvas.getContext("2d");
    let w, h;
    const dots = [];

    function resize() {
      const r = finale.getBoundingClientRect();
      w = canvas.width = Math.floor(r.width);
      h = canvas.height = Math.floor(r.height);
      dots.length = 0;
      const n = Math.min(80, Math.floor((w * h) / 12000));
      for (let i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.3,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.phase += 0.02;
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        if (d.y > h) d.y = 0;
        const a = 0.2 + (Math.sin(d.phase) + 1) * 0.25;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 132, 252, ${a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initDividerReveal();
    initFinaleParticles();
  });
})();
