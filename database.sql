-- database.sql
-- Open Supabase Dashboard -> SQL Editor -> New Query
-- Run the following setup for Perfume Storage:

CREATE TABLE IF NOT EXISTS perfumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id SERIAL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_ar_market TEXT NOT NULL,
  price_usd NUMERIC DEFAULT 0,
  total_volume_kg NUMERIC DEFAULT 1,
  description TEXT,
  seasons text[] DEFAULT '{}',
  gender text DEFAULT 'unisex',
  provider TEXT DEFAULT 'RMI',
  code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (since this is an internal local tool)
DROP POLICY IF EXISTS "Allow anonymous read access" ON perfumes;
CREATE POLICY "Allow anonymous read access" ON perfumes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access" ON perfumes;
CREATE POLICY "Allow anonymous insert access" ON perfumes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON perfumes;
CREATE POLICY "Allow anonymous update access" ON perfumes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anonymous delete access" ON perfumes;
CREATE POLICY "Allow anonymous delete access" ON perfumes FOR DELETE USING (true);

-- TRANSACTION HISTORY TABLE (For Daily/Weekly Analytics Charts)

CREATE TABLE IF NOT EXISTS public.perfume_transactions (
  id uuid default gen_random_uuid() primary key,
  perfume_id uuid references public.perfumes(id) on delete cascade not null,
  amount_kg numeric not null,
  transaction_type text not null check (transaction_type in ('deduct', 'add')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security for transactions
ALTER TABLE public.perfume_transactions ENABLE ROW LEVEL SECURITY;

-- Anonymous configuration for internal dashboard logging
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.perfume_transactions;
CREATE POLICY "Allow anonymous read access" ON public.perfume_transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access" ON public.perfume_transactions;
CREATE POLICY "Allow anonymous insert access" ON public.perfume_transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access" ON public.perfume_transactions;
CREATE POLICY "Allow anonymous update access" ON public.perfume_transactions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anonymous delete access" ON public.perfume_transactions;
CREATE POLICY "Allow anonymous delete access" ON public.perfume_transactions FOR DELETE USING (true);
