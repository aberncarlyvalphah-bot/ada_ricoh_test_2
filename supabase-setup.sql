-- ============================================
-- Supabase Setup Script for Data Ada Agent
-- ============================================
--
-- Purpose: Configure Supabase for file upload functionality
-- Usage: Run this script in Supabase SQL Editor
-- ============================================

-- ============================================
-- Step 1: Create user_files table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT,
  row_count INTEGER,
  column_count INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 2: Create indexes for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS user_files_user_id_idx ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS user_files_uploaded_at_idx ON public.user_files(uploaded_at DESC);

-- ============================================
-- Step 3: Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 4: Create RLS policies for user_files
-- ============================================

-- Development Mode: Allow all operations (anon role)
-- This is for testing with anon key before implementing authentication
DROP POLICY IF EXISTS "Allow all operations for development" ON public.user_files;
CREATE POLICY "Allow all operations for development"
ON public.user_files FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Production Mode: User-specific policies
-- Uncomment these when implementing authentication

-- DROP POLICY IF EXISTS "Users can view own files" ON public.user_files;
-- CREATE POLICY "Users can view own files"
-- ON public.user_files FOR SELECT
-- TO authenticated
-- USING (auth.uid()::text = user_id);

-- DROP POLICY IF EXISTS "Users can insert own files" ON public.user_files;
-- CREATE POLICY "Users can insert own files"
-- ON public.user_files FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid()::text = user_id);

-- DROP POLICY IF EXISTS "Users can delete own files" ON public.user_files;
-- CREATE POLICY "Users can delete own files"
-- ON public.user_files FOR DELETE
-- TO authenticated
-- USING (auth.uid()::text = user_id);

-- ============================================
-- Step 5: Create Storage policies (Development mode)
-- ============================================
-- Note: The storage bucket "user-files" must be created manually
-- Go to: Supabase Dashboard → Storage → New bucket

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'user-files');

CREATE POLICY "Allow public select"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'user-files');

CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO anon
USING (
  bucket_id = 'user-files'
  AND (storage.foldername(name))[1] = (auth.uid()::text)
);

-- ============================================
-- Step 6: Grant necessary permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE public.user_files TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if table was created
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_files'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_files';

-- Check storage policies (if any exist)
-- Note: These are managed via Storage UI
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- ============================================
-- Done!
-- ============================================
-- Next steps:
-- 1. Create the "user-files" bucket in Supabase Dashboard → Storage
-- 2. Verify files can be uploaded from the application
-- 3. When implementing authentication, switch to production policies
