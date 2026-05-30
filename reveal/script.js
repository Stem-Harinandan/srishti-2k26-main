/* =========================================================
   SMOOTH SCROLL — native scroll (no hidden overflow hacks)
   The old version set html/body overflow:hidden which broke everything.
   We now use native scroll + CSS scroll-behavior + a lightweight
   rAF ticker for anything that needs scrollY.
========================================================= */
window._smoothScrollY = 0;

// Expose scrollY reliably
function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

// Anchor smooth scroll
document.addEventListener("click", (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute("href");
  if (href === "#") return;
  const targetEl = document.querySelector(href);
  if (!targetEl) return;
  e.preventDefault();
  const top = targetEl.getBoundingClientRect().top + getScrollY() - 80;
  window.scrollTo({ top, behavior: "smooth" });
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileOverlay = document.getElementById("mobileOverlay");
  if (mobileMenu && mobileMenu.classList.contains("active")) {
    mobileMenu.classList.remove("active");
    if (mobileOverlay) mobileOverlay.classList.remove("active");
  }
});

/* =========================================================
   NEBULA CANVAS — soft deep space background
========================================================= */
(function initNebula() {
  const canvas = document.getElementById("nebulaCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h;
  let t = 0;

  const blobs = [
    {
      x: 0.18,
      y: 0.22,
      r: 0.32,
      color: [80, 20, 180],
      alpha: 0.05,
      speed: 0.00008,
    },
    {
      x: 0.78,
      y: 0.65,
      r: 0.26,
      color: [50, 80, 200],
      alpha: 0.035,
      speed: 0.00012,
    },
    {
      x: 0.5,
      y: 0.5,
      r: 0.38,
      color: [100, 30, 160],
      alpha: 0.028,
      speed: 0.00006,
    },
    {
      x: 0.85,
      y: 0.15,
      r: 0.2,
      color: [40, 10, 120],
      alpha: 0.038,
      speed: 0.00015,
    },
    {
      x: 0.1,
      y: 0.75,
      r: 0.22,
      color: [70, 15, 150],
      alpha: 0.03,
      speed: 0.0001,
    },
    // Extra soft nebula layers for depth
    {
      x: 0.6,
      y: 0.3,
      r: 0.28,
      color: [120, 40, 200],
      alpha: 0.022,
      speed: 0.00009,
    },
    {
      x: 0.3,
      y: 0.55,
      r: 0.24,
      color: [60, 20, 160],
      alpha: 0.018,
      speed: 0.000075,
    },
    {
      x: 0.72,
      y: 0.8,
      r: 0.3,
      color: [90, 25, 175],
      alpha: 0.02,
      speed: 0.00011,
    },
    {
      x: 0.05,
      y: 0.4,
      r: 0.18,
      color: [55, 10, 130],
      alpha: 0.025,
      speed: 0.00013,
    },
    {
      x: 0.92,
      y: 0.5,
      r: 0.22,
      color: [140, 50, 220],
      alpha: 0.015,
      speed: 0.00007,
    },
  ];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    blobs.forEach((b, i) => {
      const drift = Math.sin(t * b.speed * 1000 + i) * 0.04;
      const cx = (b.x + drift) * w;
      const cy = (b.y + Math.cos(t * b.speed * 800 + i) * 0.03) * h;
      const radius = b.r * Math.max(w, h);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const [r, g, bl] = b.color;
      grad.addColorStop(0, `rgba(${r},${g},${bl},${b.alpha})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${bl},${b.alpha * 0.35})`);
      grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    t = performance.now();
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
})();

/* =========================================================
   PARTICLE CANVAS — layered starfield with shooting stars
========================================================= */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h;
  let particles = [];
  let shootingStars = [];
  let lastShoot = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    buildParticles();
  }

  function createParticle() {
    const layer = Math.random() < 0.7 ? 1 : Math.random() < 0.7 ? 2 : 3;
    return {
      layer,
      x: Math.random() * w,
      y: Math.random() * h,
      r:
        layer === 1
          ? Math.random() * 0.6 + 0.15
          : layer === 2
            ? Math.random() * 1 + 0.45
            : Math.random() * 1.4 + 0.7,
      vx:
        (Math.random() - 0.5) *
        (layer === 1 ? 0.05 : layer === 2 ? 0.09 : 0.13),
      vy:
        (Math.random() - 0.5) *
        (layer === 1 ? 0.05 : layer === 2 ? 0.09 : 0.13),
      alpha:
        layer === 1
          ? Math.random() * 0.16 + 0.03
          : layer === 2
            ? Math.random() * 0.24 + 0.07
            : Math.random() * 0.44 + 0.18,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.007 + 0.002,
      color:
        layer === 3 && Math.random() < 0.35
          ? `rgba(168,85,247,`
          : `rgba(255,255,255,`,
    };
  }

  function buildParticles() {
    const count = Math.min(Math.floor((w * h) / 6500), 180);
    particles = Array.from({ length: count }, createParticle);
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * w * 0.8,
      y: Math.random() * h * 0.38,
      len: Math.random() * 110 + 55,
      speed: Math.random() * 7 + 5,
      alpha: 0.6 + Math.random() * 0.3,
      angle: Math.PI / 6 + (Math.random() - 0.5) * 0.25,
      life: 1,
      decay: Math.random() * 0.022 + 0.013,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Subtle connections between layer-3 stars
    const l3 = particles.filter((p) => p.layer === 3);
    for (let i = 0; i < l3.length; i++) {
      for (let j = i + 1; j < l3.length; j++) {
        const dx = l3[i].x - l3[j].x;
        const dy = l3[i].y - l3[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124,58,237,${0.025 * (1 - d / 150)})`;
          ctx.lineWidth = 0.4;
          ctx.moveTo(l3[i].x, l3[i].y);
          ctx.lineTo(l3[j].x, l3[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;
      if (p.x < -2) p.x = w + 2;
      if (p.x > w + 2) p.x = -2;
      if (p.y < -2) p.y = h + 2;
      if (p.y > h + 2) p.y = -2;
      const a = p.alpha * (0.65 + 0.35 * Math.sin(p.pulse));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${a})`;
      ctx.fill();
      if (p.layer === 3) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.8);
        grad.addColorStop(0, `${p.color}${a * 0.28})`);
        grad.addColorStop(1, `${p.color}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    });

    // Shooting stars
    const now = performance.now();
    if (now - lastShoot > 4500 + Math.random() * 5500) {
      spawnShootingStar();
      lastShoot = now;
    }
    shootingStars = shootingStars.filter((s) => s.life > 0);
    shootingStars.forEach((s) => {
      const tx = Math.cos(s.angle) * s.len;
      const ty = Math.sin(s.angle) * s.len;
      const grad = ctx.createLinearGradient(s.x, s.y, s.x + tx, s.y + ty);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.6, `rgba(255,255,255,${s.alpha * s.life})`);
      grad.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + tx, s.y + ty);
      ctx.stroke();
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= s.decay;
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
})();

/* =========================================================
   INTERACTIVE HERO LOGO — magnetic + particle burst on click
========================================================= */
(function initInteractiveLogo() {
  const wrap = document.getElementById("heroLogoWrap");
  const logo = document.getElementById("heroLogo");
  const canvas = document.getElementById("logoParticleCanvas");
  if (!wrap || !logo || !canvas) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let animating = false;

  function resizeCanvas() {
    canvas.width = wrap.offsetWidth + 120;
    canvas.height = wrap.offsetHeight + 120;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Magnetic float on mousemove — handled by enhanceHeroLogoTracking below
  // Particle burst is still wired here

  // Particle burst on click/tap
  function spawnBurst(ex, ey) {
    const rect = canvas.getBoundingClientRect();
    const ox = ex - rect.left;
    const oy = ey - rect.top;
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      const isAccent = Math.random() < 0.4;
      particles.push({
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        r: Math.random() * 3 + 1,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.012,
        color: isAccent
          ? `rgba(168,85,247,`
          : Math.random() < 0.5
            ? `rgba(255,255,255,`
            : `rgba(200,180,255,`,
        grav: Math.random() * 0.08 + 0.02,
      });
    }
    if (!animating) {
      animating = true;
      renderBurst();
    }
  }

  function renderBurst() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.alpha > 0.02);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.grav;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.alpha -= p.decay;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${Math.max(0, p.alpha)})`;
      ctx.fill();
    });
    if (particles.length > 0) {
      requestAnimationFrame(renderBurst);
    } else {
      animating = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
})();

/* =========================================================
   PRELOADER — FIXED VERSION
========================================================= */

const preloader = document.getElementById("preloader");
const loaderPercent = document.querySelector(".loader-percent");
const loaderLine = document.querySelector(".loader-line");

(function initPreloaderCanvas() {
  const canvas = document.getElementById("preloaderCanvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let w, h;
  let animationFrame;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  resize();

  window.addEventListener("resize", resize);

  let t = 0;

  function render() {
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < 4; i++) {
      const radius = 120 + i * 34;

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        radius,
        t * (0.3 + i * 0.05),
        t * (0.3 + i * 0.05) + Math.PI * 1.4,
      );

      ctx.strokeStyle = `rgba(124,58,237,${0.05 - i * 0.01})`;

      ctx.lineWidth = 1;

      ctx.stroke();
    }

    t += 0.015;

    animationFrame = requestAnimationFrame(render);
  }

  render();

  window.stopPreloaderAnimation = () => {
    cancelAnimationFrame(animationFrame);
  };
})();

/* ============================================
   LOADING SYSTEM
============================================ */

let progress = 0;

const progressInterval = setInterval(() => {
  /* MUCH SLOWER + SMOOTHER */
  progress += Math.random() * 3 + 0.8;

  /* slow down near end */
  if (progress > 82) {
    progress += Math.random() * 0.4;
  }

  if (progress > 96) {
    progress = 96;
  }

  if (loaderPercent) {
    loaderPercent.textContent = `${Math.floor(progress)}%`;
  }

  if (loaderLine) {
    loaderLine.style.width = `${progress}%`;
  }
}, 120);

/* ============================================
   FINISH PRELOADER
============================================ */

function finishPreloader() {
  const preloader = document.getElementById("preloader");

  if (!preloader) return;

  /* force remove styles */
  preloader.style.opacity = "0";
  preloader.style.visibility = "hidden";
  preloader.style.pointerEvents = "none";

  /* remove from DOM completely */
  setTimeout(() => {
    if (preloader.parentNode) {
      preloader.parentNode.removeChild(preloader);
    }
  }, 300);

  document.body.style.overflowY = "auto";
  document.documentElement.style.overflowY = "auto";

  if (window.stopPreloaderAnimation) {
    window.stopPreloaderAnimation();
  }

  animateCounters();
}

/* ============================================
   FAILSAFE
============================================ */

window.addEventListener("load", () => {
  /* complete loading visually */
  progress = 100;

  if (loaderPercent) {
    loaderPercent.textContent = "100%";
  }

  if (loaderLine) {
    loaderLine.style.width = "100%";
  }

  setTimeout(() => {
    finishPreloader();
  }, 1200);
});

(function initStoryStrip() {
  const panels = document.querySelectorAll(".story-panel");
  if (!panels.length) return;

  const words = document.querySelectorAll(".story-word");

  function checkStoryReveal() {
    const vh = window.innerHeight;
    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const progress = 1 - rect.top / vh;

      if (progress > 0.2) {
        const panelWords = panel.querySelectorAll(".story-word");
        panelWords.forEach((word, i) => {
          if (progress > 0.25 + i * 0.1) {
            word.classList.add("revealed");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", checkStoryReveal, { passive: true });
  checkStoryReveal();
})();

/* =========================================================
   SCROLL PROGRESS BAR
========================================================= */
const scrollProgress = document.querySelector(".scroll-progress");
function updateScrollProgress() {
  const scrollTop = getScrollY();
  const height = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollProgress && height > 0) {
    scrollProgress.style.width = `${Math.min((scrollTop / height) * 100, 100)}%`;
  }
}

/* =========================================================
   NAVBAR
========================================================= */
const navbar = document.getElementById("navbar");
function updateNavbar() {
  if (navbar) navbar.classList.toggle("scrolled", getScrollY() > 50);
}

/* =========================================================
   MOBILE MENU
========================================================= */
/* =========================================================
   MOBILE MENU TOGGLE
========================================================= */

const hamburger = document.getElementById("hamburger");

const mobileMenu = document.getElementById("mobileMenu");

const mobileOverlay = document.getElementById("mobileOverlay");

function toggleMenu() {
  mobileMenu.classList.toggle("active");

  mobileOverlay.classList.toggle("active");

  document.body.classList.toggle("menu-open");
}

hamburger?.addEventListener("click", toggleMenu);

mobileOverlay?.addEventListener("click", toggleMenu);

/* close on link click */

document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", toggleMenu);
});
/* =========================================================
   REVEAL ON SCROLL
========================================================= */
const revealElements = document.querySelectorAll(".reveal");
function revealOnScroll() {
  revealElements.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight - 40) {
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add("active"), delay);
    }
  });
}
revealOnScroll();

/* =========================================================
   CUSTOM CURSOR
========================================================= */
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
if (!isTouchDevice) {
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  let mouseX = 0,
    mouseY = 0,
    ringX = 0,
    ringY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });
  function animateCursor() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  document
    .querySelectorAll(
      "a, button, .event-card, .gallery-item, .sponsor-card, .about-card, .hero-logo-wrap, .school-card, .team-card",
    )
    .forEach((item) => {
      item.addEventListener(
        "mouseenter",
        () => cursorRing && cursorRing.classList.add("hover"),
      );
      item.addEventListener(
        "mouseleave",
        () => cursorRing && cursorRing.classList.remove("hover"),
      );
    });
}

