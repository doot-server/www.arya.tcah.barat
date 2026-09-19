/**
 * ====================================================================
 * ADMIN PANEL JAVASCRIPT ENGINE
 * ====================================================================
 */

// Web Audio API Synthesizer (100% Bebas 403 & Selalu Berbunyi)
class AestheticAudioEngine {
  constructor() {
    this.ctx = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.volume = 0.6;
    this.timer = null;
    this.chordIndex = 0;
    this.chords = [
      [130.81, 196.00, 246.94, 293.66, 329.63, 392.00],
      [110.00, 164.81, 220.00, 261.63, 329.63, 493.88],
      [87.31, 130.81, 174.61, 220.00, 261.63, 392.00],
      [98.00, 146.83, 174.61, 220.00, 261.63, 293.66]
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
  }

  play() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playChordLoop();
  }

  playChordLoop() {
    if (!this.isPlaying || !this.ctx) return;
    const chord = this.chords[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    chord.forEach((freq, i) => {
      this.triggerTone(freq, i * 0.09, 3.8);
    });

    this.timer = setTimeout(() => {
      this.playChordLoop();
    }, 3600);
  }

  triggerTone(freq, delay, duration) {
    if (!this.ctx || !this.gainNode) return;
    const now = this.ctx.currentTime + delay;

    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950, now);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.2, now + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.06, now + 1.2);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    if (this.ctx && this.gainNode) {
      this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }
}

// State konfigurasi admin
let adminConfig = null;
let previewAudio = null;
const adminSynth = new AestheticAudioEngine();

document.addEventListener("DOMContentLoaded", () => {
  previewAudio = document.getElementById("adm-preview-audio");
  
  // 1. Cek sesi login
  checkAuthSession();

  // 2. Setup Login Form & Toggle Password
  setupAuthEvents();
});

// ====================================================================
// AUTENTIKASI & KEAMANAN
// ====================================================================
function getAdminPassword() {
  const customPwd = localStorage.getItem("admin_custom_password");
  if (customPwd) return customPwd;
  return (CONFIG && CONFIG.admin && CONFIG.admin.password) ? CONFIG.admin.password : "admin123";
}

function checkAuthSession() {
  const isAuth = localStorage.getItem("admin_auth_active") === "true" || sessionStorage.getItem("admin_auth_active") === "true";
  const loginView = document.getElementById("admin-login-view");
  const dashboardView = document.getElementById("admin-dashboard-view");

  if (isAuth) {
    loginView.style.display = "none";
    dashboardView.style.display = "flex";
    initDashboard();
  } else {
    loginView.style.display = "flex";
    dashboardView.style.display = "none";
  }
}

function setupAuthEvents() {
  const loginForm = document.getElementById("admin-login-form");
  const passwordInput = document.getElementById("admin-password-input");
  const togglePwdBtn = document.getElementById("toggle-pwd-btn");
  const eyeIcon = document.getElementById("eye-icon");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("admin-logout-btn");

  // Toggle show/hide password
  if (togglePwdBtn) {
    togglePwdBtn.addEventListener("click", () => {
      const isPass = passwordInput.type === "password";
      passwordInput.type = isPass ? "text" : "password";
      eyeIcon.className = isPass ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
    });
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredPwd = passwordInput.value.trim();
      const actualPwd = getAdminPassword();

      if (enteredPwd === actualPwd) {
        loginError.style.display = "none";
        localStorage.setItem("admin_auth_active", "true");
        sessionStorage.setItem("admin_auth_active", "true");
        checkAuthSession();
        showToast("Login berhasil! Selamat datang Admin ✨");
      } else {
        loginError.style.display = "block";
        passwordInput.value = "";
        passwordInput.focus();
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("admin_auth_active");
      sessionStorage.removeItem("admin_auth_active");
      if (previewAudio) previewAudio.pause();
      adminSynth.pause();
      checkAuthSession();
      showToast("Anda telah keluar dari panel admin.");
    });
  }
}

