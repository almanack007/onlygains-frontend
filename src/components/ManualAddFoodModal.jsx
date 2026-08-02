import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, PlusCircle, X, Loader, Utensils, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ManualAddFoodModal = ({ isOpen, onClose }) => {
  const { 
    foodDatabase, categories, conversions, todayLog, setTodayLog, 
    showToast, translations, lang
  } = useApp();

  const dict = translations[lang] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [offSearchResults, setOffSearchResults] = useState([]);
  const [isSearchingOFF, setIsSearchingOFF] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);
  const [servingAmount, setServingAmount] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');

  // Prevent body overflow when modal is open
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

  // Live debounced search to Open Food Facts API
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setOffSearchResults([]);
      setIsSearchingOFF(false);
      return;
    }

    setIsSearchingOFF(true);
    const timer = setTimeout(async () => {
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('OFF Search HTTP Error');
        const data = await res.json();
        
        if (data.products && Array.isArray(data.products)) {
          const items = data.products
            .filter(p => p.product_name || p.brands)
            .map(p => {
              const name = p.product_name || p.brands || 'Product';
              const brand = p.brands || '';
              const image = p.image_front_small_url || p.image_front_url || p.image_url || p.image_small_url || null;
              const n = p.nutriments || {};
              const cal = Math.round(n['energy-kcal_100g'] || n['energy-kcal_value'] || (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0));
              const protein = Number((n.proteins_100g || n.proteins_value || 0).toFixed(1));
              const carbs = Number((n.carbohydrates_100g || n.carbohydrates_value || 0).toFixed(1));
              const fat = Number((n.fat_100g || n.fat_value || 0).toFixed(1));
              return {
                id: `off-${p.code || Math.random().toString(36).substring(2, 9)}`,
                name,
                displayName: name,
                brand,
                category: 'Open Food Facts',
                cal,
                protein,
                carbs,
                fat,
                unit: 'g',
                per: 100,
                image,
                isOpenFoodFacts: true
              };
            });
          setOffSearchResults(items);
        } else {
          setOffSearchResults([]);
        }
      } catch (err) {
        console.warn('Open Food Facts fetch error:', err.message);
        setOffSearchResults([]);
      } finally {
        setIsSearchingOFF(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combined list of Local DB foods + Open Food Facts foods
  const getCombinedFoods = () => {
    const q = searchQuery.toLowerCase().trim();
    
    // 1. Local DB foods
    const localMatches = Object.entries(foodDatabase)
      .filter(([name, data]) => {
        const matchQuery = !q || name.toLowerCase().includes(q);
        const matchCat = activeCategory === 'All' || data.category.toLowerCase() === activeCategory.toLowerCase();
        return matchQuery && matchCat;
      })
      .map(([name, data]) => ({
        id: `local-${name}`,
        name,
        displayName: name,
        brand: '',
        category: data.category,
        cal: data.cal,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        unit: data.unit || 'g',
        per: data.per || 100,
        image: data.image || null,
        isOpenFoodFacts: false
      }));

    // 2. Open Food Facts matches (only if category is 'All' or 'Open Food Facts')
    const offMatches = (activeCategory === 'All' || activeCategory === 'Open Food Facts') ? offSearchResults : [];

    return [...localMatches, ...offMatches];
  };

  const handleSelectFood = (food) => {
    setSelectedFoodItem(food);
    setServingAmount(String(food.per || 100));
    setServingUnit(food.unit || 'g');
  };

  // Add search food item to log
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

  const getRecentFoods = () => {
    const logged = todayLog
      .filter(entry => entry.type === 'food')
      .map(entry => entry.name);
    const unique = Array.from(new Set(logged));
    const fallbacks = ['Banana', 'Roti / Chapati', 'Whole Milk Curd / Dahi', 'Basmati Rice Cooked'];
    const merged = Array.from(new Set([...unique, ...fallbacks])).slice(0, 4);
    return merged
      .filter(name => foodDatabase[name])
      .map(name => ({
        id: `recent-${name}`,
        name,
        displayName: name,
        brand: '',
        category: foodDatabase[name].category,
        cal: foodDatabase[name].cal,
        protein: foodDatabase[name].protein,
        carbs: foodDatabase[name].carbs,
        fat: foodDatabase[name].fat,
        unit: foodDatabase[name].unit || 'g',
        per: foodDatabase[name].per || 100,
        image: foodDatabase[name].image || null,
        isOpenFoodFacts: false
      }));
  };

  const getFrequentFoods = () => {
    const list = ['Chicken Breast', 'Cow Milk', 'Paneer raw', 'Daal Chawal'];
    return list
      .filter(name => foodDatabase[name])
      .map(name => ({
        id: `frequent-${name}`,
        name,
        displayName: name,
        brand: '',
        category: foodDatabase[name].category,
        cal: foodDatabase[name].cal,
        protein: foodDatabase[name].protein,
        carbs: foodDatabase[name].carbs,
        fat: foodDatabase[name].fat,
        unit: foodDatabase[name].unit || 'g',
        per: foodDatabase[name].per || 100,
        image: foodDatabase[name].image || null,
        isOpenFoodFacts: false
      }));
  };

  const recentFoods = getRecentFoods();
  const frequentFoods = getFrequentFoods();
  const allCategories = ['All', 'Open Food Facts', ...categories.filter(c => c !== 'All')];
  const combinedList = getCombinedFoods();

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

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-[#161616] border-t border-white/10 rounded-t-[32px] p-5 sm:p-6 z-50 overflow-y-auto overscroll-contain max-h-[90vh] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] text-left"
          >
            {/* Handlebar */}
            <div className="w-12 h-1 bg-white/15 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white">Food Database</h2>
                <p className="text-[10px] font-semibold text-neutral-400">Powered by Open Food Facts & FitTrack DB</p>
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
                placeholder="Search food, brands, barcode products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-neutral-900 border border-white/5 pl-11 pr-10 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#adff2f]/50"
              />
              {isSearchingOFF && (
                <div className="absolute right-3.5 top-3.5">
                  <Loader className="w-4 h-4 text-[#adff2f] animate-spin" />
                </div>
              )}
            </div>

            {searchQuery === '' && (
              <div className="space-y-4 mb-4">
                {recentFoods.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Recent Foods</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {recentFoods.map(food => (
                        <button
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className="p-2.5 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl text-left cursor-pointer transition flex items-center gap-2.5 active:scale-[0.98]"
                        >
                          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/5 overflow-hidden flex-shrink-0 grid place-items-center text-neutral-400">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs text-white truncate">{food.name}</p>
                            <p className="text-[9px] text-neutral-400 mt-0.5 capitalize truncate">{food.category} • {food.cal} kcal</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Frequently Eaten</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {frequentFoods.map(food => (
                      <button
                        key={food.id}
                        onClick={() => handleSelectFood(food)}
                        className="p-2.5 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl text-left cursor-pointer transition flex items-center gap-2.5 active:scale-[0.98]"
                      >
                        <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-white/5 overflow-hidden flex-shrink-0 grid place-items-center text-neutral-400">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-xs text-white truncate">{food.name}</p>
                          <p className="text-[9px] text-neutral-400 mt-0.5 capitalize truncate">{food.category} • {food.cal} kcal</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto thin-scroll scroll-fade-x pb-2 mb-3">
              {allCategories.map((cat) => (
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

            {/* List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto thin-scroll scroll-fade-y pr-1">
              {isSearchingOFF && combinedList.length === 0 ? (
                <div className="text-center py-8">
                  <Loader className="w-6 h-6 text-[#adff2f] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-neutral-400 font-medium">Searching Open Food Facts dataset...</p>
                </div>
              ) : combinedList.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-8">No foods match your search criteria.</p>
              ) : (
                combinedList.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="w-full flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl transition duration-200 text-left cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      {food.image ? (
                        <img 
                          src={food.image} 
                          alt={food.name}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0 bg-neutral-900"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/5 grid place-items-center flex-shrink-0 text-neutral-400">
                          {food.isOpenFoodFacts ? <Globe className="w-4 h-4 text-[#adff2f]" /> : <Utensils className="w-4 h-4" />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-extrabold text-xs text-white truncate">{food.name}</p>
                          {food.brand && (
                            <span className="text-[8px] font-extrabold text-[#adff2f] bg-[#adff2f]/10 px-1.5 py-0.5 rounded border border-[#adff2f]/20 flex-shrink-0 truncate max-w-[100px]">
                              {food.brand}
                            </span>
                          )}
                          {food.isOpenFoodFacts && !food.brand && (
                            <span className="text-[8px] font-black text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 flex-shrink-0">
                              Open Food Facts
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
                    {selectedFoodItem.image ? (
                      <img 
                        src={selectedFoodItem.image} 
                        alt={selectedFoodItem.name} 
                        className="w-12 h-12 rounded-2xl object-cover border border-white/10 bg-neutral-900 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/5 grid place-items-center flex-shrink-0 text-neutral-400">
                        {selectedFoodItem.isOpenFoodFacts ? <Globe className="w-5 h-5 text-[#adff2f]" /> : <Utensils className="w-5 h-5" />}
                      </div>
                    )}
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
        </>
      )}
    </AnimatePresence>
  );
};
