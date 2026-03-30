import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { pgTable, text, varchar, serial, date } from "drizzle-orm/pg-core";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from 'bcrypt';

const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('cs'),
});

const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  tanggal: date("tanggal").notNull(),
  nama: text("nama").notNull(),
  nomorHP: text("nomor_hp").notNull(),
  email: text("email").notNull(),
  alamat: text("alamat").notNull(),
  nomorRegister: text("nomor_register").notNull().unique(),
  jenisDokumen: text("jenis_dokumen").notNull(),
  keteranganDLL: text("keterangan_dll"),
  status: text("status").notNull().default('DITERIMA'),
  keterangan: text("keterangan").notNull().default('Menunggu Diproses'),
  namaCS: text("nama_cs").notNull(),
  namaOperator: text("nama_operator").default(''),
  createdBy: text("created_by").notNull(),
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});
const db = drizzle(pool, { schema: { documents, users } });

const documentCodes: Record<string, string> = {
  'KTP': '001', 'KIA': '002', 'Kartu Keluarga': '003',
  'Pindah Keluar': '004', 'Pindah Datang': '005', 'Akte Lahir': '006',
  'Akte Kematian': '007', 'Akte Kawin': '008', 'Akte Cerai': '009', 'DLL': '010'
};

function generateRegisterNumber(id: number, jenisDokumen: string, tanggal: string): string {
  const docCode = documentCodes[jenisDokumen] || '010';
  const dateObj = new Date(tanggal);
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const romanMonth = romanMonths[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${String(id).padStart(4, '0')}/${docCode}/${romanMonth}/${year}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;
  const path = url?.split('?')[0] || '';

  try {
    if (method === 'GET' && path === '/api/documents') {
      const allDocuments = await db.select().from(documents).orderBy(desc(documents.id));
      return res.status(200).json(allDocuments);
    }

    if (method === 'POST' && path === '/api/documents') {
      const body = req.body;
      const [newDoc] = await db.insert(documents).values({
        ...body,
        nomorRegister: `TEMP-${Date.now()}`,
      }).returning();

      const nomorRegister = generateRegisterNumber(newDoc.id, body.jenisDokumen, body.tanggal);
      const [updated] = await db.update(documents)
        .set({ nomorRegister })
        .where(eq(documents.id, newDoc.id))
        .returning();
      return res.status(201).json(updated);
    }

    if (method === 'PATCH' && path.startsWith('/api/documents/')) {
      const id = parseInt(path.split('/').pop() || '0');
      const [updated] = await db.update(documents).set(req.body).where(eq(documents.id, id)).returning();
      if (!updated) return res.status(404).json({ error: "Dokumen tidak ditemukan" });
      return res.status(200).json(updated);
    }

    if (method === 'DELETE' && path.startsWith('/api/documents/')) {
      const id = parseInt(path.split('/').pop() || '0');
      await db.delete(documents).where(eq(documents.id, id));
      return res.status(204).end();
    }

    if (method === 'POST' && path === '/api/auth/login') {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: "Username dan password wajib diisi" });
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (!user) return res.status(401).json({ error: "Username atau password salah" });

      const isPasswordValid = user.password.startsWith('$2b$') || user.password.startsWith('$2a$')
        ? await bcrypt.compare(password, user.password)
        : password === user.password;

      if (!isPasswordValid) return res.status(401).json({ error: "Username atau password salah" });
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    }

    if (method === 'POST' && path === '/api/auth/logout') {
      return res.status(200).json({ message: "Logout berhasil" });
    }

    if (method === 'GET' && path === '/api/auth/me') {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (method === 'GET' && path === '/api/users') {
      const allUsers = await db.select({ id: users.id, username: users.username, role: users.role }).from(users);
      return res.status(200).json(allUsers);
    }

    if (method === 'GET' && path.startsWith('/api/users/by-role/')) {
      const role = path.split('/').pop() || '';
      const validRoles = ['cs', 'operator', 'superadmin'];
      if (!validRoles.includes(role)) return res.status(400).json({ error: "Role tidak valid" });
      const allUsers = await db.select({ username: users.username, role: users.role }).from(users).where(eq(users.role, role));
      return res.status(200).json(allUsers);
    }

    if (method === 'POST' && path === '/api/users') {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const [newUser] = await db.insert(users).values({ ...req.body, password: hashedPassword }).returning({ id: users.id, username: users.username, role: users.role });
      return res.status(201).json(newUser);
    }

    if (method === 'PATCH' && path.startsWith('/api/users/')) {
      const id = path.split('/').pop() || '';
      const { password, ...updateData } = req.body;
      const dataToUpdate = password ? { ...updateData, password: await bcrypt.hash(password, 10) } : updateData;
      const [updated] = await db.update(users).set(dataToUpdate).where(eq(users.id, id)).returning({ id: users.id, username: users.username, role: users.role });
      if (!updated) return res.status(404).json({ error: "User tidak ditemukan" });
      return res.status(200).json(updated);
    }

    if (method === 'DELETE' && path.startsWith('/api/users/')) {
      const id = path.split('/').pop() || '';
      await db.delete(users).where(eq(users.id, id));
      return res.status(204).end();
    }

    return res.status(404).json({ error: "Route not found" });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: "Internal server error", message: error instanceof Error ? error.message : 'Unknown error' });
  }
}
