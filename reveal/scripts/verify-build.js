const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const required = [
  "index.html",
  "README.md",
  "css/style.css",
  "css/srishti-redesign.css",
  "css/animations.css",
  "css/events-3d.css",
  "css/legacy-wall.css",
  "css/section-dividers.css",
  "js/preloader.js",
  "js/script.js",
  "js/audio.js",
  "js/srishti-core.js",
  "js/events-3d.js",
  "js/legacy-wall.js",
  "js/section-dividers.js",
  "manifest.json",
  "sw.js",
  "data/legacy.json",
];

const forbidden = [
  "gallery.html",
  "DEPLOYMENT.md",
  "legacy-data.json",
  "style.css",
  "script.js",
];

let ok = true;
for (const f of required) {
  if (!fs.existsSync(path.join(root, f))) {
    console.error("Missing:", f);
    ok = false;
  }
}
for (const f of forbidden) {
  if (fs.existsSync(path.join(root, f))) {
    console.error("Should be removed or relocated:", f);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("Build verification passed.");
