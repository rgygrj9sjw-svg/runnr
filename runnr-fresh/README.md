# 🏃 Runnr

TradingView-style charting platform for traders. Built with Next.js, Supabase, and Vercel.

## 🚀 Quick Deploy

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Click **New Project**
3. Name it `runnr` and set a password
4. Wait for project to spin up (~2 min)
5. Go to **Settings → API** and copy:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Set Up Database Tables

Go to **SQL Editor** in Supabase and run:

```sql
-- Watchlists table
CREATE TABLE watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades/Journal table
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL,
  price DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policies (users can only see their own data)
CREATE POLICY "Users can view own watchlists" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 3: Push to GitHub

```bash
# Unzip the project
unzip runnr-vercel.zip -d runnr
cd runnr

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/runnr.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Import your `runnr` repository
4. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `TWELVE_DATA_API_KEY` | Your key from twelvedata.com |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard |

5. Click **Deploy**

🎉 **Done!** Your app will be live at `your-project.vercel.app`

---

## 💻 Local Development

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/runnr.git
cd runnr

# Install dependencies
npm install

# Copy environment file and add your keys
cp .env.example .env.local
# Edit .env.local with your API keys

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
runnr/
├── app/
│   ├── api/
│   │   ├── chart/route.ts    # Market data API
│   │   └── auth/route.ts     # Auth endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main app
├── components/
│   ├── Chart/
│   │   ├── CandlestickChart.tsx
│   │   ├── TimeframeSelector.tsx
│   │   └── TickerSearch.tsx
│   ├── Chat/
│   │   └── ChatPanel.tsx
│   └── Layout/
│       ├── Sidebar.tsx
│       └── TopNav.tsx
├── lib/
│   ├── supabase.ts           # Client-side Supabase
│   ├── supabase-server.ts    # Server-side Supabase
│   ├── twelve-data.ts        # Market data service
│   └── store.ts              # Zustand state
├── public/
│   └── favicon.svg
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🔑 API Keys

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| Twelve Data | 800 calls/day | [twelvedata.com](https://twelvedata.com) |
| Supabase | 500MB DB, 50k auth | [supabase.com](https://supabase.com) |
| Vercel | Unlimited deploys | [vercel.com](https://vercel.com) |

---

## ✨ Features

- 📊 TradingView-style candlestick charts
- ⏱️ 11 timeframes (1m to 5y)
- 🔍 Symbol search with autocomplete
- ⭐ Watchlist with live quotes
- 💬 AI trading assistant
- 🔐 Supabase auth (ready)
- 📱 Responsive design

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Hosting**: Vercel
- **Charts**: Lightweight Charts
- **Styling**: Tailwind CSS
- **State**: Zustand

---

## 📝 License

MIT - Use it however you want!

---

**Runnr** - Trade faster. 🏃💨
