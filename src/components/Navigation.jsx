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
      className="fixed z-40 left-1/2 -translate-x-1/2 w-[90%] max-w-[460px] flex justify-between items-center px-2 py-1 rounded-[24px] border transition-all duration-300"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(26, 26, 26, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isCenter = item.id === 'lens';

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="relative flex-1 flex flex-col items-center justify-center py-1 rounded-[18px] transition-colors cursor-pointer select-none"
            style={{
              color: isActive ? '#9EFF3A' : 'rgba(255, 255, 255, 0.45)',
            }}
          >
            {/* Sliding Active Tab Background Capsule */}
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 rounded-[18px] z-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.04)',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            {/* Icon Wrapper (Guarantees perfect vertical alignment across all columns) */}
            <motion.div
              animate={{ scale: isActive ? 1.08 : 1.0 }}
              className={`relative z-10 flex items-center justify-center w-8 h-8 transition-all ${
                isCenter 
                  ? 'rounded-full bg-[#9EFF3A]/10 border border-[#9EFF3A]/25 text-[#9EFF3A]' 
                  : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </motion.div>

            {/* Label (Guarantees no overflow or overlap) */}
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-0.5 text-center relative z-10 select-none block max-w-full truncate px-0.5">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
