# PECEL DUKCAPIL - Pelacakan Cepat Layanan Dukcapil Kota Kotamobagu

## Overview

**PECEL DUKCAPIL** (Pelacakan Cepat Layanan Dukcapil) is an online document tracking system for the Population and Civil Registration Office (DISDUKCAPIL) of Kotamobagu City. It manages and tracks population documents such as KTP, KIA (Kartu Identitas Anak), Kartu Keluarga, Pindah Keluar, Pindah Datang, Akte Lahir, Akte Kematian, Akte Kawin, Akte Cerai, and DLL (Dan Lain-Lain with custom specification). The application provides role-based access for general users, customer service officers, operators, and super administrators to track and process document requests through various status stages. The system's design is inspired by modern government service patterns (e.g., gov.uk) and Notion's clarity, aiming for a professional yet friendly public service approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is built with React and TypeScript, using Vite as the build tool. Wouter handles client-side routing, and TanStack Query manages server state. UI components leverage Radix UI primitives and shadcn/ui (New York style), styled with Tailwind CSS and Class Variance Authority (CVA). The design system features a warm terracotta color palette, Plus Jakarta Sans typeface, and a mobile-first responsive approach. State management primarily uses React Query for server state and local React state for UI interactions.

### Backend

The backend is an Express.js server developed with TypeScript. It uses a RESTful API design with a `/api` prefix for all routes. Development utilizes Vite's middleware mode with HMR, while production serves static files.

**API Improvements**:
- ✅ Comprehensive Zod validation for all request bodies and query parameters
- ✅ Standardized error responses with proper HTTP status codes
- ✅ Async error handling with global error handler middleware
- ✅ Request logging with color-coded severity levels
- ✅ Database constraint error handling (unique, foreign key violations)
- ✅ Role-based access control (RBAC) middleware for protected routes
- ✅ Input sanitization and validation before database operations

**Real-time Features**:
- ✅ WebSocket server for real-time bidirectional communication
- ✅ Auto-refresh documents when status changes via WebSocket broadcasts
- ✅ Toast notifications for status updates to document owners
- ✅ Connection status indicator (Live/Offline) in Dashboard
- ✅ Automatic reconnection with exponential backoff
- ✅ User authentication over WebSocket for targeted notifications

**Search & Pagination**:
- ✅ Server-side pagination with configurable page size and total pages
- ✅ Advanced filtering by status, jenis dokumen, alamat, CS/operator name
- ✅ Date range filtering (tanggal mulai - tanggal selesai)
- ✅ Full-text search across nama, nomor register, email, nomor HP
- ✅ Sortable columns (ascending/descending)
- ✅ Debounced search input to optimize API calls (500ms delay)
- ✅ Pagination metadata (hasNext, hasPrev, totalPages, total records)

**Print Receipt Feature**:
- ✅ Professional print-ready receipt/bukti penerimaan dokumen
- ✅ QR Code generator with nomor register for easy tracking
- ✅ Complete document information (nama, jenis dokumen, status, etc.)
- ✅ Government office header with logo and contact info
- ✅ Print-optimized CSS with A4 page formatting
- ✅ Auto-show print dialog after successfully creating new document
- ✅ Important notes and instructions for document tracking

**UX & Accessibility**:
- ✅ Skeleton screens for loading states (tables, dashboard cards)
- ✅ ARIA labels on interactive elements and status indicators
- ✅ Screen reader support for document status and navigation
- ✅ Semantic HTML with proper roles and labels
- ✅ Loading indicators during data fetch and mutations
- ✅ Debounced search inputs (500ms delay) to optimize API calls
- ✅ Responsive grid layouts for mobile, tablet, and desktop
- ✅ Touch-friendly buttons and interactive elements (min-h-9)

**Analytics Dashboard (Super Admin)**:
- ✅ Statistics cards: Total documents, Selesai, Diproses, Ditunda with percentages
- ✅ Time range filters: 7 days, 30 days, 1 year, all time
- ✅ Pie chart for status distribution visualization
- ✅ Bar chart for document type distribution
- ✅ Line chart for monthly trends showing status changes over time
- ✅ Recharts integration for responsive visualizations
- ✅ Navigation button from Home page (Super Admin only)
- ✅ **User Performance Analytics**:
  - **CS Performance Card**: Shows each CS user's activity (total documents, breakdown by status: Diterima/Diproses/Selesai/Ditunda, success rate percentage with visual progress bar)
  - **Operator Performance Card**: Shows each Operator's activity (total documents processed, breakdown by status: Diproses/Selesai/Ditunda, success rate percentage with visual progress bar)
  - Both sorted by total documents (descending) and include color-coded status boxes with dark mode support

### Data Storage

PostgreSQL is the primary database, configured for **Supabase** with connection pooling, using Drizzle ORM for type-safe operations. The schema includes:
- **users table**: Basic user authentication (currently mock-based)
- **documents table**: Complete document tracking with all fields (tanggal, nama, nomorHP, email, alamat, nomorRegister, jenisDokumen, keteranganDLL, status, keterangan, namaCS, namaOperator, createdBy)

The application uses a database-backed storage interface (DbStorage) that provides full CRUD operations for documents. All document data is persisted to PostgreSQL, ensuring data is retained across sessions and page reloads.

### Authentication & Authorization

The system employs **database-backed authentication** via API endpoint `/api/auth/login` that validates user credentials against the PostgreSQL users table. Role-based access control (RBAC) supports Public (view-only), CS (create/receive documents), Operator (process/update status), and Super Admin (full access).

**Login System**:
- Users enter username and password (no role selection - role comes from database)
- API validates credentials: `POST /api/auth/login { username, password }`
- Success: Returns `{ id, username, role }` (200 OK) - password excluded for security
- Failure: Returns `{ error }` (401 Unauthorized)
- Client displays toast notifications for success/error feedback
- User state and role stored in localStorage for session persistence

