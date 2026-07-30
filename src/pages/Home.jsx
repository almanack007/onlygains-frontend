import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Dumbbell, Sparkles, PlusCircle, Utensils } from 'lucide-react';
import { WaterTank } from '../components/WaterTank';
import { motion, AnimatePresence } from 'framer-motion';
import { ManualAddFoodModal } from '../components/ManualAddFoodModal';

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
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isManualFoodModalOpen, setIsManualFoodModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(2000);
  const [customWaterAmount, setCustomWaterAmount] = useState('');
  const [waterLogs, setWaterLogs] = useState(() => {
    const saved = localStorage.getItem('fittrack_water_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (userProfile?.water_goal) {
      setGoalInput(userProfile.water_goal);
    }
  }, [userProfile?.water_goal]);

  const dailyWaterLogs = waterLogs.filter(log => {
    if (!log.timestamp) return false;
    const d = new Date(log.timestamp);
    const logDate = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return logDate === viewDateKey;
  });

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
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const newEntry = { timestamp: Date.now(), amount: ml, time: timeStr };
    const updated = [newEntry, ...waterLogs];
    setWaterLogs(updated);
    localStorage.setItem('fittrack_water_logs', JSON.stringify(updated));
    showToast(`Added ${ml} ml of water`, 'success');
  };
  const handleResetWater = () => {
    setWaterIntake(0);
    const updated = waterLogs.filter(log => {
      const logDate = new Date(log.timestamp).getFullYear() + '-' + String(new Date(log.timestamp).getMonth() + 1).padStart(2, '0') + '-' + String(new Date(log.timestamp).getDate()).padStart(2, '0');
      return logDate !== viewDateKey;
    });
    setWaterLogs(updated);
    localStorage.setItem('fittrack_water_logs', JSON.stringify(updated));
    showToast("Reset today's water intake", 'info');
  };
  const handleDeleteWaterLog = (timestamp) => {
    const entry = waterLogs.find(l => l.timestamp === timestamp);
    if (!entry) return;
    setWaterIntake(Math.max(0, waterIntake - entry.amount));
    const updated = waterLogs.filter(l => l.timestamp !== timestamp);
    setWaterLogs(updated);
    localStorage.setItem('fittrack_water_logs', JSON.stringify(updated));
    showToast('Deleted water log', 'info');
  };
  const handleUpdateGoal = (delta) => {
    const newGoal = Math.max(250, targetWater + delta);
    setGoalInput(newGoal);
    if (userProfile) {
      const updated = { ...userProfile, water_goal: newGoal };
      setUserProfile(updated);
    }
  };
  const handleSetGoal = (value) => {
    const newGoal = Math.max(250, Math.min(10000, value));
    setGoalInput(newGoal);
    if (userProfile) {
      const updated = { ...userProfile, water_goal: newGoal };
      setUserProfile(updated);
    }
  };
  const handleCustomWaterAdd = (e) => {
    e.preventDefault();
    const val = Number(customWaterAmount);
    if (!val || val <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    handleAddWater(val);
    setCustomWaterAmount('');
  };
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
        <div className="glass p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              {dict.water_intake}
            </h2>
            <span className="text-xs font-black text-neutral-450">
              {waterIntake} / {targetWater} ml
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <WaterTank
              currentWater={waterIntake}
              goalWater={targetWater}
              onAddWater={handleAddWater}
              onResetWater={handleResetWater}
              onOpenModal={() => setIsWaterModalOpen(true)}
            />

            {/* Remaining Info */}
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-500 px-1 select-none">
              <span>Remaining: {Math.max(0, targetWater - waterIntake)} ml</span>
              {waterIntake >= targetWater && (
                <span className="text-[#9EFF3A] uppercase tracking-wider font-black">Goal Reached</span>
              )}
            </div>

            {/* Quick buttons & Custom row */}
            <div className="flex items-center justify-between gap-2 w-full mt-1">
              {[250, 500].map(ml => (
                <button
                  key={ml}
                  onClick={() => handleAddWater(ml)}
                  className="flex-1 py-2 rounded-full text-xs font-bold transition-all bg-neutral-800 hover:bg-neutral-750 text-white border border-white/5 active:scale-95 cursor-pointer"
                >
                  +{ml} ml
                </button>
              ))}
              <button
                onClick={() => setIsWaterModalOpen(true)}
                className="flex-1 py-2 rounded-full text-xs font-bold transition-all bg-neutral-800 hover:bg-neutral-750 text-white border border-white/5 active:scale-95 cursor-pointer"
              >
                Custom
              </button>
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsManualFoodModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#9EFF3A] hover:bg-[#8ee02e] text-slate-950 text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(158,255,58,0.1)]"
              >
                <Plus className="w-3.5 h-3.5" /> Add Food
              </button>
              {totals.foods.length > 0 && (
                <button onClick={handleClearAll} className="text-[10px] font-black uppercase tracking-wider transition text-rose-500 hover:text-rose-450 cursor-pointer">
                  {dict.clear_all}
                </button>
              )}
            </div>
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

      {/* ── Log Water Modal (Redesigned Screen) ───────────────────────────────── */}
      <AnimatePresence>
        {isWaterModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWaterModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-[#161616] border-t border-white/10 rounded-t-[32px] p-6 z-50 overflow-y-auto max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] text-left"
            >
              {/* Handlebar for dragging */}
              <div className="w-12 h-1 bg-white/15 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider text-white">Water Intake</h2>
                  <p className="text-xs font-bold text-neutral-400 mt-0.5">
                    {waterIntake} / {targetWater} ml
                  </p>
                </div>
                <button
                  onClick={() => setIsWaterModalOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
                >
                  Done
                </button>
              </div>

              <div className="space-y-6">
                {/* Daily Goal Editor */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">
                    Daily Goal
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateGoal(-250)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-base font-black hover:bg-white/10 active:scale-95 transition cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="250"
                        max="10000"
                        value={goalInput}
                        onChange={(e) => handleSetGoal(parseInt(e.target.value) || 0)}
                        className="w-20 bg-neutral-900 border border-white/5 rounded-xl py-2 text-center text-sm font-black text-white focus:outline-none focus:border-[#9EFF3A]/50"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateGoal(250)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-base font-black hover:bg-white/10 active:scale-95 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">ml</span>
                  </div>
                </div>

                {/* Quick Add Grid */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">
                    Quick Add
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {[250, 500, 750, 1000].map(ml => (
                      <button
                        key={ml}
                        onClick={() => handleAddWater(ml)}
                        className="py-3 rounded-2xl bg-neutral-800 border border-white/5 hover:bg-neutral-750 text-white font-bold text-sm active:scale-95 transition cursor-pointer"
                      >
                        +{ml} ml
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Form */}
                <form onSubmit={handleCustomWaterAdd} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">
                    Enter Amount (ml)
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 350"
                      value={customWaterAmount}
                      onChange={e => setCustomWaterAmount(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-white/5 rounded-xl py-2 px-3 text-sm font-bold text-white focus:outline-none focus:border-[#9EFF3A]/50"
                    />
                    <button
                      type="submit"
                      className="px-5 rounded-xl bg-[#adff2f] hover:bg-[#9ee628] text-black font-black uppercase tracking-wider text-xs active:scale-95 transition cursor-pointer"
                    >
                      Add Water
                    </button>
                  </div>
                </form>

                {/* History list */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Water History
                    </span>
                    <button
                      onClick={handleResetWater}
                      className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-350 transition cursor-pointer"
                    >
                      Reset Today
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto thin-scroll">
                    {dailyWaterLogs.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-2 px-1">No water logged for this day yet.</p>
                    ) : (
                      dailyWaterLogs.map((log) => (
                        <div key={log.timestamp} className="flex items-center justify-between py-2 px-3 bg-white/[0.01] border border-white/5 rounded-xl text-xs">
                          <span className="text-neutral-400 font-bold">{log.time}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-extrabold">+{log.amount} ml</span>
                            <button
                              onClick={() => handleDeleteWaterLog(log.timestamp)}
                              className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-350 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ManualAddFoodModal 
        isOpen={isManualFoodModalOpen} 
        onClose={() => setIsManualFoodModalOpen(false)} 
      />
    </div>
  );
};
