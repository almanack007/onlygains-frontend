import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Target, Globe, Palette, ShieldCheck, Check, CreditCard, Lock, Sparkles, Bell, ToggleLeft, ToggleRight, X } from 'lucide-react';

export const Profile = () => {
  const { 
    currentUser, loginUser, userProfile, setUserProfile, goalConfigs,
    indianLanguages, lang, setLang, translations, applyTheme, showToast,
    apiBase, signOut, isPro
  } = useApp();

  const dict = translations[lang] || translations.en;

  // Personal Info form states
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [height, setHeight] = useState(userProfile?.height || 170);
  const [weight, setWeight] = useState(userProfile?.weight || 70);
  const [phone, setPhone] = useState(currentUser?.phone || userProfile?.phone || '');

  // Goals & Targets states
  const [selectedGoal, setSelectedGoal] = useState(userProfile?.goal || 'recomp');
  const [targetCals, setTargetCals] = useState(userProfile?.targetCalories || 2000);
  const [targetPro, setTargetPro] = useState(userProfile?.targetProtein || 130);
  const [targetCarb, setTargetCarb] = useState(userProfile?.targetCarbs || 220);
  const [targetFat, setTargetFat] = useState(userProfile?.targetFat || 60);

  // App settings states
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('fittrack_theme') || 'system');
  const [reminders, setReminders] = useState(() => localStorage.getItem('fittrack_reminders') !== 'false');
  const [waterAlerts, setWaterAlerts] = useState(() => localStorage.getItem('fittrack_water_alerts') !== 'false');

  // Modal states
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Synchronize state value defaults
  useEffect(() => {
    if (userProfile) {
      setSelectedGoal(userProfile.goal);
      setTargetCals(userProfile.targetCalories);
      setTargetPro(userProfile.targetProtein);
      setTargetCarb(userProfile.targetCarbs);
      setTargetFat(userProfile.targetFat);
    }
  }, [userProfile]);

  // Handle Diet Goal changes and autofill macro sliders
  const handleGoalChange = (newGoal) => {
    setSelectedGoal(newGoal);
    const config = goalConfigs[newGoal];
    if (config && userProfile) {
      const w = Number(weight) || userProfile.weight || 70;
      const h = Number(height) || userProfile.height || 170;
      const bmr = Math.round(
        userProfile.gender === 'male'
          ? 10 * w + 6.25 * h - 5 * userProfile.age + 5
          : 10 * w + 6.25 * h - 5 * userProfile.age - 161
      );
      const tdee = Math.round(bmr * userProfile.activity);
      const computedCals = Math.round(tdee * config.multiplier);
      
      setTargetCals(computedCals);
      setTargetPro(Math.round(w * config.proteinFactor));
      setTargetCarb(Math.round((computedCals * config.carbPct) / 4));
      setTargetFat(Math.round((computedCals * config.fatPct) / 9));
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!userProfile) return;

    const parsedWeight = Number(weight);
    const parsedHeight = Number(height);
    const gender = userProfile.gender;
    const age = userProfile.age;
    const activity = userProfile.activity;

    const bmr = Math.round(
      gender === 'male'
        ? 10 * parsedWeight + 6.25 * parsedHeight - 5 * age + 5
        : 10 * parsedWeight + 6.25 * parsedHeight - 5 * age - 161
    );
    const tdee = Math.round(bmr * activity);
    const config = goalConfigs[selectedGoal];
    const targetCalories = Math.round(tdee * config.multiplier);

    const updatedProfile = {
      ...userProfile,
      height: parsedHeight,
      weight: parsedWeight,
      bmr,
      tdee,
      phone,
      goal: selectedGoal,
      goalName: config.name,
      targetCalories,
      targetProtein: Math.round(parsedWeight * config.proteinFactor),
      targetCarbs: Math.round((targetCalories * config.carbPct) / 4),
      targetFat: Math.round((targetCalories * config.fatPct) / 9)
    };

    if (currentUser) {
      const updatedUser = { ...currentUser, name: fullName, phone };
      loginUser(updatedUser);
      localStorage.setItem('fittrack_phone', phone);
    }

    setUserProfile(updatedProfile);
    showToast('Personal information updated!', 'success');
  };

  const handleUpdateGoals = (e) => {
    e.preventDefault();
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      goal: selectedGoal,
      goalName: goalConfigs[selectedGoal]?.name || selectedGoal,
      targetCalories: Number(targetCals),
      targetProtein: Number(targetPro),
      targetCarbs: Number(targetCarb),
      targetFat: Number(targetFat)
    };

    setUserProfile(updatedProfile);
    showToast('Nutrition targets modified!', 'success');
  };

  const handleThemeChange = (newTheme) => {
    setActiveTheme(newTheme);
    localStorage.setItem('fittrack_theme', newTheme);
    applyTheme(newTheme);
    showToast(`Theme changed to ${newTheme}`, 'success');
  };



  const handleReminderToggle = () => {
    const val = !reminders;
    setReminders(val);
    localStorage.setItem('fittrack_reminders', String(val));
    showToast(`Reminders ${val ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleWaterAlertToggle = () => {
    const val = !waterAlerts;
    setWaterAlerts(val);
    localStorage.setItem('fittrack_water_alerts', String(val));
    showToast(`Water alerts ${val ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div id="panelProfile" className="tab-panel max-w-4xl mx-auto space-y-6 pb-24 slide-up">
      
      {/* Premium Subscription Plan Banner Card */}
      {isPro ? (
        <div className="glass p-6 border border-amber-500/25 bg-gradient-to-r from-amber-500/5 to-slate-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-amber-500/10 blur-[60px] pointer-events-none"></div>
          <div className="space-y-2 flex-1 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.3)] inline-block">
              OnlyGains PRO Elite
            </span>
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">★ PRO Member Active</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Congratulations! You are on the PRO plan. You have unlocked advanced AI scanning, detailed cumulative timeline graphs, and full server databases integrations.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider select-none flex-shrink-0">
            <ShieldCheck className="w-4 h-4" /> Active Subscriber
          </div>
        </div>
      ) : (
        <div className="glass p-6 border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-slate-900/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-[60px] pointer-events-none"></div>
          <div className="space-y-2 flex-1 text-left">
            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.2)] inline-block">
              OnlyGains PRO
            </span>
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-200">Unlock Premium Analytics</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Unlock cumulative metrics timeline graphs, full database backups, and unlimited log history for only ₹120 per month.
            </p>
          </div>
          <button 
            onClick={() => window.open(`${apiBase}/pay?userId=${currentUser.id}`, '_blank')}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-6 py-3.5 rounded-2xl transition duration-300 text-xs uppercase tracking-wider flex items-center justify-center gap-2 neon flex-shrink-0 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
          >
            <CreditCard className="w-4 h-4" /> Upgrade to PRO for ₹120/mo
          </button>
        </div>
      )}

      {/* Dynamic Profile and Personal Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details Form */}
        <div className="glass p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" /> {dict.personal_info}
          </h3>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="full_name">{dict.full_name}</span>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="height_cm">{dict.height_cm}</span>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white" 
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="weight_desc">{dict.weight_kg}</span>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white" 
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">WhatsApp / Phone Number</span>
              <input 
                type="tel" 
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650" 
              />
            </div>

            <button type="submit" className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 text-xs transition neon uppercase tracking-wider" data-i18n="save_profile">
              {dict.save_profile}
            </button>
          </form>
        </div>

        {/* Goals & Targets Form */}
        <div className="glass p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-6 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" /> {dict.goals_targets}
          </h3>

          <form onSubmit={handleUpdateGoals} className="space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="diet_goal">{dict.diet_goal}</span>
              <select 
                value={selectedGoal}
                onChange={(e) => handleGoalChange(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white"
              >
                {Object.entries(goalConfigs).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-bold uppercase tracking-wider text-slate-500">
                  <span data-i18n="target_cals_label">{dict.target_cals_label}</span>
                  <span className="text-slate-250 font-black">{targetCals} kcal</span>
                </div>
                <input 
                  type="range" min="1000" max="5000" step="50"
                  value={targetCals}
                  onChange={(e) => setTargetCals(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <span>Protein</span>
                    <span className="text-blue-450 font-black">{targetPro}g</span>
                  </div>
                  <input 
                    type="range" min="30" max="300" step="5"
                    value={targetPro}
                    onChange={(e) => setTargetPro(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <span>Carbs</span>
                    <span className="text-amber-555 font-black">{targetCarb}g</span>
                  </div>
                  <input 
                    type="range" min="50" max="500" step="5"
                    value={targetCarb}
                    onChange={(e) => setTargetCarb(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    <span>Fat</span>
                    <span className="text-pink-550 font-black">{targetFat}g</span>
                  </div>
                  <input 
                    type="range" min="20" max="200" step="5"
                    value={targetFat}
                    onChange={(e) => setTargetFat(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500" 
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full rounded-2xl bg-slate-900 hover:bg-slate-850 text-emerald-500 border border-emerald-500/20 font-black py-3.5 text-xs transition uppercase tracking-wider" data-i18n="update_goals">
              {dict.update_goals}
            </button>
          </form>
        </div>

      </div>

      {/* Language Switcher */}
      <div className="glass p-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-6 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" /> {dict.lang_selector}
        </h3>
        
        <div id="languageSelectorGrid" className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {indianLanguages.map((l) => {
            const isSelected = l.code === lang;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  showToast(`Language set to ${l.native}`, 'success');
                }}
                className={`rounded-2xl border p-3 text-xs text-center flex flex-col items-center justify-center transition-all bg-slate-900/20 ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-450 font-black shadow-[0_0_12px_rgba(204,255,0,0.15)]' 
                    : 'border-slate-850 hover:border-slate-700 text-slate-500'
                }`}
              >
                <span className="text-lg mb-1">{l.flag}</span>
                <span className="font-extrabold uppercase tracking-wide text-[9px]">{l.native}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* App Customization & Settings */}
      <div className="glass p-6 space-y-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2" data-i18n="app_customization">
          <Palette className="w-4 h-4 text-emerald-500" /> {dict.app_customization}
        </h3>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2.5" data-i18n="theme_pref">{dict.theme_pref}</span>
          <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-850 gap-1">
            {['light', 'dark', 'system'].map((t) => {
              const isActive = activeTheme === t;
              return (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition capitalize ${
                    isActive ? 'bg-slate-800 text-emerald-500 border border-slate-750 font-black' : 'text-slate-550 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-850">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block" data-i18n="notifications">Alert Notifications</span>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="text-[9px] font-black uppercase tracking-wider text-emerald-500 hover:text-emerald-450 transition"
            >
              View Log
            </button>
          </div>
          
          <div className="flex items-center justify-between cursor-pointer" onClick={handleReminderToggle}>
            <span className="text-xs text-slate-350" data-i18n="daily_reminders">{dict.daily_reminders}</span>
            <button className="text-slate-400 hover:text-white transition">
              {reminders ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
            </button>
          </div>
          
          <div className="flex items-center justify-between cursor-pointer" onClick={handleWaterAlertToggle}>
            <span className="text-xs text-slate-350" data-i18n="water_alerts">{dict.water_alerts}</span>
            <button className="text-slate-400 hover:text-white transition">
              {waterAlerts ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-850">
          <button
            onClick={signOut}
            className="w-full rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-black py-3.5 text-xs transition uppercase tracking-wider cursor-pointer active:scale-95 text-center block"
          >
            Log Out of Account
          </button>
        </div>
      </div>

      {/* Premium Subscription Checkout Dialog Modal */}
      {isBillingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md glass p-6 sm:p-8 slide-up text-left">
            <div className="flex items-center gap-2 mb-2 text-emerald-500">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">FitTrack Pro Elite Upgrade</h3>
            </div>
            
            <p className="text-xs text-slate-450 leading-relaxed mb-6">
              You are upgrading to the high performance Elite membership. Unlock full database sync, unlimited AI camera scan audits, and custom target schedules.
            </p>

            <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl mb-6 space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Billing Period</span>
                <span className="text-slate-200 font-bold">Monthly Recurring</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Pro Subscription Cost</span>
                <span className="text-slate-200 font-bold">£9.99 / mo</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-200 font-bold">Total Amount Due</span>
                <span className="text-emerald-500 font-black shadow-[0_0_10px_rgba(204,255,0,0.15)]">£9.99 GBP</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsBillingOpen(false)} 
                className="flex-grow rounded-2xl border border-slate-850 bg-slate-900/80 py-3.5 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-850 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  showToast('Simulated payment success! Welcome to FitTrack Pro Elite.', 'success');
                  setIsBillingOpen(false);
                }}
                className="flex-grow rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 text-xs transition neon uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> <span>Pay Securely</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Log Slider Panel Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass p-6 slide-up text-left">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Bell className="w-4.5 h-4.5 text-emerald-500 animate-bounce" />
                <h3 className="text-xs font-black uppercase tracking-wider">Notifications log</h3>
              </div>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-64 overflow-y-auto thin-scroll pr-1 mb-6 text-xs">
              <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-2xl">
                <p className="font-bold text-slate-200">Hydration Reminder</p>
                <p className="text-[10px] text-slate-500 mt-1">1 hour ago • Keep drinking water to stay hydrated.</p>
              </div>
              <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-2xl">
                <p className="font-bold text-slate-200">Streak Maintained!</p>
                <p className="text-[10px] text-slate-500 mt-1">Today • You have logged meals for 3 consecutive days.</p>
              </div>
              <div className="p-3 bg-slate-900/35 border border-slate-850 rounded-2xl opacity-75">
                <p className="font-bold text-slate-300">Goal Update Detected</p>
                <p className="text-[10px] text-slate-600 mt-1">Yesterday • Calorie limits updated based on goal configuration.</p>
              </div>
            </div>

            <button 
              onClick={() => setIsNotificationsOpen(false)}
              className="w-full rounded-2xl border border-slate-850 bg-slate-900/80 py-3 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
