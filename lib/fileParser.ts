// CSV file parser
export function parseCSV(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
          obj[header.trim()] = values[i]?.trim() || '';
          return obj;
        }, {} as Record<string, string>);
      });

      resolve(data);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// File validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    return { valid: false, error: `文件过大！最大支持 10MB` };
  }

  const fileName = file.name.toLowerCase();
  const isCSV = fileName.endsWith('.csv');
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

  if (!isCSV && !isExcel) {
    return { valid: false, error: '仅支持 CSV 和 Excel 文件' };
  }

  return { valid: true };
}