/* =========================================================
   HERO PARALLAX — mouse depth
========================================================= */
const heroContent = document.getElementById("heroContent");
const heroLight = document.getElementById("heroLight");
const layerBack = document.getElementById("layerBack");
const layerMid = document.getElementById("layerMid");

let heroMouseX = 0,
  heroMouseY = 0;
let currBackX = 0,
  currBackY = 0,
  currMidX = 0,
  currMidY = 0;

if (!isTouchDevice) {
  document.addEventListener("mousemove", (e) => {
    heroMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    heroMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
}

function heroParallaxLoop() {
  currBackX += (heroMouseX * 14 - currBackX) * 0.04;
  currBackY += (heroMouseY * 10 - currBackY) * 0.04;

  currMidX += (heroMouseX * 22 - currMidX) * 0.04;
  currMidY += (heroMouseY * 16 - currMidY) * 0.04;

  if (layerBack) {
    layerBack.style.transform = `translate3d(${currBackX}px, ${currBackY}px, 0)`;
  }

  if (layerMid) {
    layerMid.style.transform = `translate3d(${currMidX}px, ${currMidY}px, 0)`;
  }

  const scroll = getScrollY();
  const targetHeroY = scroll * 0.035;

  if (!window.heroCurrentY) {
    window.heroCurrentY = 0;
  }

  window.heroCurrentY += (targetHeroY - window.heroCurrentY) * 0.08;

  /* IMPORTANT FIX */
  if (heroContent) {
    heroContent.style.translate = `0 ${window.heroCurrentY}px`;
  }

  requestAnimationFrame(heroParallaxLoop);
}
heroParallaxLoop();

/* =========================================================
   COUNTERS
========================================================= */
function animateCounters() {
  document.querySelectorAll("[data-count]").forEach((counter) => {
    const target = parseInt(counter.dataset.count);
    let current = 0;
    const increment = Math.ceil(target / 50);
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      counter.textContent = current + "+";
    }, 36);
  });
}

/* =========================================================
   SCHEDULE TABS
========================================================= */
const tabButtons = document.querySelectorAll(".tab-btn");
const scheduleDays = document.querySelectorAll(".schedule-day");
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.day;
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    scheduleDays.forEach((day) =>
      day.classList.toggle("active", day.dataset.day === target),
    );
  });
});

/* =========================================================
   EVENTS — MOBILE SNAP + DOTS
========================================================= */
const eventsGrid = document.getElementById("eventsGrid");
const eventsDots = document.getElementById("eventsDots");
const eventCards = eventsGrid ? eventsGrid.querySelectorAll(".event-card") : [];

