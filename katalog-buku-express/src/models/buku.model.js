import { prisma } from '../config/prisma.js';

// Setiap fungsi mengirim query ke PostgreSQL melalui Prisma.
export function createBukuModel(client = prisma) {
  return {
    all() { return client.buku.findMany({ orderBy: { id: 'asc' } }); },
    find(id) { return client.buku.findUnique({ where: { id } }); },
    create(data) { return client.buku.create({ data }); },
    async update(id, data) {
      try {
        return await client.buku.update({ where: { id }, data });
      } catch (error) {
        if (error.code === 'P2025') return null; // Buku sudah tidak ada.
        throw error;
      }
    },
    async delete(id) {
      try {
        return await client.buku.delete({ where: { id } });
      } catch (error) {
        if (error.code === 'P2025') return null;
        throw error;
      }
    },
  };
}
