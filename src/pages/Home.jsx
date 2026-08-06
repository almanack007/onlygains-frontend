import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Dumbbell, Sparkles, PlusCircle, Utensils, Calendar, Check, Flame } from 'lucide-react';
import { WaterTank } from '../components/WaterTank';
import { motion, AnimatePresence } from 'framer-motion';
import { ManualAddFoodModal } from '../components/ManualAddFoodModal';
import { getHDHighlightFoodImage } from '../services/foodApi';

const MacroCard = ({ title, value, target, unit, percent, strokeColor, glowColor }) => {
  const radius = 30;
  const strokeWidth = 12;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (Math.min(percent, 100) / 100) * circ;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass p-3.5 sm:p-4 aspect-square flex flex-col items-center justify-between transition-all duration-200 hover:border-white/[0.15] active:scale-[0.98] select-none text-center w-full"
    >
      {/* Title */}
      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 truncate w-full">
        {title}
      </span>

      {/* Progress Ring */}
      <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 my-0.5">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          {/* Track Ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
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
            transition={{ type: 'spring', stiffness: 55, damping: 14 }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm sm:text-base font-extrabold text-white">{percent}%</span>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="w-full truncate">
        <p className="text-xs font-black text-white truncate">
          {value}
          <span className="text-[9px] font-bold text-neutral-500 ml-1">
            / {target} {unit}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

const EXERCISE_DATASET = [
  { name: 'Running (Fast - 10 km/h)', met: 9.8, category: 'cardio' },
  { name: 'Running (Moderate - 8 km/h)', met: 8.3, category: 'cardio' },
  { name: 'Running (Slow / Jogging)', met: 6.0, category: 'cardio' },
  { name: 'Cycling (Vigorous)', met: 8.0, category: 'cardio' },
  { name: 'Cycling (Moderate)', met: 6.0, category: 'cardio' },
  { name: 'Swimming (Freestyle)', met: 5.8, category: 'cardio' },
  { name: 'Walking (Brisk)', met: 3.5, category: 'cardio' },
  { name: 'Walking (Leisurely)', met: 2.5, category: 'cardio' },
  { name: 'Jump Rope', met: 11.0, category: 'cardio' },
  { name: 'Elliptical Trainer', met: 5.0, category: 'cardio' },
  { name: 'HIIT Workout', met: 8.0, category: 'cardio' },
  { name: 'Aerobics', met: 7.3, category: 'cardio' },
  { name: 'Weight Lifting (Heavy)', met: 6.0, category: 'strength' },
  { name: 'Weight Lifting (Light/Moderate)', met: 3.0, category: 'strength' },
  { name: 'Calisthenics (Pushups/Pullups)', met: 4.5, category: 'strength' },
  { name: 'CrossFit', met: 8.0, category: 'strength' },
  { name: 'Kettlebell Training', met: 8.0, category: 'strength' },
  { name: 'Circuit Training', met: 4.3, category: 'strength' },
  { name: 'Yoga (Power / Vinyasa)', met: 4.0, category: 'flexibility' },
  { name: 'Yoga (Hatha / Restorative)', met: 2.5, category: 'flexibility' },
  { name: 'Pilates', met: 3.0, category: 'flexibility' },
  { name: 'Stretching / Flexibility', met: 2.3, category: 'flexibility' },
  { name: 'Squats', met: 5.0, category: 'strength' },
  { name: 'Bench Press', met: 5.5, category: 'strength' },
  { name: 'Deadlift', met: 6.0, category: 'strength' },
  { name: 'Push-ups', met: 4.0, category: 'strength' },
  { name: 'Pull-ups', met: 5.0, category: 'strength' },
  { name: 'Lunges', met: 4.5, category: 'strength' },
  { name: 'Burpees', met: 8.0, category: 'cardio' },
  { name: 'Plank', met: 2.8, category: 'strength' },
  { name: 'Crunches / Sit-ups', met: 3.8, category: 'strength' },
  { name: 'Basketball Game', met: 8.0, category: 'sports' },
  { name: 'Soccer / Football Game', met: 7.0, category: 'sports' },
  { name: 'Tennis (Singles)', met: 7.3, category: 'sports' },
  { name: 'Badminton', met: 5.5, category: 'sports' },
  { name: 'Boxing (Sparring)', met: 7.8, category: 'cardio' }
];

export const Home = () => {
  const {
    userProfile, todayLog, setTodayLog, waterIntake, setWaterIntake,
    translations, lang, showToast, currentTotals, conversions,
    viewDateKey, setViewDateKey, getTodayKey, setUserProfile
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
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isManualFoodModalOpen, setIsManualFoodModalOpen] = useState(false);
  const [exactWaterInput, setExactWaterInput] = useState('');
  const [goalInput, setGoalInput] = useState(2000);
  const [waterLogs, setWaterLogs] = useState(() => {
    const saved = localStorage.getItem('fittrack_water_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (userProfile?.water_goal) {
      setGoalInput(userProfile.water_goal);
    }
  }, [userProfile?.water_goal]);

  useEffect(() => {
    if (isWaterModalOpen) {
      setExactWaterInput(String(waterIntake));
    }
  }, [isWaterModalOpen, waterIntake]);

  // Lock document & body scroll when any modal is active
  useEffect(() => {
    if (isWaterModalOpen || isManualFoodModalOpen || isExerciseOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isWaterModalOpen, isManualFoodModalOpen, isExerciseOpen]);

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

  const handleUpdateExactWater = (e) => {
    e.preventDefault();
    const val = Number(exactWaterInput);
    if (val < 0 || isNaN(val)) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setWaterIntake(val);
    showToast(`Updated exact intake to ${val} ml`, 'success');
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

  const handleDeleteItem = (index) => {
    const updated = [...todayLog];
    const removed = updated.splice(index, 1)[0];
    setTodayLog(updated);
    showToast(`Deleted ${removed.name || removed.label}`, 'info');
  };

  const handleClearAll = () => { setTodayLog([]); showToast('Cleared all logged items', 'info'); };

  const handleExerciseNameChange = (val) => {
    setExerciseName(val);
    if (val.trim().length > 0) {
      const filtered = EXERCISE_DATASET.filter(ex => 
        ex.name.toLowerCase().includes(val.toLowerCase())
      );
      setExerciseSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setExerciseSuggestions([]);
      setShowSuggestions(false);
      setSelectedExercise(null);
    }
  };

  const handleSelectSuggestion = (ex) => {
    setExerciseName(ex.name);
    setSelectedExercise(ex);
    setShowSuggestions(false);
    
    // Auto calculate calories with selected MET and current duration
    const weight = userProfile?.weight || 70;
    const mins = parseFloat(exerciseDuration) || 0;
    const cals = Math.round((ex.met * 3.5 * weight) / 200 * mins);
    setExerciseCalories(cals > 0 ? cals.toString() : '');
  };

  const handleDurationChange = (val) => {
    setExerciseDuration(val);
    const weight = userProfile?.weight || 70;
    const met = selectedExercise ? selectedExercise.met : 4.0;
    const mins = parseFloat(val) || 0;
    const cals = Math.round((met * 3.5 * weight) / 200 * mins);
    setExerciseCalories(cals > 0 ? cals.toString() : '');
  };

  const handleSaveExercise = (e) => {
    e.preventDefault();
    if (!exerciseName || !exerciseDuration || !exerciseCalories) {
      showToast('Please fill out all fields', 'error'); return;
    }
    setTodayLog([{
      type: 'exercise', label: exerciseName, name: exerciseName,
      duration: Number(exerciseDuration), cal: -Math.abs(Number(exerciseCalories)),
      protein: 0, carbs: 0, fat: 0, unit: 'mins', timestamp: Date.now(),
      exCategory: selectedExercise?.category || 'strength'
    }, ...todayLog]);
    setExerciseName(''); setExerciseDuration(''); setExerciseCalories('');
    setSelectedExercise(null); setExerciseSuggestions([]); setShowSuggestions(false);
    setIsExerciseOpen(false);
    showToast('Exercise workout logged!', 'success');
  };

  return (
    <div id="panelHome" className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1600px] w-full mx-auto slide-up pb-24 px-1 sm:px-0">

      {/* ── LEFT: Rings + Water ─────────────────────────── */}
      <div className="lg:col-span-7 space-y-5 w-full max-w-full overflow-hidden">

        {/* AI Insight */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 border border-[#adff2f]/20 bg-[#adff2f]/[0.04]"
        >
          <div className="flex items-center gap-2 mb-1.5 text-[#adff2f]">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-[#adff2f]" />
            <span className="section-label text-[#adff2f]">AI Daily Recommendation</span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-300">
            {totals.protein < targetProtein / 2
              ? 'You are currently behind on protein targets. We recommend adding a Greek Yogurt or scoop of protein to recover from exercises.'
              : 'Excellent macro balance today! Keep drinking water to boost protein synthesis and accelerate muscle recovery.'}
          </p>
        </motion.div>

        {/* Scrollable week date selector with scroll fade */}
        <div className="flex flex-col py-2 select-none border-b border-white/5 pb-3 w-full">
          {/* Header: Month/Year */}
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {monthYearStr}
            </span>
            <button
              onClick={() => setViewDateKey(todayKey)}
              className="text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-[#adff2f] transition px-2 py-1 rounded-lg cursor-pointer hover:bg-white/5 active:scale-95"
            >
              Today
            </button>
          </div>

          {/* Scrollable Days row with fade effect */}
          <div 
            ref={calendarRef}
            className="flex gap-2 overflow-x-auto thin-scroll scroll-fade-x pb-1.5 snap-x scroll-smooth w-full"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {calendarDays.map((day) => (
              <button
                key={day.dateStr}
                onClick={() => setViewDateKey(day.dateStr)}
                className={`flex-shrink-0 w-11 py-2 px-1 rounded-2xl border transition-all duration-200 snap-center cursor-pointer flex flex-col items-center justify-center ${
                  day.isSelected 
                    ? 'selected-date bg-white/10 border-[#adff2f]/50 text-white font-black shadow-[0_0_12px_rgba(173,255,47,0.15)]' 
                    : 'bg-transparent border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className={`text-[8px] font-bold uppercase tracking-wider ${day.isSelected ? 'text-[#adff2f]' : 'text-neutral-450'}`}>
                  {day.dayOfWeek}
                </span>
                <span className={`text-xs font-extrabold mt-0.5 ${day.isToday && !day.isSelected ? 'text-[#adff2f]' : ''}`}>
                  {day.dayOfMonth}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Dashboard Metrics Grid ─────────────────── */}
        <div className="pt-1 pb-1 space-y-3.5 w-full">
          <div className="px-1 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Today's Energy
            </h2>
            <span className="text-[10px] font-extrabold text-[#adff2f] uppercase tracking-wider bg-[#adff2f]/10 px-2.5 py-1 rounded-full border border-[#adff2f]/20">
              {remaining} kcal left
            </span>
          </div>

          {/* 2x2 Grid of MacroCards */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <MacroCard
              title="Calories"
              value={consumed}
              target={targetCalories + burned}
              unit="kcal"
              percent={calPercent}
              strokeColor="#adff2f"
              glowColor="rgba(173,255,47,0.3)"
            />
            <MacroCard
              title="Protein"
              value={Math.round(totals.protein)}
              target={targetProtein}
              unit="g"
              percent={proteinPercent}
              strokeColor="#38bdf8"
              glowColor="rgba(56,189,248,0.3)"
            />
            <MacroCard
              title="Carbs"
              value={Math.round(totals.carbs)}
              target={targetCarbs}
              unit="g"
              percent={carbsPercent}
              strokeColor="#fbbf24"
              glowColor="rgba(251,191,36,0.3)"
            />
            <MacroCard
              title="Fat"
              value={Math.round(totals.fat)}
              target={targetFat}
              unit="g"
              percent={fatPercent}
              strokeColor="#f472b6"
              glowColor="rgba(244,114,182,0.3)"
            />
          </div>
        </div>

        {/* ── Water Intake Redesign ─────────────────────── */}
        <div className="glass p-4.5 w-full">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              {dict.water_intake}
            </h2>
            <span className="text-xs font-black text-neutral-400">
              {waterIntake} / {targetWater} ml
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            <WaterTank
              currentWater={waterIntake}
              goalWater={targetWater}
              onAddWater={handleAddWater}
              onResetWater={handleResetWater}
              onOpenModal={() => setIsWaterModalOpen(true)}
            />

            {/* Remaining Info */}
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 px-0.5 select-none">
              <span>Remaining: {Math.max(0, targetWater - waterIntake)} ml</span>
              {waterIntake >= targetWater && (
                <span className="text-[#adff2f] uppercase tracking-wider font-black">Goal Reached 🎉</span>
              )}
            </div>

            {/* Quick buttons & Custom row */}
            <div className="grid grid-cols-3 gap-2 w-full mt-0.5">
              <button
                onClick={() => handleAddWater(250)}
                className="py-2.5 px-2 rounded-2xl text-xs font-bold transition-all bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-white/5 active:scale-95 cursor-pointer text-center truncate"
              >
                +250 ml
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="py-2.5 px-2 rounded-2xl text-xs font-bold transition-all bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-white/5 active:scale-95 cursor-pointer text-center truncate"
              >
                +500 ml
              </button>
              <button
                onClick={() => setIsWaterModalOpen(true)}
                className="py-2.5 px-2 rounded-2xl text-xs font-bold transition-all bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white border border-white/5 active:scale-95 cursor-pointer text-center truncate"
              >
                Custom
              </button>
            </div>
          </div>
        </div>        {/* Today's Meals */}
        <div className="glass p-5 w-full">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-base font-extrabold text-white">
              {lang === 'en' ? 'Daily Meal' : dict.todays_meals}
            </h2>
            <button
              onClick={() => setIsManualFoodModalOpen(true)}
              className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition text-[#adff2f] hover:text-[#c8ff6b] cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5 active:scale-95 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Add Food
            </button>
          </div>

          {/* Scroll fade dissolve container */}
          <div className="space-y-3.5 max-h-[420px] overflow-y-auto thin-scroll pr-1">
            {totals.foods.length === 0 ? (
              <div 
                className="relative border border-white/5 shadow-2xl rounded-[24px] p-6 flex items-center justify-between gap-4 overflow-hidden min-h-[145px] slide-up"
                style={{
                  background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.26) 0%, rgba(20, 20, 22, 0) 65%), radial-gradient(circle at bottom left, rgba(173, 255, 47, 0.20) 0%, rgba(20, 20, 22, 0) 65%), #141416'
                }}
              >
                {/* Left Side Content */}
                <div className="flex-1 space-y-4 text-left z-10">
                  <h3 className="text-sm font-extrabold text-white leading-snug">
                    It's time to log your meals & customize recipes
                  </h3>
                  
                  {/* Date Badge */}
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full w-fit">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{selectedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Right Side Illustration */}
                <div className="flex-shrink-0 z-10 relative">
                  <svg viewBox="0 0 120 120" className="w-24 h-24 sm:w-28 sm:h-28 select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-pulse overflow-visible">
                    <defs>
                      <linearGradient id="broccoliStem" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f5efe6" />
                        <stop offset="100%" stopColor="#e1d4c0" />
                      </linearGradient>
                      <radialGradient id="broccoliHead" cx="50%" cy="55%" r="50%">
                        <stop offset="0%" stopColor="#76b041" />
                        <stop offset="60%" stopColor="#437c17" />
                        <stop offset="100%" stopColor="#254d08" />
                      </radialGradient>
                      <radialGradient id="broccoliHeadLight" cx="40%" cy="40%" r="45%">
                        <stop offset="0%" stopColor="#9ad15c" />
                        <stop offset="100%" stopColor="#5b9c24" />
                      </radialGradient>
                      <radialGradient id="appleBody" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#ff4b4b" />
                        <stop offset="60%" stopColor="#d61c1c" />
                        <stop offset="100%" stopColor="#7a0303" />
                      </radialGradient>
                      <linearGradient id="appleLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a3e635" />
                        <stop offset="100%" stopColor="#4d7c0f" />
                      </linearGradient>
                    </defs>
                    <g transform="translate(10, 15) rotate(-10) scale(0.9)">
                      <path d="M40,75 C40,95 44,105 50,105 C56,105 60,95 60,75 C60,65 40,65 40,75 Z" fill="url(#broccoliStem)" />
                      <path d="M35,65 C33,72 26,78 20,76 C14,74 15,64 22,60 C29,56 35,65 35,65 Z" fill="url(#broccoliStem)" />
                      <circle cx="28" cy="55" r="18" fill="url(#broccoliHead)" />
                      <circle cx="50" cy="45" r="22" fill="url(#broccoliHeadLight)" />
                      <circle cx="72" cy="55" r="18" fill="url(#broccoliHead)" />
                      <circle cx="40" cy="38" r="16" fill="url(#broccoliHeadLight)" />
                      <circle cx="60" cy="38" r="16" fill="url(#broccoliHeadLight)" />
                      <circle cx="34" cy="50" r="4" fill="#a3e635" opacity="0.3" />
                      <circle cx="52" cy="40" r="5" fill="#a3e635" opacity="0.4" />
                      <circle cx="68" cy="52" r="4" fill="#a3e635" opacity="0.3" />
                    </g>
                    <g transform="translate(55, 35) rotate(15)">
                      <path d="M30,32 C30,22 36,15 42,16" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                      <path d="M42,16 C48,16 54,10 52,4 C46,6 40,10 42,16 Z" fill="url(#appleLeaf)" />
                      <path d="M30,30 C12,28 4,45 4,60 C4,85 24,96 30,94 C36,96 56,85 56,60 C56,45 48,28 30,30 Z" fill="url(#appleBody)" />
                      <ellipse cx="18" cy="48" rx="5" ry="10" transform="rotate(-20 18 48)" fill="#ffffff" opacity="0.25" />
                      <circle cx="24" cy="40" r="3" fill="#ffffff" opacity="0.2" />
                    </g>
                  </svg>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {totals.foods.map((food, index) => {
                  const gi = todayLog.findIndex(x => x.timestamp === food.timestamp);
                  return (
                    <motion.div 
                      key={food.timestamp || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative flex items-center justify-between p-0 overflow-hidden rounded-[24px] border border-white/5 hover:border-white/10 transition-all duration-200 h-[96px] shadow-lg"
                      style={{
                        background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.26) 0%, rgba(20, 20, 22, 0) 65%), radial-gradient(circle at bottom left, rgba(173, 255, 47, 0.20) 0%, rgba(20, 20, 22, 0) 65%), #141416'
                      }}
                    >
                      <div className="flex flex-col justify-center min-w-0 flex-1 pl-5 py-3 pr-2 h-full">
                        {/* Title and Stats */}
                        <p className="text-[10px] font-bold text-neutral-400">
                          {food.servingAmount}{food.unit || 'g'} • {food.cal} kcal • P: {Math.round(food.protein)}g
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <p className="font-extrabold text-xs text-white leading-tight truncate">
                            {food.name || food.label}
                          </p>
                          {food.brand && (
                            <span className="text-[8px] font-extrabold text-[#adff2f] bg-[#adff2f]/10 px-1.5 py-0.5 rounded border border-[#adff2f]/20 flex-shrink-0 align-middle">
                              {food.brand}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Image on Right spanning full height */}
                      <div className="relative h-full w-24 overflow-hidden rounded-r-[24px] border-l border-white/5 flex-shrink-0">
                        <img
                          src={food.image || getHDHighlightFoodImage(food.name || food.label, food.category)}
                          alt={food.name || food.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getHDHighlightFoodImage(food.name || food.label, food.category);
                          }}
                        />
                        {/* Floating Action Controls */}
                        <button 
                          onClick={() => handleDeleteItem(gi)}
                          className="absolute top-1 right-1 p-1.5 rounded-full bg-black/60 hover:bg-rose-600/90 text-white/90 backdrop-blur-sm transition cursor-pointer shadow active:scale-90"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Logged Exercises */}
        <div className="glass p-5 w-full">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white" data-i18n="logged_exercises">{dict.logged_exercises}</h2>
            <button onClick={() => setIsExerciseOpen(true)}
              className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition text-[#adff2f] hover:text-[#c8ff6b] cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5 active:scale-95 flex-shrink-0"
              data-i18n="log_exercise"
            >
              <PlusCircle className="w-4 h-4" /> {dict.log_exercise}
            </button>
          </div>

          {/* Scroll fade dissolve container */}
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto thin-scroll pr-1">
            {totals.exercises.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3 bg-[#2c2c2e] border border-white/5">
                  <Dumbbell className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="section-label">No workouts recorded</p>
              </div>
            ) : (
              <AnimatePresence>
                {totals.exercises.map((ex, index) => {
                  const gi = todayLog.findIndex(x => x.timestamp === ex.timestamp);
                  return (
                    <motion.div 
                      key={ex.timestamp || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative flex items-center justify-between p-0 overflow-hidden rounded-[24px] border border-white/5 hover:border-white/10 transition-all duration-200 h-[96px] shadow-lg"
                      style={{
                        background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.26) 0%, rgba(20, 20, 22, 0) 65%), radial-gradient(circle at bottom left, rgba(173, 255, 47, 0.20) 0%, rgba(20, 20, 22, 0) 65%), #141416'
                      }}
                    >
                      <div className="flex flex-col justify-center min-w-0 flex-1 pl-5 py-3 pr-2 h-full">
                        <p className="text-[10px] font-bold text-neutral-400">
                          {ex.duration} mins • {Math.abs(ex.cal)} kcal burned
                        </p>
                        <p className="font-extrabold text-xs text-white mt-1 leading-tight truncate">
                          {ex.name || ex.label}
                        </p>
                      </div>

                      {/* Icon Graphics on Right covering the row vertically */}
                      <div className="relative h-full w-24 flex-shrink-0 border-l border-white/5 bg-[#17171d] flex items-center justify-center rounded-r-[24px] overflow-hidden">
                        {(() => {
                          const cat = ex.exCategory || 'strength';
                          const isCardio = cat === 'cardio';
                          const isFlex = cat === 'flexibility';
                          const iconColor = isCardio ? 'text-orange-400' : isFlex ? 'text-purple-400' : 'text-sky-400';
                          const glowColor = isCardio ? 'bg-orange-500/10 border-orange-500/20' : isFlex ? 'bg-purple-500/10 border-purple-500/20' : 'bg-sky-500/10 border-sky-500/20';
                          
                          return (
                            <div className={`w-12 h-12 rounded-2xl grid place-items-center border ${glowColor} shadow-inner`}>
                              {isCardio ? (
                                <Flame className={`w-6 h-6 ${iconColor}`} />
                              ) : isFlex ? (
                                <Sparkles className={`w-6 h-6 ${iconColor}`} />
                              ) : (
                                <Dumbbell className={`w-6 h-6 ${iconColor}`} />
                              )}
                            </div>
                          );
                        })()}
                        {/* Floating Action Controls */}
                        <button 
                          onClick={() => handleDeleteItem(gi)}
                          className="absolute top-1 right-1 p-1.5 rounded-full bg-black/60 hover:bg-rose-600/90 text-white/90 backdrop-blur-sm transition cursor-pointer shadow active:scale-90"
                          title="Delete exercise"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── Log Exercise Modal ────────────────────────────── */}
      {/* ── Log Exercise Modal ────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {isExerciseOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExerciseOpen(false)}
                onTouchMove={(e) => e.stopPropagation()}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm touch-none pointer-events-auto"
              />
              <motion.div 
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm bg-[#161616] border border-white/10 rounded-[28px] p-6 text-left shadow-[0_20px_50px_rgba(0,0,0,0.7)] overscroll-contain max-h-[85vh] overflow-y-auto pointer-events-auto"
              >
                <h3 className="text-sm font-black uppercase tracking-wider text-white mb-5" data-i18n="log_exercise">{dict.log_exercise}</h3>
                <form onSubmit={handleSaveExercise} className="space-y-4">
                  <div className="relative">
                    <span className="section-label block mb-1.5" data-i18n="exercise_name">{dict.exercise_name}</span>
                    <input type="text" required placeholder="Search e.g. Running, Bench Press..."
                      value={exerciseName} onChange={e => handleExerciseNameChange(e.target.value)}
                      onFocus={() => { if (exerciseName.trim().length > 0) setShowSuggestions(true); }}
                      className="w-full px-3.5 py-3 text-xs bg-[#2c2c2e] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-[#adff2f]/50 animate-fade-in"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showSuggestions && exerciseSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-50 mt-1.5 bg-[#1e1e24] border border-white/10 rounded-2xl overflow-hidden shadow-2xl divide-y divide-white/5 max-h-[180px] overflow-y-auto thin-scroll">
                        {exerciseSuggestions.map(ex => (
                          <button
                            key={ex.name}
                            type="button"
                            onClick={() => handleSelectSuggestion(ex)}
                            className="w-full px-4 py-3 text-left text-xs text-white hover:bg-white/[0.04] transition cursor-pointer flex justify-between items-center"
                          >
                            <span className="font-bold">{ex.name}</span>
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/5 text-neutral-400 tracking-wider">
                              {ex.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="section-label block mb-1.5" data-i18n="duration_mins">{dict.duration_mins}</span>
                      <input type="number" required placeholder="30"
                        value={exerciseDuration} onChange={e => handleDurationChange(e.target.value)}
                        className="w-full px-3.5 py-3 text-xs bg-[#2c2c2e] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-[#adff2f]/50"
                      />
                    </div>
                    <div>
                      <span className="section-label block mb-1.5" data-i18n="calories_burned">{dict.calories_burned}</span>
                      <input type="number" required placeholder="250"
                        value={exerciseCalories} onChange={e => setExerciseCalories(e.target.value)}
                        className="w-full px-3.5 py-3 text-xs bg-[#2c2c2e] border border-white/5 rounded-2xl text-white focus:outline-none focus:border-[#adff2f]/50 font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsExerciseOpen(false)}
                      className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition bg-[#2c2c2e] text-neutral-300 border border-white/5 hover:bg-[#3a3a3c] active:scale-95 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition bg-[#adff2f] text-black hover:bg-[#9eff1a] active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(173,255,47,0.25)]"
                      data-i18n="record_workout">
                      {dict.record_workout}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Log Water Modal (Redesigned Screen) ───────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {isWaterModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsWaterModalOpen(false)}
                onTouchMove={(e) => e.stopPropagation()}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm touch-none pointer-events-auto"
              />
              
              {/* Floating Window in the Middle */}
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="relative bg-[#161616] border border-white/10 rounded-[28px] p-5 sm:p-6 z-50 overflow-y-auto overscroll-contain w-full max-w-[420px] max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-left pointer-events-auto"
              >

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

                <div className="space-y-5">
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
                          className="w-20 bg-neutral-900 border border-white/5 rounded-xl py-2 text-center text-sm font-black text-white focus:outline-none focus:border-[#adff2f]/50"
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2.5">
                      Quick Add
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
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

                  {/* Update Exact Amount Form */}
                  <form onSubmit={handleUpdateExactWater} className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 sm:p-4 w-full box-border">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2">
                      Update Exact Amount (ml)
                    </span>
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="number"
                        placeholder="e.g. 1250"
                        value={exactWaterInput}
                        onChange={e => setExactWaterInput(e.target.value)}
                        className="min-w-0 flex-1 bg-neutral-900 border border-white/5 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-[#adff2f]/50"
                      />
                      <button
                        type="submit"
                        className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black uppercase tracking-wider text-xs active:scale-95 transition cursor-pointer whitespace-nowrap"
                      >
                        Update
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-3 px-1">
                      <button
                        type="button"
                        onClick={handleResetWater}
                        className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-350 transition cursor-pointer"
                      >
                        Reset Today
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <ManualAddFoodModal 
        isOpen={isManualFoodModalOpen} 
        onClose={() => setIsManualFoodModalOpen(false)} 
      />
    </div>
  );
};
