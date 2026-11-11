# Penjelasan singkat untuk belajar

Folder ini boleh diabaikan ketika menjalankan aplikasi. Yang dibaca Express ada di src dan public; Prisma membaca folder prisma.

## Prisma dan Neon itu apa?

- **Neon** menyediakan database PostgreSQL di internet. Data buku disimpan di sana.
- **Prisma** membantu JavaScript membaca dan mengubah tabel tersebut tanpa menulis SQL untuk setiap endpoint.
- **schema.prisma** menjelaskan bentuk tabel; **migrasi** membuat tabelnya.
- **Prisma Client** adalah kode hasil generate yang menyediakan fungsi untuk mengakses tabel.

Alurnya: tombol web → fetch → route Express → controller → model → Prisma → Neon → respons → tabel web diperbarui.

| Operasi | Fungsi Prisma pada model |
| --- | --- |
| Ambil semua | prisma.buku.findMany() |
| Cari satu berdasarkan ID | prisma.buku.findUnique() |
| Tambah | prisma.buku.create() |
| Edit | prisma.buku.update() |
| Hapus | prisma.buku.delete() |

Query database tidak selesai seketika. Karena itu controller menggunakan **async/await**: tunggu hasil query sebelum mengirim respons ke browser. Express 5 meneruskan error dari handler async ke penanganan error pada app.js.

ID dibuat otomatis oleh PostgreSQL. Nomornya tidak harus berurutan rapat setelah ada data dihapus; selalu gunakan ID hasil respons POST.

File JSON di versi-json-lama hanya arsip. Aplikasi baru tidak membaca atau menulis file itu. Dokumentasi dan screenshot lama belum menjadi bukti koneksi Neon. Folder tests memeriksa perilaku API dengan model tiruan, tanpa memakai akun Neon atau mengubah data asli.
