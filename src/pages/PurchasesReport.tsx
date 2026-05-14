import React, { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import { ShoppingCart, Truck, History, Landmark } from 'lucide-react';
import { formatNumber } from '../lib/utils';
import axios from 'axios';

export default function PurchasesReport() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalVal: 0, totalQty: 0 });

  useEffect(() => {
    handleSearch({});
  }, []);

  const handleSearch = async (filters: any) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/reports/purchases', { filters });
      if (response.data.success) {
        const fetchedData = response.data.data as any[];
        setData(fetchedData);
        
        if (fetchedData.length > 0) {
          setColumns(Object.keys(fetchedData[0]));
        } else {
          setColumns(["المورد", "القسم", "المجموعة الرئيسية", "كمية المشتريات", "صافي القيمة"]);
        }

        const totals = fetchedData.reduce((acc, row) => ({
          totalVal: acc.totalVal + (row["الإجمالي"] || row["صافي القيمة"] || 0),
          totalQty: acc.totalQty + (row["كمية المشتريات"] || 0),
        }), { totalVal: 0, totalQty: 0 });
        setStats(totals);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PurchasesStatCard 
          label="إجمالي قيمة المشتريات" 
          value={stats.totalVal} 
          icon={<ShoppingCart className="w-5 h-5" />} 
          color="blue"
        />
        <PurchasesStatCard 
          label="إجمالي الكميات" 
          value={stats.totalQty} 
          unit="قطعة"
          icon={<Truck className="w-5 h-5" />} 
          color="emerald"
        />
      </div>

      <DataTable
        title="تقرير المشتريات والطلبيات"
        columns={columns}
        data={data}
        isLoading={isLoading}
      />
    </div>
  );
}

function PurchasesStatCard({ label, value, unit, icon, color }: { 
  label: string; 
  value: number; 
  unit?: string; 
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'orange' | 'purple'
}) {
  const styles = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    orange: "bg-orange-500/10 text-orange-600 border-orange-200",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl border ${styles[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-xl font-bold dark:text-white">{formatNumber(value)}</h4>
            {unit && <span className="text-[10px] text-slate-400">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
