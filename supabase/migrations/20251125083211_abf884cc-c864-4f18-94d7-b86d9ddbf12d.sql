-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users can view subscriptions (for admin purposes)
CREATE POLICY "Authenticated users can view subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email 
  ON public.newsletter_subscriptions(email);