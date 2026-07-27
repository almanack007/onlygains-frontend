import React from 'react';
import { useApp } from '../context/AppContext';
import { Share2, Copy, Users, Trophy } from 'lucide-react';

export const Community = () => {
  const { currentUser, showToast, translations, lang } = useApp();

  const dict = translations[lang] || translations.en;

  const referralLink = `https://fittrack.pro/invite/${currentUser?.id || 'guest'}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast('Referral link copied to clipboard!', 'success');
  };

  const mockGroups = [
    { name: 'Muscle Titans', members: 1420, active: true },
    { name: 'Calorie Cutters', members: 928, active: true },
    { name: 'Delhi Powerlifters', members: 605, active: false },
    { name: 'Mumbai Shredders', members: 423, active: true }
  ];

  return (
    <div id="panelCommunity" className="tab-panel max-w-3xl mx-auto space-y-6 slide-up pb-16">
      
      {/* 1. Invite Friends & Referrals */}
      <div className="glass p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200" data-i18n="invite_friends">{dict.invite_friends}</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed" data-i18n="invite_desc">{dict.invite_desc}</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto md:max-w-md">
          <input 
            type="text" 
            readOnly 
            value={referralLink}
            className="flex-grow rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-slate-350 w-full"
          />
          <button 
            onClick={copyReferralLink} 
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-5 py-3 rounded-2xl transition duration-300 flex items-center justify-center gap-1.5 text-xs flex-shrink-0 neon"
            data-i18n="copy_link"
          >
            <Copy className="w-4 h-4" /> <span>{dict.copy_link}</span>
          </button>
        </div>
      </div>

      {/* 2. My Groups */}
      <div className="glass p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200" data-i18n="my_groups">{dict.my_groups}</h3>
          <button 
            onClick={() => showToast('New Group creation coming in V2!', 'info')} 
            className="text-[10px] font-black uppercase tracking-wider text-emerald-500 hover:text-emerald-450 transition"
            data-i18n="new_group"
          >
            {dict.new_group}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {mockGroups.map((grp) => (
            <div key={grp.name} className="p-4 rounded-2xl border border-slate-850 bg-slate-900/30 hover:border-slate-700 transition duration-200 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
                  <Users className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-extrabold text-xs text-slate-250">{grp.name}</p>
                  <p className="text-[10px] text-slate-550 mt-1 font-medium">{grp.members} members</p>
                </div>
              </div>
              {grp.active && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#ccff00]"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Leaderboards & Challenges */}
      <div className="glass p-6 text-center flex flex-col items-center justify-center py-12 relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.15)]" data-i18n="coming_soon">
          {dict.coming_soon}
        </div>
        
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-850 grid place-items-center mb-4">
          <Trophy className="w-5 h-5 text-slate-500" />
        </div>
        
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-200 mb-1.5" data-i18n="leaderboards_challenges">{dict.leaderboards_challenges}</h3>
        <p className="text-xs text-slate-550 max-w-xs leading-relaxed" data-i18n="challenges_desc">{dict.challenges_desc}</p>
      </div>

    </div>
  );
};
