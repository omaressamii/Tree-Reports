import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import { TrendingUp, FileText, ShoppingBag, CreditCard, Clock } from 'lucide-react';
import { cn, formatNumber } from '../lib/utils';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function SalesReport() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, net: 0, qty: 0 });
  const location = useLocation();

  const isHourly = location.pathname.includes('hourly');
  const isDaily = location.pathname.includes('daily');
  const reportTitle = isHourly ? 'تقرير المبيعات بالساعات' : isDaily ? 'تقرير المبيعات اليومية' : 'تقرير المبيعات التفصيلي';
  
  const columns = isHourly 
    ? ["الساعة", "قيمة المبيعات", "عدد القطع", "عدد الفواتير"]
    : isDaily
    ? ["الفرع", "التاريخ", "صافي اليومية", "مرتجعات"]
    : ["المنتج", "كود الصنف", "القسم", "الكمية المباعة", "سعر الوحدة", "الإجمالي", "الضريبة", "الصافي"];

  useEffect(() => {
    handleSearch({});
  }, [location.pathname]);

  const handleSearch = async (filters: any) => {
    setIsLoading(true);
    try {
      const reportType = isHourly ? 'hourly' : isDaily ? 'daily' : 'detailed';
      const response = await axios.post('/api/reports/sales', { reportType, filters });
      
      if (response.data.success) {
        setData(response.data.data);
        
        // Calculate dynamic summary
        const newSummary = (response.data.data as any[]).reduce((acc, row) => ({
          total: acc.total + (row["الإجمالي"] || row["صافي اليومية"] || row["قيمة المبيعات"] || 0),
          net: acc.net + (row["الصافي"] || row["صافي اليومية"] || row["قيمة المبيعات"] || 0),
          qty: acc.qty + (row["الكمية المباعة"] || row["عدد القطع"] || 0),
        }), { total: 0, net: 0, qty: 0 });
        setSummary(newSummary);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryWidget label="إجمالي القيمة" value={summary.total} icon={<CreditCard className="w-5 h-5 text-blue-500" />} />
        <SummaryWidget label="صافي المبيعات" value={summary.net} icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} />
        <SummaryWidget label="إجمالي الكميات" value={summary.qty} unit="قطعة" icon={<ShoppingBag className="w-5 h-5 text-orange-500" />} />
        <SummaryWidget label="عدد السجلات" value={data.length} unit={isHourly ? "ساعة" : "صنف"} icon={<FileText className="w-5 h-5 text-purple-500" />} />
      </div>

      <div className={cn("dashboard-card p-6", isHourly && "bg-slate-900 border-slate-800 text-white")}>
         {isHourly && (
           <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-brand-light-blue" />
              <h2 className="text-xl font-bold">توزيع النشاط خلال اليوم</h2>
           </div>
         )}
         <DataTable
          title={reportTitle}
          columns={columns}
          data={data}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function SummaryWidget({ label, value, unit, icon }: { label: string; value: number; unit?: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold dark:text-white">{formatNumber(value)}</span>
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
