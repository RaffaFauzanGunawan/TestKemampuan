# Awaken Your Skill — Vercel deployment starter

This package prepares the supplied single-page HTML app for Vercel with a serverless API, Neon PostgreSQL persistence, password-hashed accounts, and a server-side Anthropic proxy. It is not online until you connect a Vercel project and configure the environment variables below.

## Visual refresh
- Reworked the landing page into a restrained editorial layout with warm paper tones, forest green, and a burnt-orange accent instead of the generic neon-gradient look.
- Improved typography, spacing, navigation, game cards, forms, and mobile layout while preserving the existing game interactions.
- The visual refresh is design-only; the existing games and progression logic remain the supplied project behavior.

## What changed
- `index.html` is the supplied app with account/password login, server-backed progress saves, and AI requests routed through `/api/ai-questions`.
- `api/auth.js`: creates an account on first login or authenticates an existing name/password. Passwords are hashed with bcrypt.
- `api/progress.js`: saves coins, completed games, equipped/owned outfits, question history, and theme to PostgreSQL.
- `api/ai-questions.js`: sends prompts to Anthropic from the server. The API key is never sent to the browser.
- `schema.sql`: PostgreSQL schema for Neon (the original schema was MySQL and cannot be run unchanged on Neon).

## Deploy steps
1. Create a Neon PostgreSQL project at https://neon.tech and copy its connection string.
2. Open Neon SQL Editor and run the complete `schema.sql` file from this folder.
3. Push this folder to a private/public GitHub repository (do not commit `.env` or API keys).
4. Import that repository at https://vercel.com/new.
5. In Vercel → Project → Settings → Environment Variables, add:
   - `DATABASE_URL` = Neon connection string
   - `SESSION_SECRET` = a random secret of at least 32 characters
   - `ANTHROPIC_API_KEY` = your key from Anthropic Console (optional; AI falls back to local questions when unavailable)
6. Redeploy after setting the variables.
7. Test: create an account with a password of at least 8 characters, play a game, refresh/login again, and check that progress remains.

Generate a secret locally with PowerShell:
```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

## Important limitations / production checklist
- The app's original sign-in form had only name/class/major, not real authentication. This starter adds a password. The first login with a name creates an account; subsequent logins require the same password and same major. Because the account identifier is the normalized name, two people with the same name cannot have separate accounts; for a school deployment, use a school-issued unique student ID instead of name.
- Progress is persisted, but some game rewards are still calculated in the browser. A technically savvy user could tamper with client requests and coins. For a public/competitive launch, move score validation and coin/outfit transactions fully to server-side game APIs before trusting rewards.
- The API uses bearer tokens held in page memory. Refreshing the page requires signing in again. A later hardening pass should use secure, HttpOnly cookies, rate limits, request-size limits, and audit logging.
- Configure Vercel environment variables for Production, Preview, and Development as needed. Never put secrets in HTML or any `NEXT_PUBLIC_`/`VITE_` variable.
- No live deployment has been performed from this workspace; Vercel account/repository access and the database/API credentials are required to publish it.

## Local development
Requires Node.js 20+ and Vercel CLI. Copy `.env.example` to `.env.local`, fill the values, then:
```bash
npm install
npx vercel dev
```
