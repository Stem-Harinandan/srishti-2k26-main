/**
 * Design polish — cursor trail, finale constellation
 */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(pointer: coarse)").matches;

  /* ─── Purple cursor trail ─── */
  function initCursorTrail() {
    if (touch || reduced) return;
    const container = document.querySelector(".cursor-trail-container");
    if (!container) return;

    let lastSpawn = 0;
    document.addEventListener(
      "mousemove",
      (e) => {
        const now = performance.now();
        if (now - lastSpawn < 28) return;
        lastSpawn = now;

        const dot = document.createElement("span");
        dot.className = "cursor-trail-dot";
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
        container.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove());
        if (container.children.length > 18) {
          container.firstChild?.remove();
        }
      },
      { passive: true },
    );
  }

  /* ─── Constellation between finale words ─── */
  function initFinaleConstellation() {
    const svg = document.getElementById("finaleConstellation");
    const block = document.querySelector(".premium-finale__words-block");
    const nodes = document.querySelectorAll("[data-constellation-node]");
    if (!svg || !block || nodes.length < 2) return;

    function draw() {
      const br = block.getBoundingClientRect();
      if (br.width < 10) return;
      svg.setAttribute("viewBox", `0 0 ${br.width} ${br.height}`);
      svg.innerHTML = "";

      const points = Array.from(nodes).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - br.left,
          y: r.top + r.height / 2 - br.top,
        };
      });

      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", a.x);
        line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x);
        line.setAttribute("y2", b.y);
        svg.appendChild(line);
      }

      points.forEach((p) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", p.x);
        c.setAttribute("cy", p.y);
        c.setAttribute("r", "2.5");
        svg.appendChild(c);
      });
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) draw();
      },
      { threshold: 0.3 },
    );
    obs.observe(block);
    window.addEventListener("resize", draw);
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    else setTimeout(draw, 400);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCursorTrail();
    initFinaleConstellation();
  });
})();
