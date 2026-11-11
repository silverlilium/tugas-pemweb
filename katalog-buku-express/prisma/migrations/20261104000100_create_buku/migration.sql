CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "Buku" (
    "id" SERIAL NOT NULL,
    "judul" VARCHAR(120) NOT NULL,
    "penulis" VARCHAR(100) NOT NULL,
    "kategori" VARCHAR(30) NOT NULL,
    "tahun" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Tersedia',
    CONSTRAINT "Buku_pkey" PRIMARY KEY ("id")
);
