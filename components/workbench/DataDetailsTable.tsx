'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataDetailsTableProps {
  data: Record<string, string | number>[];
}

export default function DataDetailsTable({ data }: DataDetailsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No data available
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col} className="font-medium text-xs uppercase">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
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
  );
}
