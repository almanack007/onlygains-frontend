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
    if (!currentUser) return 'bg-slate-800 border-slate-700';
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
      blue: 'bg-blue-500/20 border-blue-500 text-blue-300',
      purple: 'bg-purple-500/20 border-purple-500 text-purple-300',
      rose: 'bg-red-500/20 border-red-500 text-red-300',
      amber: 'bg-amber-500/20 border-amber-500 text-amber-300'
    };
    return colors[currentUser.color] || 'bg-slate-800 border-slate-700';
  };

  return (
    <header className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 py-2">
      <div className="space-y-1">
        <p className="text-emerald-500 font-brand-serif italic tracking-wider text-sm uppercase">FitTrack Pro</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Today’s Muscle Fuel</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <p className="text-slate-500">Goal: <span className="text-slate-350 font-medium">{getGoalLabel()}</span></p>
          <span className="text-slate-700">•</span>
          <p className={`font-semibold ${
            syncStatus.tone === 'ok' ? 'text-emerald-400' : syncStatus.tone === 'warn' ? 'text-amber-400' : 'text-slate-500'
          }`}>
            {syncStatus.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setActiveTab('profile')} 
          className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-850/50 p-2 hover:border-emerald-500/30 transition-all duration-300 text-left hover:scale-[1.02]"
        >
          {currentUser?.picture ? (
            <div className="w-10 h-10 rounded-full border border-slate-750 overflow-hidden bg-slate-900 flex-shrink-0 flex items-center justify-center">
              <img src={currentUser.picture} className="w-full h-full object-cover" alt={currentUser.name} referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold overflow-hidden flex-shrink-0 ${getAvatarColorClass()}`}>
              <span>{getAvatarInitials()}</span>
            </div>
          )}
          <div className="text-left hidden sm:block pr-2">
            <p className="font-bold text-sm text-slate-200">{currentUser?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 font-medium">{currentUser?.email || 'user@domain.com'}</p>
          </div>
        </button>

        <button 
          onClick={signOut} 
          title="Sign Out" 
          className="rounded-2xl border border-slate-800 bg-slate-850/50 p-3 hover:border-red-500/40 text-slate-450 hover:text-red-400 transition-all duration-300 flex items-center justify-center hover:scale-[1.02]"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
