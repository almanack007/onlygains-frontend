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

  const getAvatarColorClass = () => {
    if (!currentUser) return 'bg-slate-700 border-slate-600';
    const colors = {
      emerald: 'bg-emerald-500 border-emerald-400/40',
      blue: 'bg-blue-500 border-blue-400/40',
      purple: 'bg-purple-500 border-purple-400/40',
      rose: 'bg-red-500 border-red-400/40',
      amber: 'bg-amber-500 border-amber-400/40'
    };
    return colors[currentUser.color] || 'bg-slate-700 border-slate-600';
  };

  return (
    <header className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <p className="text-emerald-400 font-bold tracking-[.22em] text-xs uppercase">FitTrack Pro</p>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Today’s Muscle Fuel</h1>
        <p className="text-slate-400 mt-1">Goal: <span className="text-slate-200">{getGoalLabel()}</span></p>
        <p className={`text-xs mt-1 font-medium ${
          syncStatus.tone === 'ok' ? 'text-emerald-400' : syncStatus.tone === 'warn' ? 'text-amber-400' : 'text-slate-500'
        }`}>
          {syncStatus.message}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setActiveTab('profile')} 
          className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/55 p-2 hover:border-emerald-400/50 transition text-left"
        >
          {currentUser?.picture ? (
            <div className="w-10 h-10 rounded-full border border-slate-600 overflow-hidden bg-slate-800 flex-shrink-0 flex items-center justify-center">
              <img src={currentUser.picture} className="w-full h-full object-cover" alt={currentUser.name} referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-slate-100 overflow-hidden flex-shrink-0 ${getAvatarColorClass()}`}>
              <span>{getAvatarInitials()}</span>
            </div>
          )}
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-sm text-slate-200">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-slate-400">{currentUser?.email || 'user@domain.com'}</p>
          </div>
        </button>

        <button 
          onClick={signOut} 
          title="Sign Out" 
          className="rounded-xl border border-slate-700 bg-slate-900/55 p-3 hover:border-red-500/50 text-slate-400 hover:text-red-400 transition flex items-center justify-center"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
