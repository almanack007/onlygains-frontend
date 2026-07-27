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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[460px] glass rounded-full border border-slate-800/80 flex justify-around py-3 px-6 z-40 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
      {navItems.map(item => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item flex flex-col items-center gap-1.5 transition-all duration-300 relative pb-1.5 ${
              isActive ? 'text-emerald-500 font-extrabold scale-110' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <IconComponent className="w-5 h-5 transition-transform duration-200" />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {isActive && (
              <span className="absolute bottom-0 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#ccff00]"></span>
            )}
          </button>
        );
      })}
    </div>
  );
};
