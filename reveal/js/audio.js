/**
 * Ambient audio — hover & click feedback
 */
class AudioManager {
  constructor() {
    this.bgMusic = document.getElementById("bgMusic");
    this.hoverSound = document.getElementById("hoverSound");
    this.clickSound = document.getElementById("clickSound");
    this.volume = 0.08;
    this.isMuted = false;
    this.lastHoverTime = 0;
    this.hoverThrottle = 120;
    this.setup();
  }

  setup() {
    const toggle = document.getElementById("audioToggle");
    if (toggle) {
      toggle.addEventListener("click", () => this.toggleMute());
    }
    document.addEventListener("click", () => this.playAmbient(), { once: true });
  }

  playAmbient() {
    if (this.bgMusic && !this.isMuted) {
      this.bgMusic.volume = this.volume;
      this.bgMusic.loop = true;
      this.bgMusic.play().catch(() => {});
    }
  }

  playHover() {
    if (this.isMuted || !this.hoverSound) return;
    const now = Date.now();
    if (now - this.lastHoverTime < this.hoverThrottle) return;
    this.lastHoverTime = now;
    this.hoverSound.volume = this.volume * 0.5;
    this.hoverSound.currentTime = 0;
    this.hoverSound.play().catch(() => {});
  }

  playClick() {
    if (this.isMuted || !this.clickSound) return;
    this.clickSound.volume = this.volume * 0.6;
    this.clickSound.currentTime = 0;
    this.clickSound.play().catch(() => {});
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const toggle = document.getElementById("audioToggle");
    if (toggle) toggle.textContent = this.isMuted ? "♪" : "♫";
    if (this.isMuted) this.bgMusic?.pause();
    else this.playAmbient();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.audioManager = new AudioManager();
});
