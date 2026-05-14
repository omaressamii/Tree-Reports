import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { cn, formatNumber } from '../lib/utils';
import { motion } from 'motion/react';
import axios from 'axios';

const mockDailySales = [
  { day: 'السبت', value: 45000, prev: 38000 },
  { day: 'الأحد', value: 52000, prev: 48000 },
  { day: 'الاثنين', value: 48000, prev: 51000 },
  { day: 'الثلاثاء', value: 61000, prev: 44000 },
  { day: 'الأربعاء', value: 55000, prev: 58000 },
  { day: 'الخميس', value: 72000, prev: 65000 },
  { day: 'الجمعة', value: 85000, prev: 79000 },
];

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/stats');
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">أهلاً بك مجدداً، مدير النظام 👋</h1>
        <p className="text-slate-500">إليك نظرة سريعة على أداء العمليات اليوم.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي مبيعات اليوم"
          value={stats?.totalSales || 0}
          trend={12.5}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="عدد الفواتير"
          value={stats?.invoiceCount || 0}
          trend={-2.4}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="أصناف وصلت للحد الأدنى"
          value={stats?.lowStockCount || 0}
          icon={<Package className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="متوسط قيمة الفاتورة"
          value={stats?.avgInvoiceValue || 0}
          trend={5.2}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 dashboard-card p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg dark:text-white">أداء المبيعات الأسبوعي</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-light-blue" />
                <span className="text-xs text-slate-500">الأسبوع الحالي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500">الأسبوع السابق</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full pr-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDailySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="value" fill="#3591FF" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="prev" fill="#CBD5E1" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-card p-6 flex flex-col h-[280px]">
            <h3 className="font-bold text-md mb-6 dark:text-white flex items-center justify-between">
              <span>توزيع المبيعات</span>
              <span className="text-[10px] text-slate-400 font-normal">آخر 30 يوم</span>
            </h3>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <DepartmentProgress name="المواد الغذائية" percentage={65} color="bg-blue-500" />
              <DepartmentProgress name="المنظفات" percentage={32} color="bg-orange-500" />
              <DepartmentProgress name="أخرى" percentage={24} color="bg-slate-500" />
            </div>
          </div>

          <div className="dashboard-card p-6 flex-1">
             <h3 className="font-bold text-md mb-4 dark:text-white">تقارير حديثة الاستخدام</h3>
             <div className="space-y-3">
                <RecentReportItem title="مبيعات فرع القاهرة" time="منذ 5 دقائق" />
                <RecentReportItem title="تقييم المخزون العام" time="منذ 22 دقيقة" />
                <RecentReportItem title="مرتجع مشتريات يونيليفر" time="منذ ساعة" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentReportItem({ title, time }: { title: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-600">
             <FileText className="w-4 h-4 text-slate-400 group-hover:text-brand-blue" />
          </div>
          <span className="text-sm font-medium dark:text-slate-200">{title}</span>
       </div>
       <span className="text-[10px] text-slate-400">{time}</span>
    </div>
  );
}

function StatCard({ title, value, trend, icon, color }: {
  title: string;
  value: number;
  trend?: number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'orange' | 'purple';
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="dashboard-card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", colorMap[color])}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
            trend > 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
          )}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold dark:text-white tabular-nums">
          {formatNumber(value)}
        </h4>
      </div>
    </motion.div>
  );
}

function DepartmentProgress({ name, percentage, color }: { name: string; percentage: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
        <span className="text-slate-500 tabular-nums">{percentage}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}
