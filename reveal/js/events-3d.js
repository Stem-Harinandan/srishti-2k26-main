/**
 * Events Universe — 3D ring (desktop) + swipe carousel (mobile)
 * Smooth: direct drag · spring snap · continuous frontness
 */
(function () {
  "use strict";

  const EVENTS = [
    { id: 1, file: "01-cini-opsis.jpg", title: "Aude Sapere", desc: "Audentes Fortuna Adiuvat" },
    { id: 2, file: "02-euphony.jpg", title: "Euphony", desc: "Echoes of Infinity" },
    { id: 3, file: "03-baker-street.jpg", title: "221B Baker Street", desc: "La cuisine du Mystère" },
    { id: 4, file: "04-facere.jpg", title: "Facere", desc: "Create. Conquer. Captivate." },
    { id: 5, file: "05-chroma-clash.jpg", title: "Pel-droed", desc: "Rule the Pitch. Claim the Crown." },
    { id: 6, file: "06-vortex.jpg", title: "Frost", desc: "Where art stirs the soul beyond words" },
    { id: 7, file: "07-cypher.jpg", title: "Cypher", desc: "Where the Flaw becomes the Flow" },
    { id: 8, file: "08-conflictwa.jpg", title: "Confictura", desc: "The Odyssey of Tales, the Rhapsody of Theatre" },
    { id: 9, file: "09-cine-opsis.jpg", title: "Cine-Opsis", desc: "Make every Frame enduring" },
    { id: 10, file: "10-retrica.jpg", title: "Retrica", desc: "Where the lens meet the story" },
  ];

  const POSTER_BASES = ["assets/posters"];
  const MOBILE_BP = 768;
  const DRAG_SENS = 0.42;
  const FRICTION = 0.9;
  const SPRING = 0.11;
  const COUNT = EVENTS.length;

  let RADIUS = 420;
  let rotation = 0;
  let snapAngle = 0;
  let velocity = 0;
  let activeIndex = 0;
  let posterUrls = {};
  let dragging = false;
  let settling = false;
  let lastX = 0;
  let lastMoveT = 0;
  let mode = "desktop";
  let orbitTrail = 0;
  let orbitDir = 0;
  let wheelSnapTimer = 0;
  let mobileScrollRaf = 0;
  let mobileScrolling = false;
  let mobileScrollEndTimer = 0;

  function isMobile() {
    return window.innerWidth < MOBILE_BP;
  }

  function getRadius() {
    if (window.innerWidth < 640) return 200;
    if (window.innerWidth < 1024) return 300;
    return 420;
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function stepAngle() {
    return 360 / COUNT;
  }

  function angleForIndex(i) {
    return -mod(i, COUNT) * stepAngle();
  }

  function indexFromAngle(deg) {
    return mod(Math.round(-deg / stepAngle()), COUNT);
  }

  function shortestAngleDiff(from, to) {
    let d = to - from;
    d = ((d + 180) % 360) - 180;
    return d;
  }

  function frontness(ringDeg, cardIndex) {
    const step = stepAngle();
    const a = (((ringDeg + cardIndex * step) % 360) + 360) % 360;
    const dist = Math.min(a, 360 - a);
    return Math.max(0, 1 - dist / (step * 0.72));
  }

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

  function hapticSnap() {
    try {
      if (typeof navigator.vibrate === "function") navigator.vibrate(8);
    } catch (_) {}
  }

  function snapTo(index, immediate) {
    const prev = activeIndex;
    activeIndex = mod(index, COUNT);
    const changed = prev !== activeIndex;

    if (mode === "mobile") {
      scrollMobileTo(activeIndex, immediate);
      updateHUD();
      updateMobileDots();
      if (changed) hapticSnap();
      return;
    }

    snapAngle = angleForIndex(activeIndex);
    settling = !immediate;
    velocity = immediate ? 0 : velocity * 0.35;

    if (immediate) {
      rotation = snapAngle;
      settling = false;
      velocity = 0;
      applyRingTransform();
    }

    updateHUD();
    if (changed) hapticSnap();
  }

  function updateHUD() {
    const ev = EVENTS[activeIndex];
    document.querySelectorAll(".eu-index").forEach((el) => {
      el.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(COUNT).padStart(2, "0")}`;
    });
    document.querySelectorAll(".eu-title").forEach((el) => {
      el.textContent = ev.title;
    });
    document.querySelectorAll(".eu-desc").forEach((el) => {
      el.textContent = ev.desc;
    });
  }

  function updateMobileDots() {
    document.querySelectorAll(".events-mobile-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === activeIndex);
    });
  }

  function applyRingTransform() {
    const ring = document.getElementById("eventsRing");
    if (!ring || mode !== "desktop") return;

    ring.style.transform = `rotateY(${rotation}deg)`;
    const step = stepAngle();
    let bestIdx = 0;
    let bestT = -1;

    ring.querySelectorAll(".event-poster-3d").forEach((card, i) => {
      card.style.transform = `rotateY(${step * i}deg) translateZ(${RADIUS}px)`;
      const t = frontness(rotation, i);
      if (t > bestT) {
        bestT = t;
        bestIdx = i;
      }
      card.style.opacity = String(0.48 + t * 0.52);
      card.style.filter = `brightness(${0.58 + t * 0.5}) saturate(${0.78 + t * 0.27})`;
      card.classList.toggle("is-front", t > 0.82);
    });

    if (!dragging && !settling && bestIdx !== activeIndex && bestT > 0.92) {
      activeIndex = bestIdx;
      snapAngle = angleForIndex(activeIndex);
      updateHUD();
    }
  }

  function tick(now) {
    if (mode === "desktop" && !dragging && (settling || Math.abs(velocity) > 0.02)) {
      velocity *= FRICTION;
      rotation += velocity;

      const diff = shortestAngleDiff(rotation, snapAngle);
      rotation += diff * SPRING;

      if (Math.abs(diff) < 0.06 && Math.abs(velocity) < 0.04) {
        rotation = snapAngle;
        velocity = 0;
        settling = false;
      }

      applyRingTransform();
    }
    requestAnimationFrame(tick);
  }

  function onPosterActivate(i) {
    snapTo(i);
    window.audioManager?.playClick?.();
    const inner = document.querySelector(
      mode === "mobile"
        ? `.events-mobile-slide[data-index="${i}"] .event-poster-inner`
        : `.event-poster-3d[data-index="${i}"] .event-poster-inner`,
    );
    if (inner) {
      inner.classList.add("poster-pulse");
      setTimeout(() => inner.classList.remove("poster-pulse"), 500);
    }
  }

  function buildRing() {
    const ring = document.getElementById("eventsRing");
    if (!ring) return;
    ring.innerHTML = "";
    const step = stepAngle();

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
        img.draggable = false;
        inner.appendChild(img);
      } else {
        const img = document.createElement("img");
        img.src = "public/posters/default.jpg";
        img.alt = `${ev.title} poster`;
        img.loading = "lazy";
        img.draggable = false;
        inner.appendChild(img);
      }
      inner.appendChild(Object.assign(document.createElement("div"), { className: "poster-shine" }));
      card.appendChild(inner);
      card.style.transform = `rotateY(${step * i}deg) translateZ(${RADIUS}px)`;
      card.addEventListener("click", () => onPosterActivate(i));
      ring.appendChild(card);
    });

    applyRingTransform();
  }

  function updateMobileVisuals() {
    const track = document.getElementById("eventsMobileTrack");
    const slides = track?.querySelectorAll(".events-mobile-slide");
    if (!track || !slides?.length) return;

    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestT = -1;

    slides.forEach((slide, i) => {
      const mid = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      const maxDist = slide.offsetWidth * 0.9;
      const t = Math.max(0, 1 - dist / maxDist);
      slide.style.opacity = String(0.5 + t * 0.5);
      slide.style.transform = `scale(${0.93 + t * 0.07})`;
      slide.classList.toggle("is-active", t > 0.88);
      if (t > bestT) {
        bestT = t;
        best = i;
      }
    });

    if (best !== activeIndex && bestT > 0.55) {
      const prev = activeIndex;
      activeIndex = best;
      updateHUD();
      updateMobileDots();
      if (!mobileScrolling && prev !== activeIndex) hapticSnap();
    }
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
        img.draggable = false;
        inner.appendChild(img);
      } else {
        const img = document.createElement("img");
        img.src = "public/posters/default.jpg";
        img.alt = ev.title;
        img.loading = "lazy";
        img.draggable = false;
        inner.appendChild(img);
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

    const onMobileScroll = () => {
      mobileScrolling = true;
      track.classList.add("is-scrolling");
      clearTimeout(mobileScrollEndTimer);
      mobileScrollEndTimer = setTimeout(() => {
        mobileScrolling = false;
        track.classList.remove("is-scrolling");
        const idx = getMobileIndex();
        if (idx !== activeIndex) snapTo(idx, true);
        else updateMobileVisuals();
      }, 80);

      if (!mobileScrollRaf) {
        mobileScrollRaf = requestAnimationFrame(() => {
          mobileScrollRaf = 0;
          updateMobileVisuals();
        });
      }
    };

    track.addEventListener("scroll", onMobileScroll, { passive: true });
    if ("onscrollend" in window) {
      track.addEventListener("scrollend", () => {
        mobileScrolling = false;
        track.classList.remove("is-scrolling");
        snapTo(getMobileIndex(), true);
      }, { passive: true });
    }

    updateMobileVisuals();
    updateMobileDots();
  }

  function getMobileIndex() {
    const track = document.getElementById("eventsMobileTrack");
    const slides = track?.querySelectorAll(".events-mobile-slide");
    if (!track || !slides?.length) return 0;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const mid = slide.offsetLeft + slide.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }

  function scrollMobileTo(index, immediate) {
    const track = document.getElementById("eventsMobileTrack");
    const slides = track?.querySelectorAll(".events-mobile-slide");
    const slide = slides?.[index];
    if (!track || !slide) return;
    const left = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    track.scrollTo({
      left: Math.max(0, left),
      behavior: immediate ? "auto" : "smooth",
    });
    requestAnimationFrame(updateMobileVisuals);
  }

  function setupDrag() {
    const stage = document.querySelector(".events-stage");
    if (!stage) return;

    const onDown = (x) => {
      if (mode !== "desktop") return;
      dragging = true;
      settling = false;
      lastX = x;
      lastMoveT = performance.now();
      velocity = 0;
      stage.classList.add("is-dragging");
    };

    const onMove = (x) => {
      if (!dragging || mode !== "desktop") return;
      const now = performance.now();
      const dx = x - lastX;
      const dt = Math.max(1, now - lastMoveT);
      lastX = x;
      lastMoveT = now;

      rotation += dx * DRAG_SENS;
      velocity = (dx * DRAG_SENS) / dt * 16;
      orbitDir = Math.sign(dx) || orbitDir;
      orbitTrail = Math.min(1, orbitTrail + Math.abs(dx) * 0.018);

      applyRingTransform();
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");

      const projected = rotation + velocity * 10;
      const idx = indexFromAngle(projected);
      activeIndex = idx;
      snapAngle = angleForIndex(idx);
      settling = true;
      updateHUD();
      hapticSnap();
    };

    stage.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onDown(e.clientX);
    });
    window.addEventListener("mousemove", (e) => onMove(e.clientX));
    window.addEventListener("mouseup", onUp);
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) onDown(e.touches[0].clientX);
    }, { passive: true });
    stage.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) onMove(e.touches[0].clientX);
    }, { passive: true });
    stage.addEventListener("touchend", onUp);

    // Wheel event removed to prevent accidental movement
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
      requestAnimationFrame(() => scrollMobileTo(activeIndex, true));
    } else {
      RADIUS = getRadius();
      snapAngle = angleForIndex(activeIndex);
      rotation = snapAngle;
      velocity = 0;
      settling = false;
      buildRing();
    }
  }

  function initOrbitTrail() {
    const canvas = document.getElementById("eventsOrbitTrail");
    const stage = document.querySelector(".events-stage");
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = stage.offsetWidth;
      canvas.height = stage.offsetHeight;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === "desktop") {
        if (!dragging) orbitTrail *= 0.92;
        else orbitTrail = Math.min(1, orbitTrail + 0.04);

        if (orbitTrail > 0.04) {
          const cx = canvas.width * 0.5;
          const cy = canvas.height * 0.52;
          const r = Math.min(canvas.width, canvas.height) * 0.38;
          const spread = 0.5 + orbitTrail * 0.4;
          const start = -Math.PI / 2 - spread * orbitDir;
          const end = -Math.PI / 2 + spread * orbitDir;
          ctx.beginPath();
          ctx.arc(cx, cy, r, start, end, orbitDir < 0);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.1 + orbitTrail * 0.3})`;
          ctx.lineWidth = 2 + orbitTrail * 2;
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
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
      pts = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
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
        ctx.fillStyle = "rgba(196, 132, 252, 0.25)";
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
    RADIUS = getRadius();
    snapAngle = 0;
    rotation = 0;
    activeIndex = 0;
    setMode();
    setupDrag();
    setupNav();
    initOrbitTrail();
    initParticles();
    updateHUD();
    requestAnimationFrame(tick);

    let resizeT;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(setMode, 200);
    });
  });
})();
