# CYFSA Parent Defense Platform

A production-grade legal education and evidence analysis platform for Ontario parents navigating child protection proceedings under the Children, Youth and Family Services Act (CYFSA).

---

## Platform Overview

This platform provides three core pillars:

1. **Educate** — Statute-backed guides on CYFSA rights, CAS limits, the 5-day court rule, evidence standards, and Charter protections
2. **Document** — AI-powered document analysis that flags assumptions, opinion evidence, procedure violations, and Charter issues
3. **Connect** — Lawyer marketplace with auto-generated intake packages for Ontario family lawyers

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI Analysis | OpenAI GPT-4o-mini |
| PDF Generation | jsPDF + jsPDF-AutoTable |
| Deployment | Vercel |

---

## Project Structure

```
cyfsa-platform/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout (fonts, navbar, footer)
│   ├── globals.css                 # Global styles + CSS variables
│   ├── rights/
│   │   └── page.tsx                # Know Your Rights page
│   ├── analyzer/
│   │   └── page.tsx                # Evidence Analyzer (client component)
│   ├── case-tools/
│   │   └── page.tsx                # Case Tools (journal, checklist, calendar)
│   ├── lawyers/
│   │   └── page.tsx                # Lawyer Marketplace
│   └── api/
│       ├── analyze/route.ts        # Document analysis API (OpenAI)
│       └── lawyer-leads/route.ts   # Lawyer lead submission API
├── components/
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── utils.ts                    # Utilities, constants, flag labels
│   ├── supabase.ts                 # Supabase client helpers
│   ├── analyzer.ts                 # OpenAI analysis service
│   └── pdf-generator.ts            # Intake package PDF generator
├── types/
│   ├── index.ts                    # All TypeScript interfaces
│   └── database.ts                 # Supabase database types
├── supabase-schema.sql             # Full database schema with RLS
├── .env.local.example              # Environment variable template
└── README.md
```

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cyfsa-platform
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Then fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the entire contents of `supabase-schema.sql`
4. Enable Email Auth in Authentication → Providers

### 4. Generate Supabase Types (optional but recommended)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push to GitHub
2. Connect repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in Vercel Project Settings → Environment Variables
4. Deploy

### Required Environment Variables on Vercel

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |

---

## Key Features

### Evidence Analyzer
- Upload CAS reports, court filings, transcripts (PDF, DOCX, TXT, audio, images)
- GPT-4o-mini flags: Assumptions, Opinion (non-expert), Missing Context, Contradictions, Procedure Violations, Charter Issues
- Risk score (0–100) with severity classification
- One-click PDF lawyer intake package download

### Incident Journal
- Timestamped event logging
- CAS involvement tracking
- Witness and evidence documentation
- Court-ready format

### Lawyer Marketplace
- Three subscription tiers (Exclusive / Priority / Standard)
- City-based search across Ontario
- Lead request form with consent system
- Intake package auto-delivery

---

## Legal Disclaimer

This platform provides educational information only. It does not constitute legal advice. All content is sourced from publicly available Ontario statutes:

- Children, Youth and Family Services Act, S.O. 2017, c. 14, Sched. 1
- Canadian Charter of Rights and Freedoms, Constitution Act, 1982, Part I
- Ontario Family Law Rules, O. Reg. 114/99

Users should always consult a qualified family law lawyer for their specific situation.

**Legal Aid Ontario: 1-800-668-8258**

---

## Development Notes

### Adding Authentication (Supabase Auth)
Auth is configured via `lib/supabase.ts`. To add auth pages:
1. Create `app/auth/login/page.tsx` and `app/auth/signup/page.tsx`
2. Add middleware at `middleware.ts` to protect routes
3. See [Supabase Next.js Auth docs](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Tailwind CSS v3
This project uses **Tailwind CSS v3**, which is compatible with `@apply` and all standard utilities. Do not upgrade to v4 without testing — v4 has breaking changes with `@apply`.

### Document Analysis
The analyzer uses `gpt-4o-mini` for cost efficiency. For higher accuracy on complex legal documents, change the model in `lib/analyzer.ts` to `gpt-4o`.

---

## Support

For technical issues with deployment, consult:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
