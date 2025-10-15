import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, Response, NextFunction } from "express";
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { pgTable, text, varchar, serial, date } from "drizzle-orm/pg-core";
import { eq, desc, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Schema definitions (inline)
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

const insertUserSchema = createInsertSchema(users).omit({ id: true });
const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, nomorRegister: true });

// Initialize database
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { documents, users } });

let app: express.Express | null = null;

function getApp(): express.Express {
  if (app) return app;

  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
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
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Terjadi kesalahan saat login" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const allDocuments = await db.select().from(documents).orderBy(desc(documents.id));
      res.json(allDocuments);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      
      const lastDoc = await db.select().from(documents).orderBy(desc(documents.id)).limit(1);
      const nextId = lastDoc.length > 0 ? lastDoc[0].id + 1 : 1;
      
      const documentCodes: Record<string, string> = {
        'KTP': '001', 'KIA': '002', 'Kartu Keluarga': '003',
        'Pindah Keluar': '004', 'Pindah Datang': '005',
        'Akte Lahir': '006', 'Akte Kematian': '007',
        'Akte Kawin': '008', 'Akte Cerai': '009', 'DLL': '010'
      };
      
      const docCode = documentCodes[validatedData.jenisDokumen] || '010';
      const date = new Date(validatedData.tanggal);
      const month = date.getMonth() + 1;
      const romanMonths = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      const romanMonth = romanMonths[month - 1];
...
      
      const dataToUpdate = password ? { ...updateData, password } : updateData;
      
      const [updated] = await db
        .update(users)
        .set(dataToUpdate)
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          role: users.role,
        });
      
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await db.delete(users).where(eq(users.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = getApp();
  return app(req as any, res as any);
}
