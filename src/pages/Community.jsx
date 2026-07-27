import React from 'react';
import { useApp } from '../context/AppContext';
import { Share2, Copy, Users, Trophy, Award } from 'lucide-react';

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
    <div id="panelCommunity" className="tab-panel max-w-3xl mx-auto space-y-6">
      
      {/* 1. Invite Friends & Referrals */}
      <div className="glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-200" data-i18n="invite_friends">{dict.invite_friends}</h2>
          </div>
          <p className="text-xs text-slate-500" data-i18n="invite_desc">{dict.invite_desc}</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto md:max-w-md">
          <input 
            type="text" 
            readOnly 
            value={referralLink}
            className="flex-grow rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-2.5 text-xs text-slate-300 w-full"
          />
          <button 
            onClick={copyReferralLink} 
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 text-xs flex-shrink-0"
            data-i18n="copy_link"
          >
            <Copy className="w-3.5 h-3.5" /> {dict.copy_link}
          </button>
        </div>
      </div>

      {/* 2. My Groups */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-sm text-slate-200" data-i18n="my_groups">{dict.my_groups}</h3>
          <button 
            onClick={() => showToast('New Group creation coming in V2!', 'info')} 
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
            data-i18n="new_group"
          >
            {dict.new_group}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {mockGroups.map((grp) => (
            <div key={grp.name} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-200">{grp.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{grp.members} active members</p>
                </div>
              </div>
              {grp.active && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Leaderboards & Challenges */}
      <div className="glass rounded-2xl p-5 text-center flex flex-col items-center justify-center py-10 relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full" data-i18n="coming_soon">
          {dict.coming_soon}
        </div>
        
        <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700 grid place-items-center mb-4">
          <Trophy className="w-5 h-5 text-slate-400" />
        </div>
        
        <h3 className="font-bold text-sm text-slate-200 mb-1" data-i18n="leaderboards_challenges">{dict.leaderboards_challenges}</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed" data-i18n="challenges_desc">{dict.challenges_desc}</p>
      </div>

    </div>
  );
};
