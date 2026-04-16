-- database.sql
-- Open Supabase Dashboard -> SQL Editor -> New Query
-- Run the following setup for Perfume Storage:

CREATE TABLE IF NOT EXISTS perfumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_id SERIAL,
  name_en TEXT,
  name_ar TEXT,
  name_ar_market TEXT,
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

-- RPC: Delete a perfume and renumber subsequent items to fill the gap
-- This ensures a continuous sequence (Gapless Inventory)
CREATE OR REPLACE FUNCTION delete_perfume_and_sync(target_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_display_id INTEGER;
BEGIN
    -- 1. Get the display_id of the item being deleted
    SELECT display_id INTO deleted_display_id FROM perfumes WHERE id = target_id;
    
    -- 2. Delete the item
    DELETE FROM perfumes WHERE id = target_id;
    
    -- 3. Shift all subsequent items down by 1
    UPDATE perfumes 
    SET display_id = display_id - 1 
    WHERE display_id > deleted_display_id;
    
    -- 4. Reset the sequence to the current max + 1
    -- This handles the case where the deleted item was at the end or in the middle.
    PERFORM setval('perfumes_display_id_seq', COALESCE((SELECT MAX(display_id) FROM perfumes), 0) + 1, false);
END;
$$;
