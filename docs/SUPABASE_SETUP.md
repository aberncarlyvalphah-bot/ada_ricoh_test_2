# Supabase 配置指南

本文档详细说明如何配置 Supabase 以支持 Data Ada Agent 的文件上传功能。

## 目录

1. [创建 Storage Bucket](#1-创建-storage-bucket)
2. [配置 Storage 权限策略](#2-配置-storage-权限策略)
3. [配置数据库表和策略](#3-配置数据库表和策略)
4. [快速配置（一键脚本）](#4-快速配置一键脚本)
5. [故障排查](#5-故障排查)

---

## 1. 创建 Storage Bucket

### 手动创建步骤

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 在左侧导航栏点击 **Storage**
4. 点击 **New bucket** 按钮
5. 填写以下信息：
   - **Name**: `user-files`
   - **Public bucket**: 取消勾选（出于安全考虑）
   - **File size limit**: `10MB`
   - **Allowed MIME types**: 留空
6. 点击 **Create bucket**

### 验证 Bucket 是否创建成功

在 Storage 页面，你应该能看到 `user-files` bucket 出现在列表中。

---

## 2. 配置 Storage 权限策略

Storage 使用 Row Level Security (RLS) 策略来控制文件访问权限。

### 开发环境策略（推荐用于测试）

#### Insert/Upload 策略

允许匿名用户上传文件到 `user-files` bucket：

```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'user-files');
```

#### Select 策略

允许匿名用户读取 `user-files` bucket 中的文件：

```sql
CREATE POLICY "Allow public select"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'user-files');
```

#### Delete 策略

允许用户删除自己的文件：

```sql
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO anon
USING (
  bucket_id = 'user-files'
  AND (storage.foldername(name))[1] = (auth.uid()::text)
);
```

### 生产环境策略（认证用户）

实现用户认证后，应该使用以下策略：

#### Upload 策略

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Select 策略

```sql
CREATE POLICY "Allow authenticated select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Delete 策略

```sql
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 3. 配置数据库表和策略

### 创建 user_files 表

在 Supabase Dashboard → SQL Editor 中运行：

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
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 创建索引（提升查询性能）

```sql
CREATE INDEX IF NOT EXISTS user_files_user_id_idx ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS user_files_uploaded_at_idx ON public.user_files(uploaded_at DESC);
```

### 启用 Row Level Security

```sql
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
```

### 创建 RLS 策略

#### 开发环境策略（推荐）

```sql
-- 允许所有操作（用于测试）
CREATE POLICY "Allow all operations for development"
ON public.user_files FOR ALL
TO anon
USING (true)
WITH CHECK (true);
```

#### 生产环境策略

```sql
-- 用户可以查看自己的文件
CREATE POLICY "Users can view own files"
ON public.user_files FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

-- 用户可以插入自己的文件
CREATE POLICY "Users can insert own files"
ON public.user_files FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

-- 用户可以删除自己的文件
CREATE POLICY "Users can delete own files"
ON public.user_files FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);
```

### 授予权限

```sql
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE public.user_files TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
```

---

## 4. 快速配置（一键脚本）

### 使用完整脚本

项目根目录下的 `supabase-setup.sql` 文件包含了完整的配置脚本。

1. 打开 `supabase-setup.sql` 文件
2. 复制全部内容
3. 在 Supabase Dashboard → SQL Editor 中粘贴
4. 点击 **Run** 执行脚本

**注意**：脚本执行前，你仍然需要手动创建 `user-files` Storage bucket（第 1 步）。

---

## 5. 故障排查

### 问题：上传失败，错误 "bucket not found"

**原因**：Storage bucket 未创建

**解决方案**：
1. 访问 Supabase Dashboard → Storage
2. 创建名为 `user-files` 的 bucket

### 问题：上传失败，错误 "violates row-level security policy"

**原因**：Storage 或数据库表的 RLS 策略未正确配置

**解决方案**：
1. 运行 `supabase-setup.sql` 脚本
2. 或手动执行第 2、3 步的 SQL 语句

### 问题：文件上传成功但不在列表中显示

**可能原因**：
1. `user_files` 表的 RLS 策略阻止读取
2. 用户 ID 不匹配

**解决方案**：
1. 在 SQL Editor 中运行以下检查：
   ```sql
   SELECT * FROM public.user_files;
   ```
2. 如果有数据但前端不显示，检查 RLS 策略

### 问题：控制台错误 "Supabase not configured"

**原因**：环境变量未设置或应用未重启

**解决方案**：
1. 检查 `.env.local` 文件是否存在
2. 验证环境变量值是否正确
3. 重启开发服务器：
   ```bash
   npm run dev
   ```

### 验证配置是否正确

运行以下验证查询：

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'user_files';

-- 检查表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_files'
ORDER BY ordinal_position;

-- 检查 RLS 策略
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_files';

-- 检查索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'user_files';
```

---

## 从开发环境迁移到生产环境

当准备部署到生产环境时：

1. 移除开发环境的 `anon` 策略
2. 启用 `authenticated` 策略
3. 实现用户认证（参考 Supabase Auth 文档）
4. 更新前端代码以使用认证后的用户 ID

### 删除开发策略

```sql
-- 删除开发环境策略
DROP POLICY IF EXISTS "Allow all operations for development" ON public.user_files;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
```

### 启用生产策略

运行生产环境部分的 SQL 语句（见第 2、3 步）。

---

## 额外资源

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SQL Editor 文档](https://supabase.com/docs/guides/database/sql-editor)
