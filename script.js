/**
 * ====================================================================
 * AESTHETIC TYPEWRITER WEBSITE - JAVASCRIPT ENGINE
 * ====================================================================
 */

// State konfigurasi saat ini
let currentConfig = JSON.parse(JSON.stringify(CONFIG));
let typingTimeout = null;
let isTyping = false;
let audioPlayer = null;
let particlesAnimationId = null;

// ====================================================================
// INITIALIZATION & CONFIG LOADING
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Muat konfigurasi tersimpan dari Admin Panel atau URL Share
  loadSavedOrUrlConfig();

  // 2. Terapkan konfigurasi dasar (title, favicon, background, musik, header)
  applyPageMetadata();
  applyBackground();
  applyHeader();
  applyCardStyle();
  initAudio();
  initParticles();
  initDomElements();
  initSecretAdminAccess();

  // 3. Langsung putar lagu & mulai ketik teks tanpa dialog pembuka
  startTypewriter();
  playAudio();

  // 4. Sembunyikan widget jika disetel false di config
  if (!currentConfig.effects.showMusicWidget) {
    document.getElementById("music-widget").style.display = "none";
  }
  if (!currentConfig.effects.showCustomizerButton) {
    document.getElementById("settings-btn").style.display = "none";
  }
});

// ====================================================================
// HEADER (GAMBAR KECIL / AVATAR / BADGE)
// ====================================================================
function applyHeader() {
  const header = currentConfig.header || {
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    shape: "circle",
    size: 80,
    badgeText: "Pesan Spesial ✨"
  };

  const avatarContainer = document.getElementById("avatar-container");
  const avatarImg = document.getElementById("header-avatar");
  const badge = document.getElementById("card-badge");

  if (!avatarContainer || !badge) return;

  const type = header.type || "image";

  // Gambar kecil / Avatar
  if ((type === "image" || type === "both") && header.imageUrl) {
    avatarContainer.style.display = "flex";
    avatarImg.src = header.imageUrl;
    const size = header.size || 80;
    avatarImg.style.width = `${size}px`;
    avatarImg.style.height = `${size}px`;
    avatarImg.className = `header-avatar ${header.shape || "circle"}`;
  } else {
    avatarContainer.style.display = "none";
  }

  // Label / Badge Teks
  if (type === "badge" || type === "both") {
    badge.style.display = "inline-flex";
    badge.textContent = header.badgeText || currentConfig.typewriter.badge || "Pesan Spesial ✨";
  } else {
    badge.style.display = "none";
  }
}

// ====================================================================
// LATAR BELAKANG KARTU TEKS (TRANSPARAN / GELAP / KACA)
// ====================================================================
function applyCardStyle() {
  const cardEl = document.getElementById("message-card");
  if (!cardEl) return;

  const card = currentConfig.card || { style: "gelap", opacity: 0.75 };
  const style = card.style || "gelap";
  const opacity = (card.opacity !== undefined) ? card.opacity : 0.75;

  // Hapus class gaya kartu lama
  cardEl.classList.remove("card-style-transparan", "card-style-gelap", "card-style-kaca");

  if (style === "transparan") {
    cardEl.classList.add("card-style-transparan");
    cardEl.style.background = "transparent";
    cardEl.style.borderColor = "transparent";
    cardEl.style.boxShadow = "none";
    cardEl.style.backdropFilter = "none";
    cardEl.style.webkitBackdropFilter = "none";
  } else if (style === "kaca") {
    cardEl.classList.add("card-style-kaca");
    cardEl.style.background = `rgba(255, 255, 255, ${opacity * 0.15})`;
    cardEl.style.borderColor = "rgba(255, 255, 255, 0.25)";
    cardEl.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.45)";
    cardEl.style.backdropFilter = "blur(16px)";
    cardEl.style.webkitBackdropFilter = "blur(16px)";
  } else {
    // Default: gelap
    cardEl.classList.add("card-style-gelap");
    cardEl.style.background = `rgba(12, 12, 22, ${opacity})`;
    cardEl.style.borderColor = "rgba(255, 255, 255, 0.12)";
    cardEl.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.75)";
    cardEl.style.backdropFilter = "blur(20px)";
    cardEl.style.webkitBackdropFilter = "blur(20px)";
  }
}

