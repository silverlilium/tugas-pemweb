# Analisis demo-nama-mahasiswa-web.rar

Analisis berdasarkan file sumber yang benar-benar diekstrak dari lampiran. Arsip asli tidak diubah. Arsip berisi **12 file dan 5 entri folder**, total file setelah ekstraksi **61.103 byte**; tidak memuat `node_modules` atau `dist`.

## Isi arsip

| File | Isi/kegunaan |
| --- | --- |
| `package.json` | Express 5.3.0; TypeScript, tsx, dan tipe Express/Node; Node >=24 |
| `package-lock.json` | Mengunci versi dependency |
| `tsconfig.json` | TypeScript strict, NodeNext, hasil kompilasi ke `dist` |
| `README.md` | Petunjuk menjalankan, contoh API dan penjelasan web GET/POST |
| `src/index.ts` | Menyalakan server pada port 3000 |
| `src/app.ts` | Middleware JSON, request logger, folder public, router `/hello` |
| `src/middleware/request-logger.ts` | Mencatat waktu, method, dan URL request |
| `src/routes/hello.routes.ts` | Route GET, POST, PUT/:id, DELETE/:id |
| `src/controllers/hello.controller.ts` | CRUD array nama; data awal Budi dan Siti |
| `public/index.html` | Form nama dan tabel ID/nama |
| `public/style.css` | CSS sederhana |
| `public/script.js` | fetch GET untuk tabel dan POST untuk form; tidak ada PUT/DELETE |

## Penilaian terhadap syarat tugas

| Syarat | Status di RAR | Bukti sumber |
| --- | --- | --- |
| Express sebagai back-end | Ada | `src/app.ts` mengimpor Express |
| HTML, CSS, JavaScript sebagai front-end | Ada | Tiga file pada `public/` |
| GET menampilkan seluruh data di web | Ada | `muatNama()` memanggil GET `/hello` dan membaca `hasil.data` |
| POST melalui form | Ada | Submit mengirim JSON `{nama: ...}` ke POST `/hello` |
| PUT melalui fitur Edit di web | **Belum ada** | API PUT ada, tetapi HTML tidak memiliki tombol Edit dan script tidak memanggil PUT |
| DELETE melalui tombol Hapus di web | **Belum ada** | API DELETE ada, tetapi HTML tidak memiliki tombol Hapus dan script tidak memanggil DELETE |
| ZIP tanpa node_modules/dist | Belum berupa ZIP | Arsip RAR sudah tidak menyertakan kedua folder tersebut |
| Screenshot web dan operasi | **Belum disertakan** | Tidak ada file gambar di dalam arsip |

Kesimpulan: demo ini sudah memiliki API CRUD, tetapi belum memenuhi seluruh syarat antarmuka. Keberadaan PUT/DELETE di API atau pengujian Postman belum menggantikan kebutuhan fitur Edit/Hapus pada web.

## Endpoint demo lama

| Method | URL | Body |
| --- | --- | --- |
| GET | `http://localhost:3000/hello` | Tidak ada |
| POST | `http://localhost:3000/hello` | `{"nama":"Andi"}` |
| PUT | `http://localhost:3000/hello/:id` | `{"nama":"Andi Pratama"}` |
| DELETE | `http://localhost:3000/hello/:id` | Tidak ada |

GET juga mendukung query sapaan `?nama=Budi`. Data sebenarnya tetap berada dalam properti `data`. Nama wajib teks dan tidak boleh kosong; POST sukses 201, GET/PUT/DELETE sukses 200, nama tidak valid 400, ID tidak ditemukan 404. ID pertama hasil POST pada server baru adalah 3, tetapi saat demo gunakan ID dari respons.

## Catatan teknis demo lama

- Data hanya disimpan dalam array controller. Refresh browser tidak mereset array, tetapi restart server mengembalikan Budi dan Siti.
- `express.static("public")` menggunakan path relatif sehingga demo harus dijalankan dari root proyek.
- Script `start` menjalankan `dist/index.js`; pada arsip yang belum dibangun, harus menjalankan `npm run build` dahulu atau langsung `npm run dev`.
- ID di controller diubah memakai `Number()` tanpa pemeriksaan format ID khusus; ID aneh umumnya berakhir 404.
- Penanganan format JSON salah dan error lain belum memakai respons JSON khusus yang konsisten.
- Front-end memakai `textContent`, yang merupakan pilihan baik agar input ditampilkan sebagai teks.
- Penilaian ini berdasarkan pembacaan seluruh sumber (selain isi rinci lockfile) dan metadata dependency; tidak mengklaim demo lama sudah diuji berjalan.

## Perbandingan dengan proyek baru

| Bagian | Demo dalam RAR | BukuKita yang disiapkan |
| --- | --- | --- |
| Tema | Nama mahasiswa | Katalog buku |
| Back-end | Express + TypeScript | Express + JavaScript |
| Front-end | Tampil dan tambah | Tampil, tambah, edit, hapus, cari, filter |
| Penyimpanan | Array sementara | File JSON persisten |
| URL API | `/hello` | `/api/buku` |
| Cara menjalankan | tsx atau build TypeScript | `npm ci`, lalu `npm start` |
| Dukungan Node | >=24 | >=22 |
| Postman | Contoh request di README | Collection 8 request dengan ID otomatis dan pemeriksaan respons |
| Screenshot | Tidak ada | Screenshot web dan laporan respons API nyata; screenshot Postman perlu diambil di komputer pengguna |

Proyek baru berdiri sendiri. Endpoint, field, dan perintah kedua proyek berbeda; ikuti panduan BukuKita ketika menggunakan ZIP baru.
