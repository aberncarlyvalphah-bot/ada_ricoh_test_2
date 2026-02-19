'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserFile } from '@/types';
import { getUserFiles, deleteUserFile, uploadFiles } from '@/lib/supabase/fileService';

export function useFileLibrary(userId: string | null) {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * 加载文件列表
   */
  const loadFiles = useCallback(async () => {
    if (!userId) return;

    const userFiles = await getUserFiles(userId);
    setFiles(userFiles);
  }, [userId]);

  /**
   * 上传文件
   */
  const handleUpload = useCallback(async (filesToUpload: File[]) => {
    if (!userId) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFiles(filesToUpload, userId);

      // 更新进度
      setUploadProgress(100);

      if (result.success) {
        // 刷新文件列表
        await loadFiles();
      }

      return result;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [userId, loadFiles]);

  /**
   * 删除文件
   */
  const handleDelete = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const confirmed = window.confirm(`确定要删除文件 "${file.name}" 吗？`);
    if (!confirmed) return;

    const result = await deleteUserFile(fileId, `${userId}/${fileId}`);
    if (result.success) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } else {
      alert(result.error || '删除失败');
    }
  }, [files, userId]);

  /**
   * 初始化时加载文件列表
   */
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return {
    files,
    isUploading,
    uploadProgress,
    handleUpload,
    handleDelete,
    loadFiles,
  };
}
