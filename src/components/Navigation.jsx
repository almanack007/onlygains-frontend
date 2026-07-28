import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, TrendingUp, Camera, Users, User } from 'lucide-react';

export const Navigation = () => {
  const { activeTab, setActiveTab, translations, lang } = useApp();
  const dict = translations[lang] || translations.en;

  const navItems = [
    { id: 'home',      icon: Home,       label: dict.nav_home      || 'Home'      },
    { id: 'progress',  icon: TrendingUp,  label: dict.nav_progress  || 'Progress'  },
    { id: 'lens',      icon: Camera,      label: dict.nav_lens      || 'Add Food'  },
    { id: 'community', icon: Users,       label: dict.nav_community || 'Community' },
    { id: 'profile',   icon: User,        label: dict.nav_profile   || 'Profile'   },
  ];

  return (
    <nav className="tab-bar-bg fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all duration-200 relative ${
              isActive ? 'active-nav' : ''
            }`}
            style={isActive ? { color: '#adff2f' } : { color: 'rgba(255,255,255,0.4)' }}
          >
            {/* Active background pill */}
            {isActive && (
              <span className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(173,255,47,0.08)' }} />
            )}
            <Icon
              className="w-5 h-5 relative z-10 transition-transform duration-200"
              style={isActive ? { transform: 'scale(1.12)' } : {}}
            />
            <span className="text-[9px] font-bold uppercase tracking-widest relative z-10">
              {item.label}
            </span>
            {/* Active dot */}
            {isActive && (
              <span
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                style={{ background: '#adff2f', boxShadow: '0 0 6px #adff2f' }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
