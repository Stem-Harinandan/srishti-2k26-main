/**
 * Video preloader — plays logofirst6secs.mp4 then reveals site
 */
(function () {
  "use strict";

  const pl = document.getElementById("preloader");
  const video = document.getElementById("preloaderVideo");
  const fallback = document.getElementById("preloaderFallback");

  if (!pl) return;

  const MIN_PLAY_MS = 1800;
  const MAX_WAIT_MS = 10000;
  const FADE_MS = 900;

  let finished = false;
  const startedAt = performance.now();

  document.documentElement.classList.add("preloader-active");
  document.body.classList.add("preloader-active");
  document.body.style.overflow = "hidden";

  function finishPreloader() {
    if (finished) return;
    finished = true;

    pl.classList.add("hidden");
    pl.setAttribute("aria-busy", "false");
    document.documentElement.classList.remove("preloader-active");
    document.body.classList.remove("preloader-active");
    document.body.classList.add("loaded");
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    if (video) {
      try {
        video.pause();
      } catch (_) {}
    }

    window.dispatchEvent(new CustomEvent("srishti:preloader-done"));

    setTimeout(() => {
      if (pl.parentNode) pl.remove();
    }, FADE_MS + 100);
  }

  window.finishPreloader = finishPreloader;

  function showFallback() {
    if (fallback) fallback.classList.add("visible");
    if (video) video.style.display = "none";
  }

  function scheduleFinishAfterMin() {
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, MIN_PLAY_MS - elapsed);
    setTimeout(finishPreloader, wait);
  }

  function tryPlay() {
    if (!video) {
      showFallback();
      setTimeout(finishPreloader, 2500);
      return;
    }

    video.muted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const p = video.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        showFallback();
        pl.classList.add("needs-tap");
        const onTap = () => {
          video.play().then(() => pl.classList.remove("needs-tap")).catch(() => {});
        };
        pl.addEventListener("click", onTap, { once: true });
        pl.addEventListener("touchstart", onTap, { once: true, passive: true });
        setTimeout(finishPreloader, 4000);
      });
    }
  }

  if (video) {
    video.addEventListener("ended", scheduleFinishAfterMin);

    video.addEventListener("error", () => {
      showFallback();
      setTimeout(finishPreloader, 2200);
    });

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplaythrough", tryPlay, { once: true });
      video.addEventListener("loadeddata", tryPlay, { once: true });
      setTimeout(tryPlay, 400);
    }
  } else {
    showFallback();
    setTimeout(finishPreloader, 2500);
  }

  setTimeout(finishPreloader, MAX_WAIT_MS);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") finishPreloader();
  });
})();
