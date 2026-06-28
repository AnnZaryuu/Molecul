<table>
<tr>
<td width="90">
<img src="client/assets/molecul.png" width="70">
</td>
<td>

# PROJECT MOLECUL

</td>
</tr>
</table>

## Deskripsi

Project Molecul adalah aplikasi berbasis **Enterprise Monorepo** yang mengusung teknologi *Cross-Platform* (React Native/Expo) untuk *client* dan Laravel untuk sistem *backend*. Aplikasi ini dibuat khusus untuk menjadi pendamping komprehensif bagi pemain Mobile Legends: Bang Bang, menyediakan *database* hero lengkap, pusat info turnamen e-sports, hingga sistem prediksi pertandingan (*betting*) berhadiah poin.

### Arsitektur Proyek
Repositori ini dibagi menjadi dua bagian utama yang sangat rapi:
- **`api/` (Backend)**: Sistem server yang dibangun dengan Laravel 10 dan MySQL. Mengelola autentikasi pengguna (Sanctum), data profil pengguna, saldo koin, sistem prediksi skor, dan kontrol Dasbor Admin.
- **`client/` (Frontend)**: Aplikasi *Cross-Platform* yang dibangun dengan React Native dan Expo.

### Fitur Utama
- **Sistem Autentikasi & Koin**: Sistem *login*, pendaftaran, dan manajemen saldo koin pengguna yang terpusat.
- **Prediksi Pertandingan**: Pengguna dapat bertaruh poin pada tim e-sports jagoan mereka di pertandingan dunia nyata maupun *Dummy Match*.
- **Dasbor Admin Interaktif**: Antarmuka khusus untuk admin dalam me-*resolve* pemenang pertandingan, membuat simulasi *dummy match*, dan mengelola koin seluruh pengguna secara *in-app* dan *real-time*.
- **Database Hero**: Mengambil data hero, atribut, dan *role* secara *real-time* dari server eksternal [![rone.dev](https://img.shields.io/badge/API-rone.dev-blue.svg)](https://github.com/ridwaanhall/api-mobilelegends).
- **Portal E-Sports Terintegrasi**: Terhubung ke [![Pandascore](https://img.shields.io/badge/API-Pandascore-blue.svg)](https://www.pandascore.co/). untuk menarik jadwal pertandingan profesional, *live score*, dan klasemen turnamen MLBB global.

## Cara Menjalankan Aplikasi

Pastikan **PHP, Composer, MySQL, Node.js, dan npm** sudah terinstal pada sistem.

### 1. Menjalankan Backend (API Laravel)
```bash
cd api
composer install
cp .env.example .env # Atur DB_DATABASE, DB_USERNAME, DB_PASSWORD di sini
php artisan key:generate
php artisan migrate
php artisan serve
````

### 2. Menjalankan Frontend (Client Expo)

Buka terminal baru, lalu biarkan server Laravel tetap berjalan:

```bash
cd client
npm install
npx expo start -c
```

Pengujian aplikasi dapat dilakukan dengan memindai *QR code* menggunakan aplikasi **Expo Go** pada perangkat seluler. Alternatif lain, tekan tombol `a` di terminal untuk membuka melalui Emulator Android, atau tekan `i` untuk Simulator iOS.

## Konfigurasi Token PandaScore

Supaya jadwal e-sports dan klasemen turnamen dapat ditampilkan, diperlukan token API dari PandaScore.

1. Buat akun gratis terlebih dahulu di https://pandascore.co/
2. Masuk ke halaman *dashboard* untuk membuat API Token baru.
3. Buka file `client/src/services/config.js`.
4. Masukkan API Token pada bagian berikut:

```javascript
// client/src/services/config.js
export const PANDASCORE_TOKEN = 'MASUKKAN_TOKEN_DISINI';
```

Jika token belum diisi, aplikasi **tidak akan crash**. Tampilan E-Sports hanya akan terlihat kosong dan sistem akan mencetak peringatan ringan di konsol.
