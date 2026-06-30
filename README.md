# KanoonScan - Know Before You Sign

An AI-powered legal document analysis web application built with Next.js 14, TypeScript, and Google Gemini AI.

## Features

- 📄 Upload PDF/DOCX legal documents
- 🤖 AI-powered clause analysis using Google Gemini
- ⚠️ Risk scoring (0-100) and level assessment
- 🎨 Color-coded clause highlighting
- 💬 AI chat for document Q&A
- 📊 Risk breakdown by category
- 📥 Export analysis as PDF
- 🔐 Secure authentication with Clerk
- 💾 PostgreSQL database with Prisma ORM

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Clerk
- **Database:** Neon DB (PostgreSQL)
- **ORM:** Prisma
- **File Upload:** Uploadthing
- **AI:** Google Gemini 1.5 Flash
- **PDF Parsing:** PDF.js (pdfjs-dist)
- **DOCX Parsing:** Mammoth.js
- **Export:** jsPDF
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Clerk account (free tier available)
- A Neon DB account (free tier available)
- An Uploadthing account (free tier available)
- A Google AI Studio API key (free tier available)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd "landmine scanner"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Edit `.env.local` and add your API keys:
   
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Database (Neon PostgreSQL)
   DATABASE_URL=postgresql://...

   # Uploadthing
   UPLOADTHING_SECRET=sk_live_...
   UPLOADTHING_APP_ID=...

   # Google Gemini AI
   GEMINI_API_KEY=...

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Prisma and database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Getting API Keys

### 1. Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com)
2. Create a free account
3. Create a new application
4. Copy the API keys from the dashboard
5. Enable Google OAuth (optional but recommended)

### 2. Neon DB (PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string (DATABASE_URL)

### 3. Uploadthing (File Upload)
1. Go to [uploadthing.com](https://uploadthing.com)
2. Create a free account
3. Create a new app
4. Copy the secret and app ID

### 4. Google Gemini AI
1. Go to [ai.google.dev](https://ai.google.dev)
2. Sign in with your Google account
3. Go to "Get API Key"
4. Create a new API key
5. Copy the key

## Project Structure

```
kanoonscan/
├── app/
│   ├── (auth)/          # Sign in/up pages
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── api/             # API routes
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing page
│   └── globals.css      # Global styles
├── components/
│   ├── landing/         # Landing page components
│   ├── dashboard/       # Dashboard components
│   ├── scan/            # Upload/scan components
│   ├── analysis/        # Analysis results components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── gemini/          # AI analysis & prompts
│   ├── parsers/         # PDF/DOCX text extraction
│   ├── db/              # Prisma client
│   └── utils/           # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema
├── types/
│   └── index.ts         # TypeScript types
└── middleware.ts        # Clerk auth middleware
```

## Next Steps

After setup, you need to:

1. ✅ Test authentication (sign up/sign in)
2. ✅ Build the dashboard page
3. ✅ Build the scan/upload page
4. ✅ Build the analysis results page
5. ✅ Implement API routes for analysis
6. ✅ Test with real documents
7. ✅ Deploy to Vercel

## Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

MIT

## Disclaimer

KanoonScan is an AI-powered tool designed to assist in understanding legal documents. 
It is NOT a substitute for professional legal advice. Always consult with a qualified 
lawyer for final decisions on legal matters.
