```markdown
# EduLearn Cloud / UserApp
**Platform as a Service (PaaS) — Node.js + PostgreSQL + Railway**

**Nama:** Selly Okta Ramadhani  
**Kelas:** XII SIJA B  
**Nomor:** 26 / 21202  
**Tanggal:** 07 Oktober 2025  
**Mata Pelajaran:** Sistem Informasi, Jaringan, dan Aplikasi (PaaS)

---

## Deskripsi Proyek

EduLearn Cloud / UserApp adalah aplikasi web berbasis **Node.js + Express + PostgreSQL** yang di-deploy di **Railway.app**.  
Aplikasi ini dirancang untuk mengelola data pengguna melalui formulir input, menyimpan data ke database PostgreSQL, serta mengunggah dan menampilkan file pengguna (termasuk gambar).

Proyek ini merupakan implementasi pembelajaran **Platform as a Service (PaaS)**, dengan fokus pada integrasi database, environment variable, dan storage cloud.

---

## Tujuan Pembelajaran

- Menerapkan konsep integrasi Database dan Storage di PaaS.  
- Menggunakan Environment Variable untuk konfigurasi koneksi cloud.  
- Mengelola file upload dengan penyimpanan persisten di Railway.  
- Memahami proses deployment aplikasi backend ke platform cloud.

---

## Teknologi yang Digunakan

| Komponen | Deskripsi |
|-----------|------------|
| Node.js | Runtime JavaScript server-side |
| Express.js | Framework backend untuk routing dan middleware |
| PostgreSQL | Database relasional (managed oleh Railway) |
| Multer | Middleware untuk menangani upload file |
| dotenv | Mengelola variabel lingkungan |
| Railway.app | Platform cloud hosting (PaaS) untuk aplikasi dan database |

---

## Struktur Folder

```

userapp/
│
├── node_modules/
├── uploads/
├── .env
├── app.js
├── package.json
└── README.md

```

---

## Konfigurasi Environment Variable

Buat file `.env` di root folder, isi dengan konfigurasi berikut:

```

DATABASE_URL=postgresql://user:password@host:port/database
STORAGE_PATH=./uploads
PORT=3000

````

Catatan:
- Gunakan `DATABASE_URL` yang diperoleh dari tab **Variables** di Railway.  
- Jangan commit file `.env` ke GitHub karena berisi data sensitif.

---

## Langkah Menjalankan di Lokal

### 1. Clone Repository
```bash
git clone https://github.com/oktaselly-tech/userapp.git
cd userapp
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Jalankan Server

```bash
node app.js
```

### 4. Akses di Browser

```
http://localhost:3000
```

Jika berhasil, akan muncul pesan:

```
Terhubung ke Database PostgreSQL!
Server berjalan di port 3000
```

---

## Deployment ke Railway

### 1. Login dan Hubungkan GitHub

Masuk ke [https://railway.app](https://railway.app) dan login menggunakan akun GitHub.

### 2. Buat Database PostgreSQL

* Klik **New Project → Provision PostgreSQL**
* Buka tab **Variables** dan salin nilai `DATABASE_URL`
* Tambahkan nilai tersebut ke `.env`

### 3. Deploy Aplikasi dari GitHub

* Klik **New Project → Deploy from GitHub Repo**
* Pilih repository `userapp`
* Railway otomatis membaca `package.json` dan menjalankan `npm install`

### 4. Tambahkan Environment Variables

Masuk ke tab **Settings → Variables**, isi:

```
DATABASE_URL=postgresql://...(dari Railway)
PORT=3000
STORAGE_PATH=/uploads
```

### 5. Tambahkan Volume (Persistent Storage)

Agar file upload tidak hilang setelah redeploy:

* Masuk ke **Resources → + New Volume**
* Isi:

  ```
  Mount Path: /uploads
  Attach To: userapp
  ```
* Klik **Create Volume**

### 6. Generate Domain

Klik **Generate Domain**, lalu masukkan port `3000`.
Aplikasi akan tersedia di URL seperti:

```
https://userapp-production.up.railway.app
```

---

## Tampilan Aplikasi

### Form Input Pengguna

Tampilan form input data dengan kolom:

* Nama
* Email
* Upload File

Tombol: **Simpan**

### Daftar Pengguna

Tabel menampilkan data pengguna dan file upload:

| ID | Nama  | Email                                         | File / Gambar          |
| -- | ----- | --------------------------------------------- | ---------------------- |
| 1  | Selly | [selly@example.com](mailto:selly@example.com) | Gambar tampil langsung |

---

## Konsep PaaS yang Dipraktikkan

| Konsep                   | Penjelasan                                               |
| ------------------------ | -------------------------------------------------------- |
| Managed Database         | PostgreSQL disediakan dan dikelola otomatis oleh Railway |
| Environment Variable     | Menyimpan kredensial dan konfigurasi secara aman         |
| Persistent Volume        | Menjamin file upload tidak hilang setelah redeploy       |
| CI/CD GitHub Integration | Railway otomatis build dan deploy saat repo diperbarui   |

---

## Kriteria Penilaian

| Aspek                      | Bobot | Keterangan                                              |
| -------------------------- | ----- | ------------------------------------------------------- |
| Koneksi Database           | 25%   | Aplikasi berhasil terhubung ke PostgreSQL               |
| Konfigurasi Environment    | 20%   | `.env` dan Railway Variables dikonfigurasi dengan benar |
| Fungsi CRUD & Upload File  | 25%   | Data berhasil disimpan dan ditampilkan                  |
| Penyimpanan File Persisten | 15%   | File tetap tersimpan setelah redeploy                   |
| Dokumentasi & Keamanan     | 15%   | README lengkap, kredensial aman                         |

---

## Informasi Pengembang

| Detail  | Keterangan               |
| ------- | ------------------------ |
| Nama    | Selly Okta Ramadhani     |
| Kelas   | XII SIJA B               |
| Nomor   | 26 / 21202               |
| Proyek  | UserApp                  |
| Tanggal | 07 Oktober 2025          |

---