import 'dotenv/config';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3000);
const server = createApp().listen(port, () => {
  console.log(`BukuKita berjalan di http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api/buku`);
});
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} sedang dipakai. Hentikan server lain atau gunakan PORT berbeda.`
    : error.message);
  process.exitCode = 1;
});
