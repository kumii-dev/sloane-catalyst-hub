-- Complete cleanup and partitioning implementation
-- Drop all objects from previous attempts

-- Drop old backup tables
DROP TABLE IF EXISTS public.transactions_old_backup CASCADE;
DROP TABLE IF EXISTS public.messages_old_backup CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_old_backup CASCADE;

-- Drop partitioned tables
DROP TABLE IF EXISTS public.transactions_partitioned CASCADE;
DROP TABLE IF EXISTS public.messages_partitioned CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_partitioned CASCADE;

-- Drop all partition tables
DROP TABLE IF EXISTS public.transactions_2024_q1, public.transactions_2024_q2, public.transactions_2024_q3, public.transactions_2024_q4 CASCADE;
DROP TABLE IF EXISTS public.transactions_2025_q1, public.transactions_2025_q2, public.transactions_2025_q3, public.transactions_2025_q4 CASCADE;
DROP TABLE IF EXISTS public.transactions_default CASCADE;
DROP TABLE IF EXISTS public.messages_2024_q1, public.messages_2024_q2, public.messages_2024_q3, public.messages_2024_q4 CASCADE;
DROP TABLE IF EXISTS public.messages_2025_q1, public.messages_2025_q2, public.messages_2025_q3, public.messages_2025_q4 CASCADE;
DROP TABLE IF EXISTS public.messages_default CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2024_q1, public.credits_transactions_2024_q2 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2024_q3, public.credits_transactions_2024_q4 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2025_q1, public.credits_transactions_2025_q2 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_2025_q3, public.credits_transactions_2025_q4 CASCADE;
DROP TABLE IF EXISTS public.credits_transactions_default CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_transactions_part_trader, public.idx_transactions_part_created CASCADE;
DROP INDEX IF EXISTS public.idx_messages_part_user, public.idx_messages_part_created CASCADE;
DROP INDEX IF EXISTS public.idx_credits_trans_part_user, public.idx_credits_trans_part_created CASCADE;

-- PARTITION TRANSACTIONS
CREATE TABLE public.transactions_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trader_id uuid NOT NULL,
  amount numeric NOT NULL,
  txn_type transaction_type NOT NULL,
  channel channel_type NOT NULL DEFAULT 'app'::channel_type,
  provenance jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_transactions_part_trader ON public.transactions_partitioned(trader_id);
CREATE INDEX idx_transactions_part_created ON public.transactions_partitioned(created_at);
CREATE TABLE public.transactions_2024_q1 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.transactions_2024_q2 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.transactions_2024_q3 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.transactions_2024_q4 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.transactions_2025_q1 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.transactions_2025_q2 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.transactions_2025_q3 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.transactions_2025_q4 PARTITION OF public.transactions_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.transactions_default PARTITION OF public.transactions_partitioned DEFAULT;
INSERT INTO public.transactions_partitioned SELECT * FROM public.transactions;
ALTER TABLE public.transactions RENAME TO transactions_old_backup;
ALTER TABLE public.transactions_partitioned RENAME TO transactions;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = trader_id);
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = trader_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = trader_id);
CREATE TRIGGER create_rewards_on_transaction AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.create_rewards_on_transaction();

-- PARTITION MESSAGES
CREATE TABLE public.messages_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  related_entity_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  subject text NOT NULL,
  body text NOT NULL,
  message_type text NOT NULL DEFAULT 'notification'::text,
  related_entity_type text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_messages_part_user ON public.messages_partitioned(user_id);
CREATE INDEX idx_messages_part_created ON public.messages_partitioned(created_at);
CREATE TABLE public.messages_2024_q1 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.messages_2024_q2 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.messages_2024_q3 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.messages_2024_q4 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.messages_2025_q1 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.messages_2025_q2 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.messages_2025_q3 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.messages_2025_q4 PARTITION OF public.messages_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.messages_default PARTITION OF public.messages_partitioned DEFAULT;
INSERT INTO public.messages_partitioned SELECT * FROM public.messages;
ALTER TABLE public.messages RENAME TO messages_old_backup;
ALTER TABLE public.messages_partitioned RENAME TO messages;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);

-- PARTITION CREDITS_TRANSACTIONS
CREATE TABLE public.credits_transactions_partitioned (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reference_id uuid,
  balance_after integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  transaction_type text NOT NULL,
  description text,
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_credits_trans_part_user ON public.credits_transactions_partitioned(user_id);
CREATE INDEX idx_credits_trans_part_created ON public.credits_transactions_partitioned(created_at);
CREATE TABLE public.credits_transactions_2024_q1 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE public.credits_transactions_2024_q2 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE public.credits_transactions_2024_q3 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE public.credits_transactions_2024_q4 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
CREATE TABLE public.credits_transactions_2025_q1 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE public.credits_transactions_2025_q2 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE public.credits_transactions_2025_q3 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE public.credits_transactions_2025_q4 PARTITION OF public.credits_transactions_partitioned FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE public.credits_transactions_default PARTITION OF public.credits_transactions_partitioned DEFAULT;
INSERT INTO public.credits_transactions_partitioned SELECT * FROM public.credits_transactions;
ALTER TABLE public.credits_transactions RENAME TO credits_transactions_old_backup;
ALTER TABLE public.credits_transactions_partitioned RENAME TO credits_transactions;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their transactions" ON public.credits_transactions FOR SELECT USING (auth.uid() = user_id);

-- Helper function
CREATE OR REPLACE FUNCTION public.create_quarterly_partition(table_name TEXT, start_date DATE) RETURNS void AS $$
DECLARE partition_name TEXT; end_date DATE;
BEGIN
  partition_name := table_name || '_' || to_char(start_date, 'YYYY_Q"q"');
  end_date := start_date + INTERVAL '3 months';
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.%I FOR VALUES FROM (%L) TO (%L)', partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;