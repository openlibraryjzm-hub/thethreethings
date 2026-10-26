import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';

interface SlideToCompleteProps {
  onComplete: () => void;
  disabled?: boolean;
}

export const SlideToComplete: React.FC<SlideToCompleteProps> = ({
  onComplete,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [dragX, setDragX] = useState<number>(0);
  const [maxDrag, setMaxDrag] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Measure track width to dynamically determine drag distance
  const measure = useCallback(() => {
    if (containerRef.current) {
      const trackWidth = containerRef.current.clientWidth;
      const knobWidth = 44;
      const totalPadding = 8; // 4px padding each side
      const calculatedMax = Math.max(0, trackWidth - knobWidth - totalPadding);
      setMaxDrag(calculatedMax);
      return calculatedMax;
    }
    return 0;
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(() => {
      measure();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [measure]);

  // Reset when disabled state changes
  useEffect(() => {
    if (disabled) {
      setDragX(0);
      setIsDragging(false);
      setIsCompleted(false);
    }
  }, [disabled]);

  // Pointer drag tracking
  const dragStartRef = useRef<{ startX: number; startDragX: number; max: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isCompleted) return;
    if (e.button !== 0) return; // Only primary mouse button or touch

    const currentMax = measure();
    if (currentMax <= 0) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if pointer capture unsupported
    }

    dragStartRef.current = {
      startX: e.clientX,
      startDragX: dragX,
      max: currentMax,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !isDragging || disabled || isCompleted) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const newX = Math.min(
      Math.max(0, dragStartRef.current.startDragX + deltaX),
      dragStartRef.current.max
    );
    setDragX(newX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const max = dragStartRef.current.max;
    const threshold = max * 0.75;
    const finalX = dragX;

    dragStartRef.current = null;
    setIsDragging(false);

    if (finalX >= threshold && max > 0) {
      setDragX(max);
      setIsCompleted(true);
      onComplete();
    } else {
      // Snap back to starting position
      setDragX(0);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      dragStartRef.current = null;
      setIsDragging(false);
      setDragX(0);
    }
  };

  // Progress percentage (0 to 1)
  const progress = maxDrag > 0 ? Math.min(Math.max(0, dragX / maxDrag), 1) : 0;
  const textOpacity = Math.max(0, 1 - progress * 1.6);
  const fillWidth = dragX > 0 ? `${dragX + 44}px` : '0px';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[52px] p-1 rounded-2xl border flex items-center select-none overflow-hidden transition-colors ${
        disabled
          ? 'bg-[#F5F0E8]/70 border-[#E6DFD5] opacity-70 cursor-not-allowed'
          : 'bg-[#FAF7F2] border-[#E6DFD5] shadow-2xs'
      }`}
    >
      {/* Background fill tracking knob progress */}
      {!disabled && (
        <div
          style={{
            width: fillWidth,
            transition: isDragging ? 'none' : 'width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="absolute left-0 top-0 bottom-0 bg-[#FDF3EF] border-r border-[#DA7756]/20 rounded-2xl pointer-events-none"
        />
      )}

      {/* Guide text */}
      <div
        style={{
          opacity: disabled ? 1 : textOpacity,
          transition: isDragging ? 'none' : 'opacity 0.2s ease-out',
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none pl-10 pr-4"
      >
        {disabled ? (
          <span className="text-xs font-semibold tracking-wide text-[#78716A]/60">
            Enter a goal to unlock
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716A] uppercase tracking-wider">
            <span>Slide to complete</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="text-[#DA7756] font-bold"
            >
              →
            </motion.span>
          </div>
        )}
      </div>

      {/* Draggable Knob */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className={`relative z-10 w-[44px] h-[44px] rounded-xl flex items-center justify-center select-none touch-none ${
          disabled
            ? 'bg-[#E6DFD5] text-[#78716A]/50 cursor-not-allowed'
            : isDragging
            ? 'bg-[#C86446] text-white cursor-grabbing shadow-md scale-102'
            : 'bg-[#DA7756] hover:bg-[#C86446] text-white cursor-grab shadow-sm'
        }`}
        title={disabled ? 'Enter a goal to unlock' : 'Slide to complete this goal'}
      >
        {isCompleted ? (
          <Check className="w-5 h-5 stroke-[2.5]" />
        ) : (
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        )}
      </div>
    </div>
  );
};
