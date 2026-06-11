# Base Associates CPA — ProLearn Platform
## Setup Guide (Get Live in 15 Minutes)

---

## STEP 1 — Create a Free Supabase Project (5 min)

1. Go to https://supabase.com → Sign up free
2. Click **"New Project"**
3. Name: `base-associates-cpa`  |  Choose a strong password  |  Region: `East Africa (ap-southeast-1)`
4. Wait ~2 minutes for it to provision

---

## STEP 2 — Get Your API Keys

1. In Supabase dashboard → **Settings → API**
2. Copy your **Project URL** (looks like: `https://abcdefgh.supabase.co`)
3. Copy your **anon/public key** (long JWT string)
4. Open **`supabase.js`** and replace:
   ```
   const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON = 'YOUR_ANON_PUBLIC_KEY';
   ```
   With your actual values.

---

## STEP 3 — Create the Database Tables (2 min)

1. In Supabase → **SQL Editor → New Query**
2. Open the file **`database-setup.sql`** from this folder
3. Copy the entire contents → Paste into SQL Editor → Click **"Run"**
4. You should see "Success" messages

---

## STEP 4 — Make Yourself Admin (1 min)

After you register on the site, run this in the SQL Editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR-EMAIL@HERE.COM');
```

---

## STEP 5 — Host the Website (Free)

**Option A — Netlify (Recommended, Free)**
1. Go to https://netlify.com → Sign up
2. Drag the entire `base-prolearn-live` folder onto the Netlify deploy area
3. Your site goes live instantly at `https://random-name.netlify.app`
4. Set a custom domain in Settings if you have one

**Option B — GitHub Pages**
1. Push files to a GitHub repo
2. Settings → Pages → Deploy from main branch
3. Site goes live at `https://yourusername.github.io/repo-name`

**Option C — Run Locally**
Open any `.html` file directly in Chrome/Firefox. Everything works as-is.

---

## STEP 6 — Configure Email Confirmation (Optional)

In Supabase → **Authentication → Settings**:
- You can disable "Confirm email" for instant access (good for launch)
- Or enable it and configure your SMTP for branded confirmation emails

---

## FILE STRUCTURE

```
base-prolearn-live/
├── styles.css          ← All brand styles (Base Associates colours)
├── supabase.js         ← Database config & shared course data ← EDIT THIS
├── database-setup.sql  ← Run once in Supabase SQL Editor
├── index.html          ← Homepage
├── courses.html        ← All 20 courses with filters
├── course-detail.html  ← Course detail with session picker
├── booking.html        ← 4-step booking + MTN/Airtel payment
├── dashboard.html      ← Learner dashboard (live data)
├── admin.html          ← Admin panel (admin role only)
├── login.html          ← Login (Supabase auth)
├── register.html       ← Registration (Supabase auth)
└── forgot-password.html← Password reset (Supabase auth)
```

---

## MOBILE MONEY PAYMENTS

The booking flow shows:
- **MTN Mobile Money** — USSD code `*165*3#` with step-by-step instructions
- **Airtel Money** — USSD code `*185*9#` with step-by-step instructions

To accept REAL automated payments (no manual USSD):
- Register for **Flutterwave** (https://flutterwave.com) — they support MTN & Airtel Uganda
- Or register for **Pesapal** (https://pesapal.com) — popular in Uganda
- Both provide a JavaScript SDK that replaces the current USSD instructions with an automated prompt

---

## SUPPORT

For questions about setup: Contact your developer or refer to:
- Supabase docs: https://supabase.com/docs
- Netlify docs: https://docs.netlify.com
