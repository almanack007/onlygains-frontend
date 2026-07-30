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
        className="absolute left-0 top-0 bottom-0 bg-[#5CC8FF] overflow-visible rounded-l-full"
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', stiffness: 75, damping: 15 }}
      >
        {/* Shine highlight Sheen */}
        <div className="absolute inset-x-0 top-0 h-[25%] bg-white/15 rounded-full z-10" />

        {/* Vertical Wave Meniscus at the end of the water section */}
        {percentage > 0 && (
          <div className="absolute right-0 top-0 bottom-0 w-3 pointer-events-none overflow-visible">
            <svg className="absolute left-[-2px] top-0 h-full w-4 text-[#5CC8FF] fill-current" viewBox="0 0 16 18" preserveAspectRatio="none">
              <motion.path
                d="M 0 0 L 4 0 Q 8 4.5, 4 9 T 4 18 L 0 18 Z"
                animate={{
                  d: isDisturbed
                    ? [
                        "M 0 0 L 3 0 Q 12 4.5, 3 9 T 3 18 L 0 18 Z",
                        "M 0 0 L 4 0 Q 0 4.5, 4 9 T 4 18 L 0 18 Z",
                        "M 0 0 L 3 0 Q 9 4.5, 3 9 T 3 18 L 0 18 Z",
                        "M 0 0 L 4 0 Q 8 4.5, 4 9 T 4 18 L 0 18 Z"
                      ]
                    : [
                        "M 0 0 L 4 0 Q 8 4.5, 4 9 T 4 18 L 0 18 Z",
                        "M 0 0 L 4 0 Q 5 4.5, 4 9 T 4 18 L 0 18 Z",
                        "M 0 0 L 4 0 Q 8 4.5, 4 9 T 4 18 L 0 18 Z"
                      ]
                }}
                transition={{
                  duration: isDisturbed ? 0.95 : 3.8,
                  repeat: isDisturbed ? 0 : Infinity,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>
        )}
      </motion.div>
    </div>
  );
};
