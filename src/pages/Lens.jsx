import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Search, PlusCircle, Sparkles, Loader } from 'lucide-react';

export const Lens = () => {
  const { 
    foodDatabase, categories, conversions, todayLog, setTodayLog, 
    apiBase, showToast, translations, lang, currentTotals, userProfile
  } = useApp();

  const dict = translations[lang] || translations.en;

  // Search & Track state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFoodName, setSelectedFoodName] = useState(null);
  const [servingAmount, setServingAmount] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');

  // Lens Scan state
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [lensServingAmount, setLensServingAmount] = useState('100');
  const [lensServingUnit, setLensServingUnit] = useState('g');

  // Filter foods based on query & category
  const getFilteredFoods = () => {
    return Object.entries(foodDatabase).filter(([name, data]) => {
      const matchQuery = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'All' || data.category.toLowerCase() === activeCategory.toLowerCase();
      return matchQuery && matchCategory;
    });
  };

  // Convert files to base64
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result);
      setScanResult(null);
      triggerScan(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerScan = async (base64Image) => {
    setIsScanning(true);
    try {
      const res = await fetch(`${apiBase}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      if (!res.ok) throw new Error('Meal recognition request failed');
      const data = await res.json();
      
      if (data.scanner_unavailable) {
        showToast('Gemini API key not configured on server', 'error');
        setScanResult({
          is_food: false,
          rejection_message: 'Gemini API not configured on the server. Please add your GEMINI_API_KEY to your environment variables.'
        });
      } else {
        setScanResult(data);
        if (data.is_food && data.estimated_macros) {
          setLensServingAmount(String(data.estimated_macros.per || 100));
          setLensServingUnit(data.estimated_macros.unit || 'g');
        }
        showToast('Meal analyzed successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
      setScanResult({
        is_food: false,
        rejection_message: 'Could not connect to scanner server. Check your network or API settings.'
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Add search food item to log
  const handleAddSearchFood = () => {
    if (!selectedFoodName) return;
    const food = foodDatabase[selectedFoodName];
    const amount = Number(servingAmount);
    if (!amount || amount <= 0) return;

    // Convert serving units
    const factor = conversions[servingUnit] / conversions[food.unit];
    const baseQty = (amount * factor) / food.per;

    const entry = {
      type: 'food',
      label: selectedFoodName,
      name: selectedFoodName,
      servingAmount: amount,
      unit: servingUnit,
      cal: Math.round(food.cal * baseQty),
      protein: Number((food.protein * baseQty).toFixed(1)),
      carbs: Number((food.carbs * baseQty).toFixed(1)),
      fat: Number((food.fat * baseQty).toFixed(1)),
      timestamp: Date.now()
    };

    setTodayLog([entry, ...todayLog]);
    setSelectedFoodName(null);
    setServingAmount('100');
    setServingUnit('g');
    showToast(`Logged ${amount}${servingUnit} of ${selectedFoodName}`, 'success');
  };

  // Add scanned food item to log
  const handleAddScannedFood = () => {
    if (!scanResult || !scanResult.is_food) return;
    const macros = scanResult.estimated_macros;
    const amount = Number(lensServingAmount);
    if (!amount || amount <= 0) return;

    // Determine final name: match or recognized name
    const finalName = scanResult.match || scanResult.identified_as || 'Scanned Meal';
    const factor = conversions[lensServingUnit] / conversions[macros.unit];
    const baseQty = (amount * factor) / macros.per;

    const entry = {
      type: 'food',
      label: finalName,
      name: finalName,
      servingAmount: amount,
      unit: lensServingUnit,
      cal: Math.round(macros.cal * baseQty),
      protein: Number((macros.protein * baseQty).toFixed(1)),
      carbs: Number((macros.carbs * baseQty).toFixed(1)),
      fat: Number((macros.fat * baseQty).toFixed(1)),
      timestamp: Date.now()
    };

    setTodayLog([entry, ...todayLog]);
    setScanResult(null);
    setCapturedImage(null);
    showToast(`Logged ${amount}${lensServingUnit} of ${finalName}`, 'success');
  };

  // Live preview calculator helper
  const getLivePreview = (food, amt, unit) => {
    if (!food) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
    const parsed = Number(amt) || 0;
    const factor = conversions[unit] / conversions[food.unit];
    const baseQty = (parsed * factor) / food.per;
    return {
      cal: Math.round(food.cal * baseQty),
      protein: (food.protein * baseQty).toFixed(1),
      carbs: (food.carbs * baseQty).toFixed(1),
      fat: (food.fat * baseQty).toFixed(1)
    };
  };

  return (
    <div id="panelAddFood" className="max-w-xl mx-auto space-y-6 py-4 pb-20">
      
      {/* 1. Lens AI visual scanner card */}
      <div className="glass rounded-2xl p-5 text-center relative overflow-hidden">
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <Sparkles className="w-3 h-3" /> Lens Pro
        </div>

        <h2 className="text-lg font-bold text-slate-200 text-left mb-1" data-i18n="scan_meal">{dict.scan_meal}</h2>
        <p className="text-xs text-slate-500 text-left mb-6">Point your camera or upload a photo to identify nutrients instantly.</p>

        {/* Scanner Viewport */}
        <div className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/40 hover:border-emerald-500/40 transition-all flex flex-col items-center justify-center overflow-hidden group">
          {capturedImage ? (
            <>
              <img src={capturedImage} className="w-full h-full object-cover" alt="Captured Meal" />
              {isScanning && <div className="scanner-line"></div>}
            </>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-slate-200 transition">
              <Camera className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition duration-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Take Photo / Upload Image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Scan Results */}
        {isScanning && (
          <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-center gap-2.5 text-xs text-slate-400">
            <Loader className="w-4 h-4 text-emerald-400 animate-spin" /> Recognizing foods and estimating nutrition...
          </div>
        )}

        {scanResult && (
          <div className="mt-4 text-left slide-up space-y-4">
            {scanResult.is_food ? (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 text-sm">
                    Identified: <span className="text-emerald-400 font-extrabold capitalize">{scanResult.match || scanResult.identified_as}</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    {scanResult.food_confidence || scanResult.confidence}% match
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Calories</p>
                    <p className="font-bold text-slate-200 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).cal} kcal</p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Protein</p>
                    <p className="font-bold text-blue-400 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).protein}g</p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Carbs</p>
                    <p className="font-bold text-amber-500 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).carbs}g</p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Fat</p>
                    <p className="font-bold text-pink-500 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).fat}g</p>
                  </div>
                </div>

                {/* Adjust portions */}
                <div className="flex gap-2 mb-4">
                  <input 
                    type="number"
                    value={lensServingAmount}
                    onChange={(e) => setLensServingAmount(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-xs text-center"
                  />
                  <select 
                    value={lensServingUnit}
                    onChange={(e) => setLensServingUnit(e.target.value)}
                    className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-xs"
                  >
                    <option value="g">g</option>
                    <option value="oz">oz</option>
                    <option value="cup">cup</option>
                    <option value="piece">piece</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setScanResult(null); setCapturedImage(null); }} className="flex-1 rounded-xl border border-slate-700 bg-slate-900/55 py-2.5 text-xs text-slate-300 font-bold hover:bg-slate-800 transition">Retake</button>
                  <button onClick={handleAddScannedFood} className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2.5 text-xs font-bold transition neon">Log Scanned Meal</button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                <p className="text-xs text-red-400 font-medium leading-relaxed mb-4">{scanResult.rejection_message}</p>
                <button onClick={() => { setScanResult(null); setCapturedImage(null); }} className="px-5 py-2 rounded-xl border border-slate-700 bg-slate-900/55 text-xs text-slate-300 font-bold hover:bg-slate-800 transition">Try Again</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Search and Custom Track list */}
      <div className="glass rounded-2xl p-5">
        <h2 className="text-lg font-bold text-slate-200 mb-4" data-i18n="add_food">{dict.add_food}</h2>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search dal, paneer, roti, banana..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-950/80 border border-slate-850 pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-650"
          />
        </div>

        {/* Categories tab scroll */}
        <div className="flex gap-1.5 overflow-x-auto thin-scroll pb-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`food-tab flex-shrink-0 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                activeCategory === cat 
                  ? 'tab-active border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black' 
                  : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List of matched items */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto thin-scroll pr-1">
          {getFilteredFoods().length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No foods match your search criteria.</p>
          ) : (
            getFilteredFoods().map(([name, data]) => (
              <button
                key={name}
                onClick={() => setSelectedFoodName(name)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:border-emerald-500/40 transition text-left"
              >
                <div>
                  <p className="font-semibold text-xs text-slate-200">{name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 capitalize">
                    {data.category} • {data.cal} kcal / {data.per}{data.unit}
                  </p>
                </div>
                <div className="text-emerald-400 hover:scale-115 transition">
                  <PlusCircle className="w-5 h-5" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Serving Amount Custom Input Dialog Modal */}
      {selectedFoodName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-sm glass rounded-2xl p-5 sm:p-6 slide-up text-left">
            <h3 className="font-black text-slate-200 text-sm mb-1">Add serving portion</h3>
            <p className="text-xs text-slate-500 mb-4 capitalize">{selectedFoodName} ({foodDatabase[selectedFoodName].category})</p>

            <div className="grid grid-cols-4 gap-2 text-center text-xs mb-5">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Calories</p>
                <p className="font-bold text-slate-200 mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).cal} kcal</p>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Protein</p>
                <p className="font-bold text-blue-400 mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).protein}g</p>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Carbs</p>
                <p className="font-bold text-amber-500 mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).carbs}g</p>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Fat</p>
                <p className="font-bold text-pink-500 mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).fat}g</p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <input 
                type="number"
                value={servingAmount}
                onChange={(e) => setServingAmount(e.target.value)}
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 text-xs text-center"
              />
              <select 
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-slate-100 text-xs"
              >
                <option value="g">g</option>
                <option value="oz">oz</option>
                <option value="cup">cup</option>
                <option value="piece">piece</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedFoodName(null)} className="flex-1 rounded-xl border border-slate-700 bg-slate-900/55 py-2.5 text-xs text-slate-300 font-bold hover:bg-slate-800 transition">Cancel</button>
              <button onClick={handleAddSearchFood} className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2.5 text-xs font-bold transition neon">Log Food</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
