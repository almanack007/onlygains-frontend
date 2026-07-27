import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  let typeClasses = 'bg-slate-900 border-slate-700 text-slate-300';
  if (toast.type === 'success') {
    typeClasses = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
  } else if (toast.type === 'error') {
    typeClasses = 'bg-red-500/10 border-red-500/30 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
  }

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all duration-300 z-50 flex items-center gap-2 border ${typeClasses}`}>
      {toast.message}
    </div>
  );
};
