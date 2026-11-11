export const categories = ['Novel', 'Teknologi', 'Pengembangan Diri', 'Pendidikan'];
const statuses = ['Tersedia', 'Dipinjam'];

function validate(body) {
  const errors = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: { body: 'Body wajib berupa objek JSON.' } };
  }
  for (const [field, limit] of [['judul', 120], ['penulis', 100]]) {
    if (typeof body[field] !== 'string' || !body[field].trim() || body[field].trim().length > limit) {
      errors[field] = `${field} wajib berupa teks, 1–${limit} karakter.`;
    }
  }
  if (!categories.includes(body.kategori)) errors.kategori = `Pilih kategori: ${categories.join(', ')}.`;
  if (!Number.isInteger(body.tahun) || body.tahun < 1000 || body.tahun > 2100) {
    errors.tahun = 'tahun wajib berupa angka bulat antara 1000 dan 2100.';
  }
  if (!statuses.includes(body.status)) errors.status = 'status harus Tersedia atau Dipinjam.';
  if (Object.keys(errors).length) return { errors };
  // Ambil hanya field yang diizinkan; id dari klien tidak digunakan.
  return { data: {
    judul: body.judul.trim(), penulis: body.penulis.trim(),
    kategori: body.kategori, tahun: body.tahun, status: body.status,
  } };
}

export function checkId(req, res, next) {
  const value = req.params.id;
  if (!/^[1-9]\d*$/.test(value) || (!Number.isSafeInteger(Number(value)) || Number(value) > 2147483647)) {
    return res.status(400).json({ success: false, message: 'ID harus bilangan bulat positif.' });
  }
  req.bukuId = Number(value);
  next();
}

export function createBukuController(model) {
  const notFound = (res) => res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
  return {
    async getAll(_req, res) {
      const data = await model.all();
      res.json({ success: true, message: 'Daftar buku berhasil diambil.', data, total: data.length });
    },
    async getOne(req, res) {
      const data = await model.find(req.bukuId);
      if (!data) return notFound(res);
      res.json({ success: true, message: 'Detail buku berhasil diambil.', data });
    },
    async create(req, res) {
      const result = validate(req.body);
      if (result.errors) return res.status(400).json({ success: false, message: 'Periksa kembali data buku.', errors: result.errors });
      const data = await model.create(result.data);
      res.location(`/api/buku/${data.id}`).status(201).json({ success: true, message: 'Buku berhasil ditambahkan.', data });
    },
    async update(req, res) {
      if (!(await model.find(req.bukuId))) return notFound(res);
      const result = validate(req.body);
      if (result.errors) return res.status(400).json({ success: false, message: 'Periksa kembali data buku.', errors: result.errors });
      const data = await model.update(req.bukuId, result.data);
      if (!data) return notFound(res);
      res.json({ success: true, message: 'Buku berhasil diperbarui.', data });
    },
    async delete(req, res) {
      const data = await model.delete(req.bukuId);
      if (!data) return notFound(res);
      res.json({ success: true, message: 'Buku berhasil dihapus.', data });
    },
  };
}
