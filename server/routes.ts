import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comparePassword, requireAuth, requireRole } from "./auth";
import { asyncHandler, validateBody, validateQuery } from "./middleware";
import { loginSchema, createDocumentSchema, updateDocumentSchema, createUserSchema, updateUserSchema, paginationSchema, documentFilterSchema } from "@shared/validation";
import { wsManager } from "./websocket";
import { paginate, applySort } from "./utils/pagination";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", validateBody(loginSchema), asyncHandler(async (req: any, res: any) => {
    const { username, password } = req.body;

    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  app.post("/api/auth/logout", asyncHandler(async (req: any, res: any) => {
    req.session.destroy((err: any) => {
      if (err) {
        throw new Error("Logout gagal");
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout berhasil" });
    });
  }));

  app.get("/api/auth/me", requireAuth, asyncHandler(async (req: any, res: any) => {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  app.get("/api/users", requireAuth, requireRole('superadmin'), asyncHandler(async (req: any, res: any) => {
    const users = await storage.getAllUsers();
    res.json(users);
  }));

  app.get("/api/users/by-role/:role", asyncHandler(async (req: any, res: any) => {
    const role = req.params.role;
    const validRoles = ['cs', 'operator', 'superadmin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Role tidak valid" });
    }
    
    const allUsers = await storage.getAllUsers();
    const filteredUsers = allUsers.filter(user => user.role === role);
    
    const userList = filteredUsers.map(user => ({
      username: user.username,
      role: user.role
    }));
    
    res.json(userList);
  }));

  app.post("/api/users", requireAuth, requireRole('superadmin'), validateBody(createUserSchema), asyncHandler(async (req: any, res: any) => {
    const newUser = await storage.createUser(req.body);
    res.status(201).json(newUser);
  }));

  app.patch("/api/users/:id", requireAuth, requireRole('superadmin'), validateBody(updateUserSchema), asyncHandler(async (req: any, res: any) => {
    const id = req.params.id;
    const updatedUser = await storage.updateUser(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    res.json(updatedUser);
  }));

  app.delete("/api/users/:id", requireAuth, requireRole('superadmin'), asyncHandler(async (req: any, res: any) => {
    const id = req.params.id;
    
    if (id === req.session.userId) {
      return res.status(400).json({ error: "Tidak dapat menghapus akun sendiri" });
    }
    
    await storage.deleteUser(id);
    res.status(204).send();
  }));

  app.get("/api/documents", asyncHandler(async (req: any, res: any) => {
    let documents = await storage.getAllDocuments();
    
    const { status, jenisDokumen, alamat, namaCS, namaOperator, tanggalMulai, tanggalSelesai, search } = req.query;
    
    if (status) {
      documents = documents.filter(doc => doc.status === status);
    }
    
    if (jenisDokumen) {
      documents = documents.filter(doc => doc.jenisDokumen === jenisDokumen);
    }
    
    if (alamat) {
      documents = documents.filter(doc => doc.alamat === alamat);
    }
    
    if (namaCS) {
      documents = documents.filter(doc => doc.namaCS.toLowerCase().includes(namaCS.toLowerCase()));
    }
    
    if (namaOperator) {
      documents = documents.filter(doc => doc.namaOperator?.toLowerCase().includes(namaOperator.toLowerCase()));
    }
    
    if (tanggalMulai) {
      const startDate = new Date(tanggalMulai);
      documents = documents.filter(doc => new Date(doc.tanggal) >= startDate);
    }
    
    if (tanggalSelesai) {
      const endDate = new Date(tanggalSelesai);
      documents = documents.filter(doc => new Date(doc.tanggal) <= endDate);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      documents = documents.filter(doc => 
        doc.nama.toLowerCase().includes(searchLower) ||
        doc.nomorRegister.toLowerCase().includes(searchLower) ||
        doc.email.toLowerCase().includes(searchLower) ||
        doc.nomorHP.includes(search)
      );
    }
    
    const { sortBy, sortOrder } = req.query;
    if (sortBy) {
      documents = applySort(documents, sortBy, sortOrder || 'asc');
    }
    
    const { page, limit } = req.query;
    if (page && limit) {
      const paginatedResult = paginate(documents, parseInt(page), parseInt(limit));
      return res.json(paginatedResult);
    }
    
    res.json(documents);
  }));

  app.get("/api/documents/:id", asyncHandler(async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID dokumen tidak valid" });
    }
    
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    }
    res.json(document);
  }));

  app.post("/api/documents", requireAuth, requireRole('cs', 'superadmin'), validateBody(createDocumentSchema), asyncHandler(async (req: any, res: any) => {
    const documentData = {
      ...req.body,
      createdBy: req.session.userId,
      namaCS: req.session.username
    };
    
    const newDocument = await storage.createDocument(documentData);
    
    wsManager.broadcastDocumentUpdate(newDocument);
    
    res.status(201).json(newDocument);
  }));

  app.patch("/api/documents/:id", requireAuth, validateBody(updateDocumentSchema), asyncHandler(async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID dokumen tidak valid" });
    }
    
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    }
    
    if (req.session.userRole === 'operator') {
      const allowedFields = ['status', 'keterangan', 'namaOperator'];
      const requestedFields = Object.keys(req.body);
      const unauthorizedFields = requestedFields.filter(field => !allowedFields.includes(field));
      
      if (unauthorizedFields.length > 0) {
        return res.status(403).json({ 
          error: "Operator hanya dapat mengubah status dokumen, tidak dapat mengubah data dokumen",
          unauthorizedFields 
        });
      }
    }
    
    if (req.session.userRole === 'cs' && document.createdBy !== req.session.userId) {
      return res.status(403).json({ error: "Anda tidak memiliki akses untuk mengubah dokumen ini" });
    }
    
    const updatedDocument = await storage.updateDocument(id, req.body);
    
    wsManager.broadcastDocumentUpdate(updatedDocument);
    
    if (req.body.status && req.body.status !== document.status) {
      wsManager.notifyUser(document.createdBy, {
        type: 'status_change',
        message: `Status dokumen #${document.nomorRegister} berubah menjadi ${req.body.status}`,
        documentId: id,
        oldStatus: document.status,
        newStatus: req.body.status
      });
    }
    
    res.json(updatedDocument);
  }));

  app.delete("/api/documents/:id", requireAuth, requireRole('cs', 'superadmin'), asyncHandler(async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID dokumen tidak valid" });
    }
    
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    }
    
    if (req.session.userRole === 'cs' && document.createdBy !== req.session.userId) {
      return res.status(403).json({ error: "Anda tidak memiliki akses untuk menghapus dokumen ini" });
    }
    
    await storage.deleteDocument(id);
    res.status(204).send();
  }));

  const httpServer = createServer(app);

  wsManager.init(httpServer);

  return httpServer;
}
