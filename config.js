/**
 * ====================================================================
 * KONFIGURASI WEBSITE AESTHETIC (CUSTOM CONFIG)
 * ====================================================================
 * Anda bisa mengubah background, lagu, teks yang diketik pelan,
 * dan pengaturan lainnya langsung di file ini!
 */

const CONFIG = {
  // Judul website di tab browser & icon
  siteTitle: "A Special Message For You ✨",
  faviconEmoji: "💌",

  // 1. PENGATURAN BACKGROUND WEB
  background: {
    // Pilihan tipe: "image" atau "gradient"
    type: "image",

    // Jika tipe "image", masukkan link URL gambar/foto (Unsplash, Imgur, Pinterest, GitHub raw, dll)
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80",

    // Jika tipe "gradient", gunakan kode CSS gradient di bawah ini
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",

    // Tingkat kegelapan lapisan overlay (0.0 = transparan, 1.0 = hitam pekat)
    // Direkomendasikan 0.4 - 0.6 agar teks selalu jelas terbaca
    overlayDarkness: 0.5,

    // Efek blur lembut pada gambar background (satuan pixel, misal 0px untuk jernih, 3px untuk blur)
    blurAmount: "2px"
  },

  // 2. PENGATURAN MUSIK / LAGU
  music: {
    // Masukkan link URL file MP3 lagu favorit Anda.
    // Pastikan link langsung berakhiran .mp3 atau file audio yang dapat diakses publik.
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    
    // Judul & penyanyi yang tampil di pemutar musik
    title: "Lofi Study Beats",
    artist: "Chilled Vibes",

    // Volume awal (0.0 sampai 1.0)
    defaultVolume: 0.6,

    // Apakah musik otomatis loop (berulang saat habis)?
    loop: true
  },

  // 3. PENGATURAN BAGIAN ATAS KARTU (GAMBAR KECIL / AVATAR / STIKER / BADGE)
  header: {
    // Pilihan tipe tampilan:
    // "image" = hanya gambar kecil/avatar/stiker
    // "badge" = hanya teks label (seperti sebelumnya: "Pesan Spesial ✨")
    // "both"  = gambar kecil di atas + teks label di bawahnya
    // "none"  = tanpa header (langsung teks ketik)
    type: "image",

    // Masukkan link URL gambar kecil (bisa foto sendiri, avatar lucu, stiker, GIF)
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",

    // Bentuk gambar kecil: "circle" (lingkaran bulat) atau "rounded" (kotak sudut tumpul)
    shape: "circle",

    // Ukuran diameter gambar dalam pixel (rekomendasi: 70 sampai 100)
    size: 80,

    // Teks badge jika memilih type "badge" atau "both"
    badgeText: "Pesan Spesial ✨"
  },

  // 4. PENGATURAN TEKS & ANIMASI MENGETIK PELAN (TYPEWRITER)
  typewriter: {
    // Kecepatan mengetik per huruf dalam milidetik (ms)
    // 70 - 100 ms = Mengetik pelan santai
    // 40 - 60 ms  = Sedang
    typingSpeed: 75,

    // Jeda waktu saat bertemu tanda baca koma (,) atau titik (.) dalam milidetik
    punctuationPause: 400,

    // Jeda waktu antar baris kalimat (ms)
    linePause: 900,

    // Kalimat-kalimat yang akan diketik satu per satu secara berurutan.
    // Anda bisa menambah atau mengurangi baris sesuka hati!
    lines: [
      "Halo! Terima kasih sudah meluangkan waktu untuk membuka ini...",
      "Setiap hari yang kamu lalui membawa cerita dan perjuangan tersendiri.",
      "Jangan lupa untuk berbangga pada dirimu yang selalu bertahan dan melangkah maju.",
      "Semoga hari ini dan hari-hari esok dipenuhi dengan ketenangan, tawa, dan kebahagiaan.",
      "Jaga kesehatanmu ya, dan tetaplah tersenyum! Kamu luar biasa. 🌸🤍"
    ],

    // Teks penutup di bagian bawah setelah semua baris selesai diketik
    footerText: "With warm wishes ✨",

    // Tampilkan tombol "Putar Ulang" setelah selesai mengetik?
    showReplayButton: true
  },

  // 5. EFEK VISUAL TAMBAHAN
  effects: {
    // Partikel latar: "sparkles" (kelap-kelip), "stars" (bintang jatuh), atau "none" (tanpa efek)
    particles: "sparkles",

    // Tampilkan widget pemutar musik di pojok layar
    showMusicWidget: true,

    // Sembunyikan tombol pengaturan dari pengunjung umum (hanya admin yang bisa akses lewat /admin.html)
    showCustomizerButton: false
  },

  // 6. PENGATURAN PANEL ADMIN (TERPROTEKSI PASSWORD)
  admin: {
    // Kata sandi untuk membuka dashboard admin (/admin.html)
    // Silakan ganti dengan kata sandi rahasia Anda sendiri!
    password: "admin123",

    // Aktifkan jalan pintas rahasia keyboard (Ctrl + Shift + A) di halaman utama
    secretShortcut: true
  }
};

// Export untuk browser & modul
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