// Memuat konfigurasi: prioritas dari penyimpanan Admin (localStorage) & Link Share (URL query)
function loadSavedOrUrlConfig() {
  // 1. Muat setelan tersimpan dari Admin Panel di perangkat/browser ini
  try {
    const savedConfig = localStorage.getItem("custom_site_config");
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      currentConfig = { ...currentConfig, ...parsed };
    }
  } catch (e) {
    console.warn("Gagal memuat konfigurasi tersimpan admin:", e);
  }

  // 2. Cek apakah ada data kustom dari URL Share (prioritas tertinggi saat dibagikan)
  try {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get("c");
    if (sharedData) {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
      currentConfig = { ...currentConfig, ...decoded };
    }
  } catch (e) {
    console.warn("Gagal memuat URL params, menggunakan config default.", e);
  }
}

// Akses rahasia ke Panel Admin khusus pemilik
function initSecretAdminAccess() {
  // 1. Shortcut Keyboard Rahasia: Ctrl + Shift + A (atau Cmd + Shift + A di Mac)
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
      e.preventDefault();
      window.location.href = "admin.html";
    }
  });

  // 2. Triple-Click rahasia pada logo / bagian avatar atas kartu
  const cardHeader = document.getElementById("card-header");
  if (cardHeader) {
    let clickCount = 0;
    let clickTimer = null;
    cardHeader.addEventListener("click", () => {
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => { clickCount = 0; }, 900);
      } else if (clickCount >= 3) {
        clearTimeout(clickTimer);
        clickCount = 0;
        window.location.href = "admin.html";
      }
    });
  }
}

