// src/hooks/useCountAnimation.js
import { useState, useEffect, useRef } from 'react';

export const useCountAnimation = (endValue, duration = 800) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!animated.current) {
      animated.current = true;
      let startTime;
      let startValue = 0;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [endValue, duration]);

  return count;
};