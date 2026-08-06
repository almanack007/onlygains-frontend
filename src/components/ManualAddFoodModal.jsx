import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { Search, PlusCircle, X, Loader, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFoodDataset } from '../services/foodApi';

export const ManualAddFoodModal = ({ isOpen, onClose }) => {
  const { 
    categories, conversions, todayLog, setTodayLog, 
    showToast, translations, lang
  } = useApp();

  const dict = translations[lang] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [servingAmount, setServingAmount] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');

  // Lock body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  // Fetch food dataset from live API at runtime whenever query or category changes
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await fetchFoodDataset(searchQuery, activeCategory);
        setFoodItems(results);
      } catch (err) {
        console.error('Error fetching live food dataset:', err);
        setFoodItems([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, isOpen]);

  const handleSelectFood = (food) => {
    setSelectedFoodItem(food);
    setServingAmount(String(food.per || 100));
    setServingUnit(food.unit || 'g');
  };

  // Add selected food item to today's log
  const handleAddSearchFood = () => {
    if (!selectedFoodItem) return;
    const food = selectedFoodItem;
    const amount = Number(servingAmount);
    if (!amount || amount <= 0) return;

    const unitFactor = conversions[servingUnit] ? conversions[servingUnit] : 1;
    const foodUnitFactor = conversions[food.unit] ? conversions[food.unit] : 1;
    const factor = unitFactor / foodUnitFactor;
    const baseQty = (amount * factor) / food.per;

    const entry = {
      type: 'food',
      label: food.name,
      name: food.name,
      brand: food.brand || '',
      image: food.image || null,
      servingAmount: amount,
      unit: servingUnit,
      cal: Math.round(food.cal * baseQty),
      protein: Number((food.protein * baseQty).toFixed(1)),
      carbs: Number((food.carbs * baseQty).toFixed(1)),
      fat: Number((food.fat * baseQty).toFixed(1)),
      timestamp: Date.now()
    };

    setTodayLog([entry, ...todayLog]);
    setSelectedFoodItem(null);
    setServingAmount('100');
    setServingUnit('g');
    showToast(`Logged ${amount}${servingUnit} of ${food.name}`, 'success');
    onClose();
  };

  const getLivePreview = (food, amt, unit) => {
    if (!food) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
    const parsed = Number(amt) || 0;
    const unitFactor = conversions[unit] ? conversions[unit] : 1;
    const foodUnitFactor = conversions[food.unit] ? conversions[food.unit] : 1;
    const factor = unitFactor / foodUnitFactor;
    const baseQty = (parsed * factor) / food.per;
    return {
      cal: Math.round(food.cal * baseQty),
      protein: (food.protein * baseQty).toFixed(1),
      carbs: (food.carbs * baseQty).toFixed(1),
      fat: (food.fat * baseQty).toFixed(1)
    };
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onTouchMove={(e) => e.stopPropagation()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm touch-none pointer-events-auto"
          />

          {/* Centered Modal */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative bg-[#161616] border border-white/10 rounded-[28px] p-5 sm:p-6 z-50 overflow-y-auto overscroll-contain w-full max-w-[460px] max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-left pointer-events-auto"
          >

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white">Live Food Dataset API</h2>
                <p className="text-[10px] font-semibold text-neutral-400">Fetched dynamically at runtime from Open Food Facts</p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search any food, brand, kulcha, dal, oats, barcode item..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-neutral-900 border border-white/5 pl-11 pr-10 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#adff2f]/50"
              />
              {isLoading && (
                <div className="absolute right-3.5 top-3.5">
                  <Loader className="w-4 h-4 text-[#adff2f] animate-spin" />
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto thin-scroll scroll-fade-x pb-2 mb-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                    activeCategory === cat 
                      ? 'border-[#adff2f] bg-[#adff2f]/10 text-[#adff2f]' 
                      : 'border-white/5 bg-white/[0.02] text-neutral-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {cat === 'Open Food Facts' && <Globe className="w-3 h-3 text-[#adff2f]" />}
                  {cat}
                </button>
              ))}
            </div>

            {/* Food Results List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto thin-scroll pr-1">
              {isLoading && foodItems.length === 0 ? (
                <div className="text-center py-10">
                  <Loader className="w-6 h-6 text-[#adff2f] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">Fetching live food dataset at runtime...</p>
                </div>
              ) : foodItems.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-10">No items returned from live API. Try another search term.</p>
              ) : (
                foodItems.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl transition duration-200 text-left cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <div className="w-16 h-16 rounded-none overflow-hidden border border-white/10 bg-neutral-950 flex-shrink-0 shadow-md">
                        <img 
                          src={food.image || getHDHighlightFoodImage(food.name, food.category)} 
                          alt={food.name}
                          className="w-full h-full object-cover rounded-none transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getHDHighlightFoodImage(food.name, food.category);
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-extrabold text-xs text-white truncate">{food.name}</p>
                          {food.brand && (
                            <span className="text-[8px] font-extrabold text-[#adff2f] bg-[#adff2f]/10 px-1.5 py-0.5 rounded border border-[#adff2f]/20 flex-shrink-0 truncate max-w-[110px]">
                              {food.brand}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5 capitalize font-medium truncate">
                          {food.category} • {food.cal} kcal / {food.per}{food.unit} • P: {food.protein}g C: {food.carbs}g F: {food.fat}g
                        </p>
                      </div>
                    </div>
                    <div className="text-[#adff2f] hover:scale-110 transition flex-shrink-0">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Portion Selector Modal */}
            {selectedFoodItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm glass p-6 slide-up text-left shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-none overflow-hidden border border-white/10 bg-neutral-950 flex-shrink-0 shadow-lg shadow-black/60">
                      <img 
                        src={selectedFoodItem.image || getHDHighlightFoodImage(selectedFoodItem.name, selectedFoodItem.category)} 
                        alt={selectedFoodItem.name} 
                        className="w-full h-full object-cover rounded-none"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getHDHighlightFoodImage(selectedFoodItem.name, selectedFoodItem.category);
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-white text-sm truncate">{selectedFoodItem.name}</h3>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider capitalize truncate">
                        {selectedFoodItem.brand ? `${selectedFoodItem.brand} • ` : ''}{selectedFoodItem.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs mb-5">
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold">Calories</p>
                      <p className="font-bold text-white mt-0.5">{getLivePreview(selectedFoodItem, servingAmount, servingUnit).cal} kcal</p>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold">Protein</p>
                      <p className="font-bold text-sky-400 mt-0.5">{getLivePreview(selectedFoodItem, servingAmount, servingUnit).protein}g</p>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold">Carbs</p>
                      <p className="font-bold text-amber-400 mt-0.5">{getLivePreview(selectedFoodItem, servingAmount, servingUnit).carbs}g</p>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-neutral-400 uppercase font-semibold">Fat</p>
                      <p className="font-bold text-pink-400 mt-0.5">{getLivePreview(selectedFoodItem, servingAmount, servingUnit).fat}g</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <input 
                      type="number"
                      value={servingAmount}
                      onChange={(e) => setServingAmount(e.target.value)}
                      className="flex-1 rounded-2xl bg-neutral-900 border border-white/5 px-3.5 py-3 text-white text-xs text-center focus:outline-none focus:border-[#adff2f]/50"
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
                      onClick={() => setSelectedFoodItem(null)} 
                      className="flex-1 rounded-2xl bg-neutral-800 border border-white/5 py-3 text-xs text-white/70 font-black uppercase tracking-wider hover:bg-neutral-750 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddSearchFood} 
                      className="flex-1 rounded-2xl bg-[#adff2f] hover:bg-[#9eff1a] text-black py-3 text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-[0_0_12px_rgba(173,255,47,0.25)]"
                    >
                      Log Food
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
