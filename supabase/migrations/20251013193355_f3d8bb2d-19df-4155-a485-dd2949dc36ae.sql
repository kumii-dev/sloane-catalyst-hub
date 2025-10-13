-- Create enum for file categories
CREATE TYPE file_category AS ENUM (
  'pitch_deck',
  'financial_statement',
  'contract',
  'legal_document',
  'business_plan',
  'report',
  'presentation',
  'other'
);

-- Create files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category file_category DEFAULT 'other',
  folder TEXT,
  description TEXT,
  tags TEXT[],
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create file shares table for sharing files with specific users
CREATE TABLE public.file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_with UUID NOT NULL,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'download', 'edit')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_category ON public.files(category);
CREATE INDEX idx_files_folder ON public.files(folder);
CREATE INDEX idx_files_created_at ON public.files(created_at DESC);
CREATE INDEX idx_file_shares_file_id ON public.file_shares(file_id);
CREATE INDEX idx_file_shares_shared_with ON public.file_shares(shared_with);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for files table
CREATE POLICY "Users can view their own files"
  ON public.files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view files shared with them"
  ON public.files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.file_shares
      WHERE file_shares.file_id = files.id
        AND file_shares.shared_with = auth.uid()
        AND (file_shares.expires_at IS NULL OR file_shares.expires_at > now())
    )
  );

CREATE POLICY "Users can insert their own files"
  ON public.files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON public.files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON public.files FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for file_shares table
CREATE POLICY "Users can view shares for their files"
  ON public.file_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

CREATE POLICY "Users can create shares for their files"
  ON public.file_shares FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by
    AND EXISTS (
      SELECT 1 FROM public.files
      WHERE files.id = file_shares.file_id
        AND files.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own shares"
  ON public.file_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- Create trigger for updated_at
CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for files bucket
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view shared files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'files'
    AND EXISTS (
      SELECT 1 FROM public.files f
      JOIN public.file_shares fs ON fs.file_id = f.id
      WHERE f.file_path = name
        AND fs.shared_with = auth.uid()
        AND (fs.expires_at IS NULL OR fs.expires_at > now())
    )
  );

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );