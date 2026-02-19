import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端实例
// 如果环境变量未配置，使用空值（会导致错误，但不会让构建失败）
// TODO: 在实际部署时配置 Supabase 环境变量
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage bucket 名称
export const FILES_BUCKET = 'user-files';
