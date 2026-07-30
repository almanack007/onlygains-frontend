import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const WaterTank = ({
  currentWater,
  goalWater,
  onAddWater,
  onResetWater
}) => {
  const [isFilling, setIsFilling] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [ripples, setRipples] = useState([]);
  const fillTimerRef = useRef(null);
  
  const percentage = Math.min(Math.round((currentWater / goalWater) * 100), 100) || 0;
  const isGoalReached = currentWater >= goalWater;
  
  // Track changes to water intake to trigger animation/effects
  const prevWaterRef = useRef(currentWater);
  useEffect(() => {
    if (currentWater > prevWaterRef.current) {
      // Water logged (added)
      setIsFilling(true);
      
      // Spawn bubbles
      const newBubblesCount = Math.min(8, Math.max(4, Math.floor((currentWater - prevWaterRef.current) / 50)));
      const newBubbles = Array.from({ length: newBubblesCount }).map((_, idx) => ({
        id: Date.now() + Math.random() + idx,
        x: 10 + Math.random() * 80, // percentage position
        size: 3 + Math.random() * 5, // size in pixels
        delay: Math.random() * 0.4,
        duration: 0.8 + Math.random() * 0.4
      }));
      setBubbles(prev => [...prev, ...newBubbles]);
      
      // Reset isFilling status after animation duration (1000ms)
      if (fillTimerRef.current) clearTimeout(fillTimerRef.current);
      fillTimerRef.current = setTimeout(() => {
        setIsFilling(false);
        // Clear bubbles after 1.5s total
        setBubbles([]);
      }, 1200);
    } else if (currentWater === 0 && prevWaterRef.current > 0) {
      // Draining / reset triggered
      setIsFilling(true);
      if (fillTimerRef.current) clearTimeout(fillTimerRef.current);
      fillTimerRef.current = setTimeout(() => {
        setIsFilling(false);
      }, 1200);
    }
    prevWaterRef.current = currentWater;
  }, [currentWater]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (fillTimerRef.current) clearTimeout(fillTimerRef.current);
    };
  }, []);

  const handleTankClick = (e) => {
    // Only register add-water from tap if it's clicked on the tank and not goal reached (optional, let them overflow if they want)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger add water callback
    onAddWater(250);

    // Spawn ripple at click coordinates
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y
    };
    setRipples(prev => [...prev, newRipple]);

    // Haptic feedback (subtle vibration)
    if (navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch (err) {
        // Ignore errors in browsers that block vibration before interaction
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Premium Glass Water Tank Container */}
      <motion.div
        onClick={handleTankClick}
        className="relative w-full h-[280px] rounded-3xl cursor-pointer overflow-hidden border backdrop-blur-md transition-all duration-500"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: isGoalReached ? 'rgba(158, 255, 58, 0.3)' : 'rgba(255, 255, 255, 0.08)',
          boxShadow: isGoalReached
            ? '0 0 30px rgba(11, 110, 255, 0.25), 0 0 15px rgba(158, 255, 58, 0.15), inset 0 4px 20px rgba(0, 0, 0, 0.6)'
            : 'inset 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.995 }}
      >
        {/* Goal Reached Badge */}
        <AnimatePresence>
          {isGoalReached && (
            <motion.div
              initial={{ scale: 0, y: 15, opacity: 0, x: '-50%' }}
              animate={{ scale: 1, y: 0, opacity: 1, x: '-50%' }}
              exit={{ scale: 0, y: 15, opacity: 0, x: '-50%' }}
              className="absolute top-4 left-1/2 z-30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg border"
              style={{
                background: 'rgba(158, 255, 58, 0.15)',
                color: '#9EFF3A',
                borderColor: 'rgba(158, 255, 58, 0.3)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 15px rgba(158, 255, 58, 0.2)'
              }}
            >
              Goal Reached 🎉
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reflections & Shimmers */}
        {/* Left Vertical Highlight Reflection */}
        <div 
          className="absolute inset-y-0 left-0 w-8 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 40%, transparent 100%)',
            borderTopLeftRadius: '1.5rem',
            borderBottomLeftRadius: '1.5rem',
          }}
        />

        {/* Diagonal Gloss Shine */}
        <div 
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 25%, transparent 50%)',
          }}
        />

        {/* Click Ripple Animations */}
        <AnimatePresence>
          {ripples.map(ripple => (
            <motion.div
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              onAnimationComplete={() => {
                setRipples(prev => prev.filter(r => r.id !== ripple.id));
              }}
              style={{
                position: 'absolute',
                left: ripple.x,
                top: ripple.y,
                width: 30,
                height: 30,
                marginLeft: -15,
                marginTop: -15,
                borderRadius: '50%',
                border: '1.5px solid rgba(92, 200, 255, 0.6)',
                background: 'radial-gradient(circle, rgba(92, 200, 255, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 25
              }}
            />
          ))}
        </AnimatePresence>

        {/* Information Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <span 
            className="text-4xl font-black tracking-tight text-white select-none"
            style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)' }}
          >
            {currentWater} ml
          </span>
          <span 
            className="text-xs font-bold text-white/50 select-none uppercase tracking-widest mt-1.5"
            style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)' }}
          >
            of {goalWater} ml
          </span>
        </div>

        {/* Water Liquid Body */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 w-full transition-colors duration-500"
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 1.1, ease: [0.25, 1, 0.5, 1] }} // easeOutQuart-ish
          style={{
            background: isGoalReached
              ? 'linear-gradient(to top, #0056cc 0%, #1579ff 50%, rgba(117, 213, 255, 0.75) 100%)' // Slightly brighter when reached
              : 'linear-gradient(to top, #0B6EFF 0%, #1E88FF 50%, rgba(92, 200, 255, 0.65) 100%)',
          }}
        >
          {/* Wave Wrapper */}
          <div className="absolute bottom-full left-0 right-0 h-6 w-full pointer-events-none overflow-visible">
            {/* Back Wave (slower, opposite direction) */}
            <motion.svg
              viewBox="0 0 120 28"
              preserveAspectRatio="none"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 7 }}
              className="absolute left-0 bottom-[-2px] w-[200%] h-6 opacity-30 pointer-events-none"
              style={{
                color: isGoalReached ? '#75D5FF' : '#5CC8FF',
                fill: 'currentColor',
              }}
            >
              <motion.path 
                d="M 0 14 Q 15 6, 30 14 T 60 14 T 90 14 T 120 14 L 120 28 L 0 28 Z"
                animate={{ scaleY: isFilling ? 1.5 : 1.0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </motion.svg>

            {/* Front Wave (faster) */}
            <motion.svg
              viewBox="0 0 120 28"
              preserveAspectRatio="none"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 4 }}
              className="absolute left-0 bottom-[-2px] w-[200%] h-6 opacity-85 pointer-events-none"
              style={{
                color: isGoalReached ? '#8ee0ff' : '#6ad0ff',
                fill: 'currentColor',
                filter: 'drop-shadow(0 -1px 3px rgba(255,255,255,0.25))'
              }}
            >
              <motion.path 
                d="M 0 14 Q 15 4, 30 14 T 60 14 T 90 14 T 120 14 L 120 28 L 0 28 Z"
                animate={{ scaleY: isFilling ? 1.7 : 1.0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </motion.svg>
          </div>

          {/* Sparkles / Bubbles inside the water */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {bubbles.map(bubble => (
              <motion.div
                key={bubble.id}
                initial={{ y: '100%', x: `${bubble.x}%`, opacity: 0, scale: 0.6 }}
                animate={{
                  y: ['100%', '-10%'],
                  opacity: [0, 0.8, 0.8, 0],
                  scale: [0.6, 1.2, 1, 0.4],
                  x: [`${bubble.x}%`, `${bubble.x + (Math.random() * 10 - 5)}%`]
                }}
                transition={{
                  duration: bubble.duration,
                  delay: bubble.delay,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: bubble.size,
                  height: bubble.size,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.35)',
                  border: '0.5px solid rgba(255, 255, 255, 0.55)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
