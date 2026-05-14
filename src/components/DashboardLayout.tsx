import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Package,
  LogOut,
  Sun,
  Moon,
  User,
  BarChart3,
  Search,
} from 'lucide-react';
import { SYSTEMS } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSystems, setExpandedSystems] = useState<number[]>([101]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const toggleSystem = (code: number) => {
    setExpandedSystems(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const getSystemIcon = (code: number) => {
    switch (code) {
      case 101: return <TrendingUp className="w-5 h-5" />;
      case 103: return <ShoppingCart className="w-5 h-5" />;
      case 106: return <Package className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("min-h-screen flex", isDarkMode && "dark")}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? '280px' : '80px' }}
        className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-40 sticky top-0 h-screen transition-colors overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="bg-brand-blue p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg whitespace-nowrap dark:text-white">جملة ماركت</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {isSidebarOpen && (
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              التقارير الرئيسية
            </div>
          )}

          {SYSTEMS.map((system) => (
            <div key={system.code} className="space-y-1">
              <button
                onClick={() => isSidebarOpen && toggleSystem(system.code)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                  expandedSystems.includes(system.code)
                    ? "bg-brand-blue/5 text-brand-blue"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-1 rounded-md",
                    expandedSystems.includes(system.code) ? "bg-brand-blue text-white" : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    {getSystemIcon(system.code)}
                  </div>
                  {isSidebarOpen && <span className="font-medium whitespace-nowrap">{system.name}</span>}
                </div>
                {isSidebarOpen && (
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    expandedSystems.includes(system.code) && "rotate-180"
                  )} />
                )}
              </button>

              <AnimatePresence>
                {isSidebarOpen && expandedSystems.includes(system.code) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1 pr-4"
                  >
                    {system.reports.map((report) => (
                      <NavLink
                        key={report.id}
                        to={report.path}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 p-2 text-sm rounded-lg transition-colors border-r-2",
                          isActive
                            ? "bg-brand-blue/10 text-brand-blue border-brand-blue font-medium"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent"
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
                        <span className="whitespace-nowrap">
                          {report.docType >= 10 && report.docType <= 14 && system.code === 101 ? 'المبيعات بالأيام والساعات' : report.name}
                        </span>
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 mt-auto">
          <div className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
            <div className="bg-brand-blue/10 dark:bg-brand-blue/20 w-10 h-10 rounded-full flex items-center justify-center border border-brand-blue/20">
              <User className="w-5 h-5 text-brand-blue" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate dark:text-white">مدير النظام</p>
                <p className="text-[10px] text-slate-500 truncate">admin@gomla.com</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="group flex items-center gap-3 w-full p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isSidebarOpen && <span className="text-sm font-medium">{isDarkMode ? "الوضع المضيء" : "الوضع الليلي"}</span>}
            </button>

            <Link
              to="/logout"
              className="flex items-center gap-3 w-full p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm font-medium">تسجيل الخروج</span>}
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-w-0 flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-800 dark:text-white">
              {location.pathname === '/' ? 'لوحة القيادة العامة' : SYSTEMS.flatMap(s => s.reports).find(r => r.path === location.pathname)?.name || 'التقرير'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative max-w-xs hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في التقارير..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-brand-blue/20 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">اليوم: {new Date().toLocaleDateString('ar-EG')}</span>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
