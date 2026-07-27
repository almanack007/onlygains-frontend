import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2 } from 'lucide-react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export const Progress = () => {
  const { 
    viewDateKey, setViewDateKey, getTodayKey, currentStreak, historyDays,
    translations, lang, showToast, userProfile, saveWeightData, weightHistory, deleteWeightEntry,
    weeklyData, weeklyCalsData, weeklyWatersData, weeklyWeightsData
  } = useApp();

  const [weightVal, setWeightVal] = useState('');
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [pendingWeight, setPendingWeight] = useState(null);

  const calendarRef = useRef(null);
  const calChartRef = useRef(null);
  const proteinChartRef = useRef(null);
  const waterChartRef = useRef(null);
  const weightChartRef = useRef(null);

  const calChartInst = useRef(null);
  const proteinChartInst = useRef(null);
  const waterChartInst = useRef(null);
  const weightChartInst = useRef(null);

  const dict = translations[lang] || translations.en;
  const todayKey = getTodayKey();

  // Scroll active date into view
  useEffect(() => {
    const activeEl = calendarRef.current?.querySelector('.selected-date');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [viewDateKey]);

  // Render last 7 days metrics helper
  const getLastSevenData = () => {
    const labels = [];
    const proteins = [];
    const cals = [];
    const waters = [];
    const weights = [];
    
    for (let i = 6; i >= 0; i--) { 
      const d = new Date(); 
      d.setDate(d.getDate() - i); 
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      labels.push(d.toLocaleDateString('en', { weekday: 'short' })); 
      proteins.push(weeklyData[key] || 0); 
      cals.push(weeklyCalsData[key] || 0);
      waters.push(weeklyWatersData[key] || 0);
      weights.push(weeklyWeightsData[key] || (userProfile ? userProfile.weight : 70));
    }
    return { labels, proteins, cals, waters, weights };
  };

  // Re-build Chart.js instances on metrics change
  useEffect(() => {
    const data = getLastSevenData();

    // 1. Calories Chart
    if (calChartRef.current) {
      if (calChartInst.current) calChartInst.current.destroy();
      calChartInst.current = new Chart(calChartRef.current, {
        type: 'bar',
        data: { 
          labels: data.labels, 
          datasets: [{ 
            data: data.cals, 
            backgroundColor: 'rgba(16, 185, 129, 0.25)', 
            borderColor: '#10b981', 
            borderWidth: 1.5, 
            borderRadius: 6 
          }] 
        },
        options: { 
          maintainAspectRatio: false, 
          responsive: true, 
          plugins: { legend: { display: false } }, 
          scales: { 
            y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,.09)' }, ticks: { color: '#94a3b8' } }, 
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } } 
          } 
        }
      });
    }

    // 2. Protein Chart
    if (proteinChartRef.current) {
      if (proteinChartInst.current) proteinChartInst.current.destroy();
      proteinChartInst.current = new Chart(proteinChartRef.current, {
        type: 'bar',
        data: { 
          labels: data.labels, 
          datasets: [{ 
            data: data.proteins, 
            backgroundColor: 'rgba(59, 130, 246, 0.25)', 
            borderColor: '#3b82f6', 
            borderWidth: 1.5, 
            borderRadius: 6 
          }] 
        },
        options: { 
          maintainAspectRatio: false, 
          responsive: true, 
          plugins: { legend: { display: false } }, 
          scales: { 
            y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,.09)' }, ticks: { color: '#94a3b8' } }, 
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } } 
          } 
        }
      });
    }

    // 3. Water Chart
    if (waterChartRef.current) {
      if (waterChartInst.current) waterChartInst.current.destroy();
      waterChartInst.current = new Chart(waterChartRef.current, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.waters,
            backgroundColor: 'rgba(14, 165, 233, 0.25)',
            borderColor: '#0ea5e9',
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(148,163,184,.09)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    // 4. Weight Chart
    if (weightChartRef.current) {
      if (weightChartInst.current) weightChartInst.current.destroy();
      weightChartInst.current = new Chart(weightChartRef.current, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.weights,
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderColor: '#a855f7',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          maintainAspectRatio: false,
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: false, grid: { color: 'rgba(148,163,184,.09)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    return () => {
      if (calChartInst.current) calChartInst.current.destroy();
      if (proteinChartInst.current) proteinChartInst.current.destroy();
      if (waterChartInst.current) waterChartInst.current.destroy();
      if (weightChartInst.current) weightChartInst.current.destroy();
    };
  }, [weeklyData, weeklyCalsData, weeklyWatersData, weeklyWeightsData, userProfile]);

  const handleRecordWeight = () => {
    const val = parseFloat(weightVal);
    if (isNaN(val) || val <= 0) {
      showToast('Please enter a valid weight value', 'error');
      return;
    }

    const prevWeight = userProfile ? userProfile.weight : 70;
    const diff = prevWeight - val;

    // Trigger deviation warning modal if difference is >= 15 kg
    if (Math.abs(diff) >= 15) {
      setWarningMsg(
        `Woah! Did you ${diff > 0 ? 'lose' : 'gain'} like ${Math.abs(diff).toFixed(1)} kgs lol? That seems impossible and not good for your BMI! Are you sure you want to record ${val} kg?`
      );
      setPendingWeight(val);
      setIsWarningOpen(true);
      return;
    }

    saveWeightData(val);
    setWeightVal('');
  };

  const confirmPendingWeight = () => {
    if (pendingWeight !== null) {
      saveWeightData(pendingWeight);
      setWeightVal('');
      setPendingWeight(null);
      setIsWarningOpen(false);
    }
  };

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
      const dayData = historyDays.find(hd => hd.log_date.split('T')[0] === dateStr);
      const hasData = dayData && dayData.food_log && dayData.food_log.length > 0;
      
      list.push({ dateStr, dayOfWeek, dayOfMonth, isSelected, isToday, hasData });
    }
    return list;
  };

  return (
    <div id="panelProgress" className="tab-panel space-y-6 max-w-[1600px] mx-auto">
      {/* Calendar History Snapper */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
            <span data-i18n="calendar_history">{dict.calendar_history}</span>
            <span id="streakBadge" className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              🔥 {currentStreak} Day Streak
            </span>
          </h2>
          <button 
            onClick={() => setViewDateKey(todayKey)} 
            className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"
          >
            Today
          </button>
        </div>
        <div 
          ref={calendarRef} 
          className="flex gap-3 overflow-x-auto thin-scroll pb-2 snap-x"
        >
          {getCalendarDays().map((day) => (
            <button
              key={day.dateStr}
              onClick={() => setViewDateKey(day.dateStr)}
              className={`flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200 snap-center ${
                day.isSelected 
                  ? 'selected-date bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/60 border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span className={`text-[10px] uppercase font-bold tracking-wider ${day.isSelected ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                {day.dayOfWeek}
              </span>
              <span className={`text-lg font-black ${day.isToday && !day.isSelected ? 'text-white' : ''}`}>
                {day.dayOfMonth}
              </span>
              <div className={`h-1.5 w-1.5 rounded-full ${day.hasData ? 'bg-emerald-400 neon' : 'bg-transparent'}`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2" data-i18n="log_weight">{dict.log_weight}</h3>
            <p className="text-xs text-slate-500 mb-4" data-i18n="weight_desc">{dict.weight_desc}</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="number" 
                step="0.1" 
                placeholder="e.g. 72.5" 
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 px-4 py-3 text-slate-100 pr-12 text-sm placeholder-slate-600" 
              />
              <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">kg</span>
            </div>
            <button 
              onClick={handleRecordWeight} 
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 text-sm transition neon"
              data-i18n="record_weight"
            >
              {dict.record_weight}
            </button>
          </div>
        </div>

        {/* Weight Log History List */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4" data-i18n="weight_log">{dict.weight_log}</h3>
          <div className="max-h-40 overflow-y-auto space-y-2 thin-scroll text-xs pr-1">
            {weightHistory.length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No weight entries logged yet</p>
            ) : (
              weightHistory.map((entry) => (
                <div key={entry.timestamp} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{entry.weight} kg</span>
                    <span className="text-slate-500 text-[10px]">{entry.date}</span>
                  </div>
                  <button 
                    onClick={() => deleteWeightEntry(entry.timestamp)} 
                    className="text-slate-600 hover:text-red-400 p-1.5 transition rounded-lg hover:bg-red-500/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Weekly Trend Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weekly Calories</h3>
          <div className="h-44"><canvas ref={calChartRef}></canvas></div>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weekly Protein</h3>
          <div className="h-44"><canvas ref={proteinChartRef}></canvas></div>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weekly Water Intake</h3>
          <div className="h-44"><canvas ref={waterChartRef}></canvas></div>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight History Chart</h3>
          <div className="h-44"><canvas ref={weightChartRef}></canvas></div>
        </div>
      </div>

      {/* Weight Deviation Confirmation Dialog */}
      {isWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-sm glass rounded-2xl p-5 sm:p-6 slide-up text-left">
            <h3 className="text-base font-bold text-amber-400 mb-2">Confirm Large Weight Deviation</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">{warningMsg}</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsWarningOpen(false);
                  setWeightVal('');
                  setPendingWeight(null);
                }} 
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/55 py-2.5 text-xs text-slate-300 font-bold hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPendingWeight}
                className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 text-xs font-bold transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                Yes, Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
