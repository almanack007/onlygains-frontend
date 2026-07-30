import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, TrendingUp, Plus, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const { activeTab, setActiveTab, translations, lang } = useApp();
  const dict = translations[lang] || translations.en;

  const navItems = [
    { id: 'home',      icon: Home,       label: dict.nav_home      || 'Home'      },
    { id: 'progress',  icon: TrendingUp,  label: dict.nav_progress  || 'Progress'  },
    { id: 'lens',      icon: Plus,        label: dict.nav_lens      || 'Add Food'  },
    { id: 'community', icon: Users,       label: dict.nav_community || 'Community' },
    { id: 'profile',   icon: User,        label: dict.nav_profile   || 'Profile'   },
  ];

  return (
    <nav 
      className="fixed z-40 left-1/2 -translate-x-1/2 w-[90%] max-w-[460px] flex justify-between items-center px-4 py-2 rounded-[30px] border transition-all duration-300"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(30, 30, 30, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        // Custom render for the floating center "Add Food" CTA
        if (item.id === 'lens') {
          return (
            <div key={item.id} className="relative flex flex-col items-center px-2">
              <motion.button
                onClick={() => setActiveTab('lens')}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-gradient-to-tr from-[#1E293B] to-[#0F172A] border border-[#9EFF3A]/30 text-[#9EFF3A] shadow-[0_4px_18px_rgba(158,255,58,0.22)] active:scale-90 cursor-pointer"
                style={{
                  marginTop: '-24px',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-6 h-6" />
              </motion.button>
              <span 
                className="text-[9px] font-black uppercase tracking-widest mt-1.5 select-none transition-colors"
                style={{
                  color: isActive ? '#9EFF3A' : 'rgba(255, 255, 255, 0.45)',
                }}
              >
                {item.label}
              </span>
            </div>
          );
        }

        // Standard Tab Bar Item
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-colors cursor-pointer select-none active:scale-95"
            style={{
              color: isActive ? '#9EFF3A' : 'rgba(255, 255, 255, 0.45)',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 rounded-2xl z-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.07)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <motion.div
              animate={{ scale: isActive ? 1.08 : 1.0 }}
              className="relative z-10"
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1.5 relative z-10 select-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