// Deep merge utility untuk menggabungkan objek config tanpa merusak nilai default
function deepMerge(target, source) {
  if (!source || typeof source !== "object") return target;
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ====================================================================
// DASHBOARD INITIALIZATION
// ====================================================================
function initDashboard() {
  // Muat konfigurasi: gabungkan data tersimpan dari localStorage dengan default CONFIG
  const savedConfig = localStorage.getItem("custom_site_config");
  const baseDefault = JSON.parse(JSON.stringify(CONFIG));
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      adminConfig = deepMerge(baseDefault, parsed);
    } catch (e) {
      adminConfig = baseDefault;
    }
  } else {
    adminConfig = baseDefault;
  }

  // Bersihkan jika tersimpan URL pixabay lama yang 403 atau kosong
  if (adminConfig.music) {
    if (!adminConfig.music.audioUrl || adminConfig.music.audioUrl.includes("pixabay.com")) {
      adminConfig.music.audioUrl = "music.mp3";
      adminConfig.music.title = adminConfig.music.title || "Aesthetic Lofi Beats";
      adminConfig.music.artist = adminConfig.music.artist || "Chilled Vibes ✨";
    }
  }

  // Pastikan struktur header dan card ada
  if (!adminConfig.header) {
    adminConfig.header = {
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      shape: "circle",
      size: 80,
      badgeText: (adminConfig.typewriter && adminConfig.typewriter.badge) || "Pesan Spesial ✨"
    };
  }
  if (!adminConfig.card) {
    adminConfig.card = {
      style: "gelap",
      opacity: 0.75
    };
  }

  populateAdminForm();
  setupEditorEvents();
  updateLivePreview();
}

// ====================================================================
// POPULATE FORM DENGAN DATA KONFIGURASI
// ====================================================================
function populateAdminForm() {
  // 1. Pane Foto
  const header = adminConfig.header;
  const headerRadio = document.querySelector(`input[name='adm-header-type'][value='${header.type || "image"}']`);
  if (headerRadio) headerRadio.checked = true;
  document.getElementById("adm-input-photo-url").value = header.imageUrl || "";
  const shapeRadio = document.querySelector(`input[name='adm-header-shape'][value='${header.shape || "circle"}']`);
  if (shapeRadio) shapeRadio.checked = true;
  document.getElementById("adm-input-photo-size").value = header.size || 80;
  document.getElementById("adm-size-label").textContent = `${header.size || 80} px`;
  document.getElementById("adm-input-badge-text").value = header.badgeText || "Pesan Spesial ✨";
  
  toggleHeaderInputs(header.type || "image");

  // 2. Pane Teks & Card Style
  document.getElementById("adm-input-lines").value = (adminConfig.typewriter.lines || []).join("\n");
  document.getElementById("adm-input-speed").value = adminConfig.typewriter.typingSpeed || 75;
  document.getElementById("adm-speed-label").textContent = `${adminConfig.typewriter.typingSpeed || 75} ms`;
  document.getElementById("adm-input-footer").value = adminConfig.typewriter.footerText || "With warm wishes ✨";

  // Card Background Style & Opacity
  const card = adminConfig.card || { style: "gelap", opacity: 0.75 };
  const cardRadio = document.querySelector(`input[name='adm-card-style'][value='${card.style || "gelap"}']`);
  if (cardRadio) cardRadio.checked = true;
  document.getElementById("adm-input-card-opacity").value = card.opacity ?? 0.75;
  document.getElementById("adm-card-opacity-label").textContent = `${Math.round((card.opacity ?? 0.75) * 100)}%`;

  // 3. Pane Background
  const isImg = adminConfig.background.type === "image";
  document.querySelector(`input[name='adm-bg-type'][value='${isImg ? "image" : "gradient"}']`).checked = true;
  document.getElementById("adm-input-bg-url").value = adminConfig.background.imageUrl || "";
  document.getElementById("adm-input-bg-gradient").value = adminConfig.background.gradient || "";
  document.getElementById("adm-group-bg-url").style.display = isImg ? "block" : "none";
  document.getElementById("adm-group-bg-gradient").style.display = isImg ? "none" : "block";
  document.getElementById("adm-input-darkness").value = adminConfig.background.overlayDarkness ?? 0.5;
  document.getElementById("adm-darkness-label").textContent = adminConfig.background.overlayDarkness ?? 0.5;
  document.getElementById("adm-input-particles").value = adminConfig.effects.particles || "sparkles";

  // 4. Pane Musik
  document.getElementById("adm-input-music-url").value = adminConfig.music.audioUrl || "builtin";
  document.getElementById("adm-input-music-title").value = adminConfig.music.title || "Aesthetic Lofi Piano";
  document.getElementById("adm-input-music-artist").value = adminConfig.music.artist || "Chilled Vibes ✨";
  const vol = adminConfig.music.defaultVolume ?? 0.6;
  document.getElementById("adm-input-music-vol").value = vol;
  document.getElementById("adm-vol-label").textContent = `${Math.round(vol * 100)}%`;

  // 5. Pane Keamanan
  document.getElementById("adm-new-password").value = getAdminPassword();
}

