const CACHE = "srishti-v6";
const PRECACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/srishti-redesign.css",
  "/css/animations.css",
  "/css/section-dividers.css",
  "/css/events-3d.css",
  "/css/legacy-wall.css",
  "/js/preloader.js",
  "/js/script.js",
  "/js/section-dividers.js",
  "/js/srishti-core.js",
  "/js/events-3d.js",
  "/js/legacy-wall.js",
  "/js/audio.js",
  "/assets/logo.png",
  "/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res.ok && url.pathname.match(/\.(css|js|png|jpg|webp|json)$/)) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
