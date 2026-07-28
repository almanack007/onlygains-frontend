import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut } from 'lucide-react';

export const Header = () => {
  const { currentUser, userProfile, goalConfigs, syncStatus, signOut, setActiveTab } = useApp();

  const getGoalLabel = () => {
    if (!userProfile?.goalName) return 'None';
    const config = goalConfigs[userProfile.goalName];
    return config ? `${config.name} (${config.note})` : userProfile.goalName;
  };

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
    <header className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 py-2">
      <div className="space-y-1">
        <p style={{ color: '#adff2f' }} className="font-brand-serif italic tracking-wider text-sm uppercase">
          FitTrack Pro
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Today's Muscle Fuel
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <p className="text-slate-500">
            Goal: <span className="text-slate-300 font-medium">{getGoalLabel()}</span>
          </p>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
          <p style={{
            color: syncStatus.tone === 'ok'
              ? '#adff2f'
              : syncStatus.tone === 'warn'
              ? '#fbbf24'
              : 'rgba(255,255,255,0.35)'
          }} className="font-semibold">
            {syncStatus.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Profile button */}
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 rounded-2xl p-2 transition-all duration-200 hover:scale-[1.02]"
          style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {currentUser?.picture ? (
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                 style={{ border: '1.5px solid rgba(255,255,255,0.12)' }}>
              <img src={currentUser.picture} className="w-full h-full object-cover"
                   alt={currentUser.name} referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm"
              style={{ background: av.bg, border: `1.5px solid ${av.border}`, color: av.color }}
            >
              {getAvatarInitials()}
            </div>
          )}
          <div className="text-left hidden sm:block pr-2">
            <p className="font-bold text-sm text-white">{currentUser?.name || 'User'}</p>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {currentUser?.email || 'user@domain.com'}
            </p>
          </div>
        </button>

        {/* Sign Out */}
        <button
          onClick={signOut}
          title="Sign Out"
          className="rounded-2xl p-3 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center"
          style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
