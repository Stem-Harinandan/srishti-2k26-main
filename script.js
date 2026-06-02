/* =========================
   SECURITY SHIELD
   Prevents logo inspection
   before reveal date.
========================= */

(function () {
  /* --- 1. DISABLE RIGHT-CLICK --- */

  document.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
    },
    true,
  );

  /* --- 2. BLOCK DEVTOOLS KEYBOARD SHORTCUTS --- */

  document.addEventListener(
    "keydown",
    function (e) {
      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      /* F12 */
      if (key === "F12") {
        e.preventDefault();
        return false;
      }

      /* Ctrl+Shift+I  — Elements / Inspector */
      /* Ctrl+Shift+J  — Console              */
      /* Ctrl+Shift+C  — Pick element         */
      /* Ctrl+Shift+K  — (Firefox console)    */
      if (ctrl && shift && ["I", "J", "C", "K"].includes(key.toUpperCase())) {
        e.preventDefault();
        return false;
      }

      /* Ctrl+U  — View Source */
      if (ctrl && key.toUpperCase() === "U") {
        e.preventDefault();
        return false;
      }

      /* Ctrl+S  — Save Page As */
      if (ctrl && key.toUpperCase() === "S") {
        e.preventDefault();
        return false;
      }

      /* Ctrl+A  — Select All (stops mass-copy) */
      if (ctrl && key.toUpperCase() === "A") {
        e.preventDefault();
        return false;
      }
    },
    true,
  );

  /* --- 3. DISABLE TEXT SELECTION --- */

  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
  });

  /* --- 4. DISABLE IMAGE DRAG --- */

  document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG") {
      e.preventDefault();
    }
  });

  /* --- 5. DEVTOOLS SIZE DETECTION ---
        When DevTools is docked, the inner
        window shrinks noticeably.
        Blur the logo area if detected.
    ---------------------------------------- */

  const DEVTOOLS_THRESHOLD = 160;

  let devToolsOpen = false;

  function checkDevTools() {
    const widthGap = window.outerWidth - window.innerWidth;

    const heightGap = window.outerHeight - window.innerHeight;

    const isOpen =
      widthGap > DEVTOOLS_THRESHOLD || heightGap > DEVTOOLS_THRESHOLD;

    if (isOpen && !devToolsOpen) {
      devToolsOpen = true;

      document.body.classList.add("devtools-open");
    } else if (!isOpen && devToolsOpen) {
      devToolsOpen = false;

      document.body.classList.remove("devtools-open");
    }
  }

  setInterval(checkDevTools, 800);

  /* --- 6. CONSOLE WARNING + PERIODIC CLEAR --- */

  const CONSOLE_WARNING = `
%c⛔  STOP!
%cThis is a browser feature intended for developers.
Attempting to inspect or extract content before
the reveal is not cool. The logo will be public
at the reveal — be patient!
`;

  function printWarning() {
    console.clear();

    console.log(
      CONSOLE_WARNING,
      "color:#d8c9ff;font-size:26px;font-weight:700;",
      "color:#ffffff88;font-size:13px;",
    );
  }

  printWarning();

  /* Reprint every 3 s so the console stays noisy */
  setInterval(printWarning, 3000);
})();

/* =========================
   CSS for devtools-open state
   (injected so no extra file needed)
========================= */

(function () {
  const style = document.createElement("style");

  style.textContent = `

        /* Blur + lock logo when DevTools detected */
        body.devtools-open .logo-clear,
        body.devtools-open .logo-blur {
            filter: blur(40px) !important;
            transition: filter 0.5s ease !important;
        }

        body.devtools-open .logo-wrap::after {
            content: "⛔ CLOSE DEVTOOLS";
            position: absolute;
            z-index: 99;
            color: rgba(255,255,255,0.55);
            font-size: 9px;
            letter-spacing: 0.3em;
            font-family: 'Inter', sans-serif;
        }

        /* Prevent image drag visually */
        img {
            -webkit-user-drag: none;
            user-select: none;
            -webkit-user-select: none;
            pointer-events: none; /* no right-click on images */
        }

        /* Re-enable pointer events only on interactive elements */
        a, button {
            pointer-events: auto;
        }

    `;

  document.head.appendChild(style);
})();

