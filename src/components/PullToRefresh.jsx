import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const threshold = 80;

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (!startY.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(distance * 0.5, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
          startY.current = 0;
        }, 500);
      }
    } else {
      setPullDistance(0);
      setIsPulling(false);
      startY.current = 0;
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-full overflow-y-auto"
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        style={{ height: pullDistance }}
        animate={{ opacity: isPulling ? 1 : 0 }}
      >
        <div className="p-2 rounded-full bg-white/5 backdrop-blur-sm">
          <RefreshCw
            className={`w-5 h-5 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`}
            style={{
              transform: isRefreshing ? "none" : `rotate(${pullDistance * 3}deg)`
            }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ transform: `translateY(${pullDistance}px)` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}