# KanoonScan Setup Guide

Complete step-by-step guide to get your KanoonScan application running.

## ✅ Completed Steps

- ✅ Next.js project initialized
- ✅ All dependencies installed
- ✅ Prisma schema created and client generated
- ✅ Landing page built
- ✅ API routes created
- ✅ AI prompts configured

## 🔑 Required API Keys

You need to obtain 4 API keys to run this application:

### 1. Clerk (Authentication) - FREE

**What it does:** Handles user authentication, sign up, sign in

**Steps:**
1. Go to https://clerk.com
2. Click "Start Building for Free"
3. Sign up with Google/GitHub
4. Click "Create Application"
5. Name it "KanoonScan"
6. Enable "Email" and "Google" as sign-in methods
7. Click "Create Application"
8. You'll see your API keys immediately

**Copy these values:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Webhook Setup (Important):**
1. In Clerk dashboard, go to "Webhooks"
2. Click "Add Endpoint"
3. URL: `https://your-domain.com/api/webhooks/clerk` (you'll update this after deployment)
4. For local testing, use: `http://localhost:3000/api/webhooks/clerk`
5. Subscribe to: `user.created`
6. Copy the "Signing Secret" - this goes in `.env.local` as `WEBHOOK_SECRET`

---

### 2. Neon Database (PostgreSQL) - FREE

**What it does:** Stores all your data (users, documents, analysis)

**Steps:**
1. Go to https://neon.tech
2. Click "Sign Up" and use GitHub
3. Click "Create a project"
4. Name: "kanoonscan"
5. Region: Select closest to you
6. Click "Create Project"
7. You'll see a connection string immediately

**Copy this value:**
```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

---

### 3. Uploadthing (File Storage) - FREE

**What it does:** Handles PDF/DOCX file uploads

**Steps:**
1. Go to https://uploadthing.com
2. Click "Get Started"
3. Sign in with GitHub
4. Click "Create a new app"
5. Name: "kanoonscan"
6. Click "Create"
7. Go to "API Keys" tab

**Copy these values:**
```
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
```

---

### 4. Google Gemini AI - FREE

**What it does:** Powers the AI document analysis

**Steps:**
1. Go to https://ai.google.dev
2. Click "Get API key in Google AI Studio"
3. Sign in with your Google account
4. Click "Get API Key"
5. Click "Create API key in new project"
6. Copy the key immediately

**Copy this value:**
```
GEMINI_API_KEY=AIzaSy...
```

⚠️ **Important:** Keep this key secure! Don't commit it to GitHub.

---

## 📝 Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace all the placeholder values with your actual API keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook (get this from Clerk dashboard > Webhooks)
WEBHOOK_SECRET=whsec_...

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...your_connection_string_here...

# Uploadthing
UPLOADTHING_SECRET=sk_live_YOUR_SECRET_HERE
UPLOADTHING_APP_ID=YOUR_APP_ID_HERE

# Google Gemini AI
GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

---

## 🗄️ Set Up Database

Once you have your `DATABASE_URL` configured:

```bash
# Push the schema to your database
npx prisma db push

# Open Prisma Studio to view your database (optional)
npx prisma studio
```

---

## 🚀 Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## ✅ Test Your Setup

### 1. Test Landing Page
- Visit http://localhost:3000
- You should see the landing page with "Know Before You Sign"

### 2. Test Authentication
- Click "Get Started" or "Sign In"
- Try signing up with email or Google
- You should be redirected to `/dashboard`

### 3. Test Database
- After signing up, run: `npx prisma studio`
- Check if your user was created in the `User` table

---

## 🐛 Common Issues

### "Unauthorized" error when signing up
- Check that your Clerk keys are correct
- Make sure keys start with `pk_test_` and `sk_test_`

### "Database connection failed"
- Verify your DATABASE_URL is correct
- Make sure you ran `npx prisma db push`
- Check Neon dashboard to ensure project is active

### "Failed to upload file"
- Check Uploadthing keys
- Make sure you're using the correct app ID

### "Gemini API error"
- Verify your API key is correct
- Check quota at https://ai.google.dev
- API key should start with `AIzaSy`

---

## 📋 Next Steps

Once your setup is working:

1. ✅ Build the Dashboard page (`app/(dashboard)/dashboard/page.tsx`)
2. ✅ Build the Scan/Upload page (`app/(dashboard)/scan/page.tsx`)
3. ✅ Build the Analysis Results page (`app/(dashboard)/analysis/[id]/page.tsx`)
4. ✅ Test with real PDF/DOCX files
5. ✅ Deploy to Vercel
6. ✅ Update webhook URL in Clerk

---

## 🎯 Quick Start Checklist

- [ ] Clerk account created and API keys copied
- [ ] Neon database created and connection string copied
- [ ] Uploadthing app created and keys copied
- [ ] Google Gemini API key obtained
- [ ] All keys added to `.env.local`
- [ ] Ran `npx prisma db push`
- [ ] Ran `npm run dev`
- [ ] Visited http://localhost:3000
- [ ] Successfully signed up/signed in
- [ ] User appears in database (check with `npx prisma studio`)

---

## 💡 Pro Tips

1. **Keep your .env.local secure** - Never commit it to Git
2. **Use Prisma Studio** to debug database issues: `npx prisma studio`
3. **Check your Clerk dashboard** to see registered users
4. **Monitor API usage** in Google AI Studio to stay within limits
5. **Test with short documents first** before trying long contracts

---

## 📞 Need Help?

Check:
- Clerk docs: https://clerk.com/docs
- Neon docs: https://neon.tech/docs
- Uploadthing docs: https://docs.uploadthing.com
- Gemini docs: https://ai.google.dev/docs
- Prisma docs: https://www.prisma.io/docs

---

## 🎉 You're Ready!

Once all checks pass, you're ready to start building the dashboard and testing with real documents!
