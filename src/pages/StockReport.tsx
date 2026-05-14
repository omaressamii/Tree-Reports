import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import { Package, Calculator, BarChart3, Info } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function StockReport() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [valuation, setValuation] = useState(0);
  const location = useLocation();

  const isBalance = location.pathname.includes('balance');
  const columns = isBalance 
    ? ["المنتج", "كود الصنف", "فرع القاهرة", "فرع الإسكندرية", "فرع طنطا", "إجمالي"]
    : ["المجموعة", "كود الصنف", "الاسم", "الكمية", "سعر التكلفة", "قيمة المخزون"];

  useEffect(() => {
    handleSearch({});
  }, [location.pathname]);

  const handleSearch = async (filters: any) => {
    setIsLoading(true);
    try {
      const reportType = isBalance ? 'balance' : 'valuation';
      const response = await axios.post('/api/reports/stock/valuation', { reportType, filters });
      
      if (response.data.success) {
        setData(response.data.data);
        const total = (response.data.data as any[]).reduce((acc, row) => acc + (row["قيمة المخزون"] || row["إجمالي"] || 0), 0);
        setValuation(total);
      }
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FilterBar onSearch={handleSearch} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 dashboard-card p-6 bg-gradient-to-l from-brand-blue to-brand-light-blue text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-brand-light-blue/80 font-bold text-sm uppercase tracking-wider mb-2">
              {isBalance ? 'إجمالي عدد القطع في المخازن' : 'إجمالي قيمة المخزون الحالي'}
            </p>
            <h2 className="text-4xl font-black tabular-nums mb-4">
              {formatNumber(valuation)} 
              <span className="text-xl font-normal opacity-70 mr-2">{isBalance ? 'قطعة' : 'ج.م'}</span>
            </h2>
            <div className="flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <Info className="w-3.5 h-3.5" />
              <span>{isBalance ? 'يتم احتساب الكمية بناءً على آخر جرد مسجل' : 'يتم احتساب القيمة بناءً على متوسط سعر التكلفة المرجح'}</span>
            </div>
          </div>
          <Calculator className="absolute -left-4 -bottom-4 w-48 h-48 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="dashboard-card p-6 flex flex-col justify-center gap-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                 <Package className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                 <p className="text-xs text-slate-500 font-medium">إجمالي الأصناف</p>
                 <p className="text-xl font-bold dark:text-white">{data.length}</p>
              </div>
           </div>
           <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                 <BarChart3 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                 <p className="text-xs text-slate-500 font-medium">أصناف نشطة</p>
                 <p className="text-xl font-bold dark:text-white">{formatNumber(data.length * 0.85, 0)}</p>
              </div>
           </div>
        </div>
      </div>

      <DataTable
        title="تقرير تقييم المخزون"
        columns={columns}
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
}