/* =========================
   PAGE LOAD
========================= */

window.addEventListener("load", () => {
  document.body.classList.add("loaded");

  /* BACKGROUND MUSIC */

  const bgMusic = document.getElementById("bgMusic");

  if (bgMusic) {
    bgMusic.volume = BACKGROUND_MUSIC_VOLUME;

    bgMusic.play().catch(() => {
      console.log("Autoplay blocked until user interaction.");
    });
  }
});

/* =========================
   AUDIO SETTINGS
========================= */

const BACKGROUND_MUSIC_VOLUME = 0.05;
/*
    Range:
    0.00 → muted
    1.00 → max
*/

const REVEAL_SOUND_VOLUME = 0.3;
/*
    Reveal should usually
    be louder than bg music
*/

/* =========================
   TAGLINES
========================= */

const tagline = document.querySelector(".tagline");

const lines = [
  "2022 • DEXTERITY • ALLIES • ADULATION",

  "2023 • FERVENCY ANCHORED BY LEGACY",

  "2024 • PROVENANCE UNVEILS PROWESS",

  "2025 • EXUBERANCE IN IRIDESCENCE",

  "2026 • █████████████",
];

let current = 0;

function switchTagline() {
  tagline.classList.remove("tagline-show");

  tagline.classList.add("tagline-hide");

  setTimeout(() => {
    current = (current + 1) % lines.length;

    tagline.innerText = lines[current];

    tagline.classList.remove("tagline-hide");

    tagline.classList.add("tagline-show");
  }, 700);
}

setInterval(switchTagline, 4000);

/* =========================
   REVEAL DATES
========================= */

const TEST_MODE = false;

/*
TEST_MODE = true

10 sec -> Logo Reveal
30 sec -> Full Website

TEST_MODE = false

Uses actual launch dates
*/

let revealDate;
let websiteRevealDate;

if (TEST_MODE) {

    revealDate =
    new Date(Date.now() + 10000);

    websiteRevealDate =
    new Date(Date.now() + 30000);

} else {

    revealDate =
    new Date("2026-06-05T17:00:00");

    websiteRevealDate =
    new Date("2026-06-06T17:00:00");

}

let revealed = false;

function triggerReveal() {
  if (revealed) return;

  revealed = true;

  /*
        SECURITY: The real logo src is set HERE,
        only at reveal time. It is never present
        in the HTML, so the browser never downloads
        logo.png until this function fires.
    */

  const logoClear = document.getElementById("logoClear");

  if (logoClear) {
    /*
            Set the src dynamically.
            Rename "logo.png" on your server to
            something unpredictable (e.g. "s2k26_r.png")
            for an extra layer of obscurity.
        */

    logoClear.src = "assets/logo.png";
  }

  document.body.classList.add("revealed");

  /* REVEAL SOUND */

  const revealSound = document.getElementById("revealSound");

  if (revealSound) {
    revealSound.volume = REVEAL_SOUND_VOLUME;

    revealSound.currentTime = 0;

    revealSound.play();
  }

  /* BG MUSIC DUCKING */

  const bgMusic = document.getElementById("bgMusic");

  if (bgMusic) {
    bgMusic.animate(
      [
        { volume: BACKGROUND_MUSIC_VOLUME },
        { volume: BACKGROUND_MUSIC_VOLUME * 0.35 },
      ],

      {
        duration: 2500,
        fill: "forwards",
      },
    );

    bgMusic.volume = BACKGROUND_MUSIC_VOLUME * 0.35;
  }
}

/* =========================
   TEST BUTTON — HIDDEN BY DEFAULT
   Only visible after secret combo.
========================= */

const testButton = document.getElementById("testReveal");

/* Hide it from everyone on load */
if (testButton) {
  testButton.style.display = "none";
}

