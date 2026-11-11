> ARSIP VERSI JSON LAMA. Ini bukan bukti pengujian Prisma/Neon. Lihat ../HASIL-PEMERIKSAAN.md.

# Bukti pengujian BukuKita

Tanggal: **4 November 2026 (WIB)**. Kode dijalankan pada Node.js **24.22.1** dan Express **5.3.0**. Proyek menetapkan Node >=22. Seluruh data pengujian merupakan contoh untuk tugas ini.

## Hasil pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | Lulus: 8 hasil test menurut Node test runner, 0 gagal |
| Koleksi Postman melalui Newman | 8 request dijalankan, 21 assertion lulus, 0 gagal |
| GET saat membuka web | Empat buku awal tampil |
| Tambah melalui form web | POST menghasilkan 201; total berubah menjadi 5 |
| Edit melalui form web | PUT menghasilkan 200; judul dan status diperbarui, ID tetap |
| Hapus melalui dialog web | DELETE menghasilkan 200; total kembali menjadi 4 |
| Batal hapus | Buku tidak dihapus |
| Batal edit | Form kembali ke mode tambah |
| Cari, filter, hasil kosong | Tampilan mengikuti masukan dan status yang dipilih |
| Tampilan desktop/mobile | Diperiksa pada lebar 1440 dan 390 piksel; tidak ada overflow halaman pada mobile, tabel dapat digeser horizontal |
| Error JavaScript halaman | Tidak ada pada alur yang diuji |
| Persistence | Instance aplikasi baru membaca hasil perubahan dari file data yang sama |
| Input tidak valid | Ditolak: teks kosong, tipe salah, kategori/status salah, tahun string/pecahan, PUT tidak lengkap |
| Error API | JSON rusak 400, ID tidak valid 400, ID tidak ditemukan 404, Content-Type salah 415, body terlalu besar 413 |

Tes API memakai file sementara. Pengujian browser memakai koleksi contoh dan menghapus buku ujinya melalui tombol Hapus. Data pada paket dikembalikan ke empat buku awal setelah pengujian.

## Screenshot yang disertakan

Screenshot web diambil dari aplikasi yang benar-benar berjalan menggunakan browser headless; bukan mockup.

| File di `screenshots/` | Yang ditampilkan |
| --- | --- |
| `01-web-katalog.png` | Halaman awal: form, seluruh koleksi, tombol Edit dan Hapus |
| `02-web-setelah-post.png` | Buku baru muncul dan pesan tambah berhasil |
| `03-web-form-edit.png` | Form edit terisi sebelum perubahan disimpan |
| `04-web-setelah-put.png` | Judul revisi dan status Dipinjam setelah PUT |
| `05-web-setelah-delete.png` | Buku uji hilang dan pesan hapus berhasil |
| `06-web-mobile.png` | Tampilan pada lebar 390 piksel |
| `07-laporan-api-post.png` | Laporan request/response POST nyata, 201 Created |
| `08-laporan-api-put.png` | Laporan request/response PUT nyata, 200 OK |
| `09-laporan-api-delete.png` | Laporan request/response DELETE nyata, 200 OK |

**Batasan bukti Postman:** aplikasi Postman Desktop tidak dapat dijalankan pada lingkungan pembuat. Koleksinya diuji memakai **Newman, runner koleksi Postman**. Tiga screenshot laporan API berasal dari HTML yang menampilkan respons nyata runner tersebut; **bukan screenshot antarmuka Postman**. Jika pengumpulan meminta tampilan Postman, ambil screenshot tambahan pada komputermu mengikuti PANDUAN-POSTMAN.md.

Respons dan hasil assertion yang diringkas tersedia di `bukti-api/hasil-koleksi.json`. File `bukti-api/post.html`, `put.html`, dan `delete.html` dapat dibuka langsung untuk melihat laporan. URL localhost dalam laporan merujuk server saat pengujian, bukan tautan server daring.
