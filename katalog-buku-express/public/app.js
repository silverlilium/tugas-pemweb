const form = document.querySelector('#buku-form');
const table = document.querySelector('#daftar-buku');
const message = document.querySelector('#pesan');
const saveButton = document.querySelector('#simpan');
const cancelButton = document.querySelector('#batal');
const refreshButton = document.querySelector('#muat-ulang');
const dialog = document.querySelector('#delete-dialog');
const deleteButton = document.querySelector('#delete-confirm');
let books = [];
let editingId = null;
let pendingDelete = null;
let busy = false;

function notify(text, error = false) {
  message.textContent = text;
  message.classList.toggle('error', error);
  message.hidden = false;
}

async function request(url = '/api/buku', options = {}) {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) {
    const details = result.errors ? ` ${Object.values(result.errors).join(' ')}` : '';
    throw new Error(`${result.message}${details}`);
  }
  return result;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Seluruh input ditampilkan memakai textContent, bukan HTML mentah.
function render() {
  document.querySelector('#total').textContent = books.length;
  document.querySelector('#tersedia').textContent = books.filter((b) => b.status === 'Tersedia').length;
  document.querySelector('#dipinjam').textContent = books.filter((b) => b.status === 'Dipinjam').length;
  document.querySelector('#jumlah').textContent = books.length;
  const query = document.querySelector('#cari').value.toLocaleLowerCase('id');
  const status = document.querySelector('#filter').value;
  const visible = books.filter((b) => `${b.judul} ${b.penulis}`.toLocaleLowerCase('id').includes(query) && (!status || b.status === status));
  table.replaceChildren();
  visible.forEach((book) => {
    const row = document.createElement('tr');
    const cell = row.insertCell();
    const bookCell = element('div', 'book-cell');
    const icon = element('span', `book-mark c${(book.id - 1) % 4}`, '▤');
    icon.setAttribute('aria-hidden', 'true');
    const info = element('div');
    info.append(element('span', 'book-title', book.judul), element('span', 'book-author', `${book.penulis} · ${book.tahun}`));
    bookCell.append(icon, info);
    cell.append(bookCell);
    row.insertCell().append(element('span', 'category', book.kategori));
    row.insertCell().append(element('span', `badge${book.status === 'Dipinjam' ? ' loan' : ''}`, book.status));
    const actions = element('div', 'actions');
    for (const [action, label] of [['edit', 'Edit'], ['delete', 'Hapus']]) {
      const button = element('button', `action ${action}`, label);
      button.type = 'button';
      button.dataset.action = action;
      button.dataset.id = book.id;
      button.setAttribute('aria-label', `${label} ${book.judul}`);
      button.disabled = busy;
      actions.append(button);
    }
    row.insertCell().append(actions);
    table.append(row);
  });
  const empty = document.querySelector('#empty');
  empty.hidden = visible.length > 0;
  empty.textContent = books.length ? 'Tidak ada buku yang cocok dengan pencarian.' : 'Koleksi masih kosong. Yuk, tambah buku pertama!';
  document.querySelector('#table-note').textContent = `Menampilkan ${visible.length} dari ${books.length} buku`;
}

// GET: ambil semua buku dan tampilkan pada tabel.
async function loadBooks() {
  const result = await request();
  books = result.data;
  render();
}

function resetForm() {
  editingId = null;
  form.reset();
  document.querySelector('#form-title').textContent = 'Tambah buku';
  document.querySelector('#form-hint').textContent = 'Lengkapi detail buku untuk menambah koleksi.';
  saveButton.textContent = '+ Tambah buku';
  cancelButton.hidden = true;
}

function setBusy(value) {
  busy = value;
  form.querySelectorAll('input, select, button').forEach((node) => { node.disabled = value; });
  refreshButton.disabled = value;
  deleteButton.disabled = value;
  document.querySelector('#delete-cancel').disabled = value;
  table.querySelectorAll('button').forEach((node) => { node.disabled = value; });
}

// POST saat tambah; PUT saat form sedang mengedit buku tertentu.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy) return;
  const payload = {
    judul: form.elements.judul.value.trim(), penulis: form.elements.penulis.value.trim(),
    kategori: form.elements.kategori.value, tahun: Number(form.elements.tahun.value), status: form.elements.status.value,
  };
  if (!payload.judul || !payload.penulis) return notify('Judul dan penulis tidak boleh hanya spasi.', true);
  const url = editingId === null ? '/api/buku' : `/api/buku/${editingId}`;
  const method = editingId === null ? 'POST' : 'PUT';
  setBusy(true);
  try {
    const result = await request(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    resetForm();
    notify(result.message);
    try { await loadBooks(); } catch { notify(`${result.message} Tabel gagal dimuat ulang. Klik Muat ulang.`, true); }
  } catch (error) { notify(error.message, true); }
  finally { setBusy(false); }
});

table.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || busy) return;
  const book = books.find((b) => b.id === Number(button.dataset.id));
  if (!book) return;
  if (button.dataset.action === 'edit') {
    editingId = book.id;
    for (const key of ['judul', 'penulis', 'kategori', 'tahun', 'status']) form.elements[key].value = book[key];
    document.querySelector('#form-title').textContent = 'Edit buku';
    document.querySelector('#form-hint').textContent = `Mengubah buku #${book.id}. Lengkapi data, lalu simpan.`;
    saveButton.textContent = 'Simpan perubahan';
    cancelButton.hidden = false;
    form.elements.judul.focus();
  } else {
    pendingDelete = book.id;
    document.querySelector('#delete-text').textContent = `“${book.judul}” oleh ${book.penulis}`;
    dialog.showModal();
  }
});

// DELETE hanya dijalankan setelah pengguna mengonfirmasi di dialog.
deleteButton.addEventListener('click', async () => {
  if (pendingDelete === null || busy) return;
  const id = pendingDelete;
  setBusy(true);
  try {
    const result = await request(`/api/buku/${id}`, { method: 'DELETE' });
    if (editingId === id) resetForm();
    dialog.close();
    notify(result.message);
    try { await loadBooks(); } catch { notify(`${result.message} Tabel gagal dimuat ulang. Klik Muat ulang.`, true); }
  } catch (error) { dialog.close(); notify(error.message, true); }
  finally { setBusy(false); }
});
dialog.addEventListener('cancel', (event) => { if (busy) event.preventDefault(); });
dialog.addEventListener('close', () => { pendingDelete = null; });
document.querySelector('#delete-cancel').addEventListener('click', () => dialog.close());
cancelButton.addEventListener('click', resetForm);
document.querySelector('#cari').addEventListener('input', render);
document.querySelector('#filter').addEventListener('change', render);
refreshButton.addEventListener('click', async () => {
  setBusy(true);
  try { await loadBooks(); notify('Koleksi berhasil dimuat ulang.'); }
  catch (error) { notify(error.message, true); }
  finally { setBusy(false); }
});
loadBooks().catch((error) => { notify(error.message, true); document.querySelector('#table-note').textContent = 'Data gagal dimuat.'; });