function toggleHeaderInputs(val) {
  const showImg = val === "image" || val === "both";
  const showBadge = val === "badge" || val === "both";
  document.getElementById("adm-group-photo-url").style.display = showImg ? "block" : "none";
  document.getElementById("adm-group-badge-text").style.display = showBadge ? "block" : "none";
}

// ====================================================================
// EVENT LISTENERS EDITOR FORM
// ====================================================================
let editorEventsAttached = false;
function setupEditorEvents() {
  if (editorEventsAttached) return;
  editorEventsAttached = true;

  // Auto-simpan saat admin mengklik "Lihat Website"
  const viewSiteBtn = document.getElementById("admin-view-site-btn");
  if (viewSiteBtn) {
    viewSiteBtn.addEventListener("click", () => {
      readFormData();
      saveConfiguration();
    });
  }

  // Tab Switch
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".admin-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Header Mode Radio
  document.querySelectorAll("input[name='adm-header-type']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      toggleHeaderInputs(e.target.value);
      readFormData();
      updateLivePreview();
    });
  });

  // Header Shape Radio
  document.querySelectorAll("input[name='adm-header-shape']").forEach(radio => {
    radio.addEventListener("change", () => {
      readFormData();
      updateLivePreview();
    });
  });

  // Header Size Slider
  const sizeInput = document.getElementById("adm-input-photo-size");
  if (sizeInput) {
    sizeInput.addEventListener("input", (e) => {
      document.getElementById("adm-size-label").textContent = `${e.target.value} px`;
      readFormData();
      updateLivePreview();
    });
  }

  // 1. File Upload Picker untuk Foto / Avatar Kecil
  const filePhotoInput = document.getElementById("adm-file-photo");
  const filePhotoLabel = document.getElementById("adm-file-photo-label");
  if (filePhotoInput) {
    filePhotoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        filePhotoLabel.textContent = file.name;
        handleImageFileUpload(file, 400, 0.9, (base64Url) => {
          document.getElementById("adm-input-photo-url").value = base64Url;
          readFormData();
          updateLivePreview();
          showToast(`Foto "${file.name}" siap digunakan! ✨`);
        });
      }
    });
  }

  // Presets Avatar
  document.querySelectorAll(".btn-chip-avatar").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("adm-input-photo-url").value = chip.dataset.url;
      if (filePhotoLabel) filePhotoLabel.textContent = "Pilih File dari Folder...";
      readFormData();
      updateLivePreview();
      showToast("Preset foto dipilih!");
    });
  });

  // 2. File Upload Picker untuk Background
  const fileBgInput = document.getElementById("adm-file-bg");
  const fileBgLabel = document.getElementById("adm-file-bg-label");
  if (fileBgInput) {
    fileBgInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        fileBgLabel.textContent = file.name;
        handleImageFileUpload(file, 1920, 0.85, (base64Url) => {
          document.getElementById("adm-input-bg-url").value = base64Url;
          readFormData();
          updateLivePreview();
          showToast(`Background "${file.name}" siap digunakan! 🌌`);
        });
      }
    });
  }

  // Teks & Speed Sliders
  const speedSlider = document.getElementById("adm-input-speed");
  if (speedSlider) {
    speedSlider.addEventListener("input", (e) => {
      document.getElementById("adm-speed-label").textContent = `${e.target.value} ms`;
      readFormData();
    });
  }

  // Card Background Style Radio & Opacity Slider
  document.querySelectorAll("input[name='adm-card-style']").forEach(radio => {
    radio.addEventListener("change", () => {
      readFormData();
      updateLivePreview();
    });
  });

  const cardOpacityInput = document.getElementById("adm-input-card-opacity");
  if (cardOpacityInput) {
    cardOpacityInput.addEventListener("input", (e) => {
      document.getElementById("adm-card-opacity-label").textContent = `${Math.round(e.target.value * 100)}%`;
      readFormData();
      updateLivePreview();
    });
  }

  // Background Mode Radio
  document.querySelectorAll("input[name='adm-bg-type']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      const isImg = e.target.value === "image";
      document.getElementById("adm-group-bg-url").style.display = isImg ? "block" : "none";
      document.getElementById("adm-group-bg-gradient").style.display = isImg ? "none" : "block";
      readFormData();
      updateLivePreview();
    });
  });

  // Darkness Slider
  const darknessSlider = document.getElementById("adm-input-darkness");
  if (darknessSlider) {
    darknessSlider.addEventListener("input", (e) => {
      document.getElementById("adm-darkness-label").textContent = e.target.value;
      readFormData();
      updateLivePreview();
    });
  }

  // Volume Slider
  const volSlider = document.getElementById("adm-input-music-vol");
  if (volSlider) {
    volSlider.addEventListener("input", (e) => {
      const vol = parseFloat(e.target.value);
      document.getElementById("adm-vol-label").textContent = `${Math.round(vol * 100)}%`;
      readFormData();
      if (previewAudio) previewAudio.volume = vol;
      adminSynth.setVolume(vol);
    });
  }

  // Presets Background
  document.querySelectorAll(".btn-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("adm-input-bg-url").value = chip.dataset.img;
      readFormData();
      updateLivePreview();
      showToast("Preset background dipilih!");
    });
  });

  // 3. File Upload Picker untuk Musik / Lagu
  const fileMusicInput = document.getElementById("adm-file-music");
  const fileMusicLabel = document.getElementById("adm-file-music-label");
  if (fileMusicInput) {
    fileMusicInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        fileMusicLabel.textContent = file.name;
        handleAudioFileUpload(file, (dataUrl, cleanTitle) => {
          document.getElementById("adm-input-music-url").value = dataUrl;
          const titleInput = document.getElementById("adm-input-music-title");
          if (!titleInput.value.trim() || titleInput.value === "Background Music" || titleInput.value === "Lofi Study Beats") {
            titleInput.value = cleanTitle;
          }
          readFormData();
          updateLivePreview();
          showToast(`Lagu "${file.name}" siap diputar! 🎵`);
        });
      }
    });
  }

  // Presets Lagu
  document.querySelectorAll(".btn-chip-music").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("adm-input-music-url").value = chip.dataset.url;
      document.getElementById("adm-input-music-title").value = chip.dataset.title;
      document.getElementById("adm-input-music-artist").value = chip.dataset.artist;
      if (fileMusicLabel) fileMusicLabel.textContent = "Pilih File Lagu dari Folder...";
      readFormData();
      updateLivePreview();
      showToast("Preset lagu dipilih!");
    });
  });

  // Realtime input updates for preview
  const inputsToTrack = [
    "adm-input-photo-url", "adm-input-badge-text", "adm-input-lines",
    "adm-input-footer", "adm-input-bg-url", "adm-input-bg-gradient",
    "adm-input-music-url", "adm-input-music-title", "adm-input-music-artist"
  ];
  inputsToTrack.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        readFormData();
        updateLivePreview();
      });
    }
  });

  // Preview Audio Play / Pause
  const playBtn = document.getElementById("adm-preview-play-btn");
  const playIcon = document.getElementById("adm-play-icon");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      const url = document.getElementById("adm-input-music-url").value.trim();
      const isBuiltin = !url || url === "builtin" || url.includes("pixabay.com");
      const vol = parseFloat(document.getElementById("adm-input-music-vol").value);

      if (isBuiltin) {
        if (previewAudio) previewAudio.pause();
        if (adminSynth.isPlaying) {
          adminSynth.pause();
          playIcon.className = "fa-solid fa-play";
        } else {
          adminSynth.setVolume(vol);
          adminSynth.play();
          playIcon.className = "fa-solid fa-pause";
        }
        return;
      }

      if (!previewAudio) return;
      adminSynth.pause();
      if (previewAudio.paused) {
        previewAudio.src = url;
        previewAudio.volume = vol;
        previewAudio.play().then(() => {
          playIcon.className = "fa-solid fa-pause";
        }).catch(err => {
          console.warn("Gagal memutar audio eksternal:", err);
          showToast("Audio eksternal gagal dimuat. Beralih ke nada bawaan...");
          adminSynth.setVolume(vol);
          adminSynth.play();
          playIcon.className = "fa-solid fa-pause";
        });
      } else {
        previewAudio.pause();
        playIcon.className = "fa-solid fa-play";
      }
    });
  }

  // Save to LocalStorage
  const saveBtn = document.getElementById("adm-save-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      readFormData();
      saveConfiguration();
    });
  }

  // Share URL
  const shareBtn = document.getElementById("adm-share-url-btn");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      readFormData();
      generateShareUrl();
    });
  }

  // Copy config.js Code
  const copyBtn = document.getElementById("adm-copy-code-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      readFormData();
      copyConfigCode();
    });
  }

  // Reset to Default
  const resetBtn = document.getElementById("adm-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Kembalikan semua pengaturan ke default awal (config.js)?")) {
        localStorage.removeItem("custom_site_config");
        localStorage.removeItem("admin_custom_password");
        adminConfig = JSON.parse(JSON.stringify(CONFIG));
        populateAdminForm();
        updateLivePreview();
        showToast("Pengaturan berhasil di-reset ke default!");
      }
    });
  }
}

