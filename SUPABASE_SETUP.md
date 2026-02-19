# Supabase 设置指南

## 环境变量配置

1. 复制 `.env.example` 为 `.env.local`：
```bash
cp .env.example .env.local
```

2. 在 Supabase 控制台获取你的项目 URL 和 Anon Key：
   - 访问 https://supabase.com/dashboard
   - 选择你的项目
   - Settings > API
   - 复制 Project URL 和 anon public key

3. 更新 `.env.local` 文件：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 数据库设置

在 Supabase SQL Editor 中创建 `user_files` 表：

### 第一步：创建表和索引

```sql
-- Create user_files table
CREATE TABLE public.user_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT,
  file_path TEXT NOT NULL,
  file_url TEXT,
  row_count INTEGER,
  column_count INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX user_files_user_id_idx ON public.user_files(user_id);
CREATE INDEX user_files_uploaded_at_idx ON public.user_files(uploaded_at DESC);
```

### 第二步：启用 Row Level Security

```sql
-- Enable Row Level Security
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
```

### 第三步：创建策略

注意：Supabase 不支持 `CREATE POLICY IF NOT EXISTS`，需要先删除再创建。

```sql
-- Policy: Users can view their own files
DROP POLICY IF EXISTS "Users can view own files" ON public.user_files;
CREATE POLICY "Users can view own files"
  ON public.user_files
  FOR SELECT
  TO authenticated
  USING (auth.uid()::TEXT = user_id);

-- Policy: Users can upload their own files
DROP POLICY IF EXISTS "Users can upload own files" ON public.user_files;
CREATE POLICY "Users can upload own files"
  ON public.user_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::TEXT = user_id);

-- Policy: Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own files" ON public.user_files;
CREATE POLICY "Users can delete own files"
  ON public.user_files
  FOR DELETE
  TO authenticated
  USING (auth.uid()::TEXT = user_id);
```

## Storage 设置

### 第一步：创建 Bucket

1. 在 Supabase 控制台进入 Storage
2. 点击 **New bucket**
3. 设置：
   - **Name**: `user-files`
   - **Public bucket**: ✅ 勾选（允许公开访问）
   - **File size limit**: 10MB
4. 点击 **Create bucket**

### 第二步：创建 Storage 策略

注意：Storage 策略也需要先删除再创建。

```sql
-- Policy: Users can upload to own folder
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
CREATE POLICY "Users can upload to own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-files'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Policy: Users can view files in their own folder
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-files'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- Policy: Users can delete files in their own folder
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-files'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );
```

## 测试

配置完成后，重启开发服务器：
```bash
cd data-ada-agent
npm run dev
```

文件上传功能现在应该可以正常工作了。

## 注意事项

- 当前使用 `MOCK_USER_ID = 'user_001'`，真实用户认证需要额外实现
- 文件上传到 Supabase Storage 路径为 `{userId}/{fileId}`
- 文件大小验证：最大 10MB
- 文件数量限制：单次最多 5 个文件
- 数据规模限制：最大 10,000 行 × 100 列
- `auth.uid()` 返回 UUID 类型，必须使用 `::TEXT` 转换来与 `TEXT` 类型的路径或 user_id 字段比较
- Supabase 不支持 `CREATE POLICY IF NOT EXISTS` 语法，需要使用 `DROP POLICY IF EXISTS` + `CREATE POLICY`
