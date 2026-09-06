# TRINFRA — Land Pooling Platform
> **Zero-Budget Demonstration / Proof-of-Skill Version**
> 
> *Notice: This version is a zero-budget local demonstration environment and is not intended for production deployment.*

---

## 1. Project Overview
TRINFRA is a modern full-stack web application for structured land aggregation and development facilitation across Kerala, India. It bridges individual landowners, institutional developers/investors, and accredited multidisciplinary partners (legal, GIS, town planning, finance, engineering).

This implementation demonstrates a complete full-stack architecture — frontend design system, relational database, secure authentication, real REST API Route Handlers, server validation, admin operational workflows, and private local document handling — operating at **₹0 infrastructure cost** using local technologies.

---

## 2. Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Custom TRINFRA Editorial Design System
- **Database**: SQLite (file-based local database: `prisma/dev.db`)
- **ORM**: Prisma ORM 5.22.0
- **Authentication**: Native session management with HTTP-only cookies and bcryptjs password hashing
- **File Storage**: Private local filesystem storage (`./storage/documents/`) with authenticated streaming routes
- **Icons & Animation**: Lucide React & Framer Motion

---

## 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="trinfra_demo_session_secret_key_2026_xyz"
UPLOAD_DIR="./storage/documents"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 4. Local Setup & Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma schema to SQLite
npm run db:push

# 3. Seed demo data
npm run db:seed

# 4. Start production or development server
npm run build && npm run start
# or for development:
npm run dev
```

Visit the application at: `http://localhost:3000`

---

## 5. Demo Admin Credentials

The database is pre-seeded with an administrator account:

- **Email**: `admin@trinfra.demo`
- **Password**: `TRINFRA-DEMO-2026`
- **Login Route**: `/admin/login`

*(A one-click "Auto-Fill Credentials" button is provided on the login screen for quick review).*

---

## 6. Database Operations & Management

| Command | Action |
|---|---|
| `npm run db:push` | Synchronizes Prisma schema definitions with `dev.db` |
| `npm run db:seed` | Populates SQLite with demo admin, opportunities, projects, landowners, enquiries, notes, and notifications |
| `npm run db:reset` | Completely resets database, pushes schema, and re-seeds fresh demo data |
| `npm run db:studio` | Opens Prisma Studio GUI at `http://localhost:5555` to view/edit database records |

---

## 7. Architecture & Data Flow

```
[Public Visitor]
   │
   ├─► Register Your Land (/register)
   │     └─► POST /api/register ──► [Prisma: Landowner + LandParcel + Document] ──► SQLite
   │                                  └─► Private Filesystem (./storage/documents/)
   │
   ├─► Developer / Investor Enquiry (/enquiry)
   │     └─► POST /api/enquiries ──► [Prisma: DeveloperEnquiry + Notification] ──► SQLite
   │
   └─► Public Discovery (/opportunities, /projects)

[Admin User]
   │
   ├─► Sign In (/admin/login) ──► POST /api/auth/login ──► [Verify PasswordHash + Set Session Cookie]
   │
   └─► Protected Admin (/admin/*)
         ├─► Overview (/admin) ───────────► GET /api/admin/dashboard (Real DB Counts)
         ├─► Landowners (/admin/landowners) ► GET/PATCH /api/admin/landowners/[id]
         ├─► Enquiries (/admin/developer-enquiries) ► GET/PATCH /api/admin/enquiries
         └─► Documents (/admin/documents) ──► GET /api/admin/documents/[id] (Private Stream)
```

---

## 8. Document Privacy & Storage Architecture
- Documents uploaded during registration are stored in the server's private directory `./storage/documents/`.
- This directory is **strictly isolated** outside the `public/` folder.
- Access is gated behind the `/api/admin/documents/[id]` route, which enforces authentication via `getAuthenticatedAdmin()`. Unauthenticated requests receive HTTP 401 Unauthorized.

---

## 9. Main API Endpoints

- `POST /api/register`: Validates and writes landowner, land parcel, document files, and notifications.
- `POST /api/enquiries`: Validates and records developer/investor expressions of interest.
- `POST /api/auth/login`: Authenticates administrator and sets secure HTTP-only session cookie.
- `POST /api/auth/logout`: Clears administrator session cookie.
- `GET /api/auth/me`: Checks active session context.
- `GET /api/admin/dashboard`: Returns real aggregated counts, recent landowners, and enquiries.
- `GET /api/admin/landowners`: Filtered, searchable landowner records from SQLite.
- `GET /api/admin/landowners/[id]`: Detailed landowner profile with parcels, documents, and notes.
- `PATCH /api/admin/landowners/[id]`: Updates verification status (`NEW`, `VERIFICATION_PENDING`, `VERIFIED`, etc.).
- `POST /api/admin/landowners/[id]/notes`: Adds internal audit notes to landowner record.
- `GET /api/admin/enquiries`: Developer enquiries from SQLite.
- `PATCH /api/admin/enquiries/[id]`: Updates enquiry status and priority.
- `GET /api/admin/documents/[id]`: Authenticated file streaming endpoint.

---

## 10. Demo Limitations & Production Migration Path
- **Database**: Uses SQLite for seamless single-file local operation. For production, switch `provider = "postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL`.
- **File Storage**: Uses local filesystem `./storage/documents/`. Can be migrated to Amazon S3 or Google Cloud Storage by replacing the storage adapter in `/api/register` and `/api/admin/documents/[id]`.
- **Email/SMS**: In-app notifications are implemented. For production, connect SendGrid/AWS SES or Twilio.
