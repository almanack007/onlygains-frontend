import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ManualAddFoodModal = ({ isOpen, onClose }) => {
  const { 
    foodDatabase, categories, conversions, todayLog, setTodayLog, 
    showToast, translations, lang
  } = useApp();

  const dict = translations[lang] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFoodName, setSelectedFoodName] = useState(null);
  const [servingAmount, setServingAmount] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Filter foods based on query & category
  const getFilteredFoods = () => {
    return Object.entries(foodDatabase).filter(([name, data]) => {
      const matchQuery = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'All' || data.category.toLowerCase() === activeCategory.toLowerCase();
      return matchQuery && matchCategory;
    });
  };

  // Add search food item to log
  const handleAddSearchFood = () => {
    if (!selectedFoodName) return;
    const food = foodDatabase[selectedFoodName];
    const amount = Number(servingAmount);
    if (!amount || amount <= 0) return;

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
    onClose();
  };

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

  const getRecentFoods = () => {
    const logged = todayLog
      .filter(entry => entry.type === 'food')
      .map(entry => entry.name);
    const unique = Array.from(new Set(logged));
    const fallbacks = ['Banana', 'Roti / Chapati', 'Whole Milk Curd / Dahi', 'Basmati Rice Cooked'];
    const merged = Array.from(new Set([...unique, ...fallbacks])).slice(0, 4);
    return merged.filter(name => foodDatabase[name]);
  };

  const getFrequentFoods = () => {
    const list = ['Chicken Breast', 'Cow Milk', 'Paneer raw', 'Daal Chawal'];
    return list.filter(name => foodDatabase[name]);
  };

  const recentFoods = getRecentFoods();
  const frequentFoods = getFrequentFoods();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm touch-none"
          />

          {/* Full Screen / Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-[#161616] border-t border-white/10 rounded-t-[32px] p-6 z-50 overflow-y-auto overscroll-contain max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] text-left"
          >
            {/* Handlebar */}
            <div className="w-12 h-1 bg-white/15 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black uppercase tracking-wider text-white">Manual Add Food</h2>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search dal, paneer, roti, banana..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-neutral-900 border border-white/5 pl-11 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#9EFF3A]/50"
              />
            </div>

            {searchQuery === '' && (
              <div className="space-y-4 mb-5">
                {recentFoods.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Recent Foods</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {recentFoods.map(name => (
                        <button
                          key={`recent-${name}`}
                          onClick={() => setSelectedFoodName(name)}
                          className="p-3 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl text-left cursor-pointer transition"
                        >
                          <p className="font-extrabold text-xs text-white truncate">{name}</p>
                          <p className="text-[9px] text-neutral-500 mt-0.5 capitalize">{foodDatabase[name]?.category} • {foodDatabase[name]?.cal} kcal</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Frequently Eaten</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {frequentFoods.map(name => (
                      <button
                        key={`frequent-${name}`}
                        onClick={() => setSelectedFoodName(name)}
                        className="p-3 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl text-left cursor-pointer transition"
                      >
                        <p className="font-extrabold text-xs text-white truncate">{name}</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5 capitalize">{foodDatabase[name]?.category} • {foodDatabase[name]?.cal} kcal</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto thin-scroll scroll-fade-x pb-2 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeCategory === cat 
                      ? 'border-[#adff2f] bg-[#adff2f]/10 text-[#adff2f]' 
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto thin-scroll scroll-fade-y pr-1">
              {getFilteredFoods().length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-8">No foods match your search criteria.</p>
              ) : (
                getFilteredFoods().map(([name, data]) => (
                  <button
                    key={name}
                    onClick={() => setSelectedFoodName(name)}
                    className="w-full flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl transition duration-200 text-left cursor-pointer active:scale-[0.98]"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-xs text-white truncate">{name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 capitalize font-medium truncate">
                        {data.category} • {data.cal} kcal / {data.per}{data.unit}
                      </p>
                    </div>
                    <div className="text-[#adff2f] hover:scale-110 transition flex-shrink-0">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Portion Selector Modal */}
            {selectedFoodName && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm glass p-6 slide-up text-left">
                  <h3 className="font-black text-white text-sm mb-1">Add serving portion</h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-4 capitalize">
                    {selectedFoodName} ({foodDatabase[selectedFoodName].category})
                  </p>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs mb-5">
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-500 uppercase font-semibold">Calories</p>
                      <p className="font-bold text-white mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).cal} kcal</p>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-500 uppercase font-semibold">Protein</p>
                      <p className="font-bold text-blue-400 mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).protein}g</p>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-500 uppercase font-semibold">Carbs</p>
                      <p className="font-bold text-amber-500 mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).carbs}g</p>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-500 uppercase font-semibold">Fat</p>
                      <p className="font-bold text-pink-500 mt-0.5">{getLivePreview(foodDatabase[selectedFoodName], servingAmount, servingUnit).fat}g</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <input 
                      type="number"
                      value={servingAmount}
                      onChange={(e) => setServingAmount(e.target.value)}
                      className="flex-1 rounded-2xl bg-neutral-900 border border-white/5 px-3.5 py-3 text-white text-xs text-center focus:outline-none focus:border-[#9EFF3A]/50"
                    />
                    <select 
                      value={servingUnit}
                      onChange={(e) => setServingUnit(e.target.value)}
                      className="rounded-2xl bg-neutral-900 border border-white/5 px-4 py-3 text-white text-xs focus:outline-none"
                    >
                      <option value="g">g</option>
                      <option value="oz">oz</option>
                      <option value="cup">cup</option>
                      <option value="piece">piece</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectedFoodName(null)} 
                      className="flex-1 rounded-2xl bg-neutral-800 border border-white/5 py-3 text-xs text-white/70 font-black uppercase tracking-wider hover:bg-neutral-750 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddSearchFood} 
                      className="flex-1 rounded-2xl bg-[#9EFF3A] hover:bg-[#8ee02e] text-black py-3 text-xs font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      Log Food
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
