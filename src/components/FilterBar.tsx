import React, { useState, useEffect } from 'react';
import { Filter, Calendar, Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface FilterOption {
  id: number | string;
  name: string;
}

interface FilterBarProps {
  onSearch: (filters: any) => void;
}

export default function FilterBar({ onSearch }: FilterBarProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [filterData, setFilterData] = useState<Record<string, FilterOption[]>>({
    branch: [],
    section: [],
    group: [],
    department: [],
    supplier: [],
  });

  const [selectedFilters, setSelectedFilters] = useState<Record<string, (string | number)[]>>({
    branch: [],
    section: [],
    group: [],
    department: [],
    supplier: [],
  });

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [isCompareMode, setIsCompareMode] = useState(false);

  // Fetch initial filters
  useEffect(() => {
    fetchFilters();
  }, []);

  // Hierarchical fetching
  useEffect(() => {
    const sectionId = selectedFilters.section[0];
    const groupId = selectedFilters.group[0];
    if (sectionId || groupId) {
      fetchFilters(sectionId as number, groupId as number);
    }
  }, [selectedFilters.section, selectedFilters.group]);

  const fetchFilters = async (sectionId?: number, groupId?: number) => {
    setIsLoadingFilters(true);
    try {
      const { data } = await axios.get('/api/filters', {
        params: { sectionId, groupId }
      });
      setFilterData(prev => ({
        ...prev,
        branch: data.branches || prev.branch,
        section: data.sections || prev.section,
        group: data.groups || prev.group,
        department: data.departments || prev.department,
        supplier: data.suppliers || prev.supplier,
      }));
    } catch (error) {
      console.error("Failed to load filters:", error);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const toggleOption = (category: string, id: string | number) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id];
      
      // Hierarchy reset logic: If parent changes, reset children
      const newState = { ...prev, [category]: updated };
      if (category === 'section') {
        newState.group = [];
        newState.department = [];
      } else if (category === 'group') {
        newState.department = [];
      }
      return newState;
    });
  };

  const clearCategory = (category: string) => {
    setSelectedFilters(prev => ({ ...prev, [category]: [] }));
  };

  return (
    <div className="dashboard-card p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Filter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-[10px] text-slate-400 font-bold ml-1">{isCompareMode ? 'الحالي:' : ''}</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
              className="bg-transparent border-none text-xs outline-none dark:text-white"
            />
            <span className="text-slate-400 text-xs">إلى</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
              className="bg-transparent border-none text-xs outline-none dark:text-white"
            />
          </div>
          
          <AnimatePresence>
            {isCompareMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 bg-amber-50/50 dark:bg-amber-900/10 p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/30 overflow-hidden"
              >
                <History className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-1">السابق:</span>
                <input
                  type="date"
                  className="bg-transparent border-none text-xs outline-none dark:text-white text-amber-700"
                  defaultValue={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
                <span className="text-amber-400 text-xs">إلى</span>
                <input
                  type="date"
                  className="bg-transparent border-none text-xs outline-none dark:text-white text-amber-700"
                  defaultValue={new Date(Date.now() - 335 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Filters (Popovers) */}
        {Object.entries({
          branch: "الفرع",
          section: "القسم",
          group: "المجموعة الرئيسية",
          department: "المجموعة الفرعية",
          supplier: "المورد",
        }).map(([key, label]) => (
          <div key={key} className="relative">
            <button
              onClick={() => setActivePopover(activePopover === key ? null : key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all",
                selectedFilters[key]?.length > 0
                  ? "bg-brand-blue/5 border-brand-blue text-brand-blue"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              )}
            >
              <span>{label}</span>
              {selectedFilters[key]?.length > 0 && (
                <span className="bg-brand-blue text-white text-[10px] px-1.5 rounded-full">
                  {selectedFilters[key].length}
                </span>
              )}
              <ChevronDown className={cn("w-3 h-3 transition-transform", activePopover === key && "rotate-180")} />
            </button>

            <AnimatePresence>
              {activePopover === key && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActivePopover(null)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder={`بحث في ${label}...`}
                          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pr-8 pl-2 outline-none focus:ring-2 focus:ring-brand-blue/20"
                        />
                      </div>
                      <button
                        onClick={() => clearCategory(key)}
                        className="text-[10px] text-brand-blue hover:underline mr-2 whitespace-nowrap"
                      >
                        مسح الكل
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 relative">
                      {isLoadingFilters && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                          <Loader2 className="w-4 h-4 text-brand-blue animate-spin" />
                        </div>
                      )}
                      {filterData[key]?.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => toggleOption(key, option.id)}
                          className="flex items-center justify-between w-full p-2 text-xs text-right hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group"
                        >
                          <span className={cn("dark:text-slate-300", selectedFilters[key]?.includes(option.id) && "text-brand-blue dark:text-brand-light-blue font-semibold")}>
                            {option.name}
                          </span>
                          {selectedFilters[key]?.includes(option.id) && <Check className="w-3 h-3 text-brand-blue" />}
                        </button>
                      )) || <p className="p-4 text-center text-xs text-slate-400">لا توجد بيانات</p>}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ))}

        <div className="flex items-center gap-2 px-3 border-r border-slate-200 dark:border-slate-800">
           <label className="flex items-center gap-2 cursor-pointer group">
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                isCompareMode ? "bg-brand-blue border-brand-blue" : "border-slate-300 dark:border-slate-600 group-hover:border-brand-blue"
              )}
              onClick={() => setIsCompareMode(!isCompareMode)}>
                {isCompareMode && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 select-none">مقارنة فترتين</span>
           </label>
        </div>

        {/* Global Search Button */}
        <button
          onClick={() => onSearch({ ...selectedFilters, ...dateRange, isCompareMode })}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-blue/20"
        >
          <Search className="w-4 h-4" />
          <span className="font-bold text-sm">بحث</span>
        </button>
      </div>

      {/* Selected Tags Display */}
      {(Object.entries(selectedFilters) as [string, (string | number)[]][]).some(([_, v]) => v.length > 0) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {(Object.entries(selectedFilters) as [string, (string | number)[]][]).map(([key, ids]) =>
            ids.map(id => {
              const name = filterData[key]?.find(o => o.id === id)?.name || id;
              return (
                <div key={`${key}-${id}`} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[10px] border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">{key === 'branch' ? 'فرع' : ''}:</span>
                  <span className="font-medium dark:text-white">{name}</span>
                  <button onClick={() => toggleOption(key, id)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
