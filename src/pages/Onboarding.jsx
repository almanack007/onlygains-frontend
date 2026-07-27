import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Dumbbell, Shield, Sparkles, Heart, Flame, Zap, ArrowRight, ArrowLeft } from 'lucide-react';

export const Onboarding = () => {
  const { goalConfigs, setUserProfile, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(78);
  const [activity, setActivity] = useState(1.55);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [dietType, setDietType] = useState('Balanced');

  const goalIcons = [
    <Zap className="w-6 h-6 text-emerald-500" />,
    <Flame className="w-6 h-6 text-emerald-500" />,
    <Heart className="w-6 h-6 text-emerald-500" />,
    <Dumbbell className="w-6 h-6 text-emerald-500" />,
    <Shield className="w-6 h-6 text-emerald-500" />,
    <Sparkles className="w-6 h-6 text-emerald-500" />
  ];

  const handleContinue = () => {
    if (!age || !height || !weight || !waterGoal) {
      showToast('Please enter all values to continue', 'error');
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    if (!selectedGoal) return;
    const config = goalConfigs[selectedGoal];
    const bmr = Math.round(
      gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161
    );
    const tdee = Math.round(bmr * Number(activity));
    const targetCalories = Math.round(tdee * config.multiplier);
    const targetProtein = Math.round(weight * config.proteinFactor);
    const targetCarbs = Math.round((targetCalories * config.carbPct) / 4);
    const targetFat = Math.round((targetCalories * config.fatPct) / 9);

    const profile = {
      gender,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      activity: Number(activity),
      bmr,
      tdee,
      goal: selectedGoal,
      goalName: config.name,
      dietType,
      water_goal: Number(waterGoal),
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat
    };

    setUserProfile(profile);
    showToast("Profile created successfully! Let's crush those goals! 💪", 'success');
  };

  return (
    <section id="onboarding" className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      
      {/* Background radial accent */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Header section */}
        <div className="mb-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-[16px] bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-emerald-500 font-brand-serif italic tracking-widest text-[11px] uppercase mb-1">FitTrack Pro</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Configure Your Program</h1>
        </div>

        {step === 1 ? (
          <div id="step1" className="glass p-6 sm:p-8 slide-up">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider text-xs">Biometrics</h2>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Step 1 of 2</p>
              </div>
              <div className="h-1.5 w-32 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full w-1/2 bg-emerald-500 shadow-[0_0_8px_#ccff00]"></div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="relative">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Gender</span>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="relative">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Age (years)</span>
                <input 
                  type="number" 
                  min="13" 
                  max="100" 
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" 
                />
              </div>

              <div className="relative">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Height (cm)</span>
                <input 
                  type="number" 
                  min="120" 
                  max="230" 
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" 
                />
              </div>

              <div className="relative">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Weight (kg)</span>
                <input 
                  type="number" 
                  min="35" 
                  max="220" 
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" 
                />
              </div>

              <div className="relative sm:col-span-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Weekly Activity Frequency</span>
                <select 
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300"
                >
                  <option value="1.2">Sedentary (Little or no exercise)</option>
                  <option value="1.375">Lightly active (1-3 days/week)</option>
                  <option value="1.55">Moderately active (3-5 days/week)</option>
                  <option value="1.725">Very active (6-7 days/week)</option>
                  <option value="1.9">Extreme (Athletic / heavy physical work)</option>
                </select>
              </div>

              <div className="relative sm:col-span-2 lg:col-span-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Daily Target Water Intake (ml)</span>
                <input 
                  type="number" 
                  min="500" 
                  max="10000" 
                  step="100" 
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300" 
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleContinue} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-3.5 font-black uppercase tracking-wider text-slate-950 neon hover:bg-emerald-450 transition duration-300 text-xs"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div id="step2" className="glass p-6 sm:p-8 slide-up">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider text-xs">Primary Target Goal</h2>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Step 2 of 2</p>
              </div>
              <div className="h-1.5 w-32 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full w-full bg-emerald-500 shadow-[0_0_8px_#ccff00]"></div>
              </div>
            </div>

            <div id="goalGrid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(goalConfigs).map(([key, g], i) => (
                <button
                  key={key}
                  onClick={() => setSelectedGoal(key)}
                  className={`goal-card text-left rounded-3xl border p-5 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/40 ${
                    selectedGoal === key 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(204,255,0,0.15)] text-emerald-300' 
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center justify-center mb-4">
                    {goalIcons[i % goalIcons.length]}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-200">{g.name}</h3>
                  <p className="text-xs text-slate-550 mt-1 leading-relaxed">{g.note}</p>
                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <span>Protein focus</span>
                    <span className="text-emerald-500">{g.proteinFactor}x kg</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="relative mt-8">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Dietary Preference Focus</span>
              <select 
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="w-full rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-650 focus:border-emerald-500/40 transition duration-300"
              >
                <option value="Vegetarian">Vegetarian (Pure Veg)</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Eggetarian">Eggetarian (Ovo-Vegetarian)</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain">Jain Diet</option>
                <option value="Keto">Indian Keto</option>
                <option value="Balanced">Balanced Diet</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-4 mt-8 pt-2">
              <button 
                onClick={() => setStep(1)} 
                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 rounded-2xl border border-slate-850 bg-slate-900/80 px-8 py-3.5 font-black uppercase tracking-wider text-slate-350 hover:bg-slate-800 transition text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleFinish}
                disabled={!selectedGoal}
                className={`flex-grow sm:flex-grow-0 w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 font-black uppercase tracking-wider text-xs transition duration-300 ${
                  selectedGoal 
                    ? 'bg-emerald-500 text-slate-950 neon hover:bg-emerald-450 cursor-pointer' 
                    : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                }`}
              >
                <span>Launch Program</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
