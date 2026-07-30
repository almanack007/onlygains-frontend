import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const WaterTank = ({
  currentWater,
  goalWater,
  onAddWater,
  onResetWater,
  onOpenModal
}) => {
  const [isDisturbed, setIsDisturbed] = useState(false);
  const prevWaterRef = useRef(currentWater);

  const percentage = Math.min(Math.round((currentWater / goalWater) * 100), 100) || 0;

  useEffect(() => {
    if (currentWater > prevWaterRef.current) {
      setIsDisturbed(true);
      const timer = setTimeout(() => {
        setIsDisturbed(false);
      }, 950);
      return () => clearTimeout(timer);
    }
    prevWaterRef.current = currentWater;
  }, [currentWater]);

  return (
    <div 
      onClick={onOpenModal}
      className="relative w-full h-[18px] bg-neutral-900 border border-white/5 rounded-full overflow-hidden cursor-pointer"
    >
      {/* Filled progress bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 bg-[#5CC8FF]/30 overflow-hidden"
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', stiffness: 75, damping: 15 }}
      >
        {/* High-quality water wave SVG */}
        <svg 
          className="absolute left-0 top-0 w-[460px] h-[18px] pointer-events-none" 
          viewBox="0 0 100 18" 
          preserveAspectRatio="none"
        >
          {/* Wave 1 */}
          <motion.path
            d="M 0 3 Q 25 1, 50 3 T 100 3 L 100 18 L 0 18 Z"
            fill="#5CC8FF"
            animate={{ 
              y: isDisturbed ? [0, -3.5, 3, -1.8, 0.8, 0] : [0, -1, 1, -1, 0] 
            }}
            transition={{
              duration: isDisturbed ? 0.9 : 3.5,
              repeat: isDisturbed ? 0 : Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Wave 2 */}
          <motion.path
            d="M 0 5 Q 25 6, 50 4 T 100 5 L 100 18 L 0 18 Z"
            fill="#5CC8FF"
            opacity="0.6"
            animate={{ 
              y: isDisturbed ? [0, 3, -2.5, 1.5, -0.6, 0] : [0, 0.8, -0.8, 0.8, 0] 
            }}
            transition={{
              duration: isDisturbed ? 0.9 : 4.5,
              repeat: isDisturbed ? 0 : Infinity,
              ease: "easeInOut"
            }}
          />
        </svg>
        {/* Shine highlight Sheen */}
        <div className="absolute inset-x-0 top-0 h-[25%] bg-white/15 rounded-full" />
      </motion.div>
    </div>
  );
};
