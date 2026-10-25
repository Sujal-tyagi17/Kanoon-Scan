# ⚖️ KanoonScan

> **Know Before You Sign**

An AI-powered Legal Contract Analyzer that helps users understand legal agreements by identifying key clauses, assessing contractual risks, generating plain-English summaries, and producing professional legal reports.

<p align="center">
  <a href="https://kanoonscan.vercel.app/">
    <img src="https://img.shields.io/badge/DEMO-LIVE-green?style=for-the-badge" alt="Demo Live" />
  </a>
  <img src="https://img.shields.io/badge/NEXT.JS-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

---

## 📸 Screenshots
### Landing Page

![Landing Page](public/screenshots/landing.png)

---
### Dashboard

![Dashboard](public/screenshots/dashboard.png)

---

### Contract Analysis

![Analysis](public/screenshots/analysis.png)

---

### Document Vault

![Document Vault](public/screenshots/vault.png)

---

## ✨ Features

* **AI Analysis**: Instantly detects and analyzes key legal clauses.
* **Format Support**: Upload PDF, DOCX, and TXT agreements.
* **Risk Scoring**: Provides a 0-100 score and assigns a low/medium/high/critical risk category.
* **Plain English Summaries**: Translates complex legalese into clear text.
* **Smart Actions**: Get recommendations, who benefits, and who is at risk.
* **Document Vault**: Save, manage, and delete analyzed contracts safely.
* **PDF Reports**: Export results into clean, print-friendly reports.
* **Shareable Links**: Turn on a read-only public link for any report (document text is never exposed), and turn it off any time.
* **Fair-use Limits**: Per-user daily limits on AI analyses and chat messages protect the API budget.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Next.js App Router
- **Database:** MongoDB
- **Authentication:** Clerk
- **AI Models:** Google Gemini, Groq (Llama)
- **Document Parsing:** PDF.js, Mammoth
- **File Uploads:** UploadThing

---

## 📊 Risk Levels

| Level | Description |
|--------|-------------|
| 🟢 Low | Standard commercial terms with minimal legal concerns |
| 🟡 Medium | Clauses that should be reviewed before signing |
| 🟠 High | Significant contractual risks requiring attention |
| 🔴 Critical | Serious legal concerns requiring professional review |

---

## 🚀 Getting Started

```bash
git clone https://github.com/Sujal-tyagi17/Kanoon-Scan.git
cd Kanoon-Scan
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk authentication |
| `DATABASE_URL` | MongoDB connection string (use the `mongodb+srv://` form, with a database name) |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | AI providers (at least one required) |
| `ENCRYPTION_KEY` | Secret for encrypting document text at rest — set once, never change |
| `WEBHOOK_SECRET` | Optional Clerk webhook secret |
| `GROQ_MODELS`, `GEMINI_MODELS` | Optional comma-separated model overrides |
| `DAILY_ANALYSIS_LIMIT`, `DAILY_CHAT_LIMIT` | Optional per-user daily limits (default 10 and 50, reset at midnight IST) |

`GET /api/health` reports which variables are set (yes/no only) and whether MongoDB is reachable.

---

## 🗄️ Database Schema

MongoDB is schemaless, so the schema is enforced with `$jsonSchema` validators and indexes defined in [`lib/db/schema.ts`](lib/db/schema.ts). They are applied automatically on the first connection; you can also run [`scripts/mongo-schema.js`](scripts/mongo-schema.js) in mongosh.

| Collection | Key fields | Indexes |
|------------|-----------|---------|
| `users` | clerkId, email, name | clerkId (unique) |
| `documents` | userId, name, type, rawText (encrypted), status | userId + createdAt |
| `analyses` | documentId, riskScore (0–100), riskLevel, summary, verdict, keyInformation | documentId (unique) |
| `clauses` | analysisId, title, originalText, riskLevel, suggestion, isSaved | analysisId + position |
| `riskCategories` | analysisId, name, score, level | analysisId |
| `chats` | analysisId, role (USER/ASSISTANT), message | analysisId + createdAt |
| `audit_logs` | userId, action, details | userId + createdAt |
| `rate_limits` | key (user:action:day), count, expiresAt | key (unique), expiresAt (TTL) |

---

## 📁 Project Structure

```text
app/
  (auth)/           sign-in & sign-up pages (Clerk)
  (dashboard)/      dashboard, scan, vault, analysis report, settings
  api/              analyze, chat, documents, webhooks, health
components/         UI (landing, dashboard shell, uploader, dialogs)
lib/
  auth.ts           get-or-create the MongoDB user for the Clerk session
  db/               connection, schema validators, audit log
  groq/analyze.ts   AI analysis with Groq → Gemini fallback chain
  gemini/           document chat
  encryption.ts     AES-256 encryption of document text
scripts/            mongosh schema script
```

---

## 👨‍💻 Author

**Sujal Tyagi**

---

## 📄 License

This project is licensed under the MIT License.