**Dummy Users for Testing** (see `DUMMY_USERS.md` for complete list):
- Siti Aminah (CS) - siti123
- Rina Melati (CS) - rina123
- Andi Wijaya (Operator) - andi123
- Budi Hartono (Operator) - budi123
- Admin Dukcapil (Super Admin) - admin123

**User Management System**: Super Admin has full CRUD access to manage users through the "Kelola User" dialog. Features include:
- View all users in a sortable table with username and role badges
- Add new users with username, password, and role (CS, Operator, Super Admin)
- Edit existing users (username, role, optional password update)
- Delete users with confirmation
- All user operations use RESTful API routes (`/api/users`) with React Query for real-time updates
- **Security**: All API responses (GET, POST, PATCH) exclude password field to prevent exposure in network traces

**Security Implementation**:
- ✅ Passwords are securely hashed using bcrypt (10 salt rounds) before storage
- ✅ Session management implemented with express-session and PostgreSQL session store
- ✅ HTTP-only cookies with secure flag for production (HTTPS)
- ✅ Password comparison uses bcrypt.compare() for authentication
- ✅ Session data stored in database with 30-day expiration
- **Note**: For existing plaintext passwords, run migration: `npx tsx server/migrate-passwords.ts`

### UI/UX Decisions & Features

The application features a **forest green/natural color theme** (HSL 155 65% 45%), Plus Jakarta Sans font, rounded-2xl cards, rounded-full buttons, and redesigned status badges. Mobile optimization ensures all interactive elements meet minimum touch targets and layouts are responsive. Key features include:

-   **Dashboard Public View Enhancements**: 
    - Simplified header with NO logo and NO offline indicator (only title and back button)
    - Three independent date range filters (one per status table: SELESAI, DIPROSES, DITUNDA)
    - Each filter operates independently with options: Hari Ini, 2/3 Hari Terakhir, 1 Minggu, 2 Minggu, 1 Bulan, Semua Data
    - Updated filter labels: "1 Minggu" (not "7 Hari"), "1 Bulan" (not "30 Hari")
    - Default filter setting: "Semua Data" for all three tables
-   **Home Page Date Range Picker**: Advanced date filter with calendar popover allowing users to select custom date ranges (Dari Tanggal - Sampai Tanggal) using Indonesian locale formatting. Includes clear button to reset filter.
-   **Auto-Keterangan (Notes) by Status**: Automatic notes based on document status (e.g., "Menunggu Diproses" for DITERIMA, "Dokumen selesai" for SELESAI), with manual input required and preserved for "DITUNDA" status.
-   **DLL (Dan Lain-Lain) Document Type with Custom Specification**: When users select "DLL" as document type, a required field appears to specify the custom document type (e.g., "Surat Keterangan Domisili"). The table displays it as "DLL (specification)" format.
-   **CS User Permission System**: CS users can only edit and delete documents they created themselves. Other CS users cannot modify documents created by different CS users. Super Admin retains full access to edit/delete all documents. This is tracked via the `createdBy` field in documents.
-   **Auto-Generated Register Numbers**: Each document receives an automatically generated register number in the format `0001/001/X/2025` (4-digit sequence/document code/Roman numeral month/year). Document codes: KTP=001, KIA=002, Kartu Keluarga=003, Pindah Keluar=004, Pindah Datang=005, Akte Lahir=006, Akte Kematian=007, Akte Kawin=008, Akte Cerai=009, DLL=010. The register column is visible only to logged-in users and included in CSV exports.
-   **Contact Information Fields**: Documents now include contact fields (Phone Number, Email, and Address/District). These fields are visible only to logged-in users (CS, Operator, Super Admin) and hidden from public view. Address field provides a dropdown selection of four districts: Kotamobagu Utara, Kotamobagu Selatan, Kotamobagu Barat, and Kotamobagu Timur. The CSV export includes these contact fields.
-   **Comprehensive Column Filters**: The main page features a filter panel with dedicated filters for each column - Nama (text search), Tanggal (date picker), Jenis Dokumen (dropdown), Status (dropdown), and for logged-in users: Alamat (dropdown), Register (text search), Nama CS (text search), and Nama Operator (text search). This replaces the previous single search bar and status filter.
-   **Newest-First Sorting**: Documents on the main page are sorted by ID descending, displaying the most recently created documents at the top of the list for easy access to latest submissions.
-   **Footer with Social Media Contacts**: A comprehensive, responsive footer with WhatsApp, Facebook, and Instagram links.
-   **Clickable Row Actions**: Document table rows are clickable, triggering role-based action dialogs for Edit, Update Status, or Delete.
-   **Status Badge Color Update**: Enhanced visual distinction for status badges (DITERIMA-blue, DIPROSES-orange, SELESAI-green, DITUNDA-red).
-   **Advanced Export Feature**: Super Admin can export CSV data with filters for date range, status, and document type, generating dynamic filenames.
-   **Branding Update**: New name "PECEL DUKCAPIL", official Kotamobagu logo, and a redesigned header with gradient text and tagline.

## External Dependencies

-   **UI Libraries**: Radix UI, Lucide React (icons), date-fns, React Hook Form, Zod.
-   **Database & ORM**: Neon serverless PostgreSQL (`@neondatabase/serverless`), Drizzle ORM (`drizzle-orm`, `drizzle-kit`), `ws` package for WebSocket support.
-   **Development Tools**: Vite, TypeScript, TSX, ESBuild, PostCSS, Autoprefixer, Replit-specific plugins.
-   **Planned Deployment**: Supabase (PostgreSQL, transaction pooler, Singapore region).