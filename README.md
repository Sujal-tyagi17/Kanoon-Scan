# ⚖️ KanoonScan — Know Before You Sign

KanoonScan is a secure, AI-powered Legal Contract Analyzer built with Next.js 14, TypeScript, and MongoDB. It extracts text from contract files (PDF, DOCX, TXT) and grades them across balanced, commercial parameters to produce clean risk assessments and verdicts.

## 🚀 Key Features

* **AI Contract Scanning & Verdicts**: Automatically parses agreements and computes objective risk scores based on commercial standards.
* **Positive & Negative Assessments**: Offsets overall risk levels by matching negative risks against protective clauses (e.g. warranties, good-faith negotiations).
* **Dynamic Color-Coded Interface**: Visually segments risk levels:
  * **LOW**: Green (`#22C55E`)
  * **MEDIUM**: Amber (`#FACC15`)
  * **HIGH**: Orange (`#F97316`)
  * **CRITICAL**: Red (`#EF4444`)
* **Failover Analysis Pipeline**: Automatically fails over from Groq (Llama models) to the Google Gemini API to prevent limits or api token issues.
* **Document Vault**: Manage, review, and delete your encrypted contracts repository.
* **PDF Exporting**: Save structured legal reports locally.

## 🛠️ Tech Stack

* **Frontend & Backend**: Next.js 14 (App Router), TailwindCSS, TypeScript
* **Database**: MongoDB (via Native MongoClient)
* **Auth**: Clerk
* **AI Engines**: Groq SDK (Llama 3.3/3.1, Mixtral) & Google Gemini REST API
* **Document Parsers**: PDF.js (Legacy Node.js build) & Mammoth (DOCX)

## 📦 Getting Started

### 1. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database
DATABASE_URL="mongodb://localhost:27017/lexscan"

# Uploadthing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# AI API Credentials
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.
