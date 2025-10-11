-- Function to deduct credits from wallet and record transaction
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM credits_wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if wallet exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found for user';
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Available: %, Required: %', v_current_balance, p_amount;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update wallet
  UPDATE credits_wallet
  SET 
    balance = v_new_balance,
    total_spent = total_spent + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credits_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    reference_id,
    balance_after
  ) VALUES (
    p_user_id,
    -p_amount,
    'debit',
    p_description,
    p_reference_id,
    v_new_balance
  );
END;
$$;

-- Function to add credits to wallet
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  -- Get or create wallet
  INSERT INTO credits_wallet (user_id, balance, total_earned, total_spent)
  VALUES (p_user_id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM credits_wallet
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update wallet
  UPDATE credits_wallet
  SET 
    balance = v_new_balance,
    total_earned = total_earned + p_amount,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credits_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    reference_id,
    balance_after
  ) VALUES (
    p_user_id,
    p_amount,
    'credit',
    p_description,
    p_reference_id,
    v_new_balance
  );
END;
$$;