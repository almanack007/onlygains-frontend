import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Target, Globe, Palette, LogOut, ShieldCheck, Check } from 'lucide-react';

export const Profile = () => {
  const { 
    currentUser, loginUser, userProfile, setUserProfile, goalConfigs,
    indianLanguages, lang, setLang, translations, applyTheme, showToast,
    apiBase, setApiBase
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
  const [customApiUrl, setCustomApiUrl] = useState(apiBase);
  const [reminders, setReminders] = useState(() => localStorage.getItem('fittrack_reminders') !== 'false');
  const [waterAlerts, setWaterAlerts] = useState(() => localStorage.getItem('fittrack_water_alerts') !== 'false');

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

    // Recalculate BMR and TDEE based on changes
    const bmr = Math.round(
      gender === 'male'
        ? 10 * parsedWeight + 6.25 * parsedHeight - 5 * age + 5
        : 10 * parsedWeight + 6.25 * parsedHeight - 5 * age - 161
    );
    const tdee = Math.round(bmr * activity);
    const config = goalConfigs[selectedGoal];
    const targetCalories = Math.round(tdee * config.multiplier);

    // Build updated profile
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

    // Save user object details
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

  const handleUpdateApiUrl = () => {
    setApiBase(customApiUrl);
    showToast('API base URL updated', 'success');
  };

  const handleReminderToggle = (e) => {
    const val = e.target.checked;
    setReminders(val);
    localStorage.setItem('fittrack_reminders', String(val));
    showToast(`Reminders ${val ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleWaterAlertToggle = (e) => {
    const val = e.target.checked;
    setWaterAlerts(val);
    localStorage.setItem('fittrack_water_alerts', String(val));
    showToast(`Water alerts ${val ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div id="panelProfile" className="tab-panel max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Dynamic Profile and Personal Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details Form */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5" data-i18n="personal_info">
            <User className="w-4 h-4 text-emerald-400" /> {dict.personal_info}
          </h3>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <label className="block">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1" data-i18n="full_name">{dict.full_name}</span>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-xs" 
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1" data-i18n="height_cm">{dict.height_cm}</span>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-xs" 
                />
              </label>
              <label className="block">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1" data-i18n="weight_desc">{dict.weight_kg}</span>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-xs" 
                />
              </label>
            </div>

            <label className="block">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">WhatsApp / Phone Number</span>
              <input 
                type="tel" 
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-xs placeholder-slate-600" 
              />
            </label>

            <button type="submit" className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 text-xs transition neon" data-i18n="save_profile">
              {dict.save_profile}
            </button>
          </form>
        </div>

        {/* Goals & Targets Form */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5" data-i18n="goals_targets">
            <Target className="w-4 h-4 text-emerald-400" /> {dict.goals_targets}
          </h3>

          <form onSubmit={handleUpdateGoals} className="space-y-4">
            <label className="block">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1" data-i18n="diet_goal">{dict.diet_goal}</span>
              <select 
                value={selectedGoal}
                onChange={(e) => handleGoalChange(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-xs"
              >
                {Object.entries(goalConfigs).map(([key, config]) => (
                  <option key={key} value={key}>{config.name}</option>
                ))}
              </select>
            </label>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-semibold" data-i18n="target_cals_label">{dict.target_cals_label}</span>
                  <span className="font-bold text-slate-200">{targetCals} kcal</span>
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
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400 font-medium">Protein</span>
                    <span className="font-bold text-blue-400">{targetPro}g</span>
                  </div>
                  <input 
                    type="range" min="30" max="300" step="5"
                    value={targetPro}
                    onChange={(e) => setTargetPro(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400 font-medium">Carbs</span>
                    <span className="font-bold text-amber-500">{targetCarb}g</span>
                  </div>
                  <input 
                    type="range" min="50" max="500" step="5"
                    value={targetCarb}
                    onChange={(e) => setTargetCarb(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-400 font-medium">Fat</span>
                    <span className="font-bold text-pink-500">{targetFat}g</span>
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

            <button type="submit" className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-3 text-xs transition border border-emerald-500/20" data-i18n="update_goals">
              {dict.update_goals}
            </button>
          </form>
        </div>

      </div>

      {/* 3. Native Language Switcher */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5" data-i18n="lang_selector">
          <Globe className="w-4 h-4 text-emerald-400" /> {dict.lang_selector}
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
                className={`rounded-xl border p-2.5 text-xs text-center flex flex-col items-center justify-center transition-all bg-slate-950/40 ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                    : 'border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <span className="text-lg mb-1">{l.flag}</span>
                <span className="font-semibold">{l.native}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. App Customization & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customizations */}
        <div className="glass rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5" data-i18n="app_customization">
            <Palette className="w-4 h-4 text-emerald-400" /> {dict.app_customization}
          </h3>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-2" data-i18n="theme_pref">{dict.theme_pref}</span>
            <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-850 gap-1">
              {['light', 'dark', 'system'].map((t) => {
                const isActive = activeTheme === t;
                return (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition capitalize ${
                      isActive ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block" data-i18n="notifications">{dict.notifications}</span>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-350" data-i18n="daily_reminders">{dict.daily_reminders}</span>
              <input 
                type="checkbox" 
                checked={reminders}
                onChange={handleReminderToggle}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950" 
              />
            </label>
            
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-slate-350" data-i18n="water_alerts">{dict.water_alerts}</span>
              <input 
                type="checkbox" 
                checked={waterAlerts}
                onChange={handleWaterAlertToggle}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950" 
              />
            </label>
          </div>
        </div>

        {/* Support, Documentation, API configs */}
        <div className="glass rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Support & Advanced Settings
          </h3>
          
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">API Endpoint Base</span>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                className="flex-grow rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-650"
              />
              <button 
                onClick={handleUpdateApiUrl}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-center"
              >
                Save
              </button>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              If running FitTrack on a mobile device or emulator, update this URL to your remote hosting server (e.g. Render) to enable cross-device databases sync.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800 text-xs">
            <a 
              href="https://github.com/almanack007/Fitnesstrack" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition"
            >
              FitTrack Pro Documentation
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
