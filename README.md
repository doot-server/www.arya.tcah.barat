# ✨ Website Pesan Aesthetic (Vercel & GitHub Ready)

Website interaktif aesthetic dengan **animasi teks mengetik pelan (typewriter effect)**, **musik latar kustom (background music)**, **latar belakang web kustom (custom background)**, serta panel pengaturan langsung.

Dirancang khusus agar sangat mudah di-upload ke **GitHub** dan langsung aktif di **Vercel** (`https://nama-web-anda.vercel.app`).

---

## 🌟 Fitur Utama

- ✍️ **Animasi Mengetik Pelan (Typewriter)**: Kecepatan ketik halus, jeda koma & titik yang natural, multi-baris/paragraf, dan tombol putar ulang (*Replay*).
- 🎵 **Custom Lagu / Background Music**: Widget pemutar musik aesthetic dengan animasi gelombang suara, pengatur volume, play/pause, dan layar pembuka (*splash screen*) agar audio bisa berputar otomatis tanpa diblokir browser.
- 🖼️ **Custom Background Web**: Mendukung gambar dari internet (Unsplash, Imgur, Pinterest, dll) atau warna *gradient*, lengkap dengan overlay kegelapan agar teks tetap jelas terbaca.
- ✨ **Efek Partikel Aesthetic**: Partikel cahaya/bintang yang melayang lembut di latar belakang.
- ⚙️ **Panel Pengaturan Langsung (Live Customizer)**: Terdapat tombol pengaturan di web untuk mencoba teks, latar, dan lagu secara langsung.
- 🔗 **Fitur Bagikan Tautan (Share Link)**: Bisa langsung membuat tautan unik yang menyimpan pesan Anda untuk dikirimkan ke teman atau orang terkasih.
- 🚀 **Zero Build / Siap Deploy**: Murni HTML, CSS, dan JavaScript tanpa instalasi dependensi yang rumit. 100% bebas error saat di-deploy ke Vercel!

---

## 📂 Struktur File

```
├── index.html       # Halaman utama pengunjung (bersih tanpa tombol edit)
├── admin.html       # Halaman Admin Panel khusus pemilik (terproteksi password)
├── admin.js         # Logika dashboard admin, verifikasi password & live preview
├── config.js        # File konfigurasi utama (foto, teks, background, lagu & password)
├── style.css        # Desain aesthetic, glassmorphism & responsive mobile
├── script.js        # Mesin pengetikan typewriter pelan, audio & partikel
├── vercel.json      # Konfigurasi hosting Vercel
└── README.md        # Panduan lengkap
```

---

## 🔒 Panel Admin Khusus Pemilik (Hanya Orang Tertentu)

Untuk menjaga agar pengunjung umum tidak bisa mengubah isi pesan, gambar, ataupun lagu, tombol pengaturan publik telah disembunyikan. Hanya Anda (atau orang yang memiliki kata sandi) yang dapat mengakses panel pengaturan.

### Cara Membuka Panel Admin:
1. Buka link: `https://nama-web-anda.vercel.app/admin.html`
2. **Atau Jalan Pintas Rahasia**: Saat berada di halaman utama website, tekan tombol kombinasi keyboard:
   - **`Ctrl + Shift + A`** (atau `Cmd + Shift + A` di Mac)
   - Atau **klik 3 kali secara cepat** pada foto/avatar di bagian atas kartu pesan.
3. Masukkan kata sandi admin (Password bawaan: **`admin123`**).
4. Anda akan masuk ke dashboard admin lengkap dengan **Live Preview** langsung!

### Fitur yang Ada di Dashboard Admin:
- 🖼️ Ganti Foto / Gambar Kecil (URL, preset, bentuk bulat/kotak, ukuran diameter).
- ✍️ Ubah Teks Kalimat, kecepatan ketik pelan, dan jeda tanda baca.
- 🌌 Ganti Background Gambar (URL/preset) atau Gradient warna modern.
- 🎵 Ganti Lagu MP3, Judul, Penyanyi, dan uji coba putar lagu langsung di dashboard.
- 🔑 **Ganti Kata Sandi Admin** baru kapan saja.
- 💾 **Simpan ke Web Ini**: Langsung aktif di browser tanpa repot.
- 🔗 **Salin Link Kustom**: Membuat link rahasia berisi pesan kustom untuk dikirimkan ke target/teman tanpa perlu login.
- 📋 **Salin Kode config.js**: Menghasilkan kode baru dalam 1-klik untuk di-paste ke GitHub agar website Vercel terupdate permanen untuk seluruh pengunjung dunia.

### Mengubah Password Admin di `config.js`:
Buka `config.js` di GitHub dan ubah bagian:
```javascript
admin: {
  password: "KATA_SANDI_RAHASIA_ANDA", // Ganti dengan password baru Anda
  secretShortcut: true
}
```

---

## 🚀 Panduan Upload ke GitHub & Deploy ke Vercel

### Langkah 1: Upload Kode ke GitHub

#### Opsi A: Menggunakan Terminal / Git
Jalankan perintah berikut di folder proyek Anda:
```bash
git init
git add .
git commit -m "Initial commit website aesthetic"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/NAMA-REPO-ANDA.git
git push -u origin main
```

#### Opsi B: Lewat Website GitHub (Tanpa Perintah Terminal)
1. Buka [github.com](https://github.com) dan buat repository baru (klik **New Repository**).
2. Beri nama repository (misal: `pesan-spesial`), pilih **Public**, lalu klik **Create repository**.
3. Di halaman repository baru, klik link **"uploading an existing file"**.
4. Tarik (*drag & drop*) semua file proyek (`index.html`, `admin.html`, `admin.js`, `config.js`, `style.css`, `script.js`, `vercel.json`, `README.md`) ke dalam kotak upload.
5. Klik tombol hijau **Commit changes**.

---

### Langkah 2: Hubungkan ke Vercel (Hanya 1 Menit!)

1. Buka [vercel.com](https://vercel.com) dan masuk (*Login*) menggunakan akun GitHub Anda.
2. Pada dashboard Vercel, klik tombol **"Add New..."** lalu pilih **"Project"**.
3. Cari nama repository GitHub yang baru saja Anda buat, lalu klik **"Import"**.
4. Pada bagian *Project Settings*:
   - Framework Preset: biarkan **Other**
   - Root Directory: `./` (default)
5. Klik tombol biru **"Deploy"**.
6. Tunggu sekitar 15–30 detik sampai muncul animasi kembang api 🎉.
7. Website Anda sekarang sudah aktif di `https://nama-repo-anda.vercel.app`!

---

Dibuat dengan ❤️ untuk kemudahan kreasi web aesthetic Anda.
