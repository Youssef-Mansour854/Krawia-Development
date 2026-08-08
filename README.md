# Krawia Real Estate Development — Portfolio Website

A modern, high-performance portfolio website for a real estate development company built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Mongoose**. Designed for single-deployable serverless hosting on Vercel.

---

## 📁 Project Folder Structure

```text
portfolio/
├── app/
│   ├── (public)/          # Public-facing routes (Home page, Project details)
│   │   └── page.tsx       # Landing page (/)
│   ├── admin/             # Admin dashboard pages (protected management portal)
│   │   └── page.tsx       # Admin home (/admin)
│   ├── api/               # Serverless Next.js API route handlers
│   │   └── health/        # Health check endpoint (/api/health)
│   │       └── route.ts
│   ├── globals.css        # Tailwind CSS import & global custom styles
│   └── layout.tsx         # Root layout with custom typography & metadata
├── components/            # Shared React components (Navbar, Footer, UI elements)
│   └── Navbar.tsx
├── lib/                   # Utility helpers
│   ├── db.ts              # Cached Mongoose MongoDB connection helper
│   └── blob.ts            # Vercel Blob file storage upload & delete helpers
├── models/                # Mongoose database schemas
│   └── Project.ts         # Real Estate Project Mongoose schema
├── .env.local.example     # Template for required environment variables
├── package.json           # Installed dependencies & scripts
└── tsconfig.json          # TypeScript configuration
```

---

## 🛠️ Key Dependencies

- **Framework**: `next` (App Router), `react`, `react-dom`
- **Styling**: `tailwindcss`, `@tailwindcss/postcss`
- **Database**: `mongoose` (MongoDB ODM)
- **Storage**: `@vercel/blob` (Blob storage for media assets & PDF brochures)
- **PDF Viewing**: `react-pdf`, `pdfjs-dist`

---

## 🚀 Getting Started Locally

### 1. Environment Setup
Copy `.env.local.example` to create your local environment file:

```bash
cp .env.local.example .env.local
```

Fill in the required values in `.env.local`:
- `MONGODB_URI`: Connection string for your MongoDB instance or MongoDB Atlas.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token.
- `ADMIN_PASSWORD_HASH` / `ADMIN_SECRET`: Secret key or password hash for admin authentication.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## ⚡ Deployment

This application is configured as a single deployable unit on **Vercel**:
1. Push your repository to GitHub / Git provider.
2. Import the repository into your Vercel Dashboard.
3. Configure Environment Variables (`MONGODB_URI`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_SECRET`) in Vercel.
4. Deploy!
