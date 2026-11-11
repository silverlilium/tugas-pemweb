import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBukuModel } from './models/buku.model.js';
import { createBukuRouter } from './routes/buku.routes.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function createApp({ model = createBukuModel() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    if (['POST', 'PUT'].includes(req.method) && !req.is('application/json')) {
      return res.status(415).json({ success: false, message: 'Gunakan Body raw JSON dan Content-Type: application/json.' });
    }
    next();
  });
  app.use(express.json({ limit: '20kb' }));
  app.use('/api/buku', createBukuRouter(model));
  app.use(express.static(path.join(projectRoot, 'public')));
  app.use((_req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' }));
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ success: false, message: 'Format JSON tidak valid. Periksa tanda kutip dan koma.' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ success: false, message: 'Body terlalu besar. Maksimal 20 KB.' });
    }
    // Jangan mencetak connection string atau password database ke respons.
    console.error('Database/server error:', error.code || error.name);
    if (['P1000', 'P1001', 'P1002', 'P1017', 'P2024'].includes(error.code)) {
      return res.status(503).json({ success: false, message: 'Database belum dapat dihubungi. Periksa .env dan koneksi Neon.' });
    }
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server. Periksa terminal server.' });
  });
  return app;
}
