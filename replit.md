# PECEL DUKCAPIL - Pelacakan Cepat Layanan Dukcapil Kota Kotamobagu

## Overview

**PECEL DUKCAPIL** (Pelacakan Cepat Layanan Dukcapil) is an online document tracking system for the Population and Civil Registration Office (DISDUKCAPIL) of Kotamobagu City. It manages and tracks population documents such as KTP, KIA, Kartu Keluarga, Pindah Keluar, Pindah Datang, Akte Lahir, Akte Kematian, Akte Kawin, Akte Cerai, and DLL.

## System Architecture

### Frontend
- React + TypeScript with Vite
- Wouter for routing (Home, Dashboard, Analytics)
- TanStack Query for server state
- Radix UI / shadcn components
- Tailwind CSS with green/white government color scheme
- Plus Jakarta Sans typeface
- WebSocket for real-time updates

### Backend
- Express.js with TypeScript
- PostgreSQL via Drizzle ORM (Replit built-in database)
- Session-based auth with connect-pg-simple
- bcrypt password hashing
- WebSocket server for real-time document updates
- Role-based access control (CS, Operator, Super Admin)

### Database Schema
- `users`: id (varchar UUID), username, password (hashed), role
- `documents`: id (serial), tanggal, nama, nomorHP, email, alamat, nomorRegister (auto-generated), jenisDokumen, keteranganDLL, status, keterangan, namaCS, namaOperator, createdBy

## Key Features
- Public document tracking (no login required)
- Role-based access: CS (create/edit own docs), Operator (update status only), Super Admin (full access)
- Auto-generated register numbers (format: 0001/001/X/2025)
- Real-time WebSocket notifications
- Dashboard with auto-scrolling tables by status
- Analytics page with charts (recharts)
- CSV export with filters
- Print receipt/bukti penerimaan
- Column-based filtering and search

## User Accounts (Seeded)
- CS: Siti Aminah (siti123), Rina Melati (rina123)
- Operator: Andi Wijaya (andi123), Budi Hartono (budi123)
- Super Admin: Admin Dukcapil (admin123)

## File Structure
- `shared/schema.ts` - Drizzle schema + types
- `shared/validation.ts` - Zod validation schemas
- `server/index.ts` - Express app with session setup
- `server/routes.ts` - API routes
- `server/storage.ts` - Database operations (DbStorage)
- `server/auth.ts` - bcrypt + auth middleware
- `server/websocket.ts` - WebSocket manager
- `server/seed.ts` - Database seeding
- `server/registerUtils.ts` - Register number generation
- `client/src/pages/Home.tsx` - Main document table page
- `client/src/pages/Dashboard.tsx` - Public dashboard with auto-scroll
- `client/src/pages/Analytics.tsx` - Charts and statistics
- `client/src/components/` - All dialog and UI components
