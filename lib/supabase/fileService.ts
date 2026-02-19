import { supabase, FILES_BUCKET } from './client';
import type { UserFile } from '@/types';

// 文件大小限制：10MB

// 数据库文件记录类型
type DatabaseFile = {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  file_url: string;
  row_count: number;
  column_count: number;
  uploaded_at: string;
};
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// 单次最多上传 5 个文件
const MAX_FILES_PER_UPLOAD = 5;
// 支持的文件类型
const ALLOWED_FILE_TYPES = ['.xls', '.xlsx', '.csv'];
// 数据最大规模限制
const MAX_ROWS = 10_000;
const MAX_COLUMNS = 100;

/**
 * 生成安全的唯一文件 ID
 * 使用时间戳和随机数，避免特殊字符问题
 */
function generateFileId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `${timestamp}-${random}`;
}

/**
 * 生成安全的文件名（用于 Storage）
 * 保留中文字符，移除文件系统不支持的特殊字符
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    // 移除文件系统不支持的字符: \ / : * ? " < > |
    .replace(/[\\/:*?"<>|]/g, '_')
    // 替换空白字符为下划线
    .replace(/\s+/g, '_')
    // 移除连续的下划线
    .replace(/_+/g, '_')
    // 移除首尾下划线和点
    .replace(/^[_\.]+|[_\.]+$/g, '')
    // 截断到 100 字符（避免 Storage 路径过长）
    .substring(0, 100);
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 上传文件到 Supabase
 */
