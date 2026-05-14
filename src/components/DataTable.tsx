import React from 'react';
import { Download, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';
import * as XLSX from 'xlsx';

interface DataTableProps {
  columns: string[];
  data: any[];
  title?: string;
  isLoading?: boolean;
}

export default function DataTable({ columns, data, title, isLoading }: DataTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${title || 'report'}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card border-none bg-transparent shadow-none space-y-4">
      <div className="flex items-center justify-between">
        {title && <h3 className="font-bold text-lg dark:text-white">{title}</h3>}
        <button
          onClick={exportToExcel}
          disabled={data.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-brand-blue" />
          تصدير إلى Excel
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentData.length > 0 ? (
                currentData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {typeof row[col] === 'number' ? formatNumber(row[col]) : (row[col] || '-')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 italic">
                    لا توجد بيانات مطابقة للبحث
                  </td>
                </tr>
              )}
            </tbody>
            {data.length > 0 && (
               <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                  <tr className="font-bold text-slate-900 dark:text-white">
                    <td className="px-4 py-3">المجموع الكلي</td>
                    {columns.slice(1).map((col, idx) => {
                      const isNumeric = typeof data[0][col] === 'number';
                      if (!isNumeric) return <td key={idx} className="px-4 py-3" />;
                      const sum = data.reduce((acc, row) => acc + (row[col] || 0), 0);
                      return <td key={idx} className="px-4 py-3">{formatNumber(sum)}</td>;
                    })}
                  </tr>
               </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center transition-colors",
                      currentPage === i + 1 ? "bg-brand-blue text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <span>
              عرض {Math.min(data.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(data.length, currentPage * itemsPerPage)} من أصل {data.length} سجل
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
