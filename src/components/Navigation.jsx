import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, TrendingUp, Camera, Users, User } from 'lucide-react';

export const Navigation = () => {
  const { activeTab, setActiveTab, translations, lang } = useApp();

  const dict = translations[lang] || translations.en;

  const navItems = [
    { id: 'home', icon: Home, label: dict.nav_home || 'Home' },
    { id: 'progress', icon: TrendingUp, label: dict.nav_progress || 'Progress' },
    { id: 'lens', icon: Camera, label: dict.nav_lens || 'Add Food' },
    { id: 'community', icon: Users, label: dict.nav_community || 'Community' },
    { id: 'profile', icon: User, label: dict.nav_profile || 'Profile' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[500px] glass rounded-2xl border border-slate-800/80 flex justify-around py-3 px-4 z-40 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
      {navItems.map(item => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? 'text-emerald-400 font-bold scale-110' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <IconComponent className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
