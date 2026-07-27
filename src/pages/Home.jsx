import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Dumbbell, Award, PlusCircle, GlassWater } from 'lucide-react';

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
    showToast('Reset today\'s water intake', 'info');
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
    <div id="panelHome" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
      {/* LEFT SECTION: Summary dials & stats (Column span 7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Calories and macros rings */}
        <div className="glass rounded-2xl p-5 sm:p-6 text-center">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center justify-between">
            <span data-i18n="todays_energy">{dict.todays_energy}</span>
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{calPercent}% {dict.target} Hit</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
            
            {/* Energy (Calories) Dial */}
            <div className="glass rounded-2xl p-4 text-center w-full max-w-[150px] hover:border-emerald-500/30 transition-all duration-300">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1f2937" strokeWidth="7" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#10b981" strokeWidth="7" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(calPercent), '--ring-glow-color': '#10b98180' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-black text-base sm:text-lg text-slate-100">{calPercent}%</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase">Energy</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm font-bold text-slate-300">
                {consumed} <span className="text-slate-500 font-normal">/</span> {targetCalories + burned} <span className="text-[10px] text-slate-500 font-normal">kcal</span>
              </p>
            </div>

            {/* Protein Dial */}
            <div className="glass rounded-2xl p-4 text-center w-full max-w-[150px] hover:border-emerald-500/30 transition-all duration-300">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1f2937" strokeWidth="7" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#3b82f6" strokeWidth="7" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(proteinPercent), '--ring-glow-color': '#3b82f680' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-black text-base sm:text-lg text-slate-100">{proteinPercent}%</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase">{dict.protein}</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm font-bold text-slate-300">
                {Math.round(totals.protein)} <span className="text-slate-500 font-normal">/</span> {targetProtein} <span className="text-[10px] text-slate-500 font-normal">g</span>
              </p>
            </div>

            {/* Carbs Dial */}
            <div className="glass rounded-2xl p-4 text-center w-full max-w-[150px] hover:border-emerald-500/30 transition-all duration-300">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1f2937" strokeWidth="7" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(carbsPercent), '--ring-glow-color': '#f59e0b80' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-black text-base sm:text-lg text-slate-100">{carbsPercent}%</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase">{dict.carbs}</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm font-bold text-slate-300">
                {Math.round(totals.carbs)} <span className="text-slate-500 font-normal">/</span> {targetCarbs} <span className="text-[10px] text-slate-500 font-normal">g</span>
              </p>
            </div>

            {/* Fats Dial */}
            <div className="glass rounded-2xl p-4 text-center w-full max-w-[150px] hover:border-emerald-500/30 transition-all duration-300">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <svg viewBox="0 0 90 90" className="w-full h-full">
                  <circle cx="45" cy="45" r="36" stroke="#1f2937" strokeWidth="7" fill="none"/>
                  <circle 
                    className="ring ring-glow" 
                    cx="45" cy="45" r="36" 
                    stroke="#ec4899" strokeWidth="7" strokeLinecap="round" fill="none" 
                    style={{ strokeDashoffset: getOffset(fatPercent), '--ring-glow-color': '#ec489980' }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div>
                    <p className="font-black text-base sm:text-lg text-slate-100">{fatPercent}%</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase">{dict.fats}</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm font-bold text-slate-300">
                {Math.round(totals.fat)} <span className="text-slate-500 font-normal">/</span> {targetFat} <span className="text-[10px] text-slate-500 font-normal">g</span>
              </p>
            </div>

          </div>

          {/* Quick summary metrics */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">{dict.target}</p>
              <p className="text-base sm:text-lg font-black text-slate-200">{targetCalories}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">{dict.food}</p>
              <p className="text-base sm:text-lg font-black text-emerald-400">{consumed}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">{dict.burned}</p>
              <p className="text-base sm:text-lg font-black text-blue-400">{burned}</p>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs text-slate-400 font-medium">
              <span className="font-black text-sm text-slate-100 mr-1">{remainingCals}</span> 
              <span data-i18n="kcal_remaining">{dict.kcal_remaining}</span>
            </p>
          </div>
        </div>

        {/* Water Intake Widget */}
        <div className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center justify-between">
            <span data-i18n="water_intake">{dict.water_intake}</span>
            <span className="text-slate-400 text-xs">{waterIntake} / {targetWater} ml</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Animated bottle graphic grid */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
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
                      className="water-bottle-wrapper cursor-pointer opacity-90 hover:opacity-100 transition-all duration-200" 
                      onClick={() => handleAddWater(250)}
                    >
                      <div className="water-bottle-cap"></div>
                      <div className="water-bottle-container">
                        <div className="bottle-groove" style={{ top: '30%' }}></div>
                        <div className="bottle-groove" style={{ top: '50%' }}></div>
                        <div className="bottle-groove" style={{ top: '70%' }}></div>
                        <div 
                          className="water-bottle-fill" 
                          style={{ height: `${bottle.percent}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-slate-800 z-20 mix-blend-difference">
                          {bottle.label}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <p 
                className="text-[10px] text-slate-500 font-bold uppercase hover:text-emerald-400 transition cursor-pointer"
                onClick={() => handleAddWater(250)}
              >
                +250ml Glass (Click bottle to drink)
              </p>
            </div>

            {/* Quick add water buttons */}
            <div className="flex-1 space-y-4 text-center sm:text-left w-full">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Drinking enough water boosts muscle protein synthesis and speeds up recovery. Tap the bottle or click below.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <button onClick={() => handleAddWater(250)} className="rounded-xl border border-slate-700 bg-slate-900/55 hover:border-blue-400 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5">
                  <GlassWater className="w-3.5 h-3.5 text-blue-400" /> +250ml
                </button>
                <button onClick={() => handleAddWater(500)} className="rounded-xl border border-slate-700 bg-slate-900/55 hover:border-blue-400 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5">
                  <GlassWater className="w-3.5 h-3.5 text-blue-400" /> +500ml
                </button>
                <button onClick={() => setIsWaterOpen(true)} className="rounded-xl border border-slate-700 bg-slate-900/55 hover:border-blue-400 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-all">
                  Custom
                </button>
                <button onClick={handleResetWater} className="rounded-xl border border-red-500/30 hover:border-red-500 bg-red-500/5 px-3.5 py-2 text-xs font-semibold text-red-400 transition-all">
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
        <div className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-slate-200" data-i18n="todays_meals">{dict.todays_meals}</h2>
            {totals.foods.length > 0 && (
              <button 
                onClick={handleClearAll} 
                className="text-xs font-bold text-red-400 hover:text-red-300 transition uppercase tracking-wider"
                data-i18n="clear_all"
              >
                {dict.clear_all}
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto thin-scroll pr-1">
            {totals.foods.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No meals recorded today yet.</p>
            ) : (
              totals.foods.map((food, index) => {
                // Find actual index in global todayLog
                const globalIndex = todayLog.findIndex(x => x.timestamp === food.timestamp);
                return (
                  <div key={food.timestamp || index} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition">
                    <div>
                      <p className="font-semibold text-xs text-slate-200">{food.name || food.label}</p>
                      <p className="text-[10px] text-slate-500 mt-1 capitalize">
                        {food.servingAmount} {food.unit || 'g'} • {food.cal} kcal • P: {Math.round(food.protein)}g
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteItem(globalIndex)} 
                      className="text-slate-600 hover:text-red-400 p-1.5 transition rounded-lg hover:bg-red-500/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Logged exercises */}
        <div className="glass rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-bold text-slate-200" data-i18n="logged_exercises">{dict.logged_exercises}</h2>
            <button 
              onClick={() => setIsExerciseOpen(true)} 
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 uppercase tracking-wider"
              data-i18n="log_exercise"
            >
              <PlusCircle className="w-3.5 h-3.5" /> {dict.log_exercise}
            </button>
          </div>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto thin-scroll pr-1">
            {totals.exercises.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No workouts logged today.</p>
            ) : (
              totals.exercises.map((ex, index) => {
                const globalIndex = todayLog.findIndex(x => x.timestamp === ex.timestamp);
                return (
                  <div key={ex.timestamp || index} className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-slate-700 transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 grid place-items-center">
                        <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-200">{ex.name || ex.label}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {ex.duration} mins • {Math.abs(ex.cal)} kcal burned
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteItem(globalIndex)} 
                      className="text-slate-600 hover:text-red-400 p-1.5 transition rounded-lg hover:bg-red-500/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-sm glass rounded-2xl p-5 sm:p-6 slide-up text-left">
            <h3 className="text-base font-bold text-slate-200 mb-4" data-i18n="log_exercise">{dict.log_exercise}</h3>
            
            <form onSubmit={handleSaveExercise} className="space-y-4">
              <label className="block">
                <span className="text-xs text-slate-400 block mb-1.5" data-i18n="exercise_name">{dict.exercise_name}</span>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Squats, Bench Press"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs text-slate-400 block mb-1.5" data-i18n="duration_mins">{dict.duration_mins}</span>
                  <input 
                    type="number" 
                    required
                    placeholder="30"
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400 block mb-1.5" data-i18n="calories_burned">{dict.calories_burned}</span>
                  <input 
                    type="number" 
                    required
                    placeholder="250"
                    value={exerciseCalories}
                    onChange={(e) => setExerciseCalories(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsExerciseOpen(false)} 
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900/55 py-3 text-xs text-slate-300 font-bold hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 text-xs transition neon"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-sm glass rounded-2xl p-5 sm:p-6 slide-up text-left">
            <h3 className="text-base font-bold text-slate-200 mb-4" data-i18n="log_water">{dict.log_water}</h3>
            
            <form onSubmit={handleCustomWaterSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs text-slate-400 block mb-1.5" data-i18n="custom_amount">{dict.custom_amount}</span>
                <input 
                  type="number" 
                  required
                  placeholder="300"
                  value={customWater}
                  onChange={(e) => setCustomWater(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-slate-100 text-sm placeholder-slate-600"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsWaterOpen(false)} 
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900/55 py-3 text-xs text-slate-300 font-bold hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 text-xs transition shadow-[0_0_15px_rgba(59,130,246,0.3)]"
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
