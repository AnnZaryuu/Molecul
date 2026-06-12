# PROJECT MOLECUL
---
![Preview](assets/gayuh.jpg)

## Penjelasan Teknis Singkat

Project Molecul adalah aplikasi mobile yang dibangun menggunakan React Native dan Expo. Aplikasi ini dibuat khusus untuk menjadi pendamping bagi pemain Mobile Legends: Bang Bang, yang berisi database hero lengkap sekaligus pusat info turnamen e-sports.

### Fitur Utama
- **Database Hero**: Mengambil data hero secara real-time, mulai dari atribut, skill, sampai cerita latar belakangnya, menggunakan API publik [![rone.dev](https://img.shields.io/badge/API-rone.dev-blue.svg)](https://github.com/ridwaanhall/api-mobilelegends).
- **Sistem Role Otomatis**: Karena API bawaan kadang tidak menyediakan data role yang lengkap, aplikasi ini menggunakan cara gabungan. Ada daftar role statis sebagai referensi dasar, dipadukan dengan sistem memori sementara (cache) yang akan otomatis mengingat role hero saat aplikasi sedang digunakan.
- **Info E-Sports**: Tersambung langsung ke PandaScore API untuk menarik jadwal pertandingan profesional, status pertandingan yang sedang berjalan, klasemen turnamen.
- **Desain Layout Dinamis**: Tampilan aplikasi sudah sepenuhnya disesuaikan untuk layar perangkat mobile, lengkap dengan komponen interaktif tambahan seperti Patch Notes Carousel.

## Cara Menjalankan Aplikasi

1. Clone atau download repositori ini ke komputer.
2. Install semua file yang dibutuhkan (dependencies) dengan menjalankan perintah ini di folder proyek:
   ```bash
   npm install
   ```
3. Nyalakan server Expo:
   ```bash
   npx expo start
   ```
4. Untuk mengetes aplikasi, bisa melalui scan QR code yang muncul menggunakan aplikasi Expo Go di HP. Alternatif lainnya, tekan tombol `a` di terminal untuk membuka lewat emulator Android, atau tekan `i` untuk simulator iOS.

## Cara Memasukkan Token PandaScore

Supaya fitur e-sports (jadwal pertandingan dan turnamen) bisa muncul datanya, diperlukan token API dari PandaScore. step by step:

1. Buat akun gratis terlebih dahulu di https://pandascore.co/
2. Masuk ke halaman dashboard mereka untuk membuat API Token baru.
3. Kembali ke proyek ini, lalu buka file `src/services/config.js`.
4. Ganti teks token yang sudah ada dengan token milikmu sendiri:

```javascript
// src/services/config.js
export const PANDASCORE_TOKEN = 'MASUKKAN_TOKEN_DISINI';
```

Jika token yang dimasukkan salah atau belum diisi, aplikasinya tidak akan error atau crash. Tampilan fitur e-sports hanya akan terlihat kosong dan sistem akan memunculkan pesan peringatan ringan di console terminal.
