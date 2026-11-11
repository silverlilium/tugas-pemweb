import { prisma } from '../src/config/prisma.js';

try {
  // Tambah data contoh hanya ketika tabel kosong, tanpa menghapus data.
  if (await prisma.buku.count() > 0) {
    console.log('Tabel sudah berisi buku. Seed dilewati agar data tidak berulang.');
  } else {
    await prisma.buku.createMany({ data: [
      { judul: 'Laskar Pelangi', penulis: 'Andrea Hirata', kategori: 'Novel', tahun: 2005, status: 'Tersedia' },
      { judul: 'Atomic Habits', penulis: 'James Clear', kategori: 'Pengembangan Diri', tahun: 2018, status: 'Dipinjam' },
      { judul: 'Clean Code', penulis: 'Robert C. Martin', kategori: 'Teknologi', tahun: 2008, status: 'Tersedia' },
      { judul: 'Bumi', penulis: 'Tere Liye', kategori: 'Novel', tahun: 2014, status: 'Tersedia' },
    ] });
    console.log('Empat buku contoh berhasil ditambahkan.');
  }
} catch (error) {
  console.error('Seed gagal. Periksa koneksi Neon dan jalankan migrasi dahulu. Kode:', error.code || error.name);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
