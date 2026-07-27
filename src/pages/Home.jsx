import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Dumbbell, Sparkles, PlusCircle, GlassWater, Utensils, Heart, TrendingUp } from 'lucide-react';

export const Home = () => {
  const { 
    userProfile, todayLog, setTodayLog, waterIntake, setWaterIntake, 
    translations, lang, showToast, currentTotals, conversions 
  } = useApp();

  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseCalories, setExerciseCalories] = useState('');

  // Water edit states
  const [isWaterOpen, setIsWaterOpen] = useState(false);
  const [customWater, setCustomWater] = useState('');

  const dict = translations[lang] || translations.en;
  const totals = currentTotals();

  // Targets
  const targetCalories = userProfile?.targetCalories || 2000;
  const targetProtein = userProfile?.targetProtein || 140;
  const targetCarbs = userProfile?.targetCarbs || 220;
  const targetFat = userProfile?.targetFat || 65;
  const targetWater = userProfile?.water_goal || 2000;

  // Remaining Calculations
  const burned = totals.burned_cal;
  const consumed = totals.cal;
  const remainingCals = targetCalories - consumed + burned;

  // Percentages
  const calPercent = Math.min(Math.round((consumed / (targetCalories + burned)) * 100), 100) || 0;
  const proteinPercent = Math.min(Math.round((totals.protein / targetProtein) * 100), 100) || 0;
  const carbsPercent = Math.min(Math.round((totals.carbs / targetCarbs) * 100), 100) || 0;
  const fatPercent = Math.min(Math.round((totals.fat / targetFat) * 100), 100) || 0;
  const waterPercent = Math.min(Math.round((waterIntake / targetWater) * 100), 100) || 0;

  // Circumference = 226
  const getOffset = (percent) => 226 - (226 * Math.min(percent, 100)) / 100;

  const handleAddWater = (ml) => {
    setWaterIntake(waterIntake + ml);
    showToast(`Added ${ml} ml of water`, 'success');
  };

  const handleCustomWaterSubmit = (e) => {
    e.preventDefault();
    const val = Number(customWater);
    if (!val || val <= 0) return;
    setWaterIntake(waterIntake + val);
    setCustomWater('');
    setIsWaterOpen(false);
    showToast(`Added ${val} ml of water`, 'success');
  };

  const handleResetWater = () => {
    setWaterIntake(0);
    showToast("Reset today's water intake", 'info');
  };

  const handleDeleteItem = (index) => {
    const updated = [...todayLog];
    const removed = updated.splice(index, 1)[0];
    setTodayLog(updated);
    showToast(`Deleted ${removed.name || removed.label}`, 'info');
  };

  const handleClearAll = () => {
    setTodayLog([]);
    showToast('Cleared all logged items', 'info');
  };

  const handleSaveExercise = (e) => {
    e.preventDefault();
    if (!exerciseName || !exerciseDuration || !exerciseCalories) {
      showToast('Please fill out all fields', 'error');
      return;
    }
    const entry = {
      type: 'exercise',
      label: exerciseName,
      name: exerciseName,
      duration: Number(exerciseDuration),
      cal: -Math.abs(Number(exerciseCalories)),
      protein: 0,
      carbs: 0,
      fat: 0,
      unit: 'mins',
      timestamp: Date.now()
    };
    setTodayLog([entry, ...todayLog]);
    setExerciseName('');
    setExerciseDuration('');
    setExerciseCalories('');
    setIsExerciseOpen(false);
    showToast('Exercise workout logged!', 'success');
  };

  return (
    <div id="panelHome" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto slide-up pb-12">
      
      {/* LEFT SECTION: Summary dials & stats (Column span 7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* AI Insight Card */}
        <div className="glass p-5 border border-emerald-500/10 bg-emerald-500/5 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-wider">AI Daily Recommendation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {totals.protein < targetProtein / 2 ? (
              <span>You are currently behind on protein targets. We recommend adding a Greek Yogurt or scoop of protein to recover from exercises.</span>
            ) : (
              <span>Excellent macro balance today! Keep drinking water to boost protein synthesis and accelerate muscle recovery.</span>
            )}
          </p>
        </div>

        {/* Calories and macros rings */}
        <div className="glass p-6 text-center">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200" data-i18n="todays_energy">
              {dict.todays_energy}
            </h2>
            <span className="text-emerald-500 font-black text-xs uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.1)]">
              {calPercent}% Completed
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
            
            {/* Energy (Calories) Dial */}
            <div className="glass p-4 text-center w-full max-w-[150px] bg-slate-900/35 border-slate-800/60">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1d1d1d" strokeWidth="6" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#ccff00" strokeWidth="6" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(calPercent), '--ring-glow-color': 'rgba(204,255,0,0.4)' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-extrabold text-base sm:text-lg text-white">{calPercent}%</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Energy</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-slate-350">
                {consumed} <span className="text-slate-655">/</span> {targetCalories + burned} <span className="text-[9px] text-slate-550 font-medium">kcal</span>
              </p>
            </div>

            {/* Protein Dial */}
            <div className="glass p-4 text-center w-full max-w-[150px] bg-slate-900/35 border-slate-800/60">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1d1d1d" strokeWidth="6" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(proteinPercent), '--ring-glow-color': 'rgba(56,189,248,0.4)' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-extrabold text-base sm:text-lg text-white">{proteinPercent}%</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{dict.protein}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-slate-350">
                {Math.round(totals.protein)} <span className="text-slate-655">/</span> {targetProtein} <span className="text-[9px] text-slate-550 font-medium">g</span>
              </p>
            </div>

            {/* Carbs Dial */}
            <div className="glass p-4 text-center w-full max-w-[150px] bg-slate-900/35 border-slate-800/60">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1d1d1d" strokeWidth="6" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(carbsPercent), '--ring-glow-color': 'rgba(251,191,36,0.4)' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-extrabold text-base sm:text-lg text-white">{carbsPercent}%</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{dict.carbs}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-slate-350">
                {Math.round(totals.carbs)} <span className="text-slate-655">/</span> {targetCarbs} <span className="text-[9px] text-slate-550 font-medium">g</span>
              </p>
            </div>

            {/* Fats Dial */}
            <div className="glass p-4 text-center w-full max-w-[150px] bg-slate-900/35 border-slate-800/60">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1d1d1d" strokeWidth="6" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#f472b6" strokeWidth="6" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(fatPercent), '--ring-glow-color': 'rgba(244,114,182,0.4)' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-extrabold text-base sm:text-lg text-white">{fatPercent}%</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{dict.fats}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-slate-350">
                {Math.round(totals.fat)} <span className="text-slate-655">/</span> {targetFat} <span className="text-[9px] text-slate-550 font-medium">g</span>
              </p>
            </div>
          </div>

          {/* Quick summary metrics */}
          <div className="mt-8 pt-6 border-t border-slate-850 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{dict.target}</p>
              <p className="text-base sm:text-lg font-black text-white mt-1">{targetCalories}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{dict.food}</p>
              <p className="text-base sm:text-lg font-black text-emerald-500 mt-1">{consumed}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{dict.burned}</p>
              <p className="text-base sm:text-lg font-black text-blue-400 mt-1">{burned}</p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
            <p className="text-xs text-slate-400 font-bold">
              <span className="font-black text-base text-emerald-500 mr-1.5 shadow-[0_0_10px_rgba(204,255,0,0.1)]">{remainingCals}</span> 
              <span data-i18n="kcal_remaining">{dict.kcal_remaining}</span>
            </p>
          </div>
        </div>

        {/* Water Intake Widget */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200" data-i18n="water_intake">
              {dict.water_intake}
            </h2>
            <span className="text-slate-400 text-xs font-bold">{waterIntake} / {targetWater} ml</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Animated bottle graphic grid */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
              <div id="waterBottles" className="flex flex-wrap gap-4 items-center justify-center p-2 w-full">
                {(() => {
                  const bottles = [];
                  const bottleCapacity = 1000;
                  const fullBottles = Math.floor(waterIntake / bottleCapacity);
                  const remainingWater = waterIntake % bottleCapacity;

                  for (let i = 0; i < fullBottles; i++) {
                    bottles.push({ label: '1 L', percent: 100 });
                  }

                  if (waterIntake === 0 || remainingWater > 0 || fullBottles === 0) {
                    const fillPercent = (remainingWater / bottleCapacity) * 100;
                    bottles.push({ label: `${remainingWater} ml`, percent: fillPercent });
                  }

                  return bottles.map((bottle, idx) => (
                    <div 
                      key={idx} 
                      className="water-bottle-wrapper cursor-pointer" 
                      onClick={() => handleAddWater(250)}
                    >
                      <div className="water-bottle-cap"></div>
                      <div className="water-bottle-container border-slate-800">
                        <div className="bottle-groove" style={{ top: '30%' }}></div>
                        <div className="bottle-groove" style={{ top: '50%' }}></div>
                        <div className="bottle-groove" style={{ top: '70%' }}></div>
                        <div 
                          className="water-bottle-fill" 
                          style={{ height: `${bottle.percent}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center font-black text-[9px] tracking-wider text-white z-20 mix-blend-difference">
                          {bottle.label}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <p 
                className="text-[10px] text-slate-500 font-extrabold uppercase hover:text-emerald-500 transition cursor-pointer tracking-wider"
                onClick={() => handleAddWater(250)}
              >
                +250ml Glass (Click bottle to drink)
              </p>
            </div>

            {/* Quick add water buttons */}
            <div className="flex-1 space-y-4 text-center sm:text-left w-full">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Drinking enough water boosts protein synthesis and accelerates physical recovery. Tap the bottle or click below.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button onClick={() => handleAddWater(250)} className="rounded-2xl border border-slate-850 bg-slate-900/60 hover:border-emerald-500/40 px-4 py-3 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5">
                  <GlassWater className="w-3.5 h-3.5 text-emerald-500" /> +250ml
                </button>
                <button onClick={() => handleAddWater(500)} className="rounded-2xl border border-slate-850 bg-slate-900/60 hover:border-emerald-500/40 px-4 py-3 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5">
                  <GlassWater className="w-3.5 h-3.5 text-emerald-500" /> +500ml
                </button>
                <button onClick={() => setIsWaterOpen(true)} className="rounded-2xl border border-slate-850 bg-slate-900/60 hover:border-emerald-500/40 px-4 py-3 text-xs font-bold text-slate-200 transition-all">
                  Custom
                </button>
                <button onClick={handleResetWater} className="rounded-2xl border border-red-500/20 hover:border-red-500 bg-red-500/5 px-4 py-3 text-xs font-bold text-red-400 transition-all">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Logs and exercises (Column span 5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Today's Meals logged */}
        <div className="glass p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200" data-i18n="todays_meals">{dict.todays_meals}</h2>
            {totals.foods.length > 0 && (
              <button 
                onClick={handleClearAll} 
                className="text-[10px] font-black text-red-400 hover:text-red-300 transition uppercase tracking-wider"
                data-i18n="clear_all"
              >
                {dict.clear_all}
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto thin-scroll pr-1">
            {totals.foods.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center mb-3">
                  <Utensils className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No meals logged today</p>
              </div>
            ) : (
              totals.foods.map((food, index) => {
                const globalIndex = todayLog.findIndex(x => x.timestamp === food.timestamp);
                return (
                  <div key={food.timestamp || index} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-850 bg-slate-900/30 hover:border-slate-700 transition duration-200">
                    <div>
                      <p className="font-bold text-xs text-slate-200">{food.name || food.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1 capitalize">
                        {food.servingAmount} {food.unit || 'g'} • {food.cal} kcal • P: {Math.round(food.protein)}g
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteItem(globalIndex)} 
                      className="text-slate-500 hover:text-red-400 p-2 transition rounded-xl hover:bg-red-500/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Logged exercises */}
        <div className="glass p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200" data-i18n="logged_exercises">{dict.logged_exercises}</h2>
            <button 
              onClick={() => setIsExerciseOpen(true)} 
              className="text-[10px] font-black text-emerald-500 hover:text-emerald-450 transition flex items-center gap-1.5 uppercase tracking-wider"
              data-i18n="log_exercise"
            >
              <PlusCircle className="w-4 h-4" /> {dict.log_exercise}
            </button>
          </div>

          <div className="space-y-3 max-h-[250px] overflow-y-auto thin-scroll pr-1">
            {totals.exercises.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center mb-3">
                  <Dumbbell className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No workouts recorded</p>
              </div>
            ) : (
              totals.exercises.map((ex, index) => {
                const globalIndex = todayLog.findIndex(x => x.timestamp === ex.timestamp);
                return (
                  <div key={ex.timestamp || index} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-850 bg-slate-900/30 hover:border-slate-700 transition duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 grid place-items-center">
                        <Dumbbell className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-200">{ex.name || ex.label}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {ex.duration} mins • {Math.abs(ex.cal)} kcal burned
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteItem(globalIndex)} 
                      className="text-slate-500 hover:text-red-400 p-2 transition rounded-xl hover:bg-red-500/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Log Exercise Modal */}
      {isExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass p-6 slide-up text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-6" data-i18n="log_exercise">{dict.log_exercise}</h3>
            
            <form onSubmit={handleSaveExercise} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="exercise_name">{dict.exercise_name}</span>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Squats, Bench Press"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="duration_mins">{dict.duration_mins}</span>
                  <input 
                    type="number" 
                    required
                    placeholder="30"
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="calories_burned">{dict.calories_burned}</span>
                  <input 
                    type="number" 
                    required
                    placeholder="250"
                    value={exerciseCalories}
                    onChange={(e) => setExerciseCalories(e.target.value)}
                    className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsExerciseOpen(false)} 
                  className="flex-1 rounded-2xl border border-slate-850 bg-slate-900/80 py-3 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3 text-xs transition neon uppercase tracking-wider"
                  data-i18n="record_workout"
                >
                  {dict.record_workout}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Custom Water Modal */}
      {isWaterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass p-6 slide-up text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 mb-6" data-i18n="log_water">{dict.log_water}</h3>
            
            <form onSubmit={handleCustomWaterSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5" data-i18n="custom_amount">{dict.custom_amount}</span>
                <input 
                  type="number" 
                  required
                  placeholder="300"
                  value={customWater}
                  onChange={(e) => setCustomWater(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsWaterOpen(false)} 
                  className="flex-1 rounded-2xl border border-slate-850 bg-slate-900/80 py-3 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3 text-xs transition neon uppercase tracking-wider"
                >
                  Add Water
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
