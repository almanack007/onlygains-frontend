import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { Camera, Search, PlusCircle, Sparkles, Loader, RotateCw, Image as ImageIcon, X, HelpCircle, Dumbbell } from 'lucide-react';

export const Lens = () => {
  const { 
    foodDatabase, categories, conversions, todayLog, setTodayLog, 
    apiBase, showToast, translations, lang, setActiveTab
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

  // Camera Live Streaming states
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera tracks helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start camera streaming
  const startCamera = async (mode = facingMode) => {
    stopCamera();
    setCameraError('');
    setIsCameraActive(true);
    setCapturedImage(null);
    setScanResult(null);

    try {
      const constraints = {
        video: { facingMode: mode }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);

    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera access unavailable. Please upload a picture instead.');
      setIsCameraActive(false);
    }
  };

  // Capture image snapshot from video stream
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg');
    setCapturedImage(base64Image);
    stopCamera();
    triggerScan(base64Image);
  };

  // Switch camera between front and back
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Auto-start camera on mount and clean up on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure stream binding is persistent in portal rendering
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.log('Stream play error:', e));
    }
  }, [isCameraActive]);

  const handleBack = () => {
    stopCamera();
    setActiveTab('home');
  };

  // Filter foods based on query & category
  const getFilteredFoods = () => {
    return Object.entries(foodDatabase).filter(([name, data]) => {
      const matchQuery = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'All' || data.category.toLowerCase() === activeCategory.toLowerCase();
      return matchQuery && matchCategory;
    });
  };

  // Handle manual image uploads
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopCamera();
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
      image: capturedImage || null,
      timestamp: Date.now()
    };

    setTodayLog([entry, ...todayLog]);
    setScanResult(null);
    setCapturedImage(null);
    showToast(`Logged ${amount}${lensServingUnit} of ${finalName}`, 'success');
    setActiveTab('home');
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
    <div id="panelAddFood" className="max-w-xl mx-auto space-y-6 py-4 pb-20 slide-up">
      
      {/* 1. Lens AI visual scanner card */}
      <div className="glass rounded-[28px] p-6 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[9px] text-emerald-500 font-extrabold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(204,255,0,0.15)] z-30">
          <Sparkles className="w-3.5 h-3.5" /> Lens Pro
        </div>

        <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 text-left mb-1" data-i18n="scan_meal">{dict.scan_meal}</h2>
        <p className="text-xs text-slate-500 text-left mb-6 leading-relaxed">Point your camera or upload a photo to identify nutrients instantly.</p>

        {/* Viewport Frame */}
        {isCameraActive ? createPortal(
          <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden">
            {/* Top Camera Header bar */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-12 sm:pt-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/75 to-transparent text-slate-100">
              <button 
                onClick={handleBack} 
                className="bg-black/50 hover:bg-black/75 p-2.5 rounded-full border border-white/10 text-white/90 backdrop-blur-sm transition pointer-events-auto cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-extrabold text-xs uppercase tracking-widest drop-shadow-md">AI Visual Scan</h3>
              <button 
                onClick={() => showToast('Position food inside the focus frame to scan.', 'info')} 
                className="bg-black/50 hover:bg-black/75 p-2.5 rounded-full border border-white/10 text-white/90 backdrop-blur-sm transition pointer-events-auto cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Live Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />

            {/* Focus Targets Overlay frame */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 pointer-events-none">
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-transparent">
                {/* Focus box corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl"></div>
              </div>
              <p className="text-[10px] text-white/90 font-bold uppercase tracking-wider mt-8 bg-black/60 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md drop-shadow">
                Focus on plates and items home to the foods
              </p>
            </div>

            {/* Camera Scanning Overlay Lines */}
            {isScanning && <div className="scanner-line"></div>}

            {/* Bottom Tabs selector pills */}
            <div className="absolute bottom-28 left-0 right-0 flex justify-center z-20 pointer-events-auto">
              <div className="bg-black/65 backdrop-blur-md border border-white/10 rounded-full p-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider">
                <button className="bg-white text-slate-950 px-4 py-2 rounded-full flex items-center gap-1 transition-all">
                  <Camera className="w-3.5 h-3.5" /> AI Camera
                </button>
                <button 
                  onClick={toggleFacingMode}
                  className="text-slate-350 hover:text-white px-4 py-2 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Flip
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-slate-350 hover:text-white px-4 py-2 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Gallery
                </button>
              </div>
            </div>

            {/* Bottom Shutter Capture Trigger Button */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center z-20 pointer-events-auto">
              <button 
                onClick={captureSnapshot} 
                className="w-16 h-16 rounded-full border-4 border-white bg-transparent flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.4)] cursor-pointer"
                title="Capture Photo"
              >
                <div className="w-full h-full rounded-full bg-white"></div>
              </button>
            </div>
          </div>,
          document.body
        ) : (
          <div className="relative w-full aspect-[9/16] sm:aspect-[3/4] max-h-[550px] rounded-[24px] border border-slate-800 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
            {/* Captured Preview Image */}
            {capturedImage && (
              <img src={capturedImage} className="w-full h-full object-cover animate-fade-in" alt="Captured Meal" />
            )}

            {/* Default Placeholder View */}
            {!capturedImage && (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center z-10 animate-fade-in">
                <Camera className="w-12 h-12 text-emerald-500 mb-2 animate-pulse" />
                <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                  {cameraError || 'Camera stream is ready'}
                </p>
                
                <div className="flex flex-col gap-2 mt-4 w-44">
                  <button 
                    onClick={() => startCamera()} 
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition neon cursor-pointer"
                  >
                    Start Camera
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Upload Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden Canvas and File Inputs */}
        <canvas ref={canvasRef} className="hidden" />
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="hidden" 
        />

        {/* Scan Results */}
        {isScanning && (
          <div className="mt-4 p-4 rounded-2xl border border-slate-850 bg-slate-900/40 flex items-center justify-center gap-2.5 text-xs text-slate-400">
            <Loader className="w-4 h-4 text-emerald-500 animate-spin" /> Recognizing foods and estimating nutrition...
          </div>
        )}

        {scanResult && (
          <div className="mt-4 text-left slide-up space-y-4">
            {scanResult.is_food ? (
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-200 text-sm">
                    Identified: <span className="text-emerald-500 font-extrabold capitalize">{scanResult.match || scanResult.identified_as}</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                    {scanResult.food_confidence || scanResult.confidence}% match
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850">
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Calories</p>
                    <p className="font-bold text-slate-200 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).cal} kcal</p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850">
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Protein</p>
                    <p className="font-bold text-blue-400 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).protein}g</p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850">
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Carbs</p>
                    <p className="font-bold text-amber-500 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).carbs}g</p>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-850">
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Fat</p>
                    <p className="font-bold text-pink-500 mt-0.5">{getLivePreview(scanResult.estimated_macros, lensServingAmount, lensServingUnit).fat}g</p>
                  </div>
                </div>

                {/* Adjust portions */}
                <div className="flex gap-2 mb-4">
                  <input 
                    type="number"
                    value={lensServingAmount}
                    onChange={(e) => setLensServingAmount(e.target.value)}
                    className="flex-1 rounded-2xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-slate-100 text-xs text-center"
                  />
                  <select 
                    value={lensServingUnit}
                    onChange={(e) => setLensServingUnit(e.target.value)}
                    className="rounded-2xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-slate-100 text-xs"
                  >
                    <option value="g">g</option>
                    <option value="oz">oz</option>
                    <option value="cup">cup</option>
                    <option value="piece">piece</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setScanResult(null); setCapturedImage(null); }} className="flex-1 rounded-2xl border border-slate-850 bg-slate-900/80 py-3 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-800 transition">Retake</button>
                  <button onClick={handleAddScannedFood} className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 text-xs font-black uppercase tracking-wider transition neon">Log Scanned Meal</button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
                <p className="text-xs text-red-400 font-semibold leading-relaxed mb-4">{scanResult.rejection_message}</p>
                <button onClick={() => { setScanResult(null); setCapturedImage(null); }} className="px-5 py-2 rounded-2xl border border-slate-850 bg-slate-900/80 text-xs text-slate-350 font-black uppercase tracking-wider hover:bg-slate-800 transition">Try Again</button>
              </div>
            )}
          </div>
        )}
      </div>



    </div>
  );
};
