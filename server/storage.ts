import { type User, type InsertUser, type Document, type InsertDocument, documents as documentsTable, users as usersTable } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { generateRegisterNumber } from "./registerUtils";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getAllUsers(): Promise<Omit<User, 'password'>[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<Omit<User, 'password'>>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<Omit<User, 'password'> | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Document operations
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, doc: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // User operations
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await db.query.users.findMany({
      orderBy: (users, { asc }) => [asc(users.username)],
    });
    // Remove password from response for security
    return users.map(({ password, ...user }) => user);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    });
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<Omit<User, 'password'>> {
    const [user] = await db.insert(usersTable).values(insertUser).returning();
    // Remove password from response for security
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<Omit<User, 'password'> | undefined> {
    const [updated] = await db
      .update(usersTable)
      .set(user)
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) return undefined;
    // Remove password from response for security
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db
      .delete(usersTable)
      .where(eq(usersTable.id, id));
    return true;
  }

  // Document operations
  async getAllDocuments(): Promise<Document[]> {
    return await db.query.documents.findMany({
      orderBy: (documents, { asc }) => [asc(documents.id)],
    });
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return await db.query.documents.findFirst({
      where: (documents, { eq }) => eq(documents.id, id),
    });
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    // Insert document first with a unique temporary register number to get the auto-generated ID
    // Using UUID ensures uniqueness even under concurrent inserts
    const tempRegister = `TEMP-${randomUUID()}`;
    const [document] = await db.insert(documentsTable).values({
      ...doc,
      nomorRegister: tempRegister,
    }).returning();
    
    // Use the database-generated ID as the sequence number (atomic and guaranteed unique)
    const nomorRegister = generateRegisterNumber(document.id, doc.jenisDokumen, doc.tanggal);
    
    // Update with the correct register number
    const [updatedDocument] = await db
      .update(documentsTable)
      .set({ nomorRegister })
      .where(eq(documentsTable.id, document.id))
      .returning();
    
    return updatedDocument;
  }

  async updateDocument(id: number, doc: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updated] = await db
      .update(documentsTable)
      .set(doc)
      .where(eq(documentsTable.id, id))
      .returning();
    return updated;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db
      .delete(documentsTable)
      .where(eq(documentsTable.id, id));
    return true;
  }
}

export const storage = new DbStorage();
