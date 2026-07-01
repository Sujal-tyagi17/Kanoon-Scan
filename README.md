# ⚖️ KanoonScan

> **Know Before You Sign**

An AI-powered Legal Contract Analyzer that helps users understand legal agreements by identifying key clauses, assessing contractual risks, generating plain-English summaries, and producing professional legal reports.

---

## 📸 Screenshots
### Landing Page

![Landing Page](./screenshots/landing.png)

---
### Dashboard

![Dashboard](./screenshots/dashboard.png)

---

### Contract Analysis

![Analysis](./screenshots/analysis.png)

---

### Document Vault

![Document Vault](./screenshots/vault.png)

---

## ✨ Features

- 🤖 AI-powered legal contract analysis
- 📄 Supports PDF, DOCX, and TXT documents
- ⚖️ Automatic clause detection and classification
- 📊 Dynamic risk scoring with commercial reasoning
- 📝 Plain-English contract summaries
- 💡 AI-generated legal recommendations
- 📈 Risk categorization (Low, Medium, High, Critical)
- 📂 Secure Document Vault
- 📥 Export detailed PDF analysis reports
- 🔐 User authentication with Clerk
- ⚡ AI failover between Groq and Google Gemini
- 🎨 Color-coded risk visualization

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

## 📁 Project Structure

```text
app/
components/
lib/
actions/
models/
public/
```

---

## 👨‍💻 Author

**Sujal Tyagi**

---

## 📄 License

This project is licensed under the MIT License.