-- This migration ensures all Financial Inclusion tables and policies are set up correctly
-- Tables should already exist, this just ensures policies and indexes are correct

-- Enable RLS (safe to run multiple times)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Ensure all required policies exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can view their own transactions'
  ) THEN
    CREATE POLICY "Users can view their own transactions"
      ON public.transactions FOR SELECT
      USING (auth.uid() = trader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can insert their own transactions'
  ) THEN
    CREATE POLICY "Users can insert their own transactions"
      ON public.transactions FOR INSERT
      WITH CHECK (auth.uid() = trader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'business_scores' AND policyname = 'Users can view their own scores'
  ) THEN
    CREATE POLICY "Users can view their own scores"
      ON public.business_scores FOR SELECT
      USING (auth.uid() = trader_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'Users can view their own rewards'
  ) THEN
    CREATE POLICY "Users can view their own rewards"
      ON public.rewards FOR SELECT
      USING (auth.uid() = trader_id);
  END IF;
END $$;