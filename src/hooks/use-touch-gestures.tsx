
import { useEffect, useRef, useState } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  enabled?: boolean;
}

export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  enabled = true
}: TouchGestureOptions) => {
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setStartX(touch.clientX);
      setStartY(touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX === null || startY === null) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Check if it's a horizontal swipe (not vertical scroll)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      setStartX(null);
      setStartY(null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default only for horizontal swipes
      if (startX !== null && startY !== null) {
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - startX);
        const deltaY = Math.abs(touch.clientY - startY);
        
        if (deltaX > deltaY && deltaX > 10) {
          e.preventDefault();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [startX, startY, onSwipeLeft, onSwipeRight, threshold, enabled]);

  return elementRef;
};
