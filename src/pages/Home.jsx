import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Dumbbell, Sparkles, PlusCircle, GlassWater, Utensils } from 'lucide-react';
import { WaterTank } from '../components/WaterTank';
import { motion } from 'framer-motion';

const MacroCard = ({ title, value, target, unit, percent, strokeColor, glowColor }) => {
  const radius = 32;
  const strokeWidth = 15;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (Math.min(percent, 100) / 100) * circ;

  return (
    <div className="glass p-4 aspect-square flex flex-col items-center justify-between transition-all duration-300 hover:border-white/[0.12] active:scale-[0.99] select-none text-center">
      {/* Title */}
      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
        {title}
      </span>

      {/* Progress Ring */}
      <div className="relative flex items-center justify-center w-28 h-28 my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          {/* Track Ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Ring */}
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset }}
            transition={{ type: 'spring', stiffness: 50, damping: 13 }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-extrabold text-white">{percent}%</span>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="mt-1">
        <p className="text-xs font-black text-white">
          {value}
          <span className="text-[9px] font-bold text-neutral-500 ml-1">
            / {target} {unit}
          </span>
        </p>
      </div>
    </div>
  );
};

export const Home = () => {
  const {
    userProfile, todayLog, setTodayLog, waterIntake, setWaterIntake,
    translations, lang, showToast, currentTotals, conversions,
    viewDateKey, setViewDateKey, getTodayKey
  } = useApp();

  const todayKey = getTodayKey();
  const calendarRef = useRef(null);

  // Scroll active date into view
  useEffect(() => {
    const activeEl = calendarRef.current?.querySelector('.selected-date');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [viewDateKey]);

  const getCalendarDays = () => {
    const list = [];
    const daysToDisplay = 30;
    const parts = todayKey.split('-');
    
    for (let i = daysToDisplay - 1; i >= 0; i--) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() - i);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayOfMonth = d.getDate();
      
      const isSelected = dateStr === viewDateKey;
      const isToday = dateStr === todayKey;
      list.push({ dateStr, dayOfWeek, dayOfMonth, isSelected, isToday, rawDate: d });
    }
    return list;
  };

  const calendarDays = getCalendarDays();
  const selectedDateObj = new Date(viewDateKey);
  const monthYearStr = selectedDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const [isExerciseOpen, setIsExerciseOpen]     = useState(false);
  const [exerciseName, setExerciseName]         = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [exerciseCalories, setExerciseCalories] = useState('');
  const [isWaterOpen, setIsWaterOpen]           = useState(false);
  const [customWater, setCustomWater]           = useState('');

  const dict   = translations[lang] || translations.en;
  const totals = currentTotals();

  const targetCalories = userProfile?.targetCalories || 2000;
  const targetProtein  = userProfile?.targetProtein  || 140;
  const targetCarbs    = userProfile?.targetCarbs    || 220;
  const targetFat      = userProfile?.targetFat      || 65;
  const targetWater    = userProfile?.water_goal     || 2000;

  const burned    = totals.burned_cal;
  const consumed  = totals.cal;
  const remaining = targetCalories - consumed + burned;

  const calPercent     = Math.min(Math.round((consumed / (targetCalories + burned)) * 100), 100) || 0;
  const proteinPercent = Math.min(Math.round((totals.protein / targetProtein)  * 100), 100) || 0;
  const carbsPercent   = Math.min(Math.round((totals.carbs   / targetCarbs)    * 100), 100) || 0;
  const fatPercent     = Math.min(Math.round((totals.fat     / targetFat)      * 100), 100) || 0;
  const waterPercent   = Math.min(Math.round((waterIntake    / targetWater)    * 100), 100) || 0;



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
  const handleResetWater = () => { setWaterIntake(0); showToast("Reset today's water intake", 'info'); };
  const handleDeleteItem = (index) => {
    const updated = [...todayLog];
    const removed = updated.splice(index, 1)[0];
    setTodayLog(updated);
    showToast(`Deleted ${removed.name || removed.label}`, 'info');
  };
  const handleClearAll = () => { setTodayLog([]); showToast('Cleared all logged items', 'info'); };
  const handleSaveExercise = (e) => {
    e.preventDefault();
    if (!exerciseName || !exerciseDuration || !exerciseCalories) {
      showToast('Please fill out all fields', 'error'); return;
    }
    setTodayLog([{
      type: 'exercise', label: exerciseName, name: exerciseName,
      duration: Number(exerciseDuration), cal: -Math.abs(Number(exerciseCalories)),
      protein: 0, carbs: 0, fat: 0, unit: 'mins', timestamp: Date.now()
    }, ...todayLog]);
    setExerciseName(''); setExerciseDuration(''); setExerciseCalories('');
    setIsExerciseOpen(false);
    showToast('Exercise workout logged!', 'success');
  };

  return (
    <div id="panelHome" className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1600px] mx-auto slide-up pb-24">

      {/* ── LEFT: Rings + Water ─────────────────────────── */}
      <div className="lg:col-span-7 space-y-5">

        {/* AI Insight */}
        <div className="glass p-4" style={{ background: 'rgba(173,255,47,0.06)', border: '1px solid rgba(173,255,47,0.12)' }}>
          <div className="flex items-center gap-2 mb-2" style={{ color: '#adff2f' }}>
            <Sparkles className="w-4 h-4" />
            <span className="section-label" style={{ color: '#adff2f' }}>AI Daily Recommendation</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {totals.protein < targetProtein / 2
              ? 'You are currently behind on protein targets. We recommend adding a Greek Yogurt or scoop of protein to recover from exercises.'
              : 'Excellent macro balance today! Keep drinking water to boost protein synthesis and accelerate muscle recovery.'}
          </p>
        </div>

        {/* Minimal scrollable week date selector */}
        <div className="flex flex-col py-2 select-none border-b border-white/5 pb-3">
          {/* Header: Month/Year */}
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {monthYearStr}
            </span>
            <button
              onClick={() => setViewDateKey(todayKey)}
              className="text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-[#9EFF3A] transition px-1.5 py-0.5 rounded cursor-pointer hover:bg-white/5"
            >
              Today
            </button>
          </div>

          {/* Scrollable Days row */}
          <div 
            ref={calendarRef}
            className="flex gap-2 overflow-x-auto thin-scroll pb-1.5 snap-x scroll-smooth"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {calendarDays.map((day) => (
              <button
                key={day.dateStr}
                onClick={() => setViewDateKey(day.dateStr)}
                className={`flex-shrink-0 w-11 py-1.5 px-0.5 rounded-xl border transition-all duration-200 snap-center cursor-pointer flex flex-col items-center justify-center ${
                  day.isSelected 
                    ? 'selected-date bg-white/5 border-white/10 text-white font-black' 
                    : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <span className={`text-[8px] font-medium uppercase tracking-wider ${day.isSelected ? 'text-white' : 'text-neutral-550'}`}>
                  {day.dayOfWeek}
                </span>
                <span className={`text-xs font-extrabold mt-0.5 ${day.isToday && !day.isSelected ? 'text-[#9EFF3A]' : ''}`}>
                  {day.dayOfMonth}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Dashboard Metrics Grid ─────────────────── */}
        <div className="pt-2 pb-1 space-y-4">
          <div className="px-1 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Today's Energy
            </h2>
          </div>

          {/* 2x2 Grid of MacroCards (Directly on the page background, reduced gap) */}
          <div className="grid grid-cols-2 gap-3">
            <MacroCard
              title="Calories"
              value={consumed}
              target={targetCalories + burned}
              unit="kcal"
              percent={calPercent}
              strokeColor="#adff2f"
              glowColor="rgba(173,255,47,0.25)"
            />
            <MacroCard
              title="Protein"
              value={Math.round(totals.protein)}
              target={targetProtein}
              unit="g"
              percent={proteinPercent}
              strokeColor="#38bdf8"
              glowColor="rgba(56,189,248,0.25)"
            />
            <MacroCard
              title="Carbs"
              value={Math.round(totals.carbs)}
              target={targetCarbs}
              unit="g"
              percent={carbsPercent}
              strokeColor="#fbbf24"
              glowColor="rgba(251,191,36,0.25)"
            />
            <MacroCard
              title="Fat"
              value={Math.round(totals.fat)}
              target={targetFat}
              unit="g"
              percent={fatPercent}
              strokeColor="#f472b6"
              glowColor="rgba(244,114,182,0.25)"
            />
          </div>
        </div>

        {/* ── Water Intake Redesign ─────────────────────── */}
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white" data-i18n="water_intake">
                {dict.water_intake}
              </h2>
              <p className="text-xs font-bold text-neutral-400 mt-0.5">
                Remaining: {Math.max(0, targetWater - waterIntake)} ml
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  color: '#5CC8FF',
                  background: 'rgba(11, 110, 255, 0.1)',
                  border: '1px solid rgba(11, 110, 255, 0.2)'
                }}
              >
                {waterPercent}%
              </span>
              {waterIntake >= targetWater && (
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-[#9EFF3A]/25 bg-[#9EFF3A]/10 text-[#9EFF3A]">
                  Goal Reached
                </span>
              )}
              <button
                onClick={handleResetWater}
                className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 active:scale-95 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <WaterTank
              currentWater={waterIntake}
              goalWater={targetWater}
              onAddWater={handleAddWater}
              onResetWater={handleResetWater}
            />

            {/* Quick buttons & Info */}
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex gap-2 flex-1">
                {[250, 500].map(ml => (
                  <button
                    key={ml}
                    onClick={() => handleAddWater(ml)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold transition-all bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/90 border border-white/5 active:scale-95 cursor-pointer"
                  >
                    <GlassWater className="w-3.5 h-3.5 text-[#5CC8FF]" /> +{ml}ml
                  </button>
                ))}
                <button
                  onClick={() => setIsWaterOpen(true)}
                  className="flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/90 border border-white/5 active:scale-95 cursor-pointer"
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Remaining and Tip */}
            <div className="flex items-center justify-between text-[10px] text-white/30 px-1 select-none">
              <span>{Math.max(0, targetWater - waterIntake)} ml remaining</span>
              <span className="italic">Drink water to boost recovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Meals + Exercises ─────────────────────── */}
      <div className="lg:col-span-5 space-y-5">

        {/* Today's Meals */}
        <div className="glass p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-white" data-i18n="todays_meals">{dict.todays_meals}</h2>
            {totals.foods.length > 0 && (
              <button onClick={handleClearAll} className="text-[10px] font-black uppercase tracking-wider transition" style={{ color: '#f43f5e' }}>
                {dict.clear_all}
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto thin-scroll pr-1">
            {totals.foods.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: '#2c2c2e' }}>
                  <Utensils className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                </div>
                <p className="section-label">No meals logged today</p>
              </div>
            ) : (
              totals.foods.map((food, index) => {
                const gi = todayLog.findIndex(x => x.timestamp === food.timestamp);
                return (
                  <div key={food.timestamp || index}
                    className="flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200"
                    style={{ background: '#2c2c2e', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{food.name || food.label}</p>
                      <p className="text-[10px] mt-1 capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {food.servingAmount} {food.unit || 'g'} • {food.cal} kcal • P: {Math.round(food.protein)}g
                      </p>
                    </div>
                    <button onClick={() => handleDeleteItem(gi)}
                      className="p-2 rounded-xl transition"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Logged Exercises */}
        <div className="glass p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-white" data-i18n="logged_exercises">{dict.logged_exercises}</h2>
            <button onClick={() => setIsExerciseOpen(true)}
              className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition"
              style={{ color: '#adff2f' }}
            >
              <PlusCircle className="w-4 h-4" /> {dict.log_exercise}
            </button>
          </div>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto thin-scroll pr-1">
            {totals.exercises.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: '#2c2c2e' }}>
                  <Dumbbell className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                </div>
                <p className="section-label">No workouts recorded</p>
              </div>
            ) : (
              totals.exercises.map((ex, index) => {
                const gi = todayLog.findIndex(x => x.timestamp === ex.timestamp);
                return (
                  <div key={ex.timestamp || index}
                    className="flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200"
                    style={{ background: '#2c2c2e', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl grid place-items-center" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}>
                        <Dumbbell className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">{ex.name || ex.label}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {ex.duration} mins • {Math.abs(ex.cal)} kcal burned
                        </p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteItem(gi)}
                      className="p-2 rounded-xl transition"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
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

      {/* ── Log Exercise Modal ────────────────────────────── */}
      {isExerciseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass p-6 slide-up text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-6" data-i18n="log_exercise">{dict.log_exercise}</h3>
            <form onSubmit={handleSaveExercise} className="space-y-4">
              <div>
                <span className="section-label block mb-1.5" data-i18n="exercise_name">{dict.exercise_name}</span>
                <input type="text" required placeholder="e.g. Squats, Bench Press"
                  value={exerciseName} onChange={e => setExerciseName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="section-label block mb-1.5" data-i18n="duration_mins">{dict.duration_mins}</span>
                  <input type="number" required placeholder="30"
                    value={exerciseDuration} onChange={e => setExerciseDuration(e.target.value)} />
                </div>
                <div>
                  <span className="section-label block mb-1.5" data-i18n="calories_burned">{dict.calories_burned}</span>
                  <input type="number" required placeholder="250"
                    value={exerciseCalories} onChange={e => setExerciseCalories(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsExerciseOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition"
                  style={{ background: '#2c2c2e', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition neon"
                  style={{ background: '#adff2f', color: '#000' }}
                  data-i18n="record_workout">
                  {dict.record_workout}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Log Water Modal ───────────────────────────────── */}
      {isWaterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass p-6 slide-up text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-6" data-i18n="log_water">{dict.log_water}</h3>
            <form onSubmit={handleCustomWaterSubmit} className="space-y-4">
              <div>
                <span className="section-label block mb-1.5" data-i18n="custom_amount">{dict.custom_amount}</span>
                <input type="number" required placeholder="300"
                  value={customWater} onChange={e => setCustomWater(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsWaterOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition"
                  style={{ background: '#2c2c2e', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition neon"
                  style={{ background: '#adff2f', color: '#000' }}>
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
