/**
 * Legacy Wall — SV achievements & past Srishti photos
 */
(function () {
  "use strict";

  const BASES = ["assets/legacy"];
  const CATEGORY_LABELS = {
    achievements: "SV Achievement",
    srishti: "Past Srishti",
    moments: "Campus Moment",
  };

  const DISCOVERY = [
    { prefix: "achievement-", category: "achievements", max: 16 },
    { prefix: "srishti-", category: "srishti", max: 24 },
    { prefix: "moment-", category: "moments", max: 16 },
    { prefix: "legacy-", category: "moments", max: 12 },
  ];

  let allItems = [];
  let filteredItems = [];
  let lightboxIndex = 0;
  let spotlightIndex = 0;
  let spotlightTimer = null;

  async function fileExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function resolveUrl(file) {
    for (const base of BASES) {
      const url = `${base}/${file}`;
      if (await fileExists(url)) return url;
    }
    return null;
  }

  async function loadManifest() {
    try {
      const res = await fetch("data/legacy.json");
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.items?.length) return null;
      const resolved = [];
      for (const item of data.items) {
        const src = await resolveUrl(item.file);
        if (src) {
          resolved.push({
            src,
            category: item.category || "moments",
            title: item.title || prettifyFile(item.file),
            year: item.year || "",
            caption: item.caption || "",
          });
        }
      }
      return resolved.length ? resolved : null;
    } catch {
      return null;
    }
  }

  function prettifyFile(file) {
    return file
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async function discoverImages() {
    const found = [];
    for (const group of DISCOVERY) {
      for (let i = 1; i <= group.max; i++) {
        const file = `${group.prefix}${String(i).padStart(2, "0")}.jpg`;
        const src = await resolveUrl(file);
        if (src) {
          found.push({
            src,
            category: group.category,
            title: prettifyFile(file),
            year: inferYear(file, i),
            caption: "",
          });
        }
        const webp = file.replace(".jpg", ".webp");
        const srcW = await resolveUrl(webp);
        if (srcW) {
          found.push({
            src: srcW,
            category: group.category,
            title: prettifyFile(webp),
            year: inferYear(webp, i),
            caption: "",
          });
        }
      }
    }
    const seen = new Set();
    return found.filter((item) => {
      if (seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    });
  }

  function inferYear(file, index) {
    const m = file.match(/20\d{2}/);
    if (m) return m[0];
    const editions = ["2020", "2022", "2024", "2025", "2026"];
    return editions[index % editions.length];
  }

  function placeholders() {
    const samples = [
      { category: "achievements", title: "SV Trophy Moment", year: "2024" },
      { category: "achievements", title: "Academic Excellence", year: "2023" },
      { category: "srishti", title: "Srishti Main Stage", year: "2024" },
      { category: "srishti", title: "Finale Night", year: "2023" },
      { category: "srishti", title: "Backstage", year: "2022" },
      { category: "moments", title: "Campus Pride", year: "2025" },
      { category: "moments", title: "Team Photo", year: "2024" },
      { category: "achievements", title: "District Win", year: "2024" },
      { category: "srishti", title: "Crowd Energy", year: "2024" },
      { category: "moments", title: "Rehearsal Day", year: "2025" },
    ];
    return samples.map((s, i) => ({
      src: null,
      placeholder: true,
      category: s.category,
      title: s.title,
      year: s.year,
      caption: `Add photo: public/legacy/${DISCOVERY.find((d) => d.category === s.category)?.prefix || "legacy-"}${String(i + 1).padStart(2, "0")}.jpg`,
    }));
  }

  function renderSpotlight(item) {
    const el = document.getElementById("legacySpotlight");
    if (!el || !item) return;

    const badge = CATEGORY_LABELS[item.category] || "Memory";
    el.innerHTML = `
      <div class="legacy-spotlight-inner" id="legacySpotlightInner">
        ${
          item.src
            ? `<img src="${item.src}" alt="${item.title}" />`
            : `<div class="legacy-spotlight-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 16l-5.5-5.5a2 2 0 00-2.8 0L7 17"/></svg>
            <span>Photo coming soon</span>
          </div>`
        }
        <span class="legacy-spotlight-badge ${item.category}">${badge}</span>
        <div class="legacy-spotlight-caption">
          ${item.year ? `<p class="legacy-spotlight-year">${item.year}</p>` : ""}
          <h3 class="legacy-spotlight-title">${item.title}</h3>
          ${item.caption ? `<p class="legacy-spotlight-desc">${item.caption}</p>` : ""}
        </div>
      </div>`;

    const inner = document.getElementById("legacySpotlightInner");
    if (inner && !item.placeholder) {
      inner.addEventListener("click", () => openLightbox(allItems.indexOf(item)));
      inner.style.cursor = "pointer";
      inner.addEventListener("mousemove", (e) => {
        const r = inner.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      inner.addEventListener("mouseleave", () => {
        inner.style.transform = "";
      });
    }
  }

  function cycleSpotlight() {
    const pool = filteredItems.filter((i) => i.src);
    if (!pool.length) {
      renderSpotlight(filteredItems[0] || allItems[0]);
      return;
    }
    spotlightIndex = (spotlightIndex + 1) % pool.length;
    const inner = document.getElementById("legacySpotlightInner");
    if (inner) {
      inner.style.opacity = "0";
      inner.style.transform = "scale(0.98)";
      setTimeout(() => {
        renderSpotlight(pool[spotlightIndex]);
        const n = document.getElementById("legacySpotlightInner");
        if (n) {
          n.style.transition = "opacity 0.6s, transform 0.6s";
          requestAnimationFrame(() => {
            n.style.opacity = "1";
            n.style.transform = "";
          });
        }
      }, 300);
    } else {
      renderSpotlight(pool[spotlightIndex]);
    }
  }

  function buildMasonry() {
    const grid = document.getElementById("legacyMasonry");
    if (!grid) return;
    grid.innerHTML = "";

    filteredItems.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = `legacy-card ${item.category}`;
      card.dataset.category = item.category;
      card.dataset.index = String(index);

      const frame = document.createElement("div");
      frame.className = "legacy-card-frame";

      if (item.src) {
        const img = document.createElement("img");
        img.className = "legacy-card-img";
        img.src = item.src;
        img.alt = item.title;
        img.loading = "lazy";
        frame.appendChild(img);
      } else {
        const ph = document.createElement("div");
        ph.className = "legacy-card-placeholder";
        ph.innerHTML = `<span>◈</span><span>${item.title}</span>`;
        frame.appendChild(ph);
      }

      const shine = document.createElement("div");
      shine.className = "legacy-card-shine";
      frame.appendChild(shine);

      const meta = document.createElement("div");
      meta.className = "legacy-card-meta";
      meta.innerHTML = `
        ${item.year ? `<span class="legacy-card-year">${item.year}</span>` : ""}
        <p class="legacy-card-title">${item.title}</p>`;
      frame.appendChild(meta);

      card.appendChild(frame);

      if (item.src) {
        card.addEventListener("click", () => {
          const globalIdx = allItems.findIndex((x) => x === item);
          openLightbox(globalIdx >= 0 ? globalIdx : index);
        });
      }

      grid.appendChild(card);

      requestAnimationFrame(() => {
        setTimeout(() => card.classList.add("visible"), (index % 8) * 80);
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.08 },
    );
    grid.querySelectorAll(".legacy-card").forEach((c) => io.observe(c));
  }

  function buildFilmstrip() {
    const track = document.getElementById("legacyFilmstripTrack");
    if (!track) return;
    track.innerHTML = "";
    const withImg = allItems.filter((i) => i.src);
    const pool = withImg.length ? withImg : filteredItems.slice(0, 8);

    const buildSet = (items) => {
      items.forEach((item) => {
        if (!item.src) return;
        const el = document.createElement("div");
        el.className = "legacy-film-item";
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = "";
        img.loading = "lazy";
        el.appendChild(img);
        el.addEventListener("click", () => {
          const idx = allItems.indexOf(item);
          if (idx >= 0) openLightbox(idx);
        });
        track.appendChild(el);
      });
    };

    buildSet(pool);
    buildSet(pool);
  }

  function applyFilter(cat) {
    document.querySelectorAll(".legacy-filter-btn").forEach((btn) => {
      const on = btn.dataset.filter === cat;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    filteredItems = cat === "all" ? [...allItems] : allItems.filter((i) => i.category === cat);
    buildMasonry();
    spotlightIndex = 0;
    const first = filteredItems.find((i) => i.src) || filteredItems[0];
    renderSpotlight(first);
  }

  function openLightbox(index) {
    const withSrc = allItems.filter((i) => i.src);
    if (!withSrc.length) return;
    const item = allItems[index];
    if (!item?.src) return;
    lightboxIndex = withSrc.indexOf(item);
    if (lightboxIndex < 0) lightboxIndex = 0;

    const lb = document.getElementById("legacyLightbox");
    updateLightboxImage(withSrc[lightboxIndex]);
    lb?.classList.add("open");
    lb?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.audioManager?.playClick?.();
  }

  function updateLightboxImage(item) {
    const img = document.querySelector("#legacyLightbox img");
    const title = document.querySelector(".legacy-lightbox-info h3");
    const cap = document.querySelector(".legacy-lightbox-info p");
    if (img && item) {
      img.src = item.src;
      img.alt = item.title;
    }
    if (title) title.textContent = item.title;
    if (cap) cap.textContent = item.caption || `${CATEGORY_LABELS[item.category] || ""}${item.year ? " · " + item.year : ""}`;
  }

  function closeLightbox() {
    const lb = document.getElementById("legacyLightbox");
    lb?.classList.remove("open");
    lb?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function stepLightbox(dir) {
    const withSrc = allItems.filter((i) => i.src);
    if (!withSrc.length) return;
    lightboxIndex = (lightboxIndex + dir + withSrc.length) % withSrc.length;
    updateLightboxImage(withSrc[lightboxIndex]);
  }

  function initParticles() {
    const canvas = document.getElementById("legacyWallParticles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const section = canvas.closest(".legacy-wall-section");
    let pts = [];

    function resize() {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
      pts = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random(),
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
        ctx.fillStyle = "rgba(196, 132, 252, 0.2)";
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  function setupFilters() {
    document.querySelectorAll(".legacy-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
    });
  }

  function setupLightbox() {
    document.querySelector(".legacy-lightbox-close")?.addEventListener("click", closeLightbox);
    document.querySelector(".legacy-lightbox-backdrop")?.addEventListener("click", closeLightbox);
    document.querySelector(".legacy-lightbox-prev")?.addEventListener("click", () => stepLightbox(-1));
    document.querySelector(".legacy-lightbox-next")?.addEventListener("click", () => stepLightbox(1));
    document.addEventListener("keydown", (e) => {
      const lb = document.getElementById("legacyLightbox");
      if (!lb?.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const manifest = await loadManifest();
    const discovered = await discoverImages();
    allItems = manifest?.length ? manifest : discovered.length ? discovered : placeholders();
    filteredItems = [...allItems];

    renderSpotlight(filteredItems.find((i) => i.src) || filteredItems[0]);
    buildMasonry();
    buildFilmstrip();
    setupFilters();
    setupLightbox();
    initParticles();

    spotlightTimer = setInterval(cycleSpotlight, 6000);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(spotlightTimer);
      else spotlightTimer = setInterval(cycleSpotlight, 6000);
    });
  });
})();
