import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { pgTable, text, varchar, serial, date } from "drizzle-orm/pg-core";
import { eq, desc, sql } from "drizzle-orm";

// Schema definitions
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

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { documents, users } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.split('?')[0] || '';

  try {
    // Route: GET /api/documents
    if (method === 'GET' && path === '/api/documents') {
      const allDocuments = await db.select().from(documents).orderBy(desc(documents.id));
      return res.status(200).json(allDocuments);
    }

    // Route: POST /api/auth/login
    if (method === 'POST' && path === '/api/auth/login') {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username dan password wajib diisi" });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Username atau password salah" });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    }

    // 404 for other routes (implement other routes as needed)
    return res.status(404).json({ error: "Route not found" });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
