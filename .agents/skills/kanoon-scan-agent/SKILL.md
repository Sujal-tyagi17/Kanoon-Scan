---
name: kanoon-scan-agent
description: Skills and context guidelines for managing the KanoonScan AI Legal Document Scanner workspace.
---

# KanoonScan Agent Skill

This skill documents the complete technical workspace structure, design system tokens, database models, and API configurations for **KanoonScan** to enable seamless Pairs/Agent pair-programming.

---

## 1. System Architecture

KanoonScan is built using:
- **Framework:** Next.js 14 (App Router)
- **Authentication:** Clerk Auth (`@clerk/nextjs`)
- **Database ORM:** Prisma Client (`@prisma/client` pointing to a MongoDB provider)
- **File Upload:** Uploadthing (`@uploadthing/react`)
- **AI Engine:** Google Gemini & Groq APIs

---

## 2. Database Model Map (MongoDB Schema Rules)

The database engine is MongoDB connected via Prisma. All models must conform to these Prisma MongoDB rules:
1. **Primary Key Mapping:** Every model ID must be annotated with `@id @default(auto()) @map("_id") @db.ObjectId`.
2. **Foreign Key Mapping:** Relation keys (e.g., `userId`, `documentId`, `analysisId`) must have the `@db.ObjectId` attribute.
3. **No Field Length Annotations:** Do not use `@db.Text` in schema fields; MongoDB stores large strings natively.

### Schema Fields Reference:
- **User:** `id` (ObjectID), `clerkId` (String), `email` (String), `name` (String?), `documents` (Relation)
- **Document:** `id` (ObjectID), `userId` (ObjectID), `name` (String), `type` (String), `fileUrl` (String?), `rawText` (String), `status` (String), `analysis` (Relation)
- **Analysis:** `id` (ObjectID), `documentId` (ObjectID), `riskScore` (Int), `riskLevel` (String), `summary` (String), `plainEnglish` (String), `clauses` (Relation), `categories` (Relation), `chats` (Relation)
- **Clause:** `id` (ObjectID), `analysisId` (ObjectID), `title` (String), `originalText` (String), `riskLevel` (String), `explanation` (String), `whyRisky` (String), `suggestion` (String), `commonality` (Int), `category` (String), `position` (Int), `isSaved` (Boolean)
- **RiskCategory:** `id` (ObjectID), `analysisId` (ObjectID), `name` (String), `score` (Int), `level` (String)
- **Chat:** `id` (ObjectID), `analysisId` (ObjectID), `role` (String), `message` (String), `createdAt` (DateTime)

---

## 3. Design System & Aesthetics

### HSL Color Tokens (Dark Navy Theme)
- **Background:** `#0b1326` (CSS variable `--background: 223 55.2% 9.6%`)
- **Cards/Surfaces:** `#171f33` (CSS variable `--card: 224 37.5% 14.7%`)
- **Primary Color:** `#b4c5ff` (CSS variable `--primary: 227 100% 85.3%`)
- **Accent Color:** `#4edea3` (CSS variable `--tertiary`)
- **Active Container Background:** `#264191` (Stitch sidebar active color)

### Typography Stack
- **UI Fonts:** `Inter` (mapped to Tailwind classes `font-sans` / `font-body-md` / `font-body-lg`)
- **Legal brief / clauses font:** `Source Serif 4` (mapped to class `font-legal-text`)
- **Precision metadata/confidence tags:** `JetBrains Mono` (mapped to class `font-data-label`)

### Key Components
- **Logo:** [Logo.tsx](file:///c:/Users/tyagi/Desktop/Legal Document Scanner/components/Logo.tsx) is the animated SVG shield logo.
- **ShaderBackground:** [ShaderBackground.tsx](file:///c:/Users/tyagi/Desktop/Legal Document Scanner/components/ShaderBackground.tsx) compiles the WebGL hero background shader.
- **Doc3DAnimation:** [Doc3DAnimation.tsx](file:///c:/Users/tyagi/Desktop/Legal Document Scanner/components/Doc3DAnimation.tsx) renders the floating 3D document scanner animation using Three.js.

---

## 4. Key Execution Instructions for Future Agents

- Always verify build correctness before ending turns:
  ```bash
  npx tsc --noEmit
  ```
- Before pushing model modifications, make sure database URLs are starting with the `mongodb://` protocol.
- Do not rename **KanoonScan** (or **Kanoon Scan**); this is the official branding choice for the application.
