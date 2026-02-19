# Data Ada Agent

A data analysis and visualization platform built with Next.js, Supabase, and ECharts.

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Supabase project created at [supabase.com](https://supabase.com)

### Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Supabase Configuration

> **详细配置指南**: 查看 [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) 获取完整的 Supabase 配置说明，包括故障排查和从开发环境迁移到生产环境的指南。

> **快速配置**: 运行项目根目录的 [supabase-setup.sql](supabase-setup.sql) 脚本一键配置数据库和权限策略。

### 1. Create Storage Bucket

Go to Supabase Dashboard → Storage → New bucket and create:

- **Name**: `user-files`
- **Public bucket**: Uncheck (for security)
- **File size limit**: 10MB
- **Allowed MIME types**: Leave empty

### 2. Configure Storage RLS Policies

In Supabase Dashboard → Storage → Policies, create the following policies for the `user-files` bucket:

#### Insert/Upload Policy
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Select Policy
```sql
CREATE POLICY "Allow authenticated select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Delete Policy
```sql
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Configure Database Table RLS Policies

In Supabase Dashboard → SQL Editor, run the following to set up the `user_files` table:

#### Create Table (if not exists)
```sql
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
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_files_user_id_idx ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS user_files_uploaded_at_idx ON public.user_files(uploaded_at DESC);
```

#### Development Mode Policies (for testing with anon key)
```sql
-- Enable RLS
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Allow all operations for development (anon role)
CREATE POLICY "Allow all operations for development"
ON public.user_files FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

#### Production Mode Policies (for authenticated users)
```sql
-- Enable RLS
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own files
CREATE POLICY "Users can view own files"
ON public.user_files FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- Allow users to insert their own files
CREATE POLICY "Users can insert own files"
ON public.user_files FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON public.user_files FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);
```

### 4. Quick Setup Script (One-Time)

Run this complete script in Supabase SQL Editor to set everything up at once:

```sql
-- ============================================
-- Supabase Setup Script for Data Ada Agent
-- ============================================

-- 1. Create Storage Bucket (must be done via UI, but we can add policies)
-- Go to: Storage → New bucket → Name: "user-files"

-- 2. Create user_files table
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

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS user_files_user_id_idx ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS user_files_uploaded_at_idx ON public.user_files(uploaded_at DESC);

-- 4. Enable RLS on user_files table
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_files (Development mode - anon)
DROP POLICY IF EXISTS "Allow all operations for development" ON public.user_files;
CREATE POLICY "Allow all operations for development"
ON public.user_files FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- 6. Create Storage policies (Development mode - anon)
-- These will be created in Storage UI, but here's the SQL:
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

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE public.user_files TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
```

## Troubleshooting

### Upload Fails with "bucket not found"

**Solution**: Create the `user-files` bucket in Supabase Dashboard → Storage.

### Upload Fails with "violates row-level security policy"

**Solution**: Run the SQL scripts above to configure RLS policies for both Storage and Database.

### Files Not Appearing in UI

**Solution**: Check browser console for errors and verify:
1. Environment variables are set correctly in `.env.local`
2. Supabase project is active
3. RLS policies allow access for your user role

## Project Structure

```
/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── layout/      # Layout components (Sidebar, etc.)
│   ├── home/        # Homepage components
│   ├── upload/      # File upload components
│   └── ui/         # Reusable UI components (shadcn/ui)
├── lib/             # Utilities and services
│   ├── supabase/    # Supabase client and services
│   └── hooks/       # Custom React hooks
└── types/           # TypeScript type definitions
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features
- [ECharts Documentation](https://echarts.apache.org/en/index.html) - learn about ECharts visualization
