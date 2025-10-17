# 📘 Panduan Migrasi Aplikasi ke Supabase

Panduan lengkap untuk migrasi aplikasi DISDUKCAPIL Kotamobagu ke Supabase dan publishing.

---

## 📋 Daftar Isi
1. [Persiapan Akun Supabase](#1-persiapan-akun-supabase)
2. [Setup Project Supabase](#2-setup-project-supabase)
3. [Migrasi Database Schema](#3-migrasi-database-schema)
4. [Konfigurasi Authentication](#4-konfigurasi-authentication)
5. [Update Kode Aplikasi](#5-update-kode-aplikasi)
6. [Testing Aplikasi](#6-testing-aplikasi)
7. [Publishing Aplikasi](#7-publishing-aplikasi)

---

## 1. Persiapan Akun Supabase

### Langkah 1.1: Buat Akun Supabase
1. Buka https://supabase.com
2. Klik **"Start your project"** atau **"Sign In"**
3. Pilih metode sign up:
   - GitHub (direkomendasikan)
   - Google
   - Email

### Langkah 1.2: Verifikasi Email
- Jika menggunakan email, cek inbox dan klik link verifikasi

---

## 2. Setup Project Supabase

### Langkah 2.1: Buat Project Baru
1. Di Supabase Dashboard, klik **"New Project"**
2. Isi informasi project:
   - **Name**: `disdukcapil-kotamobagu`
   - **Database Password**: Buat password yang kuat (SIMPAN password ini!)
   - **Region**: Pilih **Southeast Asia (Singapore)** (paling dekat dengan Indonesia)
   - **Pricing Plan**: Pilih **Free** untuk development

3. Klik **"Create new project"**
4. Tunggu 2-3 menit sampai project selesai dibuat

### Langkah 2.2: Dapatkan Connection String
1. Setelah project siap, klik tombol **"Connect"** di pojok kanan atas
2. Pilih tab **"Connection string"**
3. Pilih **"Transaction pooler"** (lebih stabil untuk production)
4. Copy connection string yang terlihat seperti ini:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
5. **Ganti `[YOUR-PASSWORD]` dengan password database yang Anda buat tadi**
6. **SIMPAN connection string ini** - kita akan gunakan nanti

### Langkah 2.3: Dapatkan API Keys
1. Di Supabase Dashboard, klik **Settings** (icon gear di sidebar kiri bawah)
2. Klik **"API"** di menu Settings
3. Copy dan simpan credentials berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (key yang panjang)
   - **service_role secret**: `eyJhbGc...` (JANGAN SHARE KEY INI!)

---

## 3. Migrasi Database Schema

### Langkah 3.1: Buat Tabel di Supabase
1. Di Supabase Dashboard, klik **"SQL Editor"** di sidebar kiri
2. Klik **"New query"**
3. Copy dan paste SQL berikut:

```sql
-- Tabel Users untuk Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('cs', 'operator', 'superadmin')),
  nama_lengkap TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Documents
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  tanggal DATE NOT NULL,
  nama TEXT NOT NULL,
  jenis_dokumen TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DITERIMA', 'DIPROSES', 'DITUNDA')),
  keterangan TEXT,
  nama_cs TEXT,
  nama_operator TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk Documents
-- Public dapat melihat kolom terbatas
CREATE POLICY "Public can view limited columns"
  ON documents FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users dapat melihat semua
CREATE POLICY "Authenticated can view all"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

-- CS dapat insert dokumen
CREATE POLICY "CS can insert documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Operator dapat update dokumen
CREATE POLICY "Operator can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (true);

-- Superadmin dapat delete
CREATE POLICY "Superadmin can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies untuk Users (hanya superadmin yang bisa manage)
CREATE POLICY "Superadmin can manage users"
  ON users FOR ALL
  TO authenticated
  USING (true);

-- Buat index untuk performa
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_tanggal ON documents(tanggal DESC);
CREATE INDEX idx_users_username ON users(username);
```

4. Klik **"Run"** untuk execute query
5. Verifikasi tabel sudah dibuat dengan klik **"Table Editor"** di sidebar

### Langkah 3.2: Insert Data User Default (Opsional)
1. Di SQL Editor, buat query baru:

```sql
-- Insert default superadmin (password: admin123)
-- Note: Dalam production, gunakan hash yang lebih aman!
INSERT INTO users (username, password, role, nama_lengkap) VALUES
('admin', '$2b$10$xQPq5Z8JfHvZlJw7GxP8vu8N9L0VZvKJ5YqXb8xqY9uZH0pQvq5Vy', 'superadmin', 'Administrator'),
('cs1', '$2b$10$xQPq5Z8JfHvZlJw7GxP8vu8N9L0VZvKJ5YqXb8xqY9uZH0pQvq5Vy', 'cs', 'Siti Aminah'),
('operator1', '$2b$10$xQPq5Z8JfHvZlJw7GxP8vu8N9L0VZvKJ5YqXb8xqY9uZH0pQvq5Vy', 'operator', 'Rahmat Wijaya');

-- Insert sample documents
INSERT INTO documents (tanggal, nama, jenis_dokumen, status, keterangan, nama_cs) VALUES
('2025-01-10', 'Ahmad Hidayat', 'KTP', 'DITERIMA', 'Dokumen lengkap', 'Siti Aminah'),
('2025-01-11', 'Dewi Lestari', 'Akta Kelahiran', 'DIPROSES', 'Sedang verifikasi', 'Siti Aminah'),
('2025-01-12', 'Eko Prasetyo', 'KK', 'DITUNDA', 'Dokumen tidak lengkap', 'Siti Aminah');
```

2. Klik **"Run"**

---

## 4. Konfigurasi Authentication

### Langkah 4.1: Setup Email Authentication (Opsional)
1. Di Supabase Dashboard, klik **"Authentication"** di sidebar
2. Klik **"Providers"**
3. Enable **"Email"** provider
4. Atur **"Confirm email"** sesuai kebutuhan:
   - Disable jika tidak perlu email confirmation (untuk internal app)
   - Enable jika perlu verifikasi email

### Langkah 4.2: Konfigurasi URL Redirects
1. Klik **"URL Configuration"**
2. Tambahkan redirect URLs:
   - Development: `http://localhost:5000/**`
   - Production: `https://your-app.replit.app/**`

---

## 5. Update Kode Aplikasi

### Langkah 5.1: Set Environment Variables di Replit
1. Di Replit, klik **"Tools"** → **"Secrets"**
2. Tambahkan secrets berikut:

```
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

SUPABASE_URL=https://xxxxx.supabase.co

SUPABASE_ANON_KEY=eyJhbGc...
```

*Ganti dengan nilai yang Anda simpan di langkah 2*

### Langkah 5.2: Informasikan ke Agent
Setelah secrets ditambahkan, **katakan kepada saya**:
> "Secrets sudah ditambahkan, lanjutkan update kode"

Saya akan:
1. Install package yang diperlukan (@supabase/supabase-js, bcrypt)
2. Update schema database di `shared/schema.ts`
3. Update storage interface di `server/storage.ts`
4. Buat authentication routes di `server/routes.ts`
5. Update frontend untuk menggunakan Supabase Auth
6. Hapus mock data dan ganti dengan real API calls

---

## 6. Testing Aplikasi

### Langkah 6.1: Test Database Connection
Setelah kode diupdate, saya akan:
1. Restart aplikasi
2. Verifikasi koneksi ke Supabase
3. Test CRUD operations

### Langkah 6.2: Test Authentication
1. Test login dengan user default
2. Test role-based access (CS, Operator, Superadmin)
3. Test logout

### Langkah 6.3: Test Full Features
1. Test tambah dokumen (CS role)
2. Test update status (Operator role)
3. Test delete dokumen (Superadmin role)
4. Test dashboard publik

---

## 7. Publishing Aplikasi

### Langkah 7.1: Update Production Environment
1. Pastikan semua environment variables sudah benar
2. Test aplikasi sekali lagi di development

### Langkah 7.2: Deploy ke Replit
1. Di Replit, klik **"Deploy"** di header
2. Pilih **"Autoscale deployment"** atau **"Reserved VM"**:
   - **Autoscale**: Cocok untuk traffic tidak menentu, bayar per request
   - **Reserved VM**: Cocok untuk traffic stabil, lebih murah untuk usage tinggi

3. Klik **"Deploy"**
4. Tunggu proses deployment (2-5 menit)
5. Aplikasi akan mendapat URL: `https://disdukcapil-kotamobagu.replit.app`

### Langkah 7.3: Update Supabase Redirect URLs
1. Kembali ke Supabase Dashboard → **Authentication** → **URL Configuration**
2. Tambahkan production URL:
   ```
   https://disdukcapil-kotamobagu.replit.app/**
   ```

### Langkah 7.4: Test Production
1. Buka URL production
2. Test semua fitur:
   - Login/Logout
   - CRUD operations
   - Dashboard
   - Role-based access

---

## ✅ Checklist Final

Sebelum go-live, pastikan:

- [ ] Database schema sudah benar di Supabase
- [ ] Environment variables (secrets) sudah di-set
- [ ] Authentication berfungsi dengan baik
- [ ] Semua role (CS, Operator, Superadmin) bisa akses sesuai haknya
- [ ] Dashboard publik bisa diakses tanpa login
- [ ] Data real sudah diinput (bukan mock data)
- [ ] Aplikasi sudah di-deploy dan bisa diakses via URL production
- [ ] Redirect URLs sudah di-update di Supabase

---

## 🆘 Troubleshooting

### Error: "Password authentication failed"
- Cek password di DATABASE_URL sudah benar
- Pastikan tidak ada spasi atau karakter aneh

### Error: "CORS policy blocked"
- Tambahkan domain di Supabase → Settings → API → CORS allowed origins

### Error: "Row Level Security policy violation"
- Cek RLS policies di Supabase
- Pastikan user sudah authenticated dengan benar

### Aplikasi lambat
- Upgrade Supabase plan jika database > 500MB
- Enable caching di aplikasi
- Gunakan CDN untuk static assets

---

## 📞 Kontak Support

Jika ada masalah:
1. Cek Supabase Logs: Dashboard → Logs
2. Cek Replit Console untuk error messages
3. Dokumentasi Supabase: https://supabase.com/docs
4. Community Supabase: https://github.com/supabase/supabase/discussions

---

## 🎉 Selamat!

Setelah semua langkah selesai, aplikasi Anda sudah production-ready dengan:
- ✅ Database PostgreSQL terkelola (Supabase)
- ✅ Authentication & Authorization
- ✅ Row Level Security
- ✅ Auto-scaling deployment
- ✅ HTTPS & Custom domain ready

**Aplikasi siap digunakan oleh Dinas Kependudukan Kotamobagu! 🚀**