function initEventsDots() {
  if (!eventsDots) return;
  if (window.innerWidth > 768) {
    eventsDots.innerHTML = "";
    return;
  }
  eventsDots.innerHTML = "";
  eventCards.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () =>
      eventCards[i].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      }),
    );
    eventsDots.appendChild(dot);
  });
}
function updateEventsDots() {
  if (window.innerWidth > 768 || !eventsGrid || !eventsDots) return;
  const dots = eventsDots.querySelectorAll(".dot");
  const activeIndex = Math.round(
    eventsGrid.scrollLeft / eventsGrid.clientWidth,
  );
  dots.forEach((dot, i) => dot.classList.toggle("active", i === activeIndex));
}
if (eventsGrid) {
  eventsGrid.addEventListener("scroll", updateEventsDots, { passive: true });
  initEventsDots();
}

/* =========================================================
   COUNTDOWN
========================================================= */
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const daysInlineEl = document.getElementById("daysInline");
const targetDate = new Date("October 10, 2026 09:00:00").getTime();

function updateCountdown() {
  const distance = targetDate - Date.now();
  if (distance < 0) {
    [daysEl, hoursEl, minutesEl, secondsEl].forEach(
      (el) => el && (el.textContent = "00"),
    );
    if (daysInlineEl) daysInlineEl.textContent = "0";
    return;
  }
  const d = Math.floor(distance / 86400000);
  if (daysEl) daysEl.textContent = String(d).padStart(2, "0");
  if (hoursEl)
    hoursEl.textContent = String(
      Math.floor((distance % 86400000) / 3600000),
    ).padStart(2, "0");
  if (minutesEl)
    minutesEl.textContent = String(
      Math.floor((distance % 3600000) / 60000),
    ).padStart(2, "0");
  if (secondsEl)
    secondsEl.textContent = String(
      Math.floor((distance % 60000) / 1000),
    ).padStart(2, "0");
  if (daysInlineEl) daysInlineEl.textContent = d;
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* =========================================================
   AUDIO
========================================================= */
const bgMusic = document.getElementById("bgMusic");
const audioToggle = document.getElementById("audioToggle");
let audioStarted = false;
function startAudio() {
  if (audioStarted || !bgMusic) return;
  bgMusic.volume = 0.16;
  bgMusic.play().catch(() => {});
  audioStarted = true;
}
document.body.addEventListener("click", startAudio, { once: true });
if (audioToggle)
  audioToggle.addEventListener("click", () => {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      bgMusic.play();
      audioToggle.innerHTML = "♫";
    } else {
      bgMusic.pause();
      audioToggle.innerHTML = "🔇";
    }
  });

/* =========================================================
   HOVER SOUND
========================================================= */
const revealSound = document.getElementById("revealSound");
function playReveal() {
  if (!revealSound) return;
  revealSound.volume = 0.12;
  revealSound.currentTime = 0;
  revealSound.play().catch(() => {});
}
document
  .querySelectorAll(".btn")
  .forEach((btn) => btn.addEventListener("mouseenter", playReveal));

/* =========================================================
   EVENT CARD TILT (desktop)
========================================================= */
if (!isTouchDevice) {
  document.querySelectorAll(".event-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = (y - rect.height / 2) / 26;
      const rotateY = (rect.width / 2 - x) / 26;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
}

/* =========================================================
   BUTTON RIPPLE
========================================================= */
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;background:rgba(255,255,255,0.13);border-radius:50%;transform:scale(0);animation:rippleAnim 0.55s ease-out forwards;pointer-events:none;`;
    if (!document.getElementById("rippleStyle")) {
      const s = document.createElement("style");
      s.id = "rippleStyle";
      s.textContent =
        "@keyframes rippleAnim{to{transform:scale(3);opacity:0;}}";
      document.head.appendChild(s);
    }
    btn.style.position = "relative";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

/* =========================================================
   TOAST
========================================================= */
const toast = document.getElementById("toast");
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* =========================================================
   MARQUEE — auto-duplicate
========================================================= */
const legacyTrack = document.getElementById("legacyTrack");
if (legacyTrack) {
  const clone = legacyTrack.cloneNode(true);
  legacyTrack.parentElement.appendChild(clone);
}

/* =========================================================
   THROTTLED SCROLL HANDLER
========================================================= */
let scrollTicking = false;
function handleScroll() {
  updateNavbar();
  updateScrollProgress();
  revealOnScroll();
}
window.addEventListener(
  "scroll",
  () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        handleScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  },
  { passive: true },
);
handleScroll();

window.addEventListener("resize", () => {
  revealOnScroll();
  initEventsDots();
});

/* =========================================================
   CONSOLE SIGNATURE
========================================================= */
console.log(`
╔══════════════════════════════════╗
║     SRISHTI 2K26                 ║
║     Saraswathy Vidhyalaya        ║
║     Crafted In Chaos.            ║
║     Remembered In Echoes.        ║
╚══════════════════════════════════╝
`);
/* Aurora canvas removed — was causing background flicker */

/* hero orbs removed */

/* =========================================================
   HOLOGRAPHIC EVENT CARDS — rainbow shimmer + foil
========================================================= */
(function initHoloCards() {
  const cards = document.querySelectorAll(".event-card");

  cards.forEach((card) => {
    // Inject foil layer
    const foil = document.createElement("div");
    foil.className = "holo-foil";
    card.appendChild(foil);

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Angle based on mouse position for foil
      const angle =
        Math.atan2(
          e.clientY - (rect.top + rect.height / 2),
          e.clientX - (rect.left + rect.width / 2),
        ) *
        (180 / Math.PI);

      card.style.setProperty("--holo-x", `${x}%`);
      card.style.setProperty("--holo-y", `${y}%`);
      card.style.setProperty("--holo-opacity", "1");
      card.style.setProperty("--holo-angle", `${angle}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--holo-opacity", "0");
    });

    // Add sparkle on mouseenter
    card.addEventListener("mouseenter", (e) => {
      spawnCardSparkles(card, e);
    });
  });

  function spawnCardSparkles(card, e) {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        const rect = card.getBoundingClientRect();
        const px = Math.random() * rect.width;
        const py = Math.random() * rect.height;
        const sx = (Math.random() - 0.5) * 40;
        const sy = -(Math.random() * 30 + 20);
        sparkle.style.cssText = `left:${px}px;top:${py}px;--sx:${sx}px;--sy:${sy}px;`;
        card.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1200);
      }, i * 80);
    }
  }

  // Gallery items holographic
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("mousemove", (e) => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      item.style.setProperty("--g-holo-x", `${x}%`);
      item.style.setProperty("--g-holo-y", `${y}%`);
      item.style.setProperty("--g-holo-opacity", "1");
    });
    item.addEventListener("mouseleave", () => {
      item.style.setProperty("--g-holo-opacity", "0");
    });
  });
})();

/* =========================================================
   MAGNETIC BUTTONS — spring physics attraction
========================================================= */
(function initMagneticButtons() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const buttons = document.querySelectorAll(".btn, .icon-btn, .scroll-top-btn");
  const ATTRACTION_RADIUS = 90;
  const STRENGTH = 0.38;

  const buttonTargets = new Map();
  buttons.forEach((btn) => {
    buttonTargets.set(btn, { tx: 0, ty: 0, cx: 0, cy: 0 });
  });

  document.addEventListener("mousemove", (e) => {
    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const state = buttonTargets.get(btn);
      if (dist < ATTRACTION_RADIUS) {
        const force = (ATTRACTION_RADIUS - dist) / ATTRACTION_RADIUS;
        const easedForce = force * force * STRENGTH;
        state.tx = dx * easedForce;
        state.ty = dy * easedForce;
        btn.classList.add("magnetic-near");
      } else {
        state.tx = 0;
        state.ty = 0;
        btn.classList.remove("magnetic-near");
      }
    });
  });

  function animateMagnetic() {
    buttons.forEach((btn) => {
      const state = buttonTargets.get(btn);
      state.cx += (state.tx - state.cx) * 0.18;
      state.cy += (state.ty - state.cy) * 0.18;
      // Don't interfere with hover transforms for .btn
      if (
        !btn.classList.contains("btn") ||
        Math.abs(state.cx) > 0.1 ||
        Math.abs(state.cy) > 0.1
      ) {
        btn.style.transform = `translate(${state.cx}px, ${state.cy}px)`;
      }
    });
    requestAnimationFrame(animateMagnetic);
  }
  animateMagnetic();
})();

