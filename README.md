# TRINFRA — Full-Stack Land-Pooling Platform (Zero-Budget Demo)

TRINFRA is an institutional land-pooling and infrastructure enablement platform for Kerala. This repository represents a full-stack, zero-budget demonstration version connecting a Next.js frontend to a real, hosted **PostgreSQL** database (Supabase Free Tier) via **Prisma ORM**.

---

## 1. Demo Credentials (Zero-Budget Demo Admin)

| Role | Email | Password | Access URL |
|---|---|---|---|
| **Demo Administrator** | `admin@trinfra.demo` | `TRINFRA-DEMO-2026` | `/admin/login` |

> **Security Note**: This is a clearly labelled demonstration account. Do not use production secrets or personal accounts.

---

## 2. Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Custom TRINFRA Editorial Design System
- **Database**: Hosted PostgreSQL (Supabase Free Tier — ₹0)
- **ORM**: Prisma ORM 5.22.0
- **Authentication**: Native session management with HTTP-only cookies and bcryptjs password hashing
- **File Storage**: Private document metadata in PostgreSQL + local development filesystem storage (`./storage/documents/`) with authenticated streaming routes (ephemeral `/tmp` storage on Vercel)
- **Icons & Animation**: Lucide React & Framer Motion

---

## 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Database: Supabase PostgreSQL (Free Tier)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Authentication & Security
SESSION_SECRET="your-session-secret-at-least-32-chars-long"

# Document Storage
UPLOAD_DIR="./storage/documents"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 4. Setup & Database Operations

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Apply migrations to PostgreSQL
npx prisma migrate deploy
# (or for development schema sync: npm run db:push)

# 4. Seed demo data (repeatable)
npm run db:seed

# 5. Start development or production server
npm run dev
# or for production:
npm run build && npm run start
```

### Database Management Scripts

| Command | Action |
|---|---|
| `npm run db:push` | Synchronizes Prisma schema definitions directly with PostgreSQL |
| `npm run db:seed` | Populates PostgreSQL with demo admin, opportunities, projects, landowners, enquiries, notes, and notifications |
| `npm run db:reset` | Resets database tables, cleans local document cache, and re-seeds fresh demo data |
| `npm run db:studio` | Opens Prisma Studio GUI at `http://localhost:5555` to view/edit database records |

---

## 5. Architecture & Data Flow

```
[Public Visitor]
   │
   ├─► Register Your Land (/register)
   │     └─► POST /api/register ──► [Prisma: Landowner + LandParcel + Document] ──► PostgreSQL
   │                                  └─► Private Metadata + Storage
   │
   ├─► Developer / Investor Enquiry (/enquiry)
   │     └─► POST /api/enquiries ──► [Prisma: DeveloperEnquiry + Notification] ──► PostgreSQL
   │
   └─► Public Discovery (/opportunities, /projects)
         ├─► GET /api/opportunities ──► PostgreSQL
         └─► GET /api/projects ──► PostgreSQL

[Admin User]
   │
   ├─► Sign In (/admin/login) ──► POST /api/auth/login ──► [Verify PasswordHash + Set Session Cookie]
   │
   └─► Protected Admin (/admin/*)
         ├─► Overview (/admin) ───────────► GET /api/admin/dashboard (Real PostgreSQL Counts)
         ├─► Landowners (/admin/landowners) ► GET/PATCH /api/admin/landowners/[id]
         ├─► Enquiries (/admin/enquiries) ─► GET/PATCH /api/admin/enquiries
         ├─► Opportunities (/admin/opps) ─► GET /api/opportunities
         ├─► Activity Log (/admin/activity)► GET /api/admin/notifications
         └─► Documents (/admin/documents) ──► GET /api/admin/documents/[id] (Private Stream)
```

---

## 6. Vercel Deployment Guide (Free Tier ₹0)

1. Push your repository to GitHub.
2. Import the project into your Vercel account.
3. In **Settings > Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase connection pooler URL (port `6543`, mode: Transaction, with `?pgbouncer=true`).
   - `DIRECT_URL`: Your Supabase direct connection URL (port `5432`).
   - `SESSION_SECRET`: A secure random string (32+ characters).
   - `NEXT_PUBLIC_APP_URL`: Your deployed Vercel domain URL.
4. Deploy. The build command `prisma generate && next build` runs automatically.
