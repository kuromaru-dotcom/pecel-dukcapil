import { z } from "zod";

// Document validation schemas
export const createDocumentSchema = z.object({
  tanggal: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggal tidak valid"
  }),
  nama: z.string().min(1, "Nama wajib diisi").max(100, "Nama terlalu panjang"),
  nomorHP: z.string().min(10, "Nomor HP minimal 10 digit").max(15, "Nomor HP terlalu panjang"),
  email: z.string().email("Format email tidak valid"),
  alamat: z.enum(['Kotamobagu Utara', 'Kotamobagu Selatan', 'Kotamobagu Barat', 'Kotamobagu Timur'], {
    errorMap: () => ({ message: "Pilih kecamatan yang valid" })
  }),
  jenisDokumen: z.enum(['KTP', 'KIA', 'Kartu Keluarga', 'Pindah Keluar', 'Pindah Datang', 'Akte Lahir', 'Akte Kematian', 'Akte Kawin', 'Akte Cerai', 'DLL'], {
    errorMap: () => ({ message: "Pilih jenis dokumen yang valid" })
  }),
  keteranganDLL: z.string().optional(),
  status: z.enum(['DITERIMA', 'DIPROSES', 'SELESAI', 'DITUNDA']).default('DITERIMA'),
  keterangan: z.string().default('Menunggu Diproses'),
  namaCS: z.string().min(1, "Nama CS wajib diisi"),
  namaOperator: z.string().default(''),
  createdBy: z.string().min(1, "Created by wajib diisi")
}).refine((data) => {
  // If document type is DLL, keteranganDLL is required
  if (data.jenisDokumen === 'DLL' && !data.keteranganDLL) {
    return false;
  }
  return true;
}, {
  message: "Keterangan DLL wajib diisi untuk jenis dokumen DLL",
  path: ["keteranganDLL"]
});

export const updateDocumentSchema = z.object({
  tanggal: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format tanggal tidak valid"
  }).optional(),
  nama: z.string().min(1).max(100).optional(),
  nomorHP: z.string().min(10).max(15).optional(),
  email: z.string().email().optional(),
  alamat: z.enum(['Kotamobagu Utara', 'Kotamobagu Selatan', 'Kotamobagu Barat', 'Kotamobagu Timur']).optional(),
  jenisDokumen: z.enum(['KTP', 'KIA', 'Kartu Keluarga', 'Pindah Keluar', 'Pindah Datang', 'Akte Lahir', 'Akte Kematian', 'Akte Kawin', 'Akte Cerai', 'DLL']).optional(),
  keteranganDLL: z.string().optional(),
  status: z.enum(['DITERIMA', 'DIPROSES', 'SELESAI', 'DITUNDA']).optional(),
  keterangan: z.string().optional(),
  namaCS: z.string().optional(),
  namaOperator: z.string().optional()
}).partial();

// User validation schemas
export const createUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50, "Username terlalu panjang"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(['cs', 'operator', 'superadmin'], {
    errorMap: () => ({ message: "Pilih role yang valid" })
  }).default('cs')
});

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['cs', 'operator', 'superadmin']).optional()
}).partial();

// Login validation
export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi")
});

// Pagination and filtering schemas
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('10'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const documentFilterSchema = z.object({
  status: z.enum(['DITERIMA', 'DIPROSES', 'SELESAI', 'DITUNDA']).optional(),
  jenisDokumen: z.string().optional(),
  alamat: z.string().optional(),
  namaCS: z.string().optional(),
  namaOperator: z.string().optional(),
  tanggalMulai: z.string().optional(),
  tanggalSelesai: z.string().optional(),
  search: z.string().optional()
});