/* =========================================================
   HERO GALAXY CANVAS — deep space with nebulae + star clusters
   Only renders inside the hero section
========================================================= */
(function initHeroGalaxy() {
  const canvas = document.getElementById("heroGalaxyCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  let w,
    h,
    t = 0;
  let stars = [],
    nebulae = [],
    galaxyCores = [],
    dustClouds = [],
    shooters = [],
    lastShoot = 0;

  function resize() {
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    buildScene();
  }

  function buildScene() {
    // Deep stars — layered with colors
    stars = [];
    const count = Math.min(Math.floor((w * h) / 600), 900);
    for (let i = 0; i < count; i++) {
      const tier = Math.random();
      const isBright = tier > 0.9;
      const colorRoll = Math.random();
      const color =
        colorRoll < 0.05
          ? [168, 85, 247]
          : colorRoll < 0.1
            ? [100, 160, 255]
            : colorRoll < 0.13
              ? [255, 200, 100]
              : colorRoll < 0.15
                ? [255, 140, 140]
                : [255, 255, 255];
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: isBright ? Math.random() * 2.2 + 0.8 : Math.random() * 0.7 + 0.1,
        baseAlpha: isBright
          ? Math.random() * 0.6 + 0.3
          : Math.random() * 0.3 + 0.05,
        twinkleSpeed: Math.random() * 0.03 + 0.003,
        twinklePhase: Math.random() * Math.PI * 2,
        isBright,
        color,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.01,
      });
    }

    // Galaxy nebulae — large diffuse clouds
    nebulae = [
      {
        x: 0.15,
        y: 0.28,
        rx: 0.38,
        ry: 0.25,
        color: [80, 18, 175],
        alpha: 0.07,
      },
      {
        x: 0.82,
        y: 0.6,
        rx: 0.3,
        ry: 0.22,
        color: [30, 60, 200],
        alpha: 0.055,
      },
      {
        x: 0.5,
        y: 0.15,
        rx: 0.45,
        ry: 0.18,
        color: [110, 25, 155],
        alpha: 0.05,
      },
      {
        x: 0.9,
        y: 0.2,
        rx: 0.22,
        ry: 0.18,
        color: [190, 65, 220],
        alpha: 0.045,
      },
      {
        x: 0.28,
        y: 0.75,
        rx: 0.25,
        ry: 0.2,
        color: [40, 90, 210],
        alpha: 0.04,
      },
      {
        x: 0.65,
        y: 0.45,
        rx: 0.32,
        ry: 0.28,
        color: [60, 15, 145],
        alpha: 0.065,
      },
    ];

    // Galaxy core bright spots — distant galaxies
    galaxyCores = [
      { x: 0.12, y: 0.15, r: 55, color: [160, 100, 255], alpha: 0.12 },
      { x: 0.88, y: 0.72, r: 40, color: [80, 120, 240], alpha: 0.1 },
      { x: 0.55, y: 0.08, r: 30, color: [200, 130, 255], alpha: 0.09 },
      { x: 0.78, y: 0.36, r: 20, color: [140, 90, 210], alpha: 0.08 },
    ];

    // Dust clouds — milky way band
    dustClouds = [];
    const dustCount = Math.floor((w * h) / 2500);
    for (let i = 0; i < dustCount; i++) {
      const t2 = Math.random();
      const bx = t2 * w * 1.4 - w * 0.2;
      const by = t2 * h * 0.65 + Math.random() * h * 0.3 + h * 0.05;
      dustClouds.push({
        x: bx + (Math.random() - 0.5) * w * 0.25,
        y: by + (Math.random() - 0.5) * h * 0.12,
        r: Math.random() * 0.8 + 0.1,
        alpha: Math.random() * 0.09 + 0.02,
      });
    }
  }

  function spawnShooter() {
    shooters.push({
      x: Math.random() * w * 0.8,
      y: Math.random() * h * 0.4,
      vx: Math.random() * 8 + 4,
      vy: Math.random() * 3 + 1,
      len: Math.random() * 140 + 60,
      alpha: 0.8 + Math.random() * 0.2,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.012,
      width: Math.random() * 1.5 + 0.4,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.016;

    // Dust / milky way
    dustClouds.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 180, 255, ${d.alpha})`;
      ctx.fill();
    });

    // Galaxy core glows
    galaxyCores.forEach((gc) => {
      const cx = gc.x * w,
        cy = gc.y * h;
      const pulse = 0.85 + 0.15 * Math.sin(t * 0.3 + gc.x * 10);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, gc.r * pulse);
      const [r, g, b] = gc.color;
      grad.addColorStop(0, `rgba(${r},${g},${b},${gc.alpha * pulse})`);
      grad.addColorStop(0.3, `rgba(${r},${g},${b},${gc.alpha * 0.5 * pulse})`);
      grad.addColorStop(0.7, `rgba(${r},${g},${b},${gc.alpha * 0.15})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, gc.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // Nebulae clouds
    nebulae.forEach((n, ni) => {
      const driftX = Math.sin(t * 0.05 + ni * 1.2) * 0.008 * w;
      const driftY = Math.cos(t * 0.04 + ni * 0.9) * 0.005 * h;
      const cx = n.x * w + driftX;
      const cy = n.y * h + driftY;
      const rx = n.rx * w,
        ry = n.ry * h;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
      const maxR = Math.max(rx, ry);
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR);
      const [r, g, b] = n.color;
      const pulse = 0.9 + 0.1 * Math.sin(t * 0.08 + ni);
      grad.addColorStop(0, `rgba(${r},${g},${b},${n.alpha * pulse})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},${n.alpha * 0.5 * pulse})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(0, 0, maxR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });

    // Stars
    stars.forEach((s) => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -2) s.x = w + 2;
      if (s.x > w + 2) s.x = -2;
      if (s.y < -2) s.y = h + 2;
      if (s.y > h + 2) s.y = -2;
      const twinkle =
        0.5 + 0.5 * Math.sin(t * s.twinkleSpeed * 80 + s.twinklePhase);
      const a = s.baseAlpha * twinkle;
      const [r, g, b] = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fill();
      if (s.isBright) {
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
        halo.addColorStop(0, `rgba(${r},${g},${b},${a * 0.4})`);
        halo.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.1})`);
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
        // Diffraction spikes
        if (s.r > 1.4 && twinkle > 0.7) {
          const spikeLen = s.r * 8 * twinkle;
          const sAlpha = a * 0.35 * ((twinkle - 0.7) / 0.3);
          ctx.save();
          ctx.strokeStyle = `rgba(${r},${g},${b},${sAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y);
          ctx.lineTo(s.x + spikeLen, s.y);
          ctx.moveTo(s.x, s.y - spikeLen);
          ctx.lineTo(s.x, s.y + spikeLen);
          const diag = spikeLen * 0.5;
          ctx.moveTo(s.x - diag, s.y - diag);
          ctx.lineTo(s.x + diag, s.y + diag);
          ctx.moveTo(s.x + diag, s.y - diag);
          ctx.lineTo(s.x - diag, s.y + diag);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    // Shooting stars
    const now = performance.now();
    if (now - lastShoot > 3000 + Math.random() * 4000) {
      spawnShooter();
      if (Math.random() < 0.3)
        setTimeout(spawnShooter, 400 + Math.random() * 300);
      lastShoot = now;
    }
    shooters = shooters.filter((s) => s.life > 0);
    shooters.forEach((s) => {
      const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const nx = s.vx / spd,
        ny = s.vy / spd;
      const tailLen = s.len * s.life;
      const grad = ctx.createLinearGradient(
        s.x,
        s.y,
        s.x - nx * tailLen,
        s.y - ny * tailLen,
      );
      grad.addColorStop(0, `rgba(255,255,255,${s.alpha * s.life})`);
      grad.addColorStop(0.35, `rgba(200,170,255,${s.alpha * s.life * 0.5})`);
      grad.addColorStop(1, `rgba(200,160,255,0)`);
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - nx * tailLen, s.y - ny * tailLen);
      ctx.stroke();
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
    });

    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(hero);
  resize();
  draw();
})();

/* =========================================================
   HERO TORCH CANVAS — powerful cinematic spotlight.
   The hero BG is transparent (stars show through).
   Torch is a dramatic reveal beam — words hidden in dark, revealed by light.
   No solid background fill — composited over the star canvas.
========================================================= */
(function initTorchEffect() {
  const canvas = document.getElementById("torchCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  let w, h;
  let targetX, targetY, currX, currY;
  let isInHero = false;
  let mouseActive = false;
  let t = 0;

  // Each word has a base position + energetic drift params
  const wordData = [
    {
      text: "CHAOS",
      px: 0.06,
      py: 0.06,
      fs: 14,
      rot: -8,
      dx: 0.008,
      dy: 0.005,
    },
    {
      text: "RHYTHM",
      px: 0.22,
      py: 0.04,
      fs: 12,
      rot: 4,
      dx: -0.005,
      dy: 0.007,
    },
    {
      text: "VISION",
      px: 0.4,
      py: 0.08,
      fs: 15,
      rot: -3,
      dx: 0.007,
      dy: -0.004,
    },
    {
      text: "EUPHONY",
      px: 0.58,
      py: 0.05,
      fs: 12,
      rot: 6,
      dx: -0.006,
      dy: 0.008,
    },
    {
      text: "VORTEX",
      px: 0.76,
      py: 0.07,
      fs: 14,
      rot: -5,
      dx: 0.009,
      dy: 0.003,
    },
    {
      text: "LUMINANCE",
      px: 0.9,
      py: 0.05,
      fs: 11,
      rot: 3,
      dx: -0.004,
      dy: -0.006,
    },
    {
      text: "CULTURE",
      px: 0.04,
      py: 0.17,
      fs: 13,
      rot: -10,
      dx: 0.006,
      dy: 0.009,
    },
    {
      text: "ENERGY",
      px: 0.2,
      py: 0.19,
      fs: 17,
      rot: 2,
      dx: -0.007,
      dy: 0.004,
    },
    {
      text: "ECHOES",
      px: 0.48,
      py: 0.15,
      fs: 12,
      rot: -4,
      dx: 0.005,
      dy: -0.007,
    },
    {
      text: "KINETIC",
      px: 0.66,
      py: 0.18,
      fs: 14,
      rot: 7,
      dx: -0.008,
      dy: 0.005,
    },
    {
      text: "FASHION",
      px: 0.84,
      py: 0.15,
      fs: 13,
      rot: -6,
      dx: 0.006,
      dy: 0.008,
    },
    {
      text: "CINEMA",
      px: 0.03,
      py: 0.32,
      fs: 14,
      rot: -8,
      dx: -0.005,
      dy: -0.005,
    },
    { text: "PULSE", px: 0.05, py: 0.48, fs: 18, rot: 5, dx: 0.009, dy: 0.006 },
    {
      text: "ARTISTRY",
      px: 0.02,
      py: 0.62,
      fs: 12,
      rot: -3,
      dx: -0.006,
      dy: 0.007,
    },
    {
      text: "LEGEND",
      px: 0.88,
      py: 0.3,
      fs: 15,
      rot: 6,
      dx: 0.007,
      dy: -0.005,
    },
    {
      text: "SURGE",
      px: 0.9,
      py: 0.46,
      fs: 13,
      rot: -4,
      dx: -0.008,
      dy: 0.006,
    },
    {
      text: "IGNITE",
      px: 0.86,
      py: 0.62,
      fs: 16,
      rot: 8,
      dx: 0.005,
      dy: -0.008,
    },
    {
      text: "EUPHORIA",
      px: 0.1,
      py: 0.72,
      fs: 12,
      rot: -5,
      dx: -0.007,
      dy: 0.004,
    },
    {
      text: "HARMONY",
      px: 0.28,
      py: 0.75,
      fs: 14,
      rot: 3,
      dx: 0.008,
      dy: -0.006,
    },
    {
      text: "STORM",
      px: 0.46,
      py: 0.73,
      fs: 18,
      rot: -2,
      dx: -0.005,
      dy: 0.009,
    },
    { text: "VIVID", px: 0.62, py: 0.76, fs: 13, rot: 6, dx: 0.007, dy: 0.004 },
    {
      text: "DRAMA",
      px: 0.78,
      py: 0.73,
      fs: 15,
      rot: -7,
      dx: -0.006,
      dy: -0.007,
    },
    { text: "AURA", px: 0.92, py: 0.77, fs: 12, rot: 4, dx: 0.009, dy: 0.005 },
    {
      text: "RADIANT",
      px: 0.08,
      py: 0.87,
      fs: 13,
      rot: 5,
      dx: -0.005,
      dy: 0.008,
    },
    {
      text: "GENESIS",
      px: 0.26,
      py: 0.9,
      fs: 14,
      rot: -3,
      dx: 0.006,
      dy: -0.005,
    },
    {
      text: "COSMOS",
      px: 0.44,
      py: 0.88,
      fs: 17,
      rot: 2,
      dx: -0.007,
      dy: 0.007,
    },
    {
      text: "ETERNITY",
      px: 0.6,
      py: 0.91,
      fs: 12,
      rot: -6,
      dx: 0.008,
      dy: 0.004,
    },
    {
      text: "SRISHTI",
      px: 0.76,
      py: 0.88,
      fs: 16,
      rot: 4,
      dx: -0.006,
      dy: -0.008,
    },
    { text: "2K26", px: 0.9, py: 0.92, fs: 14, rot: -4, dx: 0.005, dy: 0.006 },
    {
      text: "MUSIC",
      px: 0.33,
      py: 0.24,
      fs: 12,
      rot: 9,
      dx: -0.008,
      dy: 0.005,
    },
    {
      text: "DANCE",
      px: 0.72,
      py: 0.26,
      fs: 13,
      rot: -8,
      dx: 0.007,
      dy: -0.006,
    },
    {
      text: "PERFORM",
      px: 0.15,
      py: 0.55,
      fs: 12,
      rot: 6,
      dx: -0.005,
      dy: 0.009,
    },
    {
      text: "MOTION",
      px: 0.82,
      py: 0.53,
      fs: 13,
      rot: -5,
      dx: 0.009,
      dy: 0.004,
    },
    {
      text: "GLORY",
      px: 0.5,
      py: 0.82,
      fs: 15,
      rot: 3,
      dx: -0.006,
      dy: -0.007,
    },
    { text: "FIRE", px: 0.38, py: 0.13, fs: 18, rot: -7, dx: 0.007, dy: 0.008 },
    { text: "ART", px: 0.64, py: 0.6, fs: 20, rot: 5, dx: -0.008, dy: 0.005 },
  ];

  // Give each word unique float phase + stronger amplitude
  wordData.forEach((wd, i) => {
    wd.phase = (i / wordData.length) * Math.PI * 2;
    wd.phase2 = (i / wordData.length) * Math.PI * 3.7;
    wd.phase3 = (i / wordData.length) * Math.PI * 5.1;
    wd.speed = 0.006 + (i % 7) * 0.0012;
    wd.ampX = 0.022 + (i % 5) * 0.006; // much bigger float
    wd.ampY = 0.032 + (i % 4) * 0.008;
  });

  function resize() {
    w = canvas.width = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
    if (!mouseActive) {
      currX = targetX = w * 0.5;
      currY = targetY = h * 0.44;
    }
  }

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    isInHero = true;
    mouseActive = true;
  });
  hero.addEventListener("mouseleave", () => {
    isInHero = false;
    // Auto drift to center
    targetX = w * 0.5;
    targetY = h * 0.44;
  });

  // Auto-wander when no mouse
  let wander = { x: 0.5, y: 0.44 };
  let wanderT = 0;

  function draw() {
    if (!w || !h) {
      requestAnimationFrame(draw);
      return;
    }
    t += 0.014;
    wanderT += 0.004;

    // Auto-wander in absence of mouse
    if (!mouseActive) {
      wander.x =
        0.5 + Math.sin(wanderT * 0.7) * 0.2 + Math.sin(wanderT * 1.3) * 0.08;
      wander.y =
        0.44 + Math.cos(wanderT * 0.6) * 0.18 + Math.cos(wanderT * 1.1) * 0.06;
      targetX = wander.x * w;
      targetY = wander.y * h;
    }

    currX += (targetX - currX) * 0.055;
    currY += (targetY - currY) * 0.055;

    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // ── Dark veil ONLY in the periphery — not solid, transparent center ──
    // We want the star background to shine through where the torch is
    const torchR = Math.min(w, h) * 0.48; // big powerful beam

    // Peripheral darkening (not full black — semi-transparent so stars peek through)
    const peripheryVeil = ctx.createRadialGradient(
      currX,
      currY,
      torchR * 0.3,
      currX,
      currY,
      torchR * 1.6,
    );
    peripheryVeil.addColorStop(0, "rgba(0,0,0,0)");
    peripheryVeil.addColorStop(0.4, "rgba(0,0,0,0)");
    peripheryVeil.addColorStop(0.65, "rgba(0,0,0,0.38)");
    peripheryVeil.addColorStop(0.85, "rgba(0,0,0,0.68)");
    peripheryVeil.addColorStop(1, "rgba(0,0,0,0.88)");
    ctx.fillStyle = peripheryVeil;
    ctx.fillRect(0, 0, w, h);

    // ── Draw words — revealed by beam ──
    ctx.save();
    wordData.forEach((wd) => {
      // Alive float: multi-frequency sinusoidal drift
      const floatX =
        Math.sin(t * wd.speed + wd.phase) * w * wd.ampX +
        Math.sin(t * wd.speed * 1.7 + wd.phase3) * w * 0.008;
      const floatY =
        Math.cos(t * wd.speed * 0.9 + wd.phase2) * h * wd.ampY +
        Math.cos(t * wd.speed * 2.1 + wd.phase) * h * 0.005;

      const wx = wd.px * w + floatX;
      const wy = wd.py * h + floatY;

      const dx = wx - currX,
        dy = wy - currY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > torchR + 60) return;

      // Smooth eased opacity — bright at center, fades at edge
      const norm = Math.max(0, 1 - dist / torchR);
      const wordAlpha = Math.pow(norm, 1.1) * 0.88; // stronger visibility
      if (wordAlpha < 0.01) return;

      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate((wd.rot * Math.PI) / 180);
      ctx.font = `300 italic ${wd.fs}px 'Cormorant Garamond', serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = wordAlpha;
      // Color shift based on proximity to center — purple/white gradient
      const centerNorm = Math.max(0, 1 - dist / (torchR * 0.4));
      ctx.shadowColor = `rgba(210,170,255,${0.7 * centerNorm + 0.3})`;
      ctx.shadowBlur = 14 + centerNorm * 20;
      ctx.fillStyle = `rgba(240,220,255,1)`;
      ctx.fillText(wd.text, 0, 0);
      ctx.restore();
    });
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // ── Strong purple warmth glow at beam center ──
    const warmth = ctx.createRadialGradient(
      currX,
      currY,
      0,
      currX,
      currY,
      torchR * 0.55,
    );
    warmth.addColorStop(0, "rgba(160,90,255,0.09)");
    warmth.addColorStop(0.4, "rgba(120,60,220,0.04)");
    warmth.addColorStop(0.7, "rgba(80,30,160,0.015)");
    warmth.addColorStop(1, "rgba(40,10,100,0)");
    ctx.fillStyle = warmth;
    ctx.beginPath();
    ctx.arc(currX, currY, torchR * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // ── Chrome ring at beam edge ──
    const ringAlpha = 0.06 + 0.04 * Math.sin(t * 0.8);
    const ring = ctx.createRadialGradient(
      currX,
      currY,
      torchR * 0.82,
      currX,
      currY,
      torchR * 0.95,
    );
    ring.addColorStop(0, `rgba(200,180,255,0)`);
    ring.addColorStop(0.5, `rgba(200,180,255,${ringAlpha})`);
    ring.addColorStop(1, `rgba(200,180,255,0)`);
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(currX, currY, torchR * 0.95, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(hero);
  resize();
  draw();
})();

/* =========================================================
   AMBIENT WORDS — rendered on torch canvas above
========================================================= */
(function initAmbientWords() {
  const c = document.getElementById("heroAmbientWords");
  if (c) c.remove();
})();

/* =========================================================
   CURSOR TRAIL — REMOVED (replaced by torch effect)
========================================================= */
// Cursor trail intentionally removed in favour of torch spotlight

/* =========================================================
   HERO LOGO — FLOAT ONLY (no glow, clean floating/hover)
========================================================= */
(function enhanceHeroLogoTracking() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const logo = document.getElementById("heroLogo");
  const wrap = document.getElementById("heroLogoWrap");
  if (!logo || !wrap) return;

  let targetX = 0,
    targetY = 0,
    currX = 0,
    currY = 0;
  let isHovering = false;
  let floatT = 0;

  document.addEventListener("mousemove", (e) => {
    const vx = (e.clientX / window.innerWidth - 0.5) * 2;
    const vy = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!isHovering) {
      targetX = vx * 14;
      targetY = vy * 9;
    }
  });

  wrap.addEventListener("mouseenter", () => {
    isHovering = true;
  });
  wrap.addEventListener("mouseleave", () => {
    isHovering = false;
    targetX = 0;
    targetY = 0;
  });

  wrap.addEventListener("mousemove", (e) => {
    if (!isHovering) return;
    const rect = wrap.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    targetX = dx * 22;
    targetY = dy * 14;
  });

  function animateLogo() {
    floatT += 0.01;
    currX += (targetX - currX) * 0.055;
    currY += (targetY - currY) * 0.055;
    // Gentle bobbing float
    const floatY = Math.sin(floatT * 0.7) * 6 + Math.sin(floatT * 1.3) * 2.5;
    const floatScale = 1 + Math.sin(floatT * 0.45) * 0.005;
    const tiltZ = currX * 0.035;
    logo.style.transform = `translate(${currX}px, ${currY + floatY}px) scale(${floatScale}) rotate(${tiltZ}deg)`;
    requestAnimationFrame(animateLogo);
  }
  animateLogo();
})();

/* =========================================================
   ENHANCED STORY STRIP — Lando-style cinematic reveal
========================================================= */
(function enhanceStoryStrip() {
  const panels = document.querySelectorAll(".story-panel");
  if (!panels.length) return;

  // Re-init words with staggered transition delays
  panels.forEach((panel, pi) => {
    const words = panel.querySelectorAll(".story-word");
    words.forEach((word, wi) => {
      word.style.transitionDelay = `${wi * 0.12}s`;
    });
  });

  function checkReveal() {
    const vh = window.innerHeight;
    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const progress = 1 - rect.top / vh;
      const words = panel.querySelectorAll(".story-word");

      words.forEach((word, i) => {
        const threshold = 0.3 + i * 0.08;
        if (progress > threshold) {
          word.classList.add("revealed");
          if (word.classList.contains("story-reveal-logo")) {
            const parentLine = word.closest(".story-line-logo");

            if (parentLine) {
              parentLine.classList.add("revealed");
            }
          }
        } else {
          // un-reveal if scrolled back up (makes it feel live)
          if (progress < 0.15) {
            word.classList.remove("revealed");
          }
        }
      });
    });
  }

  window.addEventListener("scroll", checkReveal, { passive: true });
  checkReveal();
})();

