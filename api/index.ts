import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { documents, users } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.split('?')[0] || '';

  try {
    if (method === 'GET' && path === '/api/documents') {
      const allDocuments = await db.select().from(documents).orderBy(desc(documents.id));
      return res.status(200).json(allDocuments);
    }

    if (method === 'POST' && path === '/api/documents') {
      const body = req.body;
      const lastDoc = await db.select().from(documents).orderBy(desc(documents.id)).limit(1);
      const nextId = lastDoc.length > 0 ? lastDoc[0].id + 1 : 1;
      const documentCodes: Record<string, string> = {'KTP':'001','KIA':'002','Kartu Keluarga':'003','Pindah Keluar':'004','Pindah Datang':'005','Akte Lahir':'006','Akte Kematian':'007','Akte Kawin':'008','Akte Cerai':'009','DLL':'010'};
      const docCode = documentCodes[body.jenisDokumen] || '010';
      const dateObj = new Date(body.tanggal);
      const month = dateObj.getMonth() + 1;
      const romanMonths = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      const romanMonth = romanMonths[month - 1];
      const year = dateObj.getFullYear();
      const nomorRegister = `${String(nextId).padStart(4,'0')}/${docCode}/${romanMonth}/${year}`;
      const [newDoc] = await db.insert(documents).values({...body,nomorRegister}).returning();
      return res.status(201).json(newDoc);
    }

    if (method === 'PATCH' && path.startsWith('/api/documents/')) {
      const id = parseInt(path.split('/').pop() || '0');
      const [updated] = await db.update(documents).set(req.body).where(eq(documents.id, id)).returning();
      if (!updated) return res.status(404).json({ error: "Document not found" });
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
      // Support both plaintext (legacy) and bcrypt hashed passwords
      const isPasswordValid = user.password.startsWith('$2b$') || user.password.startsWith('$2a$')
      ? await bcrypt.compare(password, user.password)  // Bcrypt hash
      : password === user.password;  // Plaintext (legacy)
      if (!isPasswordValid) return res.status(401).json({ error: "Username atau password salah" });
      // Support both bcrypt hashed passwords (new users) and plaintext passwords (legacy users)
const isPasswordValid = user.password.startsWith('$2b$') || user.password.startsWith('$2a$')
  ? await bcrypt.compare(password, user.password)  // Bcrypt hash
  : password === user.password;  // Plaintext (legacy)
    }

    if (method === 'GET' && path === '/api/users') {
      const allUsers = await db.select({id:users.id,username:users.username,role:users.role}).from(users);
      return res.status(200).json(allUsers);
    }

    if (method === 'POST' && path === '/api/users') {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const [newUser] = await db.insert(users).values({...req.body, password: hashedPassword}).returning({id:users.id,username:users.username,role:users.role});
      return res.status(201).json(newUser);
    }

    if (method === 'PATCH' && path.startsWith('/api/users/')) {
      const id = path.split('/').pop() || '';
      const { password, ...updateData } = req.body;
      const dataToUpdate = password ? { ...updateData, password: await bcrypt.hash(password, 10) } : updateData;
      const [updated] = await db.update(users).set(dataToUpdate).where(eq(users.id, id)).returning({id:users.id,username:users.username,role:users.role});
      if (!updated) return res.status(404).json({ error: "User not found" });
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
