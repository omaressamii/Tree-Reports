import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Loader2, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data } = await axios.post('/api/auth/login', { username, password });
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-brand-blue rounded-2xl shadow-xl shadow-brand-blue/20 mb-4 animate-bounce-slow">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">جملة ماركت</h1>
          <p className="text-slate-500 font-medium tracking-wide italic">نظام إدارة التقارير الذكي</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 pr-1">اسم المستخدم</label>
              <div className="relative">
                <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-blue focus:bg-white dark:focus:bg-slate-900 rounded-2xl py-3 pr-12 pl-4 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 pr-1">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-blue focus:bg-white dark:focus:bg-slate-900 rounded-2xl py-3 pr-12 pl-4 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <X className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-blue/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تسجيل الدخول"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} جملة ماركت
        </p>
      </div>
    </div>
  );
}

function X({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  );
}