/* =========================================================
   SCHEDULE — staggered item entrance + tab animation
========================================================= */
(function initScheduleAnimations() {
  function revealScheduleItems() {
    const visible = document.querySelectorAll(
      ".schedule-day.active .schedule-item, .schedule-item",
    );
    visible.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight - 20) {
        setTimeout(() => item.classList.add("sch-visible"), i * 80);
      }
    });
  }

  window.addEventListener("scroll", revealScheduleItems, { passive: true });
  revealScheduleItems();

  // Re-run on tab switch
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        document
          .querySelectorAll(".schedule-day.active .schedule-item")
          .forEach((item, i) => {
            item.classList.remove("sch-visible");
            setTimeout(() => item.classList.add("sch-visible"), i * 90 + 50);
          });
      }, 50);
    });
  });
})();

/* =========================================================
   ABOUT CARDS — mouse-track glow
========================================================= */
(function initAboutCards() {
  document.querySelectorAll(".about-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--card-x", `${x}%`);
      card.style.setProperty("--card-y", `${y}%`);
    });
  });
})();

/* =========================================================
   COUNTDOWN — FLASH ON TICK
========================================================= */
(function initCountdownFlash() {
  const original = window.updateCountdown;
  let prevSec = -1;
  function wrappedCountdown() {
    const distance =
      new Date("October 10, 2026 09:00:00").getTime() - Date.now();
    const sec = Math.floor((distance % 60000) / 1000);
    if (sec !== prevSec) {
      prevSec = sec;
      const secEl = document.getElementById("seconds")?.closest(".time-card");
      if (secEl) {
        secEl.classList.remove("tick");
        void secEl.offsetWidth; // reflow
        secEl.classList.add("tick");
      }
    }
  }
  setInterval(wrappedCountdown, 1000);
})();

