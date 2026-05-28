# Invoxa — AI-Native Financial Operations Platform

Invoxa is a specialized operational finance system for outsourcing agencies, international freelancers, and contractor businesses. It features an AI-driven invoice and settlement engine, recurring workflow automation, double-entry accounting, and a comprehensive project-based analytics dashboard.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 19, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (via Docker), Prisma ORM
- **AI Layer**: Anthropic Claude API (with graceful mock fallback)
- **OCR**: Tesseract.js
- **Queue/Workers**: Redis + BullMQ
- **Email**: Nodemailer + SMTP

## Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (Required for PostgreSQL and Redis)
- NPM, Yarn, or pnpm

### 2. Environment Variables
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
*(No paid APIs required. Leave `ANTHROPIC_API_KEY` blank to use the AI mock fallback.)*

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Infrastructure
Start the PostgreSQL and Redis containers:
```bash
docker compose up -d
```

### 5. Database Setup
Push the Prisma schema to the database and run the realistic seed script:
```bash
npx prisma db push
npm run prisma:seed
```

### 6. Run the Application
Start the Next.js development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to access the Dashboard.

## Modules Implemented
- **Module 1**: Smart Invoice Workflow (`/invoices`, `/invoices/new`)
- **Module 2**: Settlement Intelligence (`/api/settlements`)
- **Module 3**: AI Operations Center (`/ai-ops`)
- **Module 4**: Recurring Workflow Automation (`src/workers/recurring.worker.ts`)
- **Module 5**: Financial Accounts System (`/accounts`)
- **Module 6**: Double-Entry Ledger System (Foundation in Prisma)
- **Module 8**: Project-Based Accounting (APIs)
- **Dashboard**: Command Center (`/`)
