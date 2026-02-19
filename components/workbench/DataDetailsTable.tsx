'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, ArrowUp, ArrowDown } from 'lucide-react';

interface DataDetailsTableProps {
  data: Record<string, string | number>[];
}

export default function DataDetailsTable({ data }: DataDetailsTableProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering state
  const [filterColumn, setFilterColumn] = useState<string>('');
  const [filterValue, setFilterValue] = useState('');

  // Extract columns from data (or use empty array if no data)
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
  const totalRows = data?.length ?? 0;
  const totalColumns = columns.length;

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let result = [...data];

    // Apply filter
    if (filterColumn && filterValue) {
      result = result.filter((row) =>
        String(row[filterColumn])
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    // Apply sort
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal ?? '');
        const bStr = String(bVal ?? '');

        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, filterColumn, filterValue, sortColumn, sortDirection]);

  // Paginate data
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, currentPage, rowsPerPage]);

  // Reset to page 1 when filter/sort changes
  const handleFilterChange = (column: string, value: string) => {
    setFilterColumn(column);
    setFilterValue(value);
    setCurrentPage(1);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!data || data.length === 0) return;

    const headers = columns.join(',');
    const rows = data
      .map((row) => columns.map((col) => `"${row[col]}"`).join(','))
      .join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No data available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats and Actions */}
      <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>总行数: {totalRows}</span>
          <span>总列数: {totalColumns}</span>
          {filteredAndSortedData.length !== totalRows && (
            <span className="text-primary">已筛选: {filteredAndSortedData.length} 行</span>
          )}
        </div>
        <Button onClick={exportToCSV} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          导出 CSV
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2 mb-3">
        <Select
          value={filterColumn}
          onValueChange={(value) => handleFilterChange(value, filterValue)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="选择列" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部列</SelectItem>
            {columns.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="筛选值..."
          value={filterValue}
          onChange={(e) => handleFilterChange(filterColumn, e.target.value)}
          disabled={!filterColumn}
          className="flex-1"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="font-medium text-xs uppercase cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {sortColumn === col && (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell key={col} className="text-sm">
                    {String(row[col] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-muted-foreground">
          显示 {(currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)} / {filteredAndSortedData.length} 条记录
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            首页
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <span className="text-sm px-3">
            第 {currentPage} / {totalPages} 页
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            下一页
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            末页
          </Button>
        </div>
      </div>
    </div>
  );
}
