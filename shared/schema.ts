import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('cs'),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const documents = pgTable("documents", {
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

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  nomorRegister: true, // Generated server-side
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
