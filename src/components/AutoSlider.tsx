import { ReactNode, Children, useRef, useEffect, useState } from "react";
import "./AutoSlider.css";

interface AutoSliderProps {
  children: ReactNode;
  minItemsToSlide?: number;
  speed?: number; // seconds for one complete cycle
  pauseOnHover?: boolean;
  className?: string;
}

export const AutoSlider = ({
  children,
  minItemsToSlide = 3,
  speed = 30,
  pauseOnHover = true,
  className = "",
}: AutoSliderProps) => {
  const childArray = Children.toArray(children);
  const itemCount = childArray.length;
  const shouldSlide = itemCount >= minItemsToSlide && itemCount > 0;
  const [isPaused, setIsPaused] = useState(false);

  console.log(`AutoSlider: ${itemCount} items, shouldSlide: ${shouldSlide}`);

  // If not enough items to slide, render normally
  if (!shouldSlide) {
    return (
      <div className={`flex gap-6 pb-4 ${className}`}>
        {childArray}
      </div>
    );
  }

  return (
    <div
      className={`auto-slider-container ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div 
        className="auto-slider-track"
        style={{
          animationDuration: `${speed}s`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {childArray}
        {childArray}
      </div>
    </div>
  );
};

export default AutoSlider;
