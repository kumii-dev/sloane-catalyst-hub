-- Create storage bucket for platform documentation
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-docs', 'platform-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create table for tracking uploaded platform documents
CREATE TABLE IF NOT EXISTS public.platform_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  description TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all platform documents
CREATE POLICY "Authenticated users can view platform documents"
ON public.platform_documents
FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated users can upload platform documents
CREATE POLICY "Authenticated users can upload platform documents"
ON public.platform_documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

-- Policy: Users can update their own uploads
CREATE POLICY "Users can update their own platform documents"
ON public.platform_documents
FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Policy: Users can delete their own uploads
CREATE POLICY "Users can delete their own platform documents"
ON public.platform_documents
FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Storage policies for platform-docs bucket
CREATE POLICY "Authenticated users can view platform docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'platform-docs');

CREATE POLICY "Authenticated users can upload platform docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'platform-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own platform docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'platform-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own platform docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'platform-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_platform_documents_uploaded_by ON public.platform_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_platform_documents_category ON public.platform_documents(category);
CREATE INDEX IF NOT EXISTS idx_platform_documents_uploaded_at ON public.platform_documents(uploaded_at DESC);