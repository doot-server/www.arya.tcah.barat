/**
 * ====================================================================
 * ADMIN PANEL JAVASCRIPT ENGINE
 * ====================================================================
 */

// State konfigurasi admin
let adminConfig = null;
let previewAudio = null;

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
  const isAuth = sessionStorage.getItem("admin_auth_active") === "true";
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
      sessionStorage.removeItem("admin_auth_active");
      if (previewAudio) previewAudio.pause();
      checkAuthSession();
      showToast("Anda telah keluar dari panel admin.");
    });
  }
}

// ====================================================================
// DASHBOARD INITIALIZATION
// ====================================================================
function initDashboard() {
  // Muat konfigurasi: prioritas dari localStorage, atau default dari CONFIG
  const savedConfig = localStorage.getItem("custom_site_config");
  if (savedConfig) {
    try {
      adminConfig = JSON.parse(savedConfig);
    } catch (e) {
      adminConfig = JSON.parse(JSON.stringify(CONFIG));
    }
  } else {
    adminConfig = JSON.parse(JSON.stringify(CONFIG));
  }

  // Pastikan struktur header ada
  if (!adminConfig.header) {
    adminConfig.header = {
      type: "image",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      shape: "circle",
      size: 80,
      badgeText: adminConfig.typewriter.badge || "Pesan Spesial ✨"
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

  // 2. Pane Teks
  document.getElementById("adm-input-lines").value = (adminConfig.typewriter.lines || []).join("\n");
  document.getElementById("adm-input-speed").value = adminConfig.typewriter.typingSpeed || 75;
  document.getElementById("adm-speed-label").textContent = `${adminConfig.typewriter.typingSpeed || 75} ms`;
  document.getElementById("adm-input-footer").value = adminConfig.typewriter.footerText || "With warm wishes ✨";

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
  document.getElementById("adm-input-music-url").value = adminConfig.music.audioUrl || "";
  document.getElementById("adm-input-music-title").value = adminConfig.music.title || "";
  document.getElementById("adm-input-music-artist").value = adminConfig.music.artist || "";
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
function setupEditorEvents() {
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
  document.getElementById("adm-input-photo-size").addEventListener("input", (e) => {
    document.getElementById("adm-size-label").textContent = `${e.target.value} px`;
    readFormData();
    updateLivePreview();
  });

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
  document.getElementById("adm-input-speed").addEventListener("input", (e) => {
    document.getElementById("adm-speed-label").textContent = `${e.target.value} ms`;
    readFormData();
  });

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
  document.getElementById("adm-input-darkness").addEventListener("input", (e) => {
    document.getElementById("adm-darkness-label").textContent = e.target.value;
    readFormData();
    updateLivePreview();
  });

  // Volume Slider
  document.getElementById("adm-input-music-vol").addEventListener("input", (e) => {
    document.getElementById("adm-vol-label").textContent = `${Math.round(e.target.value * 100)}%`;
    readFormData();
    if (previewAudio) previewAudio.volume = parseFloat(e.target.value);
  });

  // Presets Background
  document.querySelectorAll(".btn-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("adm-input-bg-url").value = chip.dataset.img;
      readFormData();
      updateLivePreview();
      showToast("Preset background dipilih!");
    });
  });

  // Presets Lagu
  document.querySelectorAll(".btn-chip-music").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("adm-input-music-url").value = chip.dataset.url;
      document.getElementById("adm-input-music-title").value = chip.dataset.title;
      document.getElementById("adm-input-music-artist").value = chip.dataset.artist;
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
  playBtn.addEventListener("click", () => {
    if (!previewAudio) return;
    if (previewAudio.paused) {
      const url = document.getElementById("adm-input-music-url").value.trim();
      if (!url) {
        showToast("Masukkan link URL lagu terlebih dahulu!");
        return;
      }
      previewAudio.src = url;
      previewAudio.volume = parseFloat(document.getElementById("adm-input-music-vol").value);
      previewAudio.play().then(() => {
        playIcon.className = "fa-solid fa-pause";
      }).catch(err => {
        showToast("Gagal memutar audio preview.");
      });
    } else {
      previewAudio.pause();
      playIcon.className = "fa-solid fa-play";
    }
  });

  // Save to LocalStorage
  document.getElementById("adm-save-btn").addEventListener("click", () => {
    readFormData();
    saveConfiguration();
  });

  // Share URL
  document.getElementById("adm-share-url-btn").addEventListener("click", () => {
    readFormData();
    generateShareUrl();
  });

  // Copy config.js Code
  document.getElementById("adm-copy-code-btn").addEventListener("click", () => {
    readFormData();
    copyConfigCode();
  });

  // Reset to Default
  document.getElementById("adm-reset-btn").addEventListener("click", () => {
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

// ====================================================================
// BACA DATA DARI FORM KE STATE
// ====================================================================
function readFormData() {
  // 1. Header Foto
  const headerType = document.querySelector("input[name='adm-header-type']:checked").value;
  const headerShape = document.querySelector("input[name='adm-header-shape']:checked").value;
  const photoSize = parseInt(document.getElementById("adm-input-photo-size").value, 10) || 80;
  adminConfig.header = {
    type: headerType,
    imageUrl: document.getElementById("adm-input-photo-url").value.trim(),
    shape: headerShape,
    size: photoSize,
    badgeText: document.getElementById("adm-input-badge-text").value.trim() || "Pesan Spesial ✨"
  };

  // 2. Teks
  const linesRaw = document.getElementById("adm-input-lines").value.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  adminConfig.typewriter.lines = linesRaw.length > 0 ? linesRaw : ["Halo dunia! ✨"];
  adminConfig.typewriter.typingSpeed = parseInt(document.getElementById("adm-input-speed").value, 10) || 75;
  adminConfig.typewriter.footerText = document.getElementById("adm-input-footer").value.trim() || "With warm wishes ✨";
  adminConfig.typewriter.badge = adminConfig.header.badgeText;

  // 3. Background
  const bgType = document.querySelector("input[name='adm-bg-type']:checked").value;
  adminConfig.background.type = bgType;
  adminConfig.background.imageUrl = document.getElementById("adm-input-bg-url").value.trim();
  adminConfig.background.gradient = document.getElementById("adm-input-bg-gradient").value.trim();
  adminConfig.background.overlayDarkness = parseFloat(document.getElementById("adm-input-darkness").value);
  adminConfig.effects.particles = document.getElementById("adm-input-particles").value;

  // 4. Musik
  adminConfig.music.audioUrl = document.getElementById("adm-input-music-url").value.trim();
  adminConfig.music.title = document.getElementById("adm-input-music-title").value.trim() || "Background Music";
  adminConfig.music.artist = document.getElementById("adm-input-music-artist").value.trim() || "Aesthetic";
  adminConfig.music.defaultVolume = parseFloat(document.getElementById("adm-input-music-vol").value);

  // 5. Password Admin
  const newPwd = document.getElementById("adm-new-password").value.trim();
  if (newPwd) {
    if (!adminConfig.admin) adminConfig.admin = {};
    adminConfig.admin.password = newPwd;
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
