import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bot } from 'lucide-react';

export const Header = () => {
  const { currentUser, userProfile, goalConfigs, syncStatus, signOut, setActiveTab, isCoachOpen, setIsCoachOpen } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 12) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getAvatarInitials = () => {
    if (!currentUser) return 'U';
    return (currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase();
  };

  const getAvatarBg = () => {
    const map = {
      emerald: { bg: 'rgba(173,255,47,0.15)', border: 'rgba(173,255,47,0.5)', color: '#adff2f' },
      blue:    { bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.5)', color: '#38bdf8' },
      purple:  { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.5)', color: '#a855f7' },
      rose:    { bg: 'rgba(244,63,94,0.15)',  border: 'rgba(244,63,94,0.5)',  color: '#f43f5e'  },
      amber:   { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.5)', color: '#fbbf24' },
    };
    return map[currentUser?.color] || { bg: '#2c2c2e', border: 'rgba(255,255,255,0.1)', color: '#fff' };
  };

  const av = getAvatarBg();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between border-b"
      style={{
        background: isScrolled ? 'rgba(22, 22, 22, 0.88)' : 'rgba(22, 22, 22, 0)',
        backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
        WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
        borderColor: isScrolled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0)',
      }}
    >
      {/* Left: Branding Logo */}
      <div 
        className="flex items-center gap-1.5 select-none cursor-pointer active:opacity-80 transition pl-1 py-1"
        onClick={() => setActiveTab('home')}
      >
        <span className="font-extrabold tracking-[0.25em] text-sm uppercase text-white font-sans">
          OnlyGains
        </span>
      </div>

      {/* Right: Actions (AI Coach Trigger + Avatar) */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsCoachOpen(!isCoachOpen)} 
          className={`p-2.5 rounded-full transition active:scale-90 cursor-pointer ${
            isCoachOpen 
              ? 'text-[#9EFF3A] bg-white/5' 
              : 'text-neutral-400 hover:text-white'
          }`}
          title="AI Coach"
        >
          <Bot className="w-5 h-5" />
        </button>

        {/* Profile Avatar widget */}
        <button 
          onClick={() => setActiveTab('profile')} 
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 active:scale-90 transition cursor-pointer ml-1"
          title="Profile"
        >
          {currentUser?.picture ? (
            <img 
              src={currentUser.picture} 
              className="w-full h-full object-cover" 
              alt={currentUser.name || 'Profile'} 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center font-black text-xs"
              style={{ background: av.bg, color: av.color }}
            >
              {getAvatarInitials()}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