/* =========================================================
   SCROLL TO TOP BUTTON
========================================================= */
(function initScrollTop() {
  const btn = document.createElement("button");
  btn.className = "scroll-top-btn";
  btn.innerHTML = "↑";
  btn.title = "Back to top";
  document.body.appendChild(btn);

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 600);
    },
    { passive: true },
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* =========================================================
   NAV LINKS — stagger reveal on load
========================================================= */
(function initNavAnimations() {
  const links = document.querySelectorAll(".nav-links a");
  links.forEach((link, i) => {
    link.style.opacity = "0";
    link.style.transform = "translateY(-8px)";
    setTimeout(
      () => {
        link.style.transition =
          "opacity 0.5s ease, transform 0.5s ease, color 0.3s ease";
        link.style.opacity = "";
        link.style.transform = "";
      },
      3200 + i * 80,
    ); // after preloader
  });
})();

/* =========================================================
   SECTION TITLES — set data-text for chrome clone
========================================================= */
document.querySelectorAll(".section-title").forEach((el) => {
  el.setAttribute("data-text", el.textContent);
});

/* =========================================================
   SCHOOL SECTION LOGO — mouse parallax
========================================================= */
(function initSchoolLogaParallax() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const logo = document.querySelector(".school-section-logo");
  if (!logo) return;
  let tx = 0,
    ty = 0,
    cx = 0,
    cy = 0;

  document.addEventListener("mousemove", (e) => {
    const vx = e.clientX / window.innerWidth - 0.5;
    const vy = e.clientY / window.innerHeight - 0.5;
    tx = vx * 12;
    ty = vy * 8;
  });

  function animate() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    logo.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(animate);
  }
  animate();
})();
/* =========================================================
   GALAXY CANVAS — Saraswathy Vidhyalaya starry sky
========================================================= */
(function initSchoolGalaxy() {
  const section = document.querySelector(".school-section");
  if (!section) return;

  const canvas = document.createElement("canvas");
  canvas.id = "schoolGalaxyCanvas";
  section.insertBefore(canvas, section.firstChild);

  const ctx = canvas.getContext("2d");
  let w,
    h,
    stars = [],
    nebulae = [],
    shooters = [],
    milkyParticles = [];
  let t = 0,
    lastShoot = 0;

  function resize() {
    w = canvas.width = section.offsetWidth;
    h = canvas.height = section.offsetHeight;
    buildStars();
    buildMilkyWay();
  }

  function buildStars() {
    stars = [];
    const count = Math.min(Math.floor((w * h) / 650), 650);
    for (let i = 0; i < count; i++) {
      const tier = Math.random();
      const isBright = tier > 0.88;
      const isMid = tier > 0.65;
      const colorRoll = Math.random();
      const color =
        colorRoll < 0.06
          ? [168, 85, 247]
          : colorRoll < 0.11
            ? [110, 180, 255]
            : colorRoll < 0.14
              ? [255, 200, 120]
              : [255, 255, 255];
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: isBright
          ? Math.random() * 1.8 + 1.0
          : isMid
            ? Math.random() * 0.9 + 0.4
            : Math.random() * 0.5 + 0.1,
        baseAlpha: isBright
          ? Math.random() * 0.55 + 0.35
          : isMid
            ? Math.random() * 0.3 + 0.12
            : Math.random() * 0.18 + 0.04,
        twinkleSpeed: Math.random() * 0.025 + 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
        isBright,
        color,
      });
    }
    // Build nebulae
    nebulae = [
      {
        x: 0.12,
        y: 0.32,
        rx: 0.28,
        ry: 0.2,
        color: [80, 18, 165],
        alpha: 0.055,
      },
      {
        x: 0.78,
        y: 0.62,
        rx: 0.24,
        ry: 0.16,
        color: [25, 65, 195],
        alpha: 0.045,
      },
      {
        x: 0.5,
        y: 0.18,
        rx: 0.38,
        ry: 0.13,
        color: [105, 28, 155],
        alpha: 0.038,
      },
      {
        x: 0.88,
        y: 0.28,
        rx: 0.18,
        ry: 0.14,
        color: [185, 75, 220],
        alpha: 0.032,
      },
      {
        x: 0.28,
        y: 0.75,
        rx: 0.2,
        ry: 0.16,
        color: [35, 90, 200],
        alpha: 0.028,
      },
    ];
  }

  function buildMilkyWay() {
    milkyParticles = [];
    const count = Math.floor((w * h) / 2800);
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      // diagonal band from top-left to bottom-right
      const bx = t * w * 1.6 - w * 0.3;
      const by = t * h * 0.7 + Math.random() * h * 0.25 + h * 0.1;
      milkyParticles.push({
        x: bx + (Math.random() - 0.5) * w * 0.22,
        y: by + (Math.random() - 0.5) * h * 0.12,
        r: Math.random() * 0.7 + 0.15,
        alpha: Math.random() * 0.08 + 0.015,
      });
    }
  }

  function spawnShooter() {
    const side = Math.random();
    let sx, sy, angle;
    if (side < 0.5) {
      sx = Math.random() * w * 0.75;
      sy = Math.random() * h * 0.35;
      angle = Math.PI / 5 + (Math.random() - 0.5) * 0.45;
    } else {
      sx = Math.random() * 30;
      sy = Math.random() * h * 0.55;
      angle = Math.PI / 8 + (Math.random() - 0.5) * 0.3;
    }
    const speed = Math.random() * 9 + 6;
    shooters.push({
      x: sx,
      y: sy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: Math.random() * 130 + 70,
      alpha: 0.85 + Math.random() * 0.15,
      life: 1.0,
      decay: Math.random() * 0.018 + 0.01,
      width: Math.random() * 1.5 + 0.5,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.016;

    // Milky way band — soft cloud of tiny stars
    milkyParticles.forEach((mp) => {
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, mp.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210,190,255,${mp.alpha})`;
      ctx.fill();
    });

    // Nebulae / galaxy clouds
    nebulae.forEach((n) => {
      const cx = n.x * w,
        cy = n.y * h;
      const maxR = Math.max(n.rx * w, n.ry * h);
      ctx.save();
      ctx.scale((n.rx * w) / maxR, (n.ry * h) / maxR);
      const grd = ctx.createRadialGradient(
        cx * (maxR / (n.rx * w)),
        cy * (maxR / (n.ry * h)),
        0,
        cx * (maxR / (n.rx * w)),
        cy * (maxR / (n.ry * h)),
        maxR,
      );
      const [r, g, b] = n.color;
      grd.addColorStop(0, `rgba(${r},${g},${b},${n.alpha})`);
      grd.addColorStop(0.45, `rgba(${r},${g},${b},${n.alpha * 0.45})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(
        cx * (maxR / (n.rx * w)),
        cy * (maxR / (n.ry * h)),
        maxR,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();
    });

    // Stars with twinkling + diffraction spikes on bright ones
    stars.forEach((s) => {
      const twinkle =
        0.45 + 0.55 * Math.sin(t * s.twinkleSpeed * 100 + s.twinklePhase);
      const a = s.baseAlpha * twinkle;
      const [r, g, b] = s.color;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.fill();

      if (s.isBright) {
        // Soft glow halo
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
        halo.addColorStop(0, `rgba(${r},${g},${b},${a * 0.38})`);
        halo.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.1})`);
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Diffraction spike cross on very bright + big stars when twinkling high
        if (s.r > 1.5 && twinkle > 0.72) {
          const spikeLen = s.r * 7 * twinkle;
          const spikeAlpha = a * 0.3 * ((twinkle - 0.72) / 0.28);
          ctx.save();
          ctx.strokeStyle = `rgba(${r},${g},${b},${spikeAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y);
          ctx.lineTo(s.x + spikeLen, s.y);
          ctx.moveTo(s.x, s.y - spikeLen);
          ctx.lineTo(s.x, s.y + spikeLen);
          // Diagonal spikes at 45 degrees
          const diagLen = spikeLen * 0.55;
          ctx.moveTo(s.x - diagLen, s.y - diagLen);
          ctx.lineTo(s.x + diagLen, s.y + diagLen);
          ctx.moveTo(s.x + diagLen, s.y - diagLen);
          ctx.lineTo(s.x - diagLen, s.y + diagLen);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    // Shooting stars
    const now = performance.now();
    if (now - lastShoot > 2200 + Math.random() * 2800) {
      spawnShooter();
      if (Math.random() < 0.28) {
        setTimeout(spawnShooter, 350 + Math.random() * 400);
      }
      lastShoot = now;
    }

    shooters = shooters.filter((s) => s.life > 0);
    shooters.forEach((s) => {
      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
      const nx = s.vx / speed,
        ny = s.vy / speed;
      const tailLen = s.len * s.life;

      const grad = ctx.createLinearGradient(
        s.x,
        s.y,
        s.x - nx * tailLen,
        s.y - ny * tailLen,
      );
      grad.addColorStop(0, `rgba(255,255,255,${s.alpha * s.life})`);
      grad.addColorStop(0.3, `rgba(210,185,255,${s.alpha * s.life * 0.6})`);
      grad.addColorStop(1, `rgba(200,160,255,0)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - nx * tailLen, s.y - ny * tailLen);
      ctx.stroke();

      // Head glow
      const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 7);
      headGlow.addColorStop(0, `rgba(255,255,255,${s.alpha * s.life * 0.9})`);
      headGlow.addColorStop(0.5, `rgba(200,160,255,${s.alpha * s.life * 0.3})`);
      headGlow.addColorStop(1, "rgba(200,160,255,0)");
      ctx.beginPath();
      ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = headGlow;
      ctx.fill();

      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
    });

    requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(section);
  resize();
  draw();
})();

/* =========================================================
   TYPOGRAPHY CHAR SPLIT — hero heading stagger hover
========================================================= */
(function initTypographyChars() {
  const heading = document.querySelector(".hero-heading");
  if (!heading || window.matchMedia("(pointer:coarse)").matches) return;

  const raw = heading.innerHTML;
  let out = "";
  let ci = 0;
  let inside = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "<") {
      inside = true;
      out += ch;
      continue;
    }
    if (ch === ">") {
      inside = false;
      out += ch;
      continue;
    }
    if (inside) {
      out += ch;
      continue;
    }
    if (ch === " ") {
      out += `<span class="hero-char hero-space" aria-hidden="true"> </span>`;
    } else if (ch.trim()) {
      out += `<span class="hero-char" style="--ci:${ci}" aria-hidden="true">${ch}</span>`;
      ci++;
    } else {
      out += ch;
    }
  }

  heading.setAttribute("aria-label", heading.textContent);
  heading.innerHTML = out;
  heading.classList.add("chars-split");
})();

/* =========================================================
   CINEMATIC STORY INTRO — ensure story strip is seen first
   Make the first story panel ("IT STARTS WITH AN IDEA")
   animate in like a title card after preloader
========================================================= */
(function initCinematicIntro() {
  const firstPanel = document.querySelector('.story-panel[data-story="0"]');
  if (!firstPanel) return;

  // After preloader fades, if user hasn't scrolled yet,
  // gently auto-scroll to the story strip for the cinematic reveal
  let introPlayed = false;
  const preloaderEl = document.getElementById("preloader");

  function watchPreloader() {
    if (!preloaderEl) return;
    const obs = new MutationObserver(() => {
      if (preloaderEl.classList.contains("hidden") && !introPlayed) {
        introPlayed = true;
        // Subtle pulsing background on first panel to draw attention
        firstPanel.classList.add("story-intro-active");
        obs.disconnect();
      }
    });
    obs.observe(preloaderEl, { attributes: true, attributeFilter: ["class"] });
  }
  watchPreloader();
})();

/* ===== CINEMATIC MOTION PATCH ===== */

(function cinematicAmbientMotion() {
  const words = document.querySelectorAll(".ambient-word");
  if (!words.length) return;

  let mx = 0;
  let my = 0;

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true },
  );

  function animate() {
    words.forEach((word, i) => {
      const speed = (i + 1) * 6;
      const x = Math.sin(Date.now() * 0.00015 + i) * speed + mx * speed * 4;
      const y = Math.cos(Date.now() * 0.00012 + i) * speed + my * speed * 4;
      word.style.transform = `translate3d(${x}px, ${y}px, 0px)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
})();

(function enhanceLogoGlow() {
  const logo = document.getElementById("heroLogo");
  if (!logo) return;

  window.addEventListener(
    "mousemove",
    (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;

      logo.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0px) rotateX(${-y * 0.08}deg) rotateY(${x * 0.08}deg)`;
    },
    { passive: true },
  );
})();

/* ===== ADVANCED GALAXY ORBS ===== */

(function createGalaxyOrbs() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  for (let i = 0; i < 7; i++) {
    const orb = document.createElement("div");
    orb.className = "galaxy-orb";

    const size = 180 + Math.random() * 320;

    orb.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:radial-gradient(circle,
        rgba(168,85,247,0.18),
        rgba(124,58,237,0.08),
        transparent 70%);
      filter:blur(35px);
      pointer-events:none;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      opacity:${0.25 + Math.random() * 0.25};
      z-index:1;
      animation:orbFloat${i} ${18 + i * 3}s ease-in-out infinite alternate;
    `;

    hero.appendChild(orb);

    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes orbFloat${i}{
        0%{
          transform:translate3d(0,0,0) scale(1);
        }
        100%{
          transform:translate3d(${Math.random() * 120 - 60}px, ${Math.random() * 80 - 40}px,0) scale(1.12);
        }
      }
    `;
    document.head.appendChild(style);
  }
})();

/* ===== EXTRA CINEMATIC HERO FIXES ===== */

/* Smaller torch radius */
(function reduceTorchRadius() {
  const canvas = document.getElementById("torchCanvas");
  if (!canvas) return;

  const original = CanvasRenderingContext2D.prototype.createRadialGradient;

  CanvasRenderingContext2D.prototype.createRadialGradient = function (
    x0,
    y0,
    r0,
    x1,
    y1,
    r1,
  ) {
    return original.call(this, x0, y0, r0, x1, y1, r1 * 0.5);
  };
})();

/* Add cinematic stars */
(function addCinematicStars() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  for (let i = 0; i < 45; i++) {
    const star = document.createElement("div");
    star.className = "cinematic-star";

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 5 + "s";

    hero.appendChild(star);
  }
})();

/* Extra smooth menu scroll */
document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;

    window.scrollTo({
      top: target.offsetTop - 60,
      behavior: "smooth",
    });
  });
});

/* Background flicker prevention */
(function preventFlicker() {
  const elems = document.querySelectorAll(".hero, .section, canvas");

  elems.forEach((el) => {
    el.style.transform = "translateZ(0)";
    el.style.backfaceVisibility = "hidden";
  });
})();

window.addEventListener(
  "scroll",
  () => {
    updateNavbar();
    updateScrollProgress();
    revealOnScroll();
  },
  { passive: true },
);

setTimeout(() => {
  const loader = document.getElementById("preloader");
  if (loader) {
    loader.classList.add("hidden");
  }
}, 4500);

/* =========================================================
   FORCE SCROLL SAFETY
========================================================= */

document.documentElement.style.overflowY = "auto";
document.body.style.overflowY = "auto";

window.addEventListener("wheel", () => {}, { passive: true });

window.addEventListener("touchmove", () => {}, { passive: true });

/* PRELOADER FAILSAFE */
window.addEventListener("load", () => {
  setTimeout(() => {
    const preloader = document.getElementById("preloader");

    if (preloader) {
      preloader.classList.add("hidden");
    }
  }, 3500);
});

/* resize stability */
window.addEventListener("resize", () => {
  document.body.style.overflowY = "auto";
});

/* prevent accidental scroll blocking */
document.addEventListener("gesturestart", (e) => e.preventDefault());

/* =========================================================
   NUCLEAR PRELOADER FAILSAFE
========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const preloader = document.getElementById("preloader");

    if (preloader) {
      preloader.remove();
    }

    document.body.style.overflow = "auto";
    document.body.style.overflowY = "auto";

    document.documentElement.style.overflow = "auto";
    document.documentElement.style.overflowY = "auto";
  }, 5000);
});