export async function uploadFile(
  file: File,
  userId: string
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  console.log('[uploadFile] Starting upload for file:', file.name, 'userId:', userId);

  if (!supabase) {
    console.error('[uploadFile] Supabase not configured');
    return {
      success: false,
      error: 'Supabase 未配置',
    };
  }

  try {
    // 验证文件类型
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      console.log('[uploadFile] Invalid file type:', fileExtension);
      return {
        success: false,
        error: `不支持的文件类型：${fileExtension}。仅支持 ${ALLOWED_FILE_TYPES.join(', ')}`,
      };
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      console.log('[uploadFile] File too large:', file.size);
      return {
        success: false,
        error: `文件过大（${formatFileSize(file.size)}）。最大支持 10MB`,
      };
    }

    // 验证文件规模（需要先解析）
    console.log('[uploadFile] Validating file data...');
    const dataValidation = await validateFileData(file);
    if (!dataValidation.valid) {
      console.log('[uploadFile] Data validation failed:', dataValidation.error);
      return {
        success: false,
        error: dataValidation.error,
      };
    }

    // 生成安全的唯一 ID（用于数据库和 Storage）
    const fileId = generateFileId();

    // 生成 Storage 路径：使用用户ID + fileId（完全避免中文字符）
    // Supabase Storage 不支持非 ASCII 字符在路径中，所以使用 fileId 作为文件名
    const storageFilePath = `${userId}/${fileId}`;

    console.log('[uploadFile] Uploading to path:', storageFilePath, 'bucket:', FILES_BUCKET);

    // 上传文件到 Storage
    const { error: uploadError } = await supabase.storage
      .from(FILES_BUCKET)
      .upload(storageFilePath, file);

    console.log('[uploadFile] Upload result:', { error: uploadError });

    if (uploadError) {
      console.error('[uploadFile] Storage upload error:', uploadError);
      return {
        success: false,
        error: `文件上传失败：${uploadError.message}`,
      };
    }

    // 获取文件 URL
    const { data: publicUrlData } = supabase.storage
      .from(FILES_BUCKET)
      .getPublicUrl(storageFilePath);

    console.log('[uploadFile] Public URL:', publicUrlData?.publicUrl);

    // 保存文件元数据到数据库（使用原始文件名显示）
    console.log('[uploadFile] Inserting into user_files table...');
    const { error: dbError } = await supabase.from('user_files').insert({
      id: fileId,
      user_id: userId,
      file_name: file.name, // 使用原始文件名
      file_size: file.size,
      file_type: file.type,
      file_path: storageFilePath,
      file_url: publicUrlData.publicUrl,
      row_count: dataValidation.rowCount,
      column_count: dataValidation.columnCount,
    }).select();

    console.log('[uploadFile] DB insert result:', {
      success: !dbError,
      error: dbError,
    });

    if (dbError) {
      console.error('[uploadFile] Database error:', dbError);
      // 尝试删除已上传的文件
      await supabase.storage.from(FILES_BUCKET).remove([storageFilePath]);
      return {
        success: false,
        error: `保存文件信息失败：${dbError.message}`,
      };
    }

    console.log('[uploadFile] Upload completed successfully, fileId:', fileId);
    return {
      success: true,
      fileId,
    };
  } catch (error) {
    console.error('[uploadFile] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 验证文件数据
 */
async function validateFileData(file: File): Promise<{
  valid: boolean;
  rowCount?: number;
  columnCount?: number;
  error?: string;
}> {
  try {
    const content = await file.arrayBuffer();

    if (file.name.endsWith('.csv')) {
      // CSV 文件解析
      const text = new TextDecoder().decode(content);
      const rows = text.split('\n').filter(row => row.trim());
      const columns = rows[0]?.split(',') || [];

      if (rows.length > MAX_ROWS + 1) {
        return {
          valid: false,
          error: `数据过大（${rows.length} 行）。最大支持 ${MAX_ROWS} 行`,
        };
      }

      if (columns.length > MAX_COLUMNS) {
        return {
          valid: false,
          error: `列数过多（${columns.length} 列）。最大支持 ${MAX_COLUMNS} 列`,
        };
      }

      return {
        valid: true,
        rowCount: rows.length - 1, // 减去表头
        columnCount: columns.length,
      };
    } else {
      // Excel 文件解析
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(content, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Record<string, unknown>[];

      if (!jsonData || jsonData.length === 0) {
        return {
          valid: false,
          error: '文件中没有数据',
        };
      }

      if (jsonData.length > MAX_ROWS) {
        return {
          valid: false,
          error: `数据过大（${jsonData.length} 行）。最大支持 ${MAX_ROWS} 行`,
        };
      }

      const columns = Object.keys(jsonData[0]);
      if (columns.length > MAX_COLUMNS) {
        return {
          valid: false,
          error: `列数过多（${columns.length} 列）。最大支持 ${MAX_COLUMNS} 列`,
        };
      }

      return {
        valid: true,
        rowCount: jsonData.length,
        columnCount: columns.length,
      };
    }
  } catch (error) {
    console.error('Validation error:', error);
    return {
      valid: false,
      error: '文件解析失败',
    };
  }
}

/**
 * 获取用户文件列表（带去重）
 */
export async function getUserFiles(userId: string): Promise<UserFile[]> {
  console.log('[getUserFiles] Called with userId:', userId);

  if (!supabase) {
    console.warn('Supabase not configured, returning empty files list');
    return [];
  }

  try {
    console.log('[getUserFiles] Querying user_files table for userId:', userId);

    const { data, error } = await supabase
      .from('user_files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    console.log('[getUserFiles] Query result:', {
      status: error ? error?.code : 'success',
      statusText: error?.message || 'Success',
      dataCount: data?.length || 0,
      error,
    });

    if (error) {
      console.error('[getUserFiles] Fetch files error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return [];
    }

    if (!data || data.length === 0) {
      console.log('[getUserFiles] No files found for user:', userId);
      return [];
    }

    // 去重：根据文件名和大小去重，保留最新的文件
    const deduplicatedFiles = deduplicateFiles(data);

    console.log('[getUserFiles] Deduplicated from', data.length, 'to', deduplicatedFiles.length, 'files');

    const files = deduplicatedFiles.map(file => ({
      id: file.id,
      name: file.file_name,
      size: file.file_size,
      uploadedAt: file.uploaded_at,
      url: file.file_url,
      rowCount: file.row_count,
      columnCount: file.column_count,
    }));

    console.log('[getUserFiles] Returning', files.length, 'files for user:', userId);
    return files;
  } catch (error) {
    console.error('[getUserFiles] Unexpected error:', error);
    return [];
  }
}

/**
 * 文件去重函数（根据文件名和大小）
 * 保留最新的文件（按上传时间排序）
 */
function deduplicateFiles(files: DatabaseFile[]): DatabaseFile[] {
  const fileMap = new Map<string, DatabaseFile>();

  for (const file of files) {
    // 使用文件名和大小作为组合键
    const key = `${file.file_name}-${file.file_size}`;

    // Map 保留后插入的值，所以会自动保留最新的文件
    if (!fileMap.has(key)) {
      fileMap.set(key, file);
    }
  }

  return Array.from(fileMap.values());
}

/**
 * 删除用户文件
 */
export async function deleteUserFile(
  fileId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase 未配置',
    };
  }

  try {
    // 删除数据库记录
    const { error: dbError } = await supabase.from('user_files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      console.error('Delete from DB error:', dbError);
      return {
        success: false,
        error: `删除文件信息失败：${dbError.message}`,
      };
    }

    // 删除 Storage 中的文件
    const { error: storageError } = await supabase.storage
      .from(FILES_BUCKET)
      .remove([filePath]);

    if (storageError) {
      console.error('Delete from Storage error:', storageError);
      return {
        success: false,
        error: `删除文件失败：${storageError.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 批量上传文件
 */
export async function uploadFiles(
  files: File[],
  userId: string
): Promise<{ success: boolean; uploaded: string[]; errors: string[] }> {
  console.log('[uploadFiles] Starting batch upload of', files.length, 'files');

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return {
      success: false,
      uploaded: [],
      errors: [`单次最多上传 ${MAX_FILES_PER_UPLOAD} 个文件`],
    };
  }

  const uploaded: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadFile(file, userId);

    if (result.success && result.fileId) {
      uploaded.push(result.fileId);
    } else {
      errors.push(`${file.name}: ${result.error || '上传失败'}`);
    }
  }

  console.log('[uploadFiles] Batch upload complete:', {
    uploaded,
    errors,
  });

  return {
    success: errors.length === 0,
    uploaded,
    errors,
  };
}

/**
 * 检查 Supabase 是否已配置
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