function toggleReveal() {
  if (!revealed) {
    triggerReveal();

    if (testButton) testButton.innerText = "HIDE ↩";
  } else {
    /* Reset back to pre-reveal */
    revealed = false;

    document.body.classList.remove("revealed");

    const logoClear = document.getElementById("logoClear");

    if (logoClear) {
      logoClear.style.opacity = "0";

      setTimeout(() => {
        logoClear.src = "";
        logoClear.style.opacity = "";
      }, 600);
    }

    if (testButton) testButton.innerText = "REVEAL ↗";
  }
}

if (testButton) {
  testButton.addEventListener("click", toggleReveal);
}

/* =========================
   SECRET KEY COMBO
   Press: S + R + I simultaneously
   (first letters of SRISHTI)
   — shows the toggle button
   — and fires the preview
========================= */

const SECRET_KEYS = new Set(["s", "r", "i"]);
const keysHeld = new Set();

document.addEventListener("keydown", function (e) {
  keysHeld.add(e.key.toLowerCase());

  const allHeld = [...SECRET_KEYS].every((k) => keysHeld.has(k));

  if (allHeld) {
    if (testButton) {
      testButton.style.display = "block";
    }

    toggleReveal();

    keysHeld.clear();
  }
});

document.addEventListener("keyup", function (e) {
  keysHeld.delete(e.key.toLowerCase());
});

/* =========================
   COUNTDOWN
========================= */

function updateCountdown() {

    const now = new Date();

    /* Full website live */

    if (now >= websiteRevealDate) {

        window.location.replace(
            "https://srishti.eu.org/reveal/"
        );

        return;
    }

    /* Logo reveal phase */

    if (now >= revealDate) {

        triggerReveal();

        return;
    }

    /* Normal countdown */

    const distance = revealDate - now;

    const days = Math.floor(
        distance / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24))
        / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
        (distance % (1000 * 60 * 60))
        / (1000 * 60)
    );

    const seconds = Math.floor(
        (distance % (1000 * 60))
        / 1000
    );

    document.getElementById("days").innerText =
        String(days).padStart(2, "0");

    document.getElementById("hours").innerText =
        String(hours).padStart(2, "0");

    document.getElementById("minutes").innerText =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").innerText =
        String(seconds).padStart(2, "0");
}

updateCountdown();

setInterval(updateCountdown, 1000);

/* =========================
   CURSOR GLOW
========================= */

const glowCursor = document.createElement("div");

glowCursor.classList.add("cursor-glow");

document.body.appendChild(glowCursor);

document.addEventListener("mousemove", (e) => {
  glowCursor.style.left = e.clientX + "px";
  glowCursor.style.top = e.clientY + "px";
});

/* =========================
   GLOW PARALLAX
========================= */

const glow = document.querySelector(".glow");

document.addEventListener("mousemove", (e) => {
  const x = e.clientX / window.innerWidth;
  const y = e.clientY / window.innerHeight;

  glow.style.transform = `translate(-50%,-50%)
        translate(
            ${x * 20 - 10}px,
            ${y * 20 - 10}px
        )`;
});

/* =========================
   MOBILE TAP — RESUME AUDIO
========================= */

document.addEventListener(
  "click",
  () => {
    const bgMusic = document.getElementById("bgMusic");

    if (bgMusic) {
      bgMusic.play().catch(() => {});
    }
  },
  { once: true },
);

/* =========================
   AUDIO TOGGLE
========================= */

const audioToggle = document.getElementById("audioToggle");

let audioMuted = false;

audioToggle.addEventListener("click", () => {
  audioMuted = !audioMuted;

  const bgMusic = document.getElementById("bgMusic");

  const revealSound = document.getElementById("revealSound");

  if (audioMuted) {
    if (bgMusic) bgMusic.muted = true;
    if (revealSound) revealSound.muted = true;

    audioToggle.innerText = "SOUND OFF";
    audioToggle.classList.add("muted");
  } else {
    if (bgMusic) bgMusic.muted = false;
    if (revealSound) revealSound.muted = false;

    audioToggle.innerText = "SOUND ON";
    audioToggle.classList.remove("muted");
  }
});
