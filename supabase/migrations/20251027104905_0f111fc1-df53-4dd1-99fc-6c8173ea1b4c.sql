-- Enable RLS on all partition child tables
-- PostgreSQL requires explicit RLS enablement on partitions

-- Enable RLS on transaction partitions
ALTER TABLE public.transactions_2024_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2024_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2024_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2024_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_2025_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions_default ENABLE ROW LEVEL SECURITY;

-- Enable RLS on message partitions
ALTER TABLE public.messages_2024_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2024_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2024_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2024_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_2025_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_default ENABLE ROW LEVEL SECURITY;

-- Enable RLS on credits_transactions partitions
ALTER TABLE public.credits_transactions_2024_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2024_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2024_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2024_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_2025_q4 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions_default ENABLE ROW LEVEL SECURITY;