// ====================================================================
// BACA DATA DARI FORM KE STATE
// ====================================================================
function readFormData() {
  if (!adminConfig) adminConfig = JSON.parse(JSON.stringify(CONFIG));
  if (!adminConfig.header) adminConfig.header = {};
  if (!adminConfig.typewriter) adminConfig.typewriter = {};
  if (!adminConfig.card) adminConfig.card = {};
  if (!adminConfig.background) adminConfig.background = {};
  if (!adminConfig.effects) adminConfig.effects = {};
  if (!adminConfig.music) adminConfig.music = {};

  // 1. Header Foto
  const headerTypeRadio = document.querySelector("input[name='adm-header-type']:checked");
  const headerType = headerTypeRadio ? headerTypeRadio.value : (adminConfig.header.type || "image");

  const headerShapeRadio = document.querySelector("input[name='adm-header-shape']:checked");
  const headerShape = headerShapeRadio ? headerShapeRadio.value : (adminConfig.header.shape || "circle");

  const photoSizeInput = document.getElementById("adm-input-photo-size");
  const photoSize = photoSizeInput ? (parseInt(photoSizeInput.value, 10) || 80) : 80;

  const photoUrlInput = document.getElementById("adm-input-photo-url");
  const badgeTextInput = document.getElementById("adm-input-badge-text");

  adminConfig.header = {
    type: headerType,
    imageUrl: photoUrlInput ? photoUrlInput.value.trim() : (adminConfig.header.imageUrl || ""),
    shape: headerShape,
    size: photoSize,
    badgeText: badgeTextInput ? (badgeTextInput.value.trim() || "Pesan Spesial ✨") : "Pesan Spesial ✨"
  };

  // 2. Teks & Card Style
  const linesInput = document.getElementById("adm-input-lines");
  if (linesInput) {
    const linesRaw = linesInput.value.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    adminConfig.typewriter.lines = linesRaw.length > 0 ? linesRaw : ["Halo dunia! ✨"];
  }
  const speedInput = document.getElementById("adm-input-speed");
  if (speedInput) {
    adminConfig.typewriter.typingSpeed = parseInt(speedInput.value, 10) || 75;
  }
  const footerInput = document.getElementById("adm-input-footer");
  if (footerInput) {
    adminConfig.typewriter.footerText = footerInput.value.trim() || "With warm wishes ✨";
  }
  adminConfig.typewriter.badge = adminConfig.header.badgeText;

  // Latar Kotak Teks (Card Style)
  const cardStyleRadio = document.querySelector("input[name='adm-card-style']:checked");
  const cardStyle = cardStyleRadio ? cardStyleRadio.value : (adminConfig.card.style || "gelap");
  const cardOpacityInput = document.getElementById("adm-input-card-opacity");
  const cardOpacity = cardOpacityInput ? (parseFloat(cardOpacityInput.value) || 0.75) : 0.75;
  adminConfig.card = {
    style: cardStyle,
    opacity: cardOpacity
  };

  // 3. Background
  const bgTypeRadio = document.querySelector("input[name='adm-bg-type']:checked");
  const bgType = bgTypeRadio ? bgTypeRadio.value : (adminConfig.background.type || "gradient");
  adminConfig.background.type = bgType;
  const bgUrlInput = document.getElementById("adm-input-bg-url");
  if (bgUrlInput) adminConfig.background.imageUrl = bgUrlInput.value.trim();
  const bgGradInput = document.getElementById("adm-input-bg-gradient");
  if (bgGradInput) adminConfig.background.gradient = bgGradInput.value.trim();
  const darknessInput = document.getElementById("adm-input-darkness");
  if (darknessInput) adminConfig.background.overlayDarkness = parseFloat(darknessInput.value);
  const particlesInput = document.getElementById("adm-input-particles");
  if (particlesInput) adminConfig.effects.particles = particlesInput.value;

  // 4. Musik
  const musicUrlInput = document.getElementById("adm-input-music-url");
  let musicUrl = musicUrlInput ? musicUrlInput.value.trim() : (adminConfig.music.audioUrl || "music.mp3");
  if (!musicUrl || musicUrl.includes("pixabay.com")) {
    musicUrl = "music.mp3";
  }
  adminConfig.music.audioUrl = musicUrl;
  const musicTitleInput = document.getElementById("adm-input-music-title");
  if (musicTitleInput) adminConfig.music.title = musicTitleInput.value.trim() || "Aesthetic Lofi Beats";
  const musicArtistInput = document.getElementById("adm-input-music-artist");
  if (musicArtistInput) adminConfig.music.artist = musicArtistInput.value.trim() || "Chilled Vibes ✨";
  const musicVolInput = document.getElementById("adm-input-music-vol");
  if (musicVolInput) adminConfig.music.defaultVolume = parseFloat(musicVolInput.value);

  // 5. Password Admin
  const pwdInput = document.getElementById("adm-new-password");
  if (pwdInput) {
    const newPwd = pwdInput.value.trim();
    if (newPwd) {
      if (!adminConfig.admin) adminConfig.admin = {};
      adminConfig.admin.password = newPwd;
    }
  }
}

