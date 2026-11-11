import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

const sample = { judul: 'Belajar Express', penulis: 'Ata', kategori: 'Teknologi', tahun: 2026, status: 'Tersedia' };

test('CRUD, validasi, persistence, dan respons error', async (t) => {
  // Pengujian memakai folder sementara; koleksi milik pengguna tidak diubah.
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'bukukita-test-'));
  const dataFile = path.join(temporary, 'buku.json');
  fs.writeFileSync(dataFile, JSON.stringify({ nextId: 1, data: [] }));
  const server = createApp({ dataFile }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((e) => e ? reject(e) : resolve()));
    fs.rmSync(temporary, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = async (method, suffix = '', body) => {
    const response = await fetch(`${base}/api/buku${suffix}`, {
      method, ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    return { status: response.status, json: await response.json(), headers: response.headers };
  };

  await t.test('GET seluruh data dan halaman statis', async () => {
    const list = await send('GET');
    assert.equal(list.status, 200);
    assert.deepEqual(list.json.data, []);
    const web = await fetch(base);
    assert.equal(web.status, 200);
    assert.match(await web.text(), /BukuKita/);
  });
  let id;
  await t.test('POST menambah dengan ID server dan trimming', async () => {
    const result = await send('POST', '', { ...sample, id: 999, judul: '  Belajar Express  ' });
    assert.equal(result.status, 201);
    id = result.json.data.id;
    assert.equal(id, 1);
    assert.equal(result.json.data.judul, sample.judul);
    assert.equal(result.headers.get('location'), `/api/buku/${id}`);
  });
  await t.test('PUT mengganti seluruh field tanpa mengganti ID', async () => {
    const result = await send('PUT', `/${id}`, { ...sample, judul: 'Belajar Express Edisi Revisi', status: 'Dipinjam' });
    assert.equal(result.status, 200);
    assert.equal(result.json.data.id, id);
    assert.equal(result.json.data.status, 'Dipinjam');
    assert.equal((await send('GET', `/${id}`)).json.data.judul, 'Belajar Express Edisi Revisi');
  });
  await t.test('data terbaca oleh instance baru dari file yang sama', async () => {
    const second = createApp({ dataFile }).listen(0, '127.0.0.1');
    await once(second, 'listening');
    try {
      const result = await fetch(`http://127.0.0.1:${second.address().port}/api/buku`);
      assert.equal((await result.json()).data[0].status, 'Dipinjam');
    } finally { await new Promise((resolve) => second.close(resolve)); }
  });
  await t.test('input salah ditolak tanpa mengubah data', async () => {
    for (const body of [null, [], {}, { ...sample, judul: '   ' }, { ...sample, penulis: 42 }, { ...sample, tahun: '2026' }, { ...sample, tahun: 2.5 }, { ...sample, kategori: 'Lainnya' }, { ...sample, status: 'Hilang' }]) {
      assert.equal((await send('POST', '', body)).status, 400);
    }
    assert.equal((await send('PUT', `/${id}`, { judul: 'Belum lengkap' })).status, 400);
    assert.equal((await send('GET')).json.total, 1);
  });
  await t.test('JSON rusak, Content-Type, ukuran body, ID dan rute', async () => {
    assert.equal((await fetch(`${base}/api/buku`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
    assert.equal((await fetch(`${base}/api/buku`, { method: 'POST', body: 'judul=buku' })).status, 415);
    assert.equal((await send('POST', '', { ...sample, judul: 'x'.repeat(22000) })).status, 413);
    for (const value of ['abc', '-1', '1.5', '0']) assert.equal((await send('DELETE', `/${value}`)).status, 400);
    assert.equal((await send('PUT', '/999', sample)).status, 404);
    assert.equal((await fetch(`${base}/api/tidak-ada`)).status, 404);
  });
  await t.test('DELETE menghapus dan ID tidak dipakai ulang', async () => {
    assert.equal((await send('DELETE', `/${id}`)).status, 200);
    assert.equal((await send('GET')).json.total, 0);
    assert.equal((await send('GET', `/${id}`)).status, 404);
    assert.equal((await send('DELETE', `/${id}`)).status, 404);
    assert.equal((await send('POST', '', sample)).json.data.id, 2);
  });
});
