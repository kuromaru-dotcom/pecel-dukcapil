# Daftar User Dummy untuk Testing

Berikut adalah daftar user yang sudah terdaftar di sistem PECEL DUKCAPIL. Gunakan username dan password ini untuk login ke aplikasi.

## User Customer Service (CS)

### 1. Siti Aminah
- **Username**: `Siti Aminah`
- **Password**: `siti123`
- **Role**: CS
- **Akses**: 
  - Tambah dokumen baru
  - Edit dokumen yang dibuat sendiri
  - Hapus dokumen yang dibuat sendiri
  - Lihat semua dokumen

### 2. Rina Melati
- **Username**: `Rina Melati`
- **Password**: `rina123`
- **Role**: CS
- **Akses**: 
  - Tambah dokumen baru
  - Edit dokumen yang dibuat sendiri
  - Hapus dokumen yang dibuat sendiri
  - Lihat semua dokumen

## User Operator

### 3. Andi Wijaya
- **Username**: `Andi Wijaya`
- **Password**: `andi123`
- **Role**: Operator
- **Akses**: 
  - Update status dokumen (DIPROSES, DITUNDA, SELESAI)
  - Lihat semua dokumen
  - **Tidak bisa** tambah/edit/hapus dokumen

### 4. Budi Hartono
- **Username**: `Budi Hartono`
- **Password**: `budi123`
- **Role**: Operator
- **Akses**: 
  - Update status dokumen (DIPROSES, DITUNDA, SELESAI)
  - Lihat semua dokumen
  - **Tidak bisa** tambah/edit/hapus dokumen

## User Super Admin

### 5. Admin Dukcapil
- **Username**: `Admin Dukcapil`
- **Password**: `admin123`
- **Role**: Super Admin
- **Akses**: 
  - **Full access** - semua fitur
  - Kelola user (tambah, edit, hapus user)
  - Tambah/edit/hapus dokumen (semua dokumen, bukan hanya milik sendiri)
  - Update status dokumen
  - Export data dengan filter
  - Lihat dashboard

## Cara Login

1. Klik tombol **"Masuk"** di header
2. Masukkan **Username** dan **Password** sesuai daftar di atas
3. Klik **"Login"**
4. Sistem akan otomatis mendeteksi role user dari database

⚠️ **Catatan Keamanan**:
- Password saat ini disimpan dalam **plaintext** untuk keperluan development/testing
- Untuk production deployment, **wajib** implement password hashing (bcrypt/argon2)
- Jangan gunakan password dummy ini untuk production!

## User Publik (Tanpa Login)

Pengguna yang tidak login dapat:
- Lihat daftar dokumen (tanpa info kontak dan nomor register)
- Filter dokumen berdasarkan status dan tanggal
- **Tidak bisa** melihat data sensitif (nomor HP, email, alamat, nomor register)
- **Tidak bisa** tambah/edit/hapus dokumen
