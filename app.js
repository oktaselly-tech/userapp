// ====================================================
//  EduLearn / UserApp - Node.js + PostgreSQL + Railway
//  Versi: Modern UI + Preview Gambar + Nomor Urut (ASC)
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
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ====================================================
// Koneksi Database
// ====================================================
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL belum diatur di file .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => console.log('✅ Terhubung ke Database PostgreSQL!'))
  .catch((err) => console.error('❌ Gagal konek ke Database:', err.message));

// ====================================================
// Routing
// ====================================================

// 🔹 Halaman Utama (Form Input)
app.get('/', (req, res) => {
  res.send(`
  <html>
  <head>
    <title>EduLearn Cloud | UserApp</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #1e88e5, #42a5f5);
        color: #333;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .container {
        background: white;
        padding: 30px 40px;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        width: 400px;
        text-align: center;
      }
      h2 {
        color: #1e88e5;
        margin-bottom: 20px;
      }
      input, button {
        width: 100%;
        padding: 10px;
        margin: 8px 0;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      button {
        background: #1e88e5;
        color: white;
        font-weight: bold;
        cursor: pointer;
        border: none;
        transition: 0.3s;
      }
      button:hover {
        background: #1565c0;
      }
      a {
        display: inline-block;
        margin-top: 15px;
        color: #1e88e5;
        text-decoration: none;
        font-weight: bold;
      }
      a:hover {
        text-decoration: underline;
      }
      footer {
        margin-top: 20px;
        font-size: 0.8em;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>📋 Input Data Pengguna</h2>
      <form action="/users" method="POST" enctype="multipart/form-data">
        <input type="text" name="nama" placeholder="Nama" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="file" name="file">
        <button type="submit">💾 Simpan</button>
      </form>
      <a href="/list">📄 Lihat Data Pengguna</a>
      <footer>EduLearn Cloud © 2025</footer>
    </div>
  </body>
  </html>
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
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            text-align: center;
            background: #f0f4ff;
            padding: 60px;
          }
          a {
            display: inline-block;
            padding: 10px 20px;
            background: #1e88e5;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            margin: 5px;
          }
          a:hover { background: #1565c0; }
        </style>
      </head>
      <body>
        <h2>✅ Data Berhasil Disimpan!</h2>
        <a href="/">⬅️ Kembali ke Form</a>
        <a href="/list">📄 Lihat Data</a>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Gagal menyimpan data.');
  }
});

// 🔹 Halaman Daftar Pengguna (Urutan Lama ke Baru + Preview Gambar)
app.get('/list', async (req, res) => {
  try {
    // 🔄 Urutkan dari yang paling lama ke paling baru (ASC)
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');

    let no = 1;
    let rowsHtml = '';
    for (const row of result.rows) {
      let fileHtml = '-';
      if (row.file_path) {
        const ext = path.extname(row.file_path).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          fileHtml = `<img src="/${row.file_path}" 
                            alt="preview" 
                            style="width:80px;height:80px;object-fit:cover;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.2)">`;
        } else {
          fileHtml = `<a href="/${row.file_path}" target="_blank">📎 Lihat File</a>`;
        }
      }

      rowsHtml += `
        <tr>
          <td>${no++}</td>
          <td>${row.nama}</td>
          <td>${row.email}</td>
          <td>${fileHtml}</td>
        </tr>
      `;
    }

    res.send(`
      <html>
      <head>
        <title>Daftar Pengguna</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #e3f2fd;
            padding: 40px;
            text-align: center;
          }
          h2 {
            color: #1565c0;
          }
          table {
            margin: 20px auto;
            border-collapse: collapse;
            width: 90%;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          th, td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
            vertical-align: middle;
          }
          th {
            background: #1976d2;
            color: white;
          }
          tr:nth-child(even) { background: #f9f9f9; }
          tr:hover { background: #f1f1f1; }
          a.button {
            background: #1e88e5;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
            display: inline-block;
          }
          a.button:hover { background: #1565c0; }
        </style>
      </head>
      <body>
        <h2>📋 Daftar Pengguna EduLearn</h2>
        <table>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Email</th>
            <th>File / Gambar</th>
          </tr>
          ${rowsHtml}
        </table>
        <a href="/" class="button">⬅️ Kembali ke Form</a>
      </body>
      </html>
    `);
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
