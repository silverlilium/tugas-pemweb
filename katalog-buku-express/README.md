# BukuKita — Express, Prisma, Neon

Proyek sederhana untuk belajar CRUD. Front-end: HTML, CSS, JavaScript. Back-end: Express. Data buku sekarang disimpan pada PostgreSQL di Neon melalui Prisma, bukan file JSON.

## 1. Siapkan Neon

1. Buka https://console.neon.tech dan masuk ke akunmu.
2. Buat **project baru khusus BukuKita**, atau gunakan database kosong khusus tugas ini. Jangan arahkan migrasi ke database tugas lain.
3. Pada project itu, buka **Connect**. Pilih branch, database, dan role yang akan dipakai.
4. Aktifkan **Connection pooling**, lalu salin connection string untuk `DATABASE_URL`.
5. Matikan Connection pooling, lalu salin connection string untuk `DIRECT_URL`.
6. Kedua URL harus dari project, branch, database, dan role yang sama. Pertahankan parameter keamanan seperti `sslmode=require` dari Neon.

`DATABASE_URL` dipakai aplikasi. `DIRECT_URL` dipakai Prisma saat membuat tabel lewat migrasi. URL mengandung password, cukup simpan pada .env di komputermu.

## 2. Buka proyek dan isi .env

Ekstrak ZIP, buka folder `katalog-buku-express` di VS Code, lalu buka Terminal. Gunakan Node.js 22 atau lebih baru.

```powershell
node -v
npm ci
Copy-Item .env.example .env
```

Buka `.env`, lalu ganti **seluruh nilai URL contoh** dengan dua URL yang tadi kamu salin. Jangan hanya mengganti kata PASSWORD. Jika terminalmu Command Prompt, buat salinan .env.example melalui VS Code atau gunakan `copy .env.example .env`.

```dotenv
DATABASE_URL="URL_POOLING_DARI_NEON"
DIRECT_URL="URL_DIRECT_DARI_NEON"
PORT=3000
```

Contoh di atas hanya penunjuk tempat mengisi, bukan URL yang bisa dipakai. Tidak ada password asli di ZIP.

## 3. Siapkan tabel dan jalankan

Jalankan berurutan pada terminal folder proyek:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm start
```

- `db:generate`: membuat Prisma Client dari schema.
- `db:migrate`: menjalankan migrasi yang sudah disediakan untuk membuat tabel `Buku`.
- `db:seed`: menambah empat buku contoh jika tabel masih kosong.
- `npm start`: menyalakan Express.

Buka **http://localhost:3000**. Biarkan terminal tetap menyala. Saat membuka proyek lagi, cukup `npm start`; setup tabel tidak perlu diulang. Gunakan Ctrl+C untuk menghentikan server.

Jangan buka index.html langsung atau menggunakan Live Server. Halaman dan API dilayani oleh Express.

## 4. Uji CRUD

1. Buka web: GET mengambil seluruh buku dari Neon.
2. Isi form → **Tambah buku**: POST menyimpan buku ke Neon.
3. Klik **Edit** → ubah judul/status → **Simpan perubahan**: PUT mengubah buku berdasarkan ID.
4. Klik **Hapus** → konfirmasi: DELETE menghapus buku.
5. Buka **Tables** pada Neon dan lihat tabel `Buku` untuk membandingkan hasil. Alternatif lokal: jalankan `npm run db:studio` di terminal lain.

Untuk Postman, impor `postman/BukuKita.postman_collection.json`. Kirim request 01–08 secara berurutan; POST menyimpan ID untuk PUT dan DELETE. Request terakhir sengaja menghasilkan 404 setelah bukunya dihapus. Klik **Muat ulang** pada web setelah perubahan dari Postman.

| Method | Endpoint | Body |
| --- | --- | --- |
| GET | `/api/buku` | Tidak ada |
| POST | `/api/buku` | Kelima field buku |
| PUT | `/api/buku/:id` | Kelima field buku |
| DELETE | `/api/buku/:id` | Tidak ada |

POST/PUT menggunakan Body → raw → JSON:

```json
{
  "judul": "Belajar Express",
  "penulis": "Ata",
  "kategori": "Teknologi",
  "tahun": 2026,
  "status": "Tersedia"
}
```

Kategori: Novel, Teknologi, Pengembangan Diri, Pendidikan. Status: Tersedia atau Dipinjam. Tahun harus angka bulat 1000–2100.

## 5. File yang perlu dipelajari

| Bagian | Kegunaan |
| --- | --- |
| `prisma/schema.prisma` | Bentuk tabel Buku: id, judul, penulis, kategori, tahun, status |
| `prisma/migrations/` | SQL pembuatan tabel, dibutuhkan db:migrate |
| `prisma/seed.js` | Data contoh |
| `src/config/prisma.js` | Membuat koneksi Prisma Client |
| `src/models/buku.model.js` | Query ke database |
| `src/controllers/buku.controller.js` | Validasi dan respons API; await menunggu query database |
| `src/routes/buku.routes.js` | Daftar endpoint |
| `src/app.js`, `src/server.js` | Pengaturan dan menjalankan Express |
| `public/` | HTML, CSS, JavaScript web |
| `postman/` | Koleksi request |
| `pendukung/` | Penjelasan tambahan, test, dan dokumentasi versi JSON lama; tidak dibutuhkan saat npm start |

Urutan belajar: schema → config Prisma → model → controller → routes → public/app.js. Hanya satu tabel, tanpa login dan relasi tambahan. Prisma dikunci pada versi 6.19.3 supaya konfigurasi tetap sederhana dan konsisten dengan panduan ini; gunakan versi pada package-lock.json.

## 6. Jika ada kendala

| Kendala | Yang diperiksa |
| --- | --- |
| PowerShell memblokir npm.ps1 | Gunakan terminal Command Prompt, atau ketik npm.cmd menggantikan npm. |
| Prisma belum dibuat | Jalankan npm run db:generate. |
| Database tidak terhubung / P1001 | Cek kedua URL, branch Neon, internet, dan aktifkan kembali compute melalui Neon bila perlu. |
| Password salah / P1000 | Salin ulang connection string lengkap dari Connect. |
| Tabel belum ada / P2021 | Jalankan npm run db:migrate pada database yang benar. |
| Port 3000 terpakai | Hentikan server proyek sebelumnya dahulu dengan Ctrl+C. |
| PUT/DELETE menghasilkan 404 | Gunakan ID dari POST terbaru, bukan menebak angka 5. |

Tidak ada reset database otomatis. Data JSON versi lama tidak dipindahkan otomatis ke Neon; seed menyediakan empat contoh awal. Lihat `pendukung/HASIL-PEMERIKSAAN.md` untuk batas pengujian versi ini.

## 7. Pengumpulan

Ambil ulang screenshot web serta POST, PUT, DELETE setelah aplikasi terhubung ke Neon. Screenshot pada `pendukung/versi-json-lama/` hanya bukti versi terdahulu.

ZIP proyek tanpa `node_modules`, `dist`, dan **tanpa .env**. Sertakan `.env.example`, `package-lock.json`, folder `prisma` beserta migrasinya, `src`, dan `public`. ZIP yang disediakan sudah mengikuti aturan ini.

Referensi: https://www.prisma.io/docs/orm/v6/prisma-schema/overview/data-sources dan https://www.prisma.io/docs/orm/v6/reference/prisma-config-reference