// ====================================================================
// UPDATE LIVE PREVIEW BOX
// ====================================================================
function updateLivePreview() {
  const previewBg = document.getElementById("adm-preview-bg");
  const previewOverlay = document.getElementById("adm-preview-overlay");
  const previewAvatar = document.getElementById("adm-preview-avatar");
  const previewBadge = document.getElementById("adm-preview-badge");
  const previewText = document.getElementById("adm-preview-text");
  const previewFooter = document.getElementById("adm-preview-footer");
  const musicTitle = document.getElementById("adm-prev-music-title");
  const musicArtist = document.getElementById("adm-prev-music-artist");
  const previewCard = document.querySelector(".preview-card");

  // Background
  const bg = adminConfig.background;
  if (bg.type === "image" && bg.imageUrl) {
    previewBg.style.backgroundImage = `url('${bg.imageUrl}')`;
  } else {
    previewBg.style.backgroundImage = "none";
    previewBg.style.background = bg.gradient || "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)";
  }
  previewOverlay.style.backgroundColor = `rgba(0, 0, 0, ${bg.overlayDarkness ?? 0.5})`;

  // Header Avatar & Badge
  const header = adminConfig.header;
  const isImg = (header.type === "image" || header.type === "both") && header.imageUrl;
  if (isImg) {
    previewAvatar.style.display = "block";
    previewAvatar.src = header.imageUrl;
    const scaledSize = Math.max(45, Math.min(110, Math.round(header.size * 0.85)));
    previewAvatar.style.width = `${scaledSize}px`;
    previewAvatar.style.height = `${scaledSize}px`;
    previewAvatar.className = `preview-avatar ${header.shape || "circle"}`;
  } else {
    previewAvatar.style.display = "none";
  }

  const isBadge = header.type === "badge" || header.type === "both";
  if (isBadge) {
    previewBadge.style.display = "inline-flex";
    previewBadge.textContent = header.badgeText || "Pesan Spesial ✨";
  } else {
    previewBadge.style.display = "none";
  }

  // Latar Kotak Teks (Card Style: Gelap / Transparan / Kaca)
  const card = adminConfig.card || { style: "gelap", opacity: 0.75 };
  if (previewCard) {
    if (card.style === "transparan") {
      previewCard.style.background = "transparent";
      previewCard.style.borderColor = "transparent";
      previewCard.style.boxShadow = "none";
      previewCard.style.backdropFilter = "none";
      previewText.style.textShadow = "0 2px 10px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,1)";
    } else if (card.style === "kaca") {
      previewCard.style.background = `rgba(255, 255, 255, ${(card.opacity || 0.75) * 0.15})`;
      previewCard.style.borderColor = "rgba(255, 255, 255, 0.25)";
      previewCard.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.45)";
      previewCard.style.backdropFilter = "blur(16px)";
      previewText.style.textShadow = "none";
    } else {
      previewCard.style.background = `rgba(12, 12, 22, ${card.opacity ?? 0.75})`;
      previewCard.style.borderColor = "rgba(255, 255, 255, 0.12)";
      previewCard.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.75)";
      previewCard.style.backdropFilter = "blur(20px)";
      previewText.style.textShadow = "none";
    }
  }

  // Teks Preview
  const firstLine = (adminConfig.typewriter.lines && adminConfig.typewriter.lines.length > 0) 
    ? adminConfig.typewriter.lines[0] 
    : "Halo dunia! ✨";
  previewText.textContent = firstLine;
  previewFooter.textContent = adminConfig.typewriter.footerText || "With warm wishes ✨";

  // Musik Info
  musicTitle.textContent = adminConfig.music.title || "Background Music";
  musicArtist.textContent = adminConfig.music.artist || "Aesthetic";
}

