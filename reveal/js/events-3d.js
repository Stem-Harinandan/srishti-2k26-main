/**
 * Events Universe — 3D ring (desktop) + swipe carousel (mobile)
 */
(function () {
  "use strict";

  const EVENTS = [
    { id: 1, file: "01-cini-opsis.jpg", title: "Cini Opsis", desc: "Cinematic storytelling and immersive visual craft." },
    { id: 2, file: "02-euphony.jpg", title: "Euphony", desc: "Rhythm, vocals and live stage energy collide." },
    { id: 3, file: "03-baker-street.jpg", title: "221B Baker Street", desc: "Deduction, suspense and investigation under pressure." },
    { id: 4, file: "04-facere.jpg", title: "Facere", desc: "Experimental fashion and visual identity on the ramp." },
    { id: 5, file: "05-chroma-clash.jpg", title: "Chroma Clash", desc: "Fast-paced live art battles driven by instinct." },
    { id: 6, file: "06-vortex.jpg", title: "Vortex", desc: "High-intensity choreography and synchronized movement." },
  ];

  const POSTER_BASES = ["public/posters", "assets/posters"];
  const MOBILE_BP = 768;

  function isMobile() {
    return window.innerWidth < MOBILE_BP;
  }

  function getRadius() {
    if (window.innerWidth < 640) return 200;
    if (window.innerWidth < 1024) return 300;
    return 420;
  }

  let RADIUS = getRadius();
  let rotation = 0;
  let targetRotation = 0;
  let activeIndex = 0;
  let posterUrls = {};
  let dragging = false;
  let lastX = 0;
  let velocity = 0;
  let mode = "desktop";

  async function resolvePoster(file) {
    for (const base of POSTER_BASES) {
      const url = `${base}/${file}`;
      const ok = await new Promise((res) => {
        const img = new Image();
        img.onload = () => res(true);
        img.onerror = () => res(false);
        img.src = url;
      });
      if (ok) return url;
    }
    return null;
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function indexFromRotation() {
    const step = 360 / EVENTS.length;
    return mod(Math.round(-targetRotation / step), EVENTS.length);
  }

  function snapTo(index) {
    activeIndex = mod(index, EVENTS.length);
    if (mode === "mobile") {
      scrollMobileTo(activeIndex);
      updateHUD();
      return;
    }
    const step = 360 / EVENTS.length;
    targetRotation = -activeIndex * step;
    updateHUD();
    updateFrontClass();
  }

  function updateHUD() {
    const ev = EVENTS[activeIndex];
    document.querySelectorAll(".eu-index").forEach((el) => {
      el.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(EVENTS.length).padStart(2, "0")}`;
    });
    document.querySelectorAll(".eu-title").forEach((el) => {
      el.textContent = ev.title;
    });
    document.querySelectorAll(".eu-desc").forEach((el) => {
      el.textContent = ev.desc;
    });
  }

  function updateFrontClass() {
    document.querySelectorAll(".event-poster-3d").forEach((card, i) => {
      card.classList.toggle("is-front", i === activeIndex);
    });
    document.querySelectorAll(".events-mobile-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === activeIndex);
    });
  }

  function applyRingTransform() {
    const ring = document.getElementById("eventsRing");
    if (!ring || mode !== "desktop") return;
    ring.style.transform = `rotateY(${rotation}deg)`;
    const step = 360 / EVENTS.length;
    ring.querySelectorAll(".event-poster-3d").forEach((card, i) => {
      card.style.transform = `rotateY(${step * i}deg) translateZ(${RADIUS}px)`;
    });
  }

  function tick() {
    if (mode !== "desktop") return;
    if (!dragging && Math.abs(velocity) < 0.02) targetRotation -= 0.02;
    const diff = targetRotation - rotation;
    rotation += diff * 0.12 + velocity;
    velocity *= 0.92;
    if (Math.abs(diff) < 0.05 && Math.abs(velocity) < 0.05) {
      rotation = targetRotation;
      velocity = 0;
    }
    const newIndex = indexFromRotation();
    if (newIndex !== activeIndex) {
      activeIndex = newIndex;
      updateHUD();
      updateFrontClass();
      window.audioManager?.playHover?.();
    }
    applyRingTransform();
    requestAnimationFrame(tick);
  }

  function onPosterActivate(i) {
    snapTo(i);
    window.audioManager?.playClick?.();
    const card = document.querySelector(`.event-poster-3d[data-index="${i}"] .event-poster-inner`);
    if (card) {
      card.classList.add("poster-pulse");
      setTimeout(() => card.classList.remove("poster-pulse"), 500);
    }
  }

  function buildRing() {
    const ring = document.getElementById("eventsRing");
    if (!ring) return;
    ring.innerHTML = "";
    const step = 360 / EVENTS.length;

    EVENTS.forEach((ev, i) => {
      const card = document.createElement("article");
      card.className = "event-poster-3d";
      card.dataset.index = String(i);
      card.setAttribute("aria-label", ev.title);

      const inner = document.createElement("div");
      inner.className = "event-poster-inner";
      const url = posterUrls[ev.id];
      if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = `${ev.title} poster`;
        img.loading = "lazy";
        inner.appendChild(img);
      } else {
        const fb = document.createElement("div");
        fb.className = "poster-fallback-num";
        fb.textContent = String(ev.id).padStart(2, "0");
        inner.appendChild(fb);
      }
      inner.appendChild(Object.assign(document.createElement("div"), { className: "poster-shine" }));
      card.appendChild(inner);
      card.style.transform = `rotateY(${step * i}deg) translateZ(${RADIUS}px)`;

      card.addEventListener("click", () => onPosterActivate(i));
      ring.appendChild(card);
    });
    updateFrontClass();
  }

  function buildMobile() {
    const track = document.getElementById("eventsMobileTrack");
    const dots = document.getElementById("eventsMobileDots");
    if (!track) return;
    track.innerHTML = "";
    if (dots) dots.innerHTML = "";

    EVENTS.forEach((ev, i) => {
      const slide = document.createElement("article");
      slide.className = "events-mobile-slide";
      slide.dataset.index = String(i);
      const inner = document.createElement("div");
      inner.className = "event-poster-inner";
      const url = posterUrls[ev.id];
      if (url) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = ev.title;
        img.loading = "lazy";
        inner.appendChild(img);
      } else {
        const fb = document.createElement("div");
        fb.className = "poster-fallback-num";
        fb.textContent = String(ev.id).padStart(2, "0");
        inner.appendChild(fb);
      }
      slide.appendChild(inner);
      slide.addEventListener("click", () => onPosterActivate(i));
      track.appendChild(slide);

      if (dots) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "events-mobile-dot";
        dot.setAttribute("aria-label", `Go to ${ev.title}`);
        dot.addEventListener("click", () => snapTo(i));
        dots.appendChild(dot);
      }
    });

    let touchStartX = 0;
    track.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    track.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return;
      snapTo(activeIndex + (dx < 0 ? 1 : -1));
    });

    track.addEventListener("scroll", () => {
      const slide = track.querySelector(".events-mobile-slide");
      if (!slide) return;
      const w = slide.offsetWidth + 16;
      const idx = Math.round(track.scrollLeft / w);
      if (idx !== activeIndex && idx >= 0 && idx < EVENTS.length) {
        activeIndex = idx;
        updateHUD();
        updateFrontClass();
      }
    }, { passive: true });
  }

  function scrollMobileTo(index) {
    const track = document.getElementById("eventsMobileTrack");
    const slide = track?.querySelector(".events-mobile-slide");
    if (!track || !slide) return;
    track.scrollTo({ left: index * (slide.offsetWidth + 16), behavior: "smooth" });
    updateFrontClass();
  }

  function setupDrag() {
    const stage = document.querySelector(".events-stage");
    if (!stage) return;

    const onDown = (x) => {
      dragging = true;
      lastX = x;
      velocity = 0;
      stage.classList.add("is-dragging");
      document.getElementById("eventsRing")?.classList.add("no-transition");
    };
    const onMove = (x) => {
      if (!dragging) return;
      const dx = x - lastX;
      lastX = x;
      targetRotation += dx * 0.35;
      velocity = dx * 0.15;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      document.getElementById("eventsRing")?.classList.remove("no-transition");
      snapTo(indexFromRotation());
    };

    stage.addEventListener("mousedown", (e) => onDown(e.clientX));
    window.addEventListener("mousemove", (e) => onMove(e.clientX));
    window.addEventListener("mouseup", onUp);
    stage.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) onDown(e.touches[0].clientX);
      },
      { passive: true },
    );
    stage.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 1) onMove(e.touches[0].clientX);
      },
      { passive: true },
    );
    stage.addEventListener("touchend", onUp);
    stage.addEventListener("wheel", (e) => {
      e.preventDefault();
      targetRotation += e.deltaY * 0.12;
      velocity = e.deltaY * 0.06;
    }, { passive: false });
  }

  function setupNav() {
    document.querySelectorAll(".eu-prev").forEach((btn) => {
      btn.addEventListener("click", () => {
        snapTo(activeIndex - 1);
        window.audioManager?.playClick?.();
      });
    });
    document.querySelectorAll(".eu-next").forEach((btn) => {
      btn.addEventListener("click", () => {
        snapTo(activeIndex + 1);
        window.audioManager?.playClick?.();
      });
    });
  }

  function setMode() {
    const mobile = isMobile();
    mode = mobile ? "mobile" : "desktop";
    document.querySelector(".events-universe")?.classList.toggle("is-mobile", mobile);
    if (mobile) {
      buildMobile();
      scrollMobileTo(activeIndex);
    } else {
      RADIUS = getRadius();
      buildRing();
      applyRingTransform();
    }
  }

  function initParticles() {
    const canvas = document.getElementById("eventsParticles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const wrap = canvas.closest(".events-universe-section");
    let pts = [];

    function resize() {
      canvas.width = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
      pts = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196, 132, 252, 0.3)";
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    for (const ev of EVENTS) {
      posterUrls[ev.id] = await resolvePoster(ev.file);
    }
    setMode();
    setupDrag();
    setupNav();
    initParticles();
    updateHUD();
    snapTo(0);
    requestAnimationFrame(tick);

    let t;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(setMode, 200);
    });
  });
})();
