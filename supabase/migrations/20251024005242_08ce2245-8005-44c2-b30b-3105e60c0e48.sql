-- Allow users to upload company logos
CREATE POLICY "Users can upload company logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to update their company logos
CREATE POLICY "Users can update their company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = 'company-logos'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public access to view company logos
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures' AND (storage.foldername(name))[1] = 'company-logos');