// ====================================================================
// SIMPAN & EKSPOR
// ====================================================================
function saveConfiguration() {
  try {
    localStorage.setItem("custom_site_config", JSON.stringify(adminConfig));
    
    // Simpan password jika diubah
    const newPwd = document.getElementById("adm-new-password").value.trim();
    if (newPwd) {
      localStorage.setItem("admin_custom_password", newPwd);
    }

    showToast("Pengaturan berhasil disimpan ke website ini! 🎉");
  } catch (err) {
    console.error(err);
    showToast("Gagal menyimpan ke penyimpanan lokal.");
  }
}

function generateShareUrl() {
  try {
    const compactData = {
      header: adminConfig.header,
      card: adminConfig.card,
      background: adminConfig.background,
      music: adminConfig.music,
      typewriter: adminConfig.typewriter,
      effects: adminConfig.effects
    };
    const jsonStr = JSON.stringify(compactData);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = new URL("index.html", window.location.href);
    url.searchParams.set("c", encoded);

    navigator.clipboard.writeText(url.toString()).then(() => {
      showToast("Link kustom berhasil disalin! Siap dikirimkan 🚀");
    });
  } catch (err) {
    showToast("Gagal membuat link kustom.");
  }
}

function copyConfigCode() {
  try {
    const jsCode = `/**
 * ====================================================================
 * KONFIGURASI WEBSITE AESTHETIC (CUSTOM CONFIG)
 * ====================================================================
 */

const CONFIG = ${JSON.stringify(adminConfig, null, 2)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
`;
    navigator.clipboard.writeText(jsCode).then(() => {
      showToast("Kode config.js berhasil disalin! Tempel di GitHub untuk update Vercel.");
    });
  } catch (err) {
    showToast("Gagal menyalin kode config.js.");
  }
}

// Utility Toast Popup
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Utility membaca dan mengompresi gambar lokal (Choose your file dari folder)
function handleImageFileUpload(file, maxDimension, quality, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality || 0.85);
      callback(compressedDataUrl, file.name);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Utility membaca file audio lokal (Choose audio file dari folder)
function handleAudioFileUpload(file, callback) {
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    showToast("Ukuran audio agak besar (>8MB), disarankan gunakan file di bawah 5MB.");
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    callback(e.target.result, cleanTitle, file.name);
  };
  reader.readAsDataURL(file);
}
