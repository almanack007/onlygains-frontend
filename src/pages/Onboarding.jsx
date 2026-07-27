import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Onboarding = () => {
  const { goalConfigs, setUserProfile, saveLocalState, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(78);
  const [activity, setActivity] = useState(1.55);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [dietType, setDietType] = useState('Balanced');

  const goalIcons = ['◒', '▲', '◆', '◇', '⬢', '◈'];

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
    showToast('Profile created successfully! Let\'s crush those goals! 💪', 'success');
  };

  return (
    <section id="onboarding" className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-emerald-400 font-bold tracking-[.25em] text-xs uppercase">muscle building nutrition</p>
          <h1 className="text-4xl sm:text-6xl font-black mt-3 text-slate-100">FitTrack Pro</h1>
        </div>

        {step === 1 ? (
          <div id="step1" className="glass rounded-2xl p-5 sm:p-8 slide-up">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Build Your Profile</h2>
                <p className="text-slate-400 mt-1">Step 1 of 2</p>
              </div>
              <div className="h-2 w-28 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full w-1/2 bg-emerald-500"></div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm text-slate-300">Gender</span>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Age</span>
                <input 
                  type="number" 
                  min="13" 
                  max="100" 
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100" 
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Height (cm)</span>
                <input 
                  type="number" 
                  min="120" 
                  max="230" 
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100" 
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-300">Weight (kg)</span>
                <input 
                  type="number" 
                  min="35" 
                  max="220" 
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100" 
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm text-slate-300">Activity Level</span>
                <select 
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100"
                >
                  <option value="1.2">Sedentary (Little or no exercise)</option>
                  <option value="1.375">Lightly active (1-3 days/week)</option>
                  <option value="1.55">Moderately active (3-5 days/week)</option>
                  <option value="1.725">Very active (6-7 days/week)</option>
                  <option value="1.9">Extreme (Athletic/heavy physical work)</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm text-slate-300">Daily Water Goal (ml)</span>
                <input 
                  type="number" 
                  min="500" 
                  max="10000" 
                  step="100" 
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100" 
                />
              </label>
            </div>

            <button 
              onClick={handleContinue} 
              className="mt-7 w-full sm:w-auto rounded-xl bg-emerald-500 px-7 py-3 font-bold text-slate-950 neon hover:bg-emerald-400 transition"
            >
              Continue
            </button>
          </div>
        ) : (
          <div id="step2" className="glass rounded-2xl p-5 sm:p-8 slide-up">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Choose Your Goal</h2>
                <p className="text-slate-400 mt-1">Step 2 of 2</p>
              </div>
              <div className="h-2 w-28 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full w-full bg-emerald-500"></div>
              </div>
            </div>

            <div id="goalGrid" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(goalConfigs).map(([key, g], i) => (
                <button
                  key={key}
                  onClick={() => setSelectedGoal(key)}
                  className={`goal-card text-left rounded-2xl border p-4 transition hover:-translate-y-1 hover:border-emerald-400/60 ${
                    selectedGoal === key 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-emerald-300' 
                      : 'border-slate-700 bg-slate-900/55'
                  }`}
                >
                  <div className="text-3xl text-emerald-300">{goalIcons[i % goalIcons.length]}</div>
                  <h3 className="font-bold mt-3">{g.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{g.note}</p>
                  <p className="text-xs text-slate-500 mt-3">{g.proteinFactor}g protein/kg</p>
                </button>
              ))}
            </div>

            <label className="block mt-6">
              <span className="text-sm text-slate-300">Dietary Preference</span>
              <select 
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100"
              >
                <option value="Vegetarian">Vegetarian (Pure Veg)</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Eggetarian">Eggetarian (Ovo-Vegetarian)</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain">Jain Diet</option>
                <option value="Keto">Indian Keto</option>
                <option value="Balanced">Balanced Diet</option>
              </select>
            </label>

            <div className="flex gap-4 mt-7">
              <button 
                onClick={() => setStep(1)} 
                className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-900/55 px-7 py-3 font-bold text-slate-300 hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!selectedGoal}
                className={`w-full sm:w-auto rounded-xl px-7 py-3 font-bold transition ${
                  selectedGoal 
                    ? 'bg-emerald-500 text-slate-950 neon hover:bg-emerald-400 cursor-pointer' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                Start Tracking
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
