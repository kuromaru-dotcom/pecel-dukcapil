import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, Response, NextFunction } from "express";
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { documents, users } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import { insertDocumentSchema, insertUserSchema } from "../shared/schema";

// Initialize database connection
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
      const year = date.getFullYear();
      const nomorRegister = `${String(nextId).padStart(4, '0')}/${docCode}/${romanMonth}/${year}`;
      
      const [newDoc] = await db.insert(documents).values({
        ...validatedData,
        nomorRegister,
      }).returning();
      
      res.status(201).json(newDoc);
    } catch (error) {
      console.error("Create document error:", error);
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.patch("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const [updated] = await db
        .update(documents)
        .set(req.body)
        .where(eq(documents.id, id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update document error:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(documents).where(eq(documents.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
      }).from(users);
      res.json(allUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const [newUser] = await db.insert(users).values(validatedData).returning({
        id: users.id,
        username: users.username,
        role: users.role,
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { password, ...updateData } = req.body;
      
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
