import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../../src/app.js';
import { createBukuModel } from '../../src/models/buku.model.js';

const buku = { judul: 'Belajar Express', penulis: 'Ata', kategori: 'Teknologi', tahun: 2026, status: 'Tersedia' };

// Model tiruan bersifat async untuk memeriksa apakah controller menunggu query.
// Ini tidak menguji koneksi Neon dan tidak mengubah database asli.
function modelTiruan() {
  let rows = [];
  let nextId = 1;
  return {
    async all() { return rows; },
    async find(id) { return rows.find(b => b.id === id) || null; },
    async create(data) { const row = { id: nextId++, ...data }; rows.push(row); return row; },
    async update(id, data) { const i = rows.findIndex(b => b.id === id); if (i === -1) return null; return rows[i] = { id, ...data }; },
    async delete(id) { const row = rows.find(b => b.id === id); rows = rows.filter(b => b.id !== id); return row || null; },
  };
}

async function serve(t, model) {
  const server = createApp({ model }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  return async (method, route, body) => {
    const response = await fetch(base + route, { method,
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    return { status: response.status, body: await response.json() };
  };
}

test('GET, POST, PUT, DELETE menunggu hasil query async', async t => {
  const send = await serve(t, modelTiruan());
  assert.deepEqual((await send('GET', '/api/buku')).body.data, []);
  const created = await send('POST', '/api/buku', buku);
  assert.equal(created.status, 201);
  const id = created.body.data.id;
  assert.equal((await send('GET', '/api/buku')).body.total, 1);
  const updated = await send('PUT', `/api/buku/${id}`, { ...buku, status: 'Dipinjam' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.status, 'Dipinjam');
  assert.equal((await send('GET', `/api/buku/${id}`)).body.data.status, 'Dipinjam');
  assert.equal((await send('DELETE', `/api/buku/${id}`)).status, 200);
  assert.equal((await send('GET', '/api/buku')).body.total, 0);
  assert.equal((await send('GET', `/api/buku/${id}`)).status, 404);
  assert.equal((await send('DELETE', `/api/buku/${id}`)).status, 404);
});

test('validasi input dan ID sebelum query ke PostgreSQL', async t => {
  const send = await serve(t, modelTiruan());
  for (const body of [{}, null, [], { ...buku, judul: '  ' }, { ...buku, tahun: '2026' }, { ...buku, kategori: 'Salah' }, { ...buku, status: 'Salah' }]) {
    assert.equal((await send('POST', '/api/buku', body)).status, 400);
  }
  for (const id of ['0','abc','-1','1.5','2147483648']) {
    assert.equal((await send('DELETE', `/api/buku/${id}`)).status, 400);
  }
  assert.equal((await send('PUT', '/api/buku/1', buku)).status, 404);
});

test('error koneksi dari Promise diteruskan sebagai 503', async t => {
  const send = await serve(t, { async all() { throw Object.assign(new Error('database offline'), { code: 'P1001' }); } });
  const result = await send('GET', '/api/buku');
  assert.equal(result.status, 503);
  assert.match(result.body.message, /Neon/);
});

test('model memakai fungsi Prisma dan menangani P2025', async () => {
  const calls = [];
  const client = { buku: Object.fromEntries(['findMany','findUnique','create','update','delete'].map(name => [name, async args => { calls.push({ name, args }); return { id: 3, ...buku }; }])) };
  const model = createBukuModel(client);
  await model.all(); await model.find(3); await model.create(buku); await model.update(3, buku); await model.delete(3);
  assert.deepEqual(calls.map(c => c.name), ['findMany','findUnique','create','update','delete']);
  assert.deepEqual(calls[0].args, { orderBy: { id: 'asc' } });
  assert.deepEqual(calls[1].args, { where: { id: 3 } });
  assert.deepEqual(calls[2].args, { data: buku });
  assert.deepEqual(calls[3].args, { where: { id: 3 }, data: buku });
  client.buku.update = client.buku.delete = async () => { throw { code: 'P2025' }; };
  assert.equal(await model.update(3, buku), null);
  assert.equal(await model.delete(3), null);
  client.buku.update = async () => { throw { code: 'P1001' }; };
  await assert.rejects(model.update(3, buku), e => e.code === 'P1001');
});