// ====================================================================
// PAGE METADATA & BACKGROUND
// ====================================================================
function applyPageMetadata() {
  document.title = currentConfig.siteTitle || "A Special Message ✨";
  if (currentConfig.faviconEmoji) {
    const faviconUrl = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${currentConfig.faviconEmoji}</text></svg>`;
    let link = document.querySelector("link[rel*='icon']");
    if (link) link.href = faviconUrl;
  }
}

function applyBackground() {
  const bgLayer = document.getElementById("bg-layer");
  const bgOverlay = document.getElementById("bg-overlay");
  const bg = currentConfig.background;

  if (bg.type === "image" && bg.imageUrl) {
    bgLayer.style.backgroundImage = `url('${bg.imageUrl}')`;
    bgLayer.style.background = "";
    bgLayer.style.backgroundImage = `url('${bg.imageUrl}')`;
  } else {
    bgLayer.style.backgroundImage = "none";
    bgLayer.style.background = bg.gradient || "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)";
  }

  bgLayer.style.filter = `blur(${bg.blurAmount || "0px"})`;
  bgOverlay.style.backgroundColor = `rgba(0, 0, 0, ${bg.overlayDarkness ?? 0.5})`;
}

// ====================================================================
// AUDIO PLAYER ENGINE
// ====================================================================
function initAudio() {
  audioPlayer = document.getElementById("bg-audio");
  const music = currentConfig.music;

  if (music && music.audioUrl) {
    audioPlayer.src = music.audioUrl;
    audioPlayer.loop = music.loop !== false;
    audioPlayer.volume = music.defaultVolume ?? 0.6;
    
    document.getElementById("widget-song-title").textContent = music.title || "Background Music";
    document.getElementById("widget-song-artist").textContent = music.artist || "Aesthetic";
    document.getElementById("volume-slider").value = audioPlayer.volume;
  }
}

function playAudio() {
  if (audioPlayer && audioPlayer.src) {
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          document.getElementById("music-widget").classList.add("playing");
        })
        .catch(err => {
          console.warn("Autoplay dicegah oleh kebijakan browser, lagu akan otomatis berputar saat sentuhan/klik pertama di mana saja:", err);
          // Bila browser membutuhkan interaksi pertama pengguna, klik/sentuhan apa pun di layar akan langsung menyalakan lagu
          const handleFirstInteraction = () => {
            audioPlayer.play().then(() => {
              document.getElementById("music-widget").classList.add("playing");
            }).catch(() => {});
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("touchstart", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
          };
          window.addEventListener("click", handleFirstInteraction, { once: true });
          window.addEventListener("touchstart", handleFirstInteraction, { once: true });
          window.addEventListener("keydown", handleFirstInteraction, { once: true });
        });
    }
  }
}

function toggleAudio() {
  if (!audioPlayer) return;
  const widget = document.getElementById("music-widget");
  if (audioPlayer.paused) {
    audioPlayer.play();
    widget.classList.add("playing");
  } else {
    audioPlayer.pause();
    widget.classList.remove("playing");
  }
}

// ====================================================================
// TYPEWRITER ENGINE (ANIMASI MENGETIK PELAN)
// ====================================================================
function startTypewriter() {
  const container = document.getElementById("typewriter-content");
  const cursor = document.getElementById("cursor");
  const footer = document.getElementById("card-footer");
  const badge = document.getElementById("card-badge");
  const footerText = document.getElementById("footer-text");

  // Reset state
  if (typingTimeout) clearTimeout(typingTimeout);
  container.innerHTML = "";
  cursor.classList.remove("finished");
  footer.classList.remove("visible");

  // Terapkan data badge & footer text
  badge.textContent = currentConfig.typewriter.badge || "Pesan Spesial ✨";
  footerText.textContent = currentConfig.typewriter.footerText || "With warm wishes ✨";

  const lines = currentConfig.typewriter.lines || [];
  if (lines.length === 0) return;

  const speed = currentConfig.typewriter.typingSpeed || 75;
  const punctuationPause = currentConfig.typewriter.punctuationPause || 400;
  const linePause = currentConfig.typewriter.linePause || 900;

  let currentLineIndex = 0;
  let currentCharIndex = 0;
  let currentParagraph = null;

  isTyping = true;

  function typeNextCharacter() {
    if (!isTyping) return;

    // Jika membuat baris baru
    if (currentCharIndex === 0) {
      currentParagraph = document.createElement("p");
      container.appendChild(currentParagraph);
      // Posisikan kursor tepat di dalam / setelah paragraf aktif
      currentParagraph.appendChild(cursor);
    }

    const currentLine = lines[currentLineIndex];

    if (currentCharIndex < currentLine.length) {
      const char = currentLine[currentCharIndex];
      // Sisipkan karakter sebelum kursor
      const textNode = document.createTextNode(char);
      currentParagraph.insertBefore(textNode, cursor);
      currentCharIndex++;

      // Kalkulasi jeda waktu
      let delay = speed;
      // Beri jeda lebih lama jika bertemu koma, titik, tanda seru, atau tanya
      if (char === "," || char === ";" || char === "—") {
        delay += punctuationPause;
      } else if (char === "." || char === "!" || char === "?") {
        delay += punctuationPause + 150;
      }

      typingTimeout = setTimeout(typeNextCharacter, delay);
    } else {
      // Baris saat ini sudah selesai diketik
      currentLineIndex++;
      currentCharIndex = 0;

      if (currentLineIndex < lines.length) {
        // Lanjut ke baris berikutnya setelah jeda antar baris
        typingTimeout = setTimeout(typeNextCharacter, linePause);
      } else {
        // Semua baris selesai diketik!
        isTyping = false;
        finishTyping();
      }
    }
  }

  // Mulai karakter pertama
  typeNextCharacter();
}

function finishTyping() {
  const cursor = document.getElementById("cursor");
  const footer = document.getElementById("card-footer");
  
  cursor.classList.add("finished");
  footer.classList.add("visible");
}

// ====================================================================
// PARTICLES CANVAS ENGINE (SPARKLES & STARS)
// ====================================================================
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particleType = currentConfig.effects.particles || "sparkles";
  if (particleType === "none") {
    ctx.clearRect(0, 0, width, height);
    if (particlesAnimationId) cancelAnimationFrame(particlesAnimationId);
    return;
  }

  const particleCount = window.innerWidth < 640 ? 35 : 70;
  particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.8 + 0.2,
      fadeSpeed: Math.random() * 0.015 + 0.005,
      fadingOut: Math.random() > 0.5
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Efek kelap-kelip
      if (p.fadingOut) {
        p.opacity -= p.fadeSpeed;
        if (p.opacity <= 0.1) p.fadingOut = false;
      } else {
        p.opacity += p.fadeSpeed;
        if (p.opacity >= 0.9) p.fadingOut = true;
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Tambahkan glow halus
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(216, 180, 254, 0.6)";
    }

    particlesAnimationId = requestAnimationFrame(animate);
  }

  if (particlesAnimationId) cancelAnimationFrame(particlesAnimationId);
  animate();
}

// ====================================================================
// DOM EVENTS & USER INTERACTIONS
// ====================================================================
function initDomElements() {
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  const volumeSlider = document.getElementById("volume-slider");
  const volumeToggleBtn = document.getElementById("volume-toggle-btn");
  const replayBtn = document.getElementById("replay-btn");
  const quickShareBtn = document.getElementById("quick-share-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const settingsModal = document.getElementById("settings-modal");
  const applySettingsBtn = document.getElementById("apply-settings-btn");
  const copyConfigBtn = document.getElementById("copy-config-btn");
  const shareLinkBtn = document.getElementById("share-link-btn");

  // 1. Pemutar Musik
  musicToggleBtn.addEventListener("click", toggleAudio);
  
  volumeSlider.addEventListener("input", (e) => {
    if (audioPlayer) {
      audioPlayer.volume = parseFloat(e.target.value);
      updateVolumeIcon(audioPlayer.volume);
    }
  });

  volumeToggleBtn.addEventListener("click", () => {
    if (!audioPlayer) return;
    if (audioPlayer.volume > 0) {
      audioPlayer.dataset.lastVol = audioPlayer.volume;
      audioPlayer.volume = 0;
      volumeSlider.value = 0;
    } else {
      const restore = parseFloat(audioPlayer.dataset.lastVol || 0.6);
      audioPlayer.volume = restore;
      volumeSlider.value = restore;
    }
    updateVolumeIcon(audioPlayer.volume);
  });

  function updateVolumeIcon(vol) {
    const icon = document.getElementById("volume-icon");
    if (vol === 0) icon.className = "fa-solid fa-volume-xmark";
    else if (vol < 0.5) icon.className = "fa-solid fa-volume-low";
    else icon.className = "fa-solid fa-volume-high";
  }

  // 3. Tombol Ulangi Mengetik
  replayBtn.addEventListener("click", () => {
    startTypewriter();
  });

  // 4. Quick Share
  quickShareBtn.addEventListener("click", () => {
    copyShareUrl();
  });

  // 5. Modal Settings
  settingsBtn.addEventListener("click", () => {
    populateModalForm();
    settingsModal.classList.add("open");
  });

  closeModalBtn.addEventListener("click", () => {
    settingsModal.classList.remove("open");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("open");
    }
  });

  // Tab switching di modal
  document.querySelectorAll(".modal-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal-tabs .tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".modal-body .tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  // Radio button header switch (foto/badge/both/none)
  document.querySelectorAll("input[name='header-type']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      const val = e.target.value;
      const showImg = val === "image" || val === "both";
      const showBadge = val === "badge" || val === "both";
      document.getElementById("group-header-img").style.display = showImg ? "block" : "none";
      document.getElementById("group-header-badge").style.display = showBadge ? "block" : "none";
    });
  });

  // Slider ukuran gambar header
  const inputHeaderSize = document.getElementById("input-header-size");
  if (inputHeaderSize) {
    inputHeaderSize.addEventListener("input", (e) => {
      document.getElementById("size-label").textContent = `${e.target.value} px`;
    });
  }

  // File Picker Foto Kecil di modal
  const modalFilePhoto = document.getElementById("modal-file-photo");
  const modalFilePhotoLabel = document.getElementById("modal-file-photo-label");
  if (modalFilePhoto) {
    modalFilePhoto.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        modalFilePhotoLabel.textContent = file.name;
        handleImageFileUpload(file, 400, 0.9, (dataUrl) => {
          document.getElementById("input-header-img").value = dataUrl;
          showToast(`Foto "${file.name}" siap digunakan! ✨`);
        });
      }
    });
  }

  // Presets klik gambar kecil / avatar
  document.querySelectorAll(".btn-chip-avatar").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("input-header-img").value = chip.dataset.url;
      if (modalFilePhotoLabel) modalFilePhotoLabel.textContent = "Pilih File dari Folder...";
      showToast("Preset gambar kecil dipilih!");
    });
  });

  // File Picker Background di modal
  const modalFileBg = document.getElementById("modal-file-bg");
  const modalFileBgLabel = document.getElementById("modal-file-bg-label");
  if (modalFileBg) {
    modalFileBg.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        modalFileBgLabel.textContent = file.name;
        handleImageFileUpload(file, 1920, 0.85, (dataUrl) => {
          document.getElementById("input-bg-url").value = dataUrl;
          showToast(`Background "${file.name}" siap digunakan! 🌌`);
        });
      }
    });
  }

  // Radio button background switch
  document.querySelectorAll("input[name='bg-type']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      const isImg = e.target.value === "image";
      document.getElementById("group-bg-url").style.display = isImg ? "block" : "none";
      document.getElementById("group-bg-gradient").style.display = isImg ? "none" : "block";
    });
  });

  // Slider label updates
  document.getElementById("input-speed").addEventListener("input", (e) => {
    document.getElementById("speed-label").textContent = `${e.target.value} ms`;
  });
  document.getElementById("input-bg-darkness").addEventListener("input", (e) => {
    document.getElementById("darkness-label").textContent = e.target.value;
  });

  const cardOpacityInput = document.getElementById("input-card-opacity");
  if (cardOpacityInput) {
    cardOpacityInput.addEventListener("input", (e) => {
      const label = document.getElementById("card-opacity-label");
      if (label) label.textContent = `${Math.round(e.target.value * 100)}%`;
    });
  }

  // Presets klik gambar
  document.querySelectorAll(".btn-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("input-bg-url").value = chip.dataset.img;
      showToast("Preset gambar dipilih!");
    });
  });

  // File Picker Lagu di modal
  const modalFileMusic = document.getElementById("modal-file-music");
  const modalFileMusicLabel = document.getElementById("modal-file-music-label");
  if (modalFileMusic) {
    modalFileMusic.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        modalFileMusicLabel.textContent = file.name;
        handleAudioFileUpload(file, (dataUrl, cleanTitle) => {
          document.getElementById("input-music-url").value = dataUrl;
          const titleInput = document.getElementById("input-music-title");
          if (!titleInput.value.trim() || titleInput.value === "Background Music" || titleInput.value === "Lofi Study Beats") {
            titleInput.value = cleanTitle;
          }
          showToast(`Lagu "${file.name}" siap diputar! 🎵`);
        });
      }
    });
  }

  // Presets klik lagu
  document.querySelectorAll(".btn-chip-music").forEach(chip => {
    chip.addEventListener("click", () => {
      document.getElementById("input-music-url").value = chip.dataset.url;
      document.getElementById("input-music-title").value = chip.dataset.title;
      document.getElementById("input-music-artist").value = chip.dataset.artist;
      if (modalFileMusicLabel) modalFileMusicLabel.textContent = "Pilih File Lagu dari Folder...";
      showToast("Preset lagu dipilih!");
    });
  });

  // Terapkan pengaturan baru
  applySettingsBtn.addEventListener("click", () => {
    readModalForm();
    applyBackground();
    applyHeader();
    applyCardStyle();
    initAudio();
    initParticles();
    settingsModal.classList.remove("open");
    playAudio();
    startTypewriter();
    showToast("Pengaturan berhasil diterapkan! ✨");
  });

  // Salin Kode config.js
  copyConfigBtn.addEventListener("click", () => {
    readModalForm();
    const jsCode = generateConfigJsCode(currentConfig);
    navigator.clipboard.writeText(jsCode).then(() => {
      showToast("Kode config.js berhasil disalin! Tempel di GitHub.");
    });
  });

  // Salin Link Share
  shareLinkBtn.addEventListener("click", () => {
    readModalForm();
    copyShareUrl();
  });
}

// Mengisi form modal dengan nilai state saat ini
function populateModalForm() {
  // Tab Teks
  document.getElementById("input-lines").value = (currentConfig.typewriter.lines || []).join("\n");
  document.getElementById("input-speed").value = currentConfig.typewriter.typingSpeed || 75;
  document.getElementById("speed-label").textContent = `${currentConfig.typewriter.typingSpeed || 75} ms`;
  document.getElementById("input-footer").value = currentConfig.typewriter.footerText || "";

  // Card Background Style & Opacity
  const card = currentConfig.card || { style: "gelap", opacity: 0.75 };
  const cardRadio = document.querySelector(`input[name='card-style'][value='${card.style || "gelap"}']`);
  if (cardRadio) cardRadio.checked = true;
  const cardOpacityEl = document.getElementById("input-card-opacity");
  if (cardOpacityEl) {
    cardOpacityEl.value = card.opacity ?? 0.75;
    const cardOpacityLabel = document.getElementById("card-opacity-label");
    if (cardOpacityLabel) cardOpacityLabel.textContent = `${Math.round((card.opacity ?? 0.75) * 100)}%`;
  }

  // Tab Foto / Header
  const header = currentConfig.header || {
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    shape: "circle",
    size: 80,
    badgeText: "Pesan Spesial ✨"
  };
  const headerTypeRadio = document.querySelector(`input[name='header-type'][value='${header.type || "image"}']`);
  if (headerTypeRadio) headerTypeRadio.checked = true;
  document.getElementById("input-header-img").value = header.imageUrl || "";
  const shapeRadio = document.querySelector(`input[name='header-shape'][value='${header.shape || "circle"}']`);
  if (shapeRadio) shapeRadio.checked = true;
  document.getElementById("input-header-size").value = header.size || 80;
  document.getElementById("size-label").textContent = `${header.size || 80} px`;
  document.getElementById("input-badge").value = header.badgeText || currentConfig.typewriter.badge || "Pesan Spesial ✨";

  const val = header.type || "image";
  document.getElementById("group-header-img").style.display = (val === "image" || val === "both") ? "block" : "none";
  document.getElementById("group-header-badge").style.display = (val === "badge" || val === "both") ? "block" : "none";

  // Tab Background
  const isImage = currentConfig.background.type === "image";
  document.querySelector(`input[name='bg-type'][value='${isImage ? "image" : "gradient"}']`).checked = true;
  document.getElementById("group-bg-url").style.display = isImage ? "block" : "none";
  document.getElementById("group-bg-gradient").style.display = isImage ? "none" : "block";
  document.getElementById("input-bg-url").value = currentConfig.background.imageUrl || "";
  document.getElementById("input-bg-gradient").value = currentConfig.background.gradient || "";
  document.getElementById("input-bg-darkness").value = currentConfig.background.overlayDarkness ?? 0.5;
  document.getElementById("darkness-label").textContent = currentConfig.background.overlayDarkness ?? 0.5;
  document.getElementById("input-particles").value = currentConfig.effects.particles || "sparkles";

  // Tab Musik
  document.getElementById("input-music-url").value = currentConfig.music.audioUrl || "";
  document.getElementById("input-music-title").value = currentConfig.music.title || "";
  document.getElementById("input-music-artist").value = currentConfig.music.artist || "";
}

// Membaca form modal ke state
function readModalForm() {
  // Tab Teks
  const linesRaw = document.getElementById("input-lines").value.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  currentConfig.typewriter.lines = linesRaw.length > 0 ? linesRaw : ["Halo dunia! ✨"];
  currentConfig.typewriter.typingSpeed = parseInt(document.getElementById("input-speed").value, 10);
  currentConfig.typewriter.footerText = document.getElementById("input-footer").value.trim() || "With warm wishes ✨";

  // Card Background Style & Opacity
  const cardRadio = document.querySelector("input[name='card-style']:checked");
  const cardStyle = cardRadio ? cardRadio.value : (currentConfig.card ? currentConfig.card.style : "gelap");
  const cardOpacityEl = document.getElementById("input-card-opacity");
  const cardOpacity = cardOpacityEl ? (parseFloat(cardOpacityEl.value) || 0.75) : (currentConfig.card ? currentConfig.card.opacity : 0.75);
  currentConfig.card = {
    style: cardStyle,
    opacity: cardOpacity
  };

  // Tab Foto / Header
  const headerType = document.querySelector("input[name='header-type']:checked").value;
  const headerShape = document.querySelector("input[name='header-shape']:checked").value;
  currentConfig.header = {
    type: headerType,
    imageUrl: document.getElementById("input-header-img").value.trim(),
    shape: headerShape,
    size: parseInt(document.getElementById("input-header-size").value, 10) || 80,
    badgeText: document.getElementById("input-badge").value.trim() || "Pesan Spesial ✨"
  };
  currentConfig.typewriter.badge = currentConfig.header.badgeText;

  // Tab Background
  const bgType = document.querySelector("input[name='bg-type']:checked").value;
  currentConfig.background.type = bgType;
  currentConfig.background.imageUrl = document.getElementById("input-bg-url").value.trim();
  currentConfig.background.gradient = document.getElementById("input-bg-gradient").value.trim();
  currentConfig.background.overlayDarkness = parseFloat(document.getElementById("input-bg-darkness").value);
  currentConfig.effects.particles = document.getElementById("input-particles").value;

  // Tab Musik
  currentConfig.music.audioUrl = document.getElementById("input-music-url").value.trim();
  currentConfig.music.title = document.getElementById("input-music-title").value.trim() || "Background Music";
  currentConfig.music.artist = document.getElementById("input-music-artist").value.trim() || "Aesthetic";
}

// Menghasilkan link share dengan konfigurasi terenkripsi base64
function copyShareUrl() {
  try {
    const compactData = {
      header: currentConfig.header,
      card: currentConfig.card,
      background: currentConfig.background,
      music: currentConfig.music,
      typewriter: currentConfig.typewriter,
      effects: currentConfig.effects
    };
    const jsonStr = JSON.stringify(compactData);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = new URL(window.location.href);
    url.searchParams.set("c", encoded);

    navigator.clipboard.writeText(url.toString()).then(() => {
      showToast("Link berhasil disalin! Kirimkan ke siapa pun 🚀");
    });
  } catch (err) {
    console.error("Gagal menyalin tautan:", err);
    showToast("Gagal menyalin link share.");
  }
}

// Generate kode config.js yang bersih untuk ditempel pengguna
function generateConfigJsCode(cfg) {
  return `const CONFIG = ${JSON.stringify(cfg, null, 2)};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}`;
}

// Toast Popup Utility
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// Utility membaca dan mengompresi file gambar lokal
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
