// ====================================================
//  EduLearn / UserApp - Node.js + PostgreSQL + Railway
// ====================================================

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware bawaan
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ====================================================
// Konfigurasi Upload File
// ====================================================
const uploadPath = process.env.STORAGE_PATH || './uploads';

// Pastikan folder upload tersedia
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ====================================================
// Konfigurasi Database PostgreSQL
// ====================================================
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL belum diatur di file .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Uji koneksi database
pool.connect()
  .then(() => console.log('✅ Terhubung ke Database PostgreSQL!'))
  .catch(err => console.error('❌ Gagal konek ke Database:', err.message));

// ====================================================
// Routing
// ====================================================

// 🔹 Halaman Utama (Form Input)
app.get('/', (req, res) => {
  res.send(`
    <h2>📋 Form Input Data Pengguna</h2>
    <form action="/users" method="POST" enctype="multipart/form-data">
      <input type="text" name="nama" placeholder="Nama" required><br><br>
      <input type="email" name="email" placeholder="Email" required><br><br>
      <input type="file" name="file"><br><br>
      <button type="submit">Simpan</button>
    </form>
    <br>
    <a href="/list">📄 Lihat Data Pengguna</a>
  `);
});

// 🔹 Proses Simpan Data ke Database
app.post('/users', upload.single('file'), async (req, res) => {
  try {
    const { nama, email } = req.body;
    const filePath = req.file ? `uploads/${req.file.filename}` : null;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nama TEXT,
        email TEXT,
        file_path TEXT
      )
    `);

    await pool.query(
      'INSERT INTO users (nama, email, file_path) VALUES ($1, $2, $3)',
      [nama, email, filePath]
    );

    res.send(`
      ✅ Data berhasil disimpan!<br>
      <a href="/">⬅️ Kembali ke Form</a><br>
      <a href="/list">📄 Lihat Data</a>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal menyimpan data.');
  }
});

// 🔹 Tampilkan Semua Data dalam Bentuk HTML
app.get('/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id DESC');

    let html = `
      <h2>📄 Daftar Pengguna</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr style="background:#f2f2f2;">
          <th>ID</th>
          <th>Nama</th>
          <th>Email</th>
          <th>File</th>
        </tr>
    `;

    for (const row of result.rows) {
      html += `
        <tr>
          <td>${row.id}</td>
          <td>${row.nama}</td>
          <td>${row.email}</td>
          <td>${row.file_path ? `<a href="/${row.file_path}" target="_blank">Lihat File</a>` : '-'}</td>
        </tr>
      `;
    }

    html += `
      </table>
      <br>
      <a href="/">⬅️ Kembali ke Form</a>
    `;

    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal mengambil data dari database.');
  }
});

// ====================================================
// Akses File Upload dari Browser
// ====================================================
app.use('/uploads', express.static('uploads'));

// ====================================================
// Jalankan Server
// ====================================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

