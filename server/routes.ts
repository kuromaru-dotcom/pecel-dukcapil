import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comparePassword, requireAuth, requireRole } from "./auth";
import { asyncHandler, validateBody, validateQuery } from "./middleware";
import { loginSchema, createDocumentSchema, updateDocumentSchema, createUserSchema, updateUserSchema, paginationSchema, documentFilterSchema } from "@shared/validation";
import { wsManager } from "./websocket";
import { paginate, applySort } from "./utils/pagination";

export async function registerRoutes(app: Express): Promise<Server> {
  // ========== Auth Routes ==========
  
  // POST /api/auth/login - Authenticate user
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

    // Set session data
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.userRole = user.role;

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  // POST /api/auth/logout - Logout user
  app.post("/api/auth/logout", asyncHandler(async (req: any, res: any) => {
    req.session.destroy((err: any) => {
      if (err) {
        throw new Error("Logout gagal");
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout berhasil" });
    });
  }));

  // GET /api/auth/me - Get current user
  app.get("/api/auth/me", requireAuth, asyncHandler(async (req: any, res: any) => {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));

  // ========== User Routes ==========
  
  // GET /api/users - Get all users (Super Admin only)
  app.get("/api/users", requireAuth, requireRole('superadmin'), asyncHandler(async (req: any, res: any) => {
    const users = await storage.getAllUsers();
    res.json(users);
  }));

  // GET /api/users/by-role/:role - Get users by role (for dropdown filters)
  app.get("/api/users/by-role/:role", asyncHandler(async (req: any, res: any) => {
    const role = req.params.role;
    const validRoles = ['cs', 'operator', 'superadmin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Role tidak valid" });
    }
    
    const allUsers = await storage.getAllUsers();
    const filteredUsers = allUsers.filter(user => user.role === role);
    
    // Return only username and role for dropdown
    const userList = filteredUsers.map(user => ({
      username: user.username,
      role: user.role
    }));
    
    res.json(userList);
  }));

  // POST /api/users - Create new user (Super Admin only)
  app.post("/api/users", requireAuth, requireRole('superadmin'), validateBody(createUserSchema), asyncHandler(async (req: any, res: any) => {
    const newUser = await storage.createUser(req.body);
    res.status(201).json(newUser);
  }));

  // PATCH /api/users/:id - Update user (Super Admin only)
  app.patch("/api/users/:id", requireAuth, requireRole('superadmin'), validateBody(updateUserSchema), asyncHandler(async (req: any, res: any) => {
    const id = req.params.id;
    const updatedUser = await storage.updateUser(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    res.json(updatedUser);
  }));

  // DELETE /api/users/:id - Delete user (Super Admin only)
  app.delete("/api/users/:id", requireAuth, requireRole('superadmin'), asyncHandler(async (req: any, res: any) => {
    const id = req.params.id;
    
    // Prevent deleting self
    if (id === req.session.userId) {
      return res.status(400).json({ error: "Tidak dapat menghapus akun sendiri" });
    }
    
    await storage.deleteUser(id);
    res.status(204).send();
  }));

  // ========== Document Routes ==========
  
  // GET /api/documents - Get all documents (with optional filters and pagination)
  app.get("/api/documents", asyncHandler(async (req: any, res: any) => {
    let documents = await storage.getAllDocuments();
    
    // Apply filters
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
    
    // Search across multiple fields
    if (search) {
      const searchLower = search.toLowerCase();
      documents = documents.filter(doc => 
        doc.nama.toLowerCase().includes(searchLower) ||
        doc.nomorRegister.toLowerCase().includes(searchLower) ||
        doc.email.toLowerCase().includes(searchLower) ||
        doc.nomorHP.includes(search)
      );
    }
    
    // Apply sorting
    const { sortBy, sortOrder } = req.query;
    if (sortBy) {
      documents = applySort(documents, sortBy, sortOrder || 'asc');
    }
    
    // Apply pagination if requested
    const { page, limit } = req.query;
    if (page && limit) {
      const paginatedResult = paginate(documents, parseInt(page), parseInt(limit));
      return res.json(paginatedResult);
    }
    
    // Return all documents if no pagination
    res.json(documents);
  }));

  // GET /api/documents/:id - Get single document
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

  // POST /api/documents - Create new document (CS and Super Admin only, NOT Operator)
  app.post("/api/documents", requireAuth, requireRole('cs', 'superadmin'), validateBody(createDocumentSchema), asyncHandler(async (req: any, res: any) => {
    // Auto-set createdBy from session
    const documentData = {
      ...req.body,
      createdBy: req.session.userId,
      namaCS: req.session.username
    };
    
    const newDocument = await storage.createDocument(documentData);
    
    // Broadcast new document to all clients
    wsManager.broadcastDocumentUpdate(newDocument);
    
    res.status(201).json(newDocument);
  }));

  // PATCH /api/documents/:id - Update document
  app.patch("/api/documents/:id", requireAuth, validateBody(updateDocumentSchema), asyncHandler(async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID dokumen tidak valid" });
    }
    
    // Check permissions
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    }
    
    // Operator can ONLY update status, keterangan, and namaOperator
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
    
    // CS can only edit their own documents, unless they're superadmin
    if (req.session.userRole === 'cs' && document.createdBy !== req.session.userId) {
      return res.status(403).json({ error: "Anda tidak memiliki akses untuk mengubah dokumen ini" });
    }
    
    const updatedDocument = await storage.updateDocument(id, req.body);
    
    // Broadcast document update
    wsManager.broadcastDocumentUpdate(updatedDocument);
    
    // If status changed, notify the document owner
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

  // DELETE /api/documents/:id - Delete document
  app.delete("/api/documents/:id", requireAuth, asyncHandler(async (req: any, res: any) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID dokumen tidak valid" });
    }
    
    // Check permissions
    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    }
    
    // CS can only delete their own documents, unless they're superadmin
    if (req.session.userRole === 'cs' && document.createdBy !== req.session.userId) {
      return res.status(403).json({ error: "Anda tidak memiliki akses untuk menghapus dokumen ini" });
    }
    
    await storage.deleteDocument(id);
    res.status(204).send();
  }));

  const httpServer = createServer(app);

  // Initialize WebSocket server
  wsManager.init(httpServer);

  return httpServer;
}
