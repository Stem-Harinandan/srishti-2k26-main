# Srishti 2K26 — Website

Srishti 2K26 — **Rhapsody of Radiance**. Saraswathi Vidyalaya interschool cultural fest site.

---

## Folder structure

```
reveal/
├── index.html              # Main page (only HTML file)
├── README.md               # This file — all instructions
├── package.json            # npm scripts
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline shell)
├── sitemap.xml
├── vercel.json             # Vercel deploy config
├── netlify.toml            # Netlify deploy config
│
├── css/                    # All stylesheets
│   ├── style.css           # Base layout & sections
│   ├── srishti-redesign.css
│   ├── animations.css      # Nav, footer
│   ├── events-3d.css       # Event Universe 3D ring
│   └── legacy-wall.css     # Legacy Wall photos
│
├── js/                     # All scripts
│   ├── script.js           # Core animations, scroll FX
│   ├── srishti-core.js     # Lenis, hero stars, story sky
│   ├── events-3d.js        # 3D poster ring + mobile carousel
│   ├── legacy-wall.js      # Legacy Wall gallery
│   └── audio.js            # Sound toggle & effects
│
├── data/
│   └── legacy.json         # Optional captions for Legacy Wall photos
│
├── public/                 # Primary uploads (use these first)
│   ├── posters/            # Event poster images
│   └── legacy/             # SV achievements & past Srishti photos
│
├── assets/                 # Bundled / fallback assets
│   ├── logo.png            # Site logo
│   ├── sv_logo.png         # School logo
│   ├── posters/            # Fallback posters if public/ empty
│   └── legacy/             # Fallback legacy photos
│
├── media/                  # Optional — large files (if you use this layout)
│   ├── video/              # background.mp4, trailer.mp4, thumbnail.jpg
│   └── audio/              # background-music.mp3, hover.mp3, etc.
│
└── scripts/
    ├── verify-build.js     # npm run build
    └── lint-static.js      # npm run lint
```

> **Note:** Videos and audio can stay in the **project root** (current setup) or move into `media/video/` and `media/audio/` — update paths in `index.html` if you move them.

---

## Quick start

```bash
npm run build    # Check all required files exist
npm start        # Preview at http://localhost:3000
```

---

## Event posters (Event Universe)

**Folder:** `public/posters/` (fallback: `assets/posters/`)

| File | Event |
|------|--------|
| `01-cini-opsis.jpg` | Cini Opsis |
| `02-euphony.jpg` | Euphony |
| `03-baker-street.jpg` | 221B Baker Street |
| `04-facere.jpg` | Facere |
| `05-chroma-clash.jpg` | Chroma Clash |
| `06-vortex.jpg` | Vortex |

- Format: JPG or WebP, ~800×1000 (4:5 portrait), compressed  
- Site auto-detects files — no code changes needed  

---

## Legacy Wall (achievements & past Srishti)

**Folder:** `public/legacy/` (fallback: `assets/legacy/`)

| Prefix | Category | Examples |
|--------|----------|----------|
| `achievement-` | SV Achievements | `achievement-01.jpg` |
| `srishti-` | Past Srishti | `srishti-01.jpg` |
| `moment-` | Campus moments | `moment-01.jpg` |

Number sequentially: `01`, `02`, `03` …

**Optional metadata:** edit `data/legacy.json`:

```json
{
  "items": [
    {
      "file": "srishti-01.jpg",
      "category": "srishti",
      "title": "Main Stage 2024",
      "year": "2024",
      "caption": "Opening night"
    }
  ]
}
```

---

## Branding assets

| File | Location |
|------|----------|
| Srishti logo | `assets/logo.png` |
| School logo | `assets/sv_logo.png` |

---

## Media (optional)

Place in project **root** (default) or `media/` subfolders:

| File | Purpose |
|------|---------|
| `trailer.mp4` | Trailer section |
| `background-music.mp3` | Ambient audio |
| `hover.mp3`, `click.mp3`, `reveal.mp3` | UI sounds |

---

## Deploy

**Publish directory:** project root (`.`)

### Vercel
- Framework: Other  
- Build command: `npm run build` (optional)  
- Output: `.`  
- Uses `vercel.json`  

### Netlify
- Publish: `.`  
- Build: `npm run build`  
- Uses `netlify.toml`  

### After deploy
1. Replace Instagram/YouTube URLs in footer (`index.html`)  
2. Update `sitemap.xml` and meta `canonical` if domain changes  
3. Hard-refresh once (Ctrl+Shift+R) to load new `sw.js` cache  

---

## Environment variables

None required for static hosting.

---

## Editing the site

| Change | Edit |
|--------|------|
| Content / sections | `index.html` |
| Colors / theme | `css/srishti-redesign.css`, `css/style.css` |
| Event 3D behavior | `js/events-3d.js` |
| Legacy gallery | `js/legacy-wall.js`, `data/legacy.json` |
| Hero animations | `js/script.js`, `css/animations.css` |

---

## License / credits

© Srishti 2K26 · Rhapsody of Radiance · Saraswathi Vidyalaya
