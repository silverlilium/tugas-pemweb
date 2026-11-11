# Panduan Postman dan urutan screenshot

Proyek sekarang memakai Prisma dan Neon. Selesaikan setup database pada README.md dahulu. ID hasil POST dapat berbeda; selalu gunakan ID dari respons terbaru. Screenshot lama di versi-json-lama hanya dokumentasi versi terdahulu.

## A. Persiapan

1. Jalankan proyek dengan `npm ci`, lalu `npm start` dari terminal VS Code.
2. Buka http://localhost:3000 dan pastikan koleksi muncul.
3. Buka **Postman Desktop** di komputermu. Versi web memerlukan Desktop Agent untuk mengakses server lokal; aplikasi desktop lebih sederhana untuk tugas ini.
4. Klik **Import** dan pilih file `postman/BukuKita.postman_collection.json` dari folder proyek. Impor sebagai collection jika diminta.
5. Buka collection **BukuKita - CRUD Express**. Tidak perlu membuat environment: variabel `base_url` dan `buku_id` berada pada collection.
6. Buka bagian variabel collection jika perlu. `base_url` harus `http://localhost:3000`. Jika port diganti, sesuaikan.

## B. Kirim request satu per satu

### 01 — GET seluruh buku

Buka **01 GET - Semua buku**, lalu klik **Send**. Pastikan status **200 OK** dan `data` berisi array buku. Tidak perlu Body. Halaman web juga menggunakan endpoint ini.

### 02 — POST tambah buku

Buka **02 POST - Tambah buku uji**. Body raw JSON sudah disediakan:

```json
{
  "judul": "Belajar Express",
  "penulis": "Ata",
  "kategori": "Teknologi",
  "tahun": 2026,
  "status": "Tersedia"
}
```

URL: `{{base_url}}/api/buku`. Pastikan **Body → raw → JSON**. Klik **Send**. Harus **201 Created** dengan pesan `Buku berhasil ditambahkan.` dan objek `data`.

Script setelah respons menyimpan `data.id` ke variabel collection `buku_id`. Nilai ID bisa berbeda dari screenshot; itu normal. Catat ID hasil respons untuk memahami prosesnya.

**Screenshot POST:** perlu terlihat method POST, URL, Body JSON, status 201, dan respons JSON. Perbesar jendela atau geser pembatas panel respons jika body tertutup. Tekan **Win+Shift+S**, pilih area, kemudian simpan `screenshots-baru/postman-post.png`.

### 03 — GET verifikasi penambahan

Kirim **03 GET - Verifikasi penambahan**. Pastikan `Belajar Express` ada pada `data`. Klik **Muat ulang** di web untuk melihat buku yang sama.

### 04 — PUT edit buku

Buka **04 PUT - Edit buku uji**. URL: `{{base_url}}/api/buku/{{buku_id}}`. Body JSON:

```json
{
  "judul": "Belajar Express Edisi Revisi",
  "penulis": "Ata",
  "kategori": "Teknologi",
  "tahun": 2026,
  "status": "Dipinjam"
}
```

Klik **Send**. Harus **200 OK**, judul berubah, status `Dipinjam`, dan ID tetap sama. PUT pada proyek ini mengganti seluruh lima field; jangan mengirim judul saja.

**Screenshot PUT:** method PUT, URL beserta ID, Body JSON baru, status 200, dan respons. Simpan `screenshots-baru/postman-put.png`.

Jika URL masih menampilkan `{{buku_id}}`, arahkan kursor untuk melihat nilainya. Bisa juga mengganti bagian ID dengan angka dari respons POST. Jangan memakai ID milik buku lain.

### 05 — GET verifikasi perubahan

Kirim **05 GET - Verifikasi perubahan**. Detail buku harus menampilkan judul revisi dan status `Dipinjam`. Refresh web untuk membandingkan.

### 06 — DELETE hapus buku uji

Buka **06 DELETE - Hapus buku uji**. URL memakai ID yang sama. Body tidak diperlukan. Klik **Send**. Harus **200 OK** dengan pesan `Buku berhasil dihapus.` dan data buku yang dihapus.

**Screenshot DELETE:** method DELETE, URL beserta ID, status 200, dan respons. Simpan `screenshots-baru/postman-delete.png`.

### 07 dan 08 — GET verifikasi penghapusan

- **07 GET - Semua buku setelah hapus:** harus 200; buku uji sudah tidak ada.
- **08 GET - Detail terhapus menghasilkan 404:** harus **404 Not Found**. Ini hasil yang diharapkan karena bukunya telah dihapus.

Pada tab **Test Results**, pemeriksaan otomatis seharusnya lulus. Hanya request terakhir yang diharapkan 404; request sukses lainnya 200 atau 201.

## C. Demo dari web untuk membuktikan form bekerja

1. Ambil screenshot web awal saat semua status ditampilkan dan pencarian kosong.
2. Tambahkan satu buku melalui form. Ambil screenshot pesan sukses dan baris barunya.
3. Klik Edit, ubah judul/status, lalu Simpan perubahan. Ambil screenshot hasil perubahan.
4. Klik Hapus dan konfirmasi untuk buku uji itu. Ambil screenshot pesan sukses.

Dengan begitu bukti mencakup API di Postman sekaligus tombol pada web. Menguji Postman saja belum membuktikan fitur Edit dan Hapus di halaman bekerja.

## D. Naskah penjelasan singkat

“Saya membuat BukuKita, katalog buku dengan back-end Express dan front-end HTML, CSS, serta JavaScript. Saat halaman dibuka, fetch GET mengambil semua buku. Form tambah mengirim POST. Tombol Edit mengisi form lalu menyimpan perubahan melalui PUT berdasarkan ID. Tombol Hapus mengirim DELETE setelah konfirmasi. Data disimpan di Neon PostgreSQL melalui Prisma sehingga tetap ada setelah server dimulai ulang. Saya menguji endpoint melalui Postman dan memverifikasi perubahan yang sama pada halaman web.”

## Referensi

- https://learning.postman.com/docs/getting-started/importing-and-exporting/importing-data/
- https://learning.postman.com/docs/use/send-requests/create-requests/parameters
- https://learning.postman.com/docs/getting-started/installation/overview/
