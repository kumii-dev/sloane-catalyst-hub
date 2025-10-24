-- Create transaction type enum
CREATE TYPE public.transaction_type AS ENUM ('sale', 'expense', 'deposit', 'withdrawal', 'supplier_purchase');

-- Create channel type enum
CREATE TYPE public.channel_type AS ENUM ('app', 'ussd', 'sms', 'whatsapp', 'qr');

-- Create KYC tier type enum
CREATE TYPE public.kyc_tier_type AS ENUM ('none', 'lite', 'full');

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  txn_type transaction_type NOT NULL,
  channel channel_type NOT NULL DEFAULT 'app',
  description TEXT,
  provenance JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create business_scores table
CREATE TABLE public.business_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  credit_tier TEXT NOT NULL CHECK (credit_tier IN ('A', 'B', 'C', 'D', 'E')),
  top_drivers JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rewards table
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trader_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS kyc_tier kyc_tier_type DEFAULT 'none';

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = trader_id);

-- RLS Policies for business_scores
CREATE POLICY "Users can view their own scores"
  ON public.business_scores FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own scores"
  ON public.business_scores FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

-- RLS Policies for rewards
CREATE POLICY "Users can view their own rewards"
  ON public.rewards FOR SELECT
  USING (auth.uid() = trader_id);

CREATE POLICY "Users can insert their own rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (auth.uid() = trader_id);

CREATE POLICY "Users can update their own rewards"
  ON public.rewards FOR UPDATE
  USING (auth.uid() = trader_id);

-- Create function to auto-create rewards on first transaction
CREATE OR REPLACE FUNCTION public.create_rewards_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create rewards entry if it doesn't exist
  INSERT INTO public.rewards (trader_id, points, lifetime_points)
  VALUES (NEW.trader_id, 10, 10)
  ON CONFLICT (trader_id) 
  DO UPDATE SET 
    points = rewards.points + 10,
    lifetime_points = rewards.lifetime_points + 10,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to award points on transaction
CREATE TRIGGER award_points_on_transaction
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_rewards_on_transaction();

-- Create indexes for better performance
CREATE INDEX idx_transactions_trader_id ON public.transactions(trader_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_business_scores_trader_id ON public.business_scores(trader_id);
CREATE INDEX idx_business_scores_calculated_at ON public.business_scores(calculated_at DESC);
CREATE INDEX idx_rewards_trader_id ON public.rewards(trader_id);

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;