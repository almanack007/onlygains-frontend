import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, AlertTriangle, Scale, Calendar, LineChart, Flame } from 'lucide-react';
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

    const chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { color: 'rgba(255, 255, 255, 0.03)' }, 
          ticks: { color: '#7e7e7e', font: { size: 9, weight: 'bold' } } 
        },
        x: { 
          grid: { display: false }, 
          ticks: { color: '#7e7e7e', font: { size: 9, weight: 'bold' } } 
        }
      }
    };

    // 1. Calories Chart
    if (calChartRef.current) {
      if (calChartInst.current) calChartInst.current.destroy();
      calChartInst.current = new Chart(calChartRef.current, {
        type: 'bar',
        data: { 
          labels: data.labels, 
          datasets: [{ 
            data: data.cals, 
            backgroundColor: 'rgba(204, 255, 0, 0.15)', 
            borderColor: '#ccff00', 
            borderWidth: 1.5, 
            borderRadius: 8
          }] 
        },
        options: chartOptions
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
            backgroundColor: 'rgba(56, 189, 248, 0.15)', 
            borderColor: '#38bdf8', 
            borderWidth: 1.5, 
            borderRadius: 8
          }] 
        },
        options: chartOptions
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
            backgroundColor: 'rgba(204, 255, 0, 0.12)',
            borderColor: '#ccff00',
            borderWidth: 1.5,
            borderRadius: 8
          }]
        },
        options: chartOptions
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
            backgroundColor: 'rgba(204, 255, 0, 0.04)',
            borderColor: '#ccff00',
            borderWidth: 2,
            tension: 0.35,
            fill: true
          }]
        },
        options: {
          ...chartOptions,
          scales: {
            y: { ...chartOptions.scales.y, beginAtZero: false },
            x: chartOptions.scales.x
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

    if (Math.abs(diff) >= 15) {
      setWarningMsg(
        `Woah! Did you ${diff > 0 ? 'lose' : 'gain'} like ${Math.abs(diff).toFixed(1)} kgs? That is a large biometrics deviation! Are you sure you want to record ${val} kg?`
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

  return (
    <div id="panelProgress" className="tab-panel space-y-6 max-w-[1600px] mx-auto slide-up pb-12">

      {/* Weight Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-400">
              <Scale className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider" data-i18n="log_weight">{dict.log_weight}</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6" data-i18n="weight_desc">{dict.weight_desc}</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="number" 
                step="0.1" 
                placeholder="e.g. 72.5" 
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
                className="w-full rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-white pr-12 text-xs placeholder-slate-650" 
              />
              <span className="absolute right-4 top-3 text-xs text-slate-500 font-bold uppercase tracking-wider">kg</span>
            </div>
            <button 
              onClick={handleRecordWeight} 
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3.5 text-xs transition neon uppercase tracking-wider"
              data-i18n="record_weight"
            >
              {dict.record_weight}
            </button>
          </div>
        </div>

        {/* Weight Log History List */}
        <div className="glass p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <LineChart className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-black uppercase tracking-wider" data-i18n="weight_log">{dict.weight_log}</h3>
          </div>
          <div className="max-h-44 overflow-y-auto space-y-2.5 thin-scroll text-xs pr-1">
            {weightHistory.length === 0 ? (
              <p className="text-slate-500 italic py-8 text-center">No weight logs logged yet</p>
            ) : (
              weightHistory.map((entry) => (
                <div key={entry.timestamp} className="bg-slate-900/30 border border-slate-850 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-xs text-slate-200">{entry.weight} kg</span>
                    <span className="text-slate-550 text-[10px] font-medium">{entry.date}</span>
                  </div>
                  <button 
                    onClick={() => deleteWeightEntry(entry.timestamp)} 
                    className="text-slate-500 hover:text-red-400 p-2 transition rounded-xl hover:bg-red-500/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Weekly Trend Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass p-5 flex flex-col bg-slate-900/20">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Weekly Calories</h3>
          <div className="h-48"><canvas ref={calChartRef}></canvas></div>
        </div>
        <div className="glass p-5 flex flex-col bg-slate-900/20">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Weekly Protein</h3>
          <div className="h-48"><canvas ref={proteinChartRef}></canvas></div>
        </div>
        <div className="glass p-5 flex flex-col bg-slate-900/20">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Weekly Water Intake</h3>
          <div className="h-48"><canvas ref={waterChartRef}></canvas></div>
        </div>
        <div className="glass p-5 flex flex-col bg-slate-900/20">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Weight History Chart</h3>
          <div className="h-48"><canvas ref={weightChartRef}></canvas></div>
        </div>
      </div>

      {/* Weight Deviation Confirmation Dialog */}
      {isWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm glass p-6 slide-up text-left">
            
            <div className="flex items-center gap-2 mb-2 text-amber-500">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">Confirm Weight Change</h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">{warningMsg}</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsWarningOpen(false);
                  setWeightVal('');
                  setPendingWeight(null);
                }} 
                className="flex-1 rounded-2xl border border-slate-850 bg-slate-900/80 py-3 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPendingWeight}
                className="flex-1 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 py-3 text-xs font-black transition shadow-[0_0_15px_rgba(245,158,11,0.25)] uppercase tracking-wider"
              >
                Record Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
