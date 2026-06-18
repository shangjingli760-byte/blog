'use client';

import { useState, useEffect, useRef } from 'react';

interface FlipNumberProps {
  value: number;
  minDigits?: number;
}

function FlipCard({ digit }: { digit: string }) {
  // stableDigit holds the digit that was visible BEFORE the current flip started
  const [stableDigit, setStableDigit] = useState(digit);
  const [flipId, setFlipId] = useState(0);
  const animating = flipId > 0;
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (digit !== stableDigit) {
      setFlipId(id => id + 1);
      // stableDigit stays at the pre-flip value during animation
    }
  }, [digit, stableDigit]);

  const handleAnimEnd = () => {
    setFlipId(0);
    setStableDigit(digit);
  };

  return (
    <div className="flip-card">
      {/* Static top: shows NEW digit (hidden behind top flap, revealed when flap folds away) */}
      <div className="flip-card-face flip-card-top">
        <span>{digit}</span>
      </div>
      {/* Static bottom: shows OLD digit (visible, then covered by bottom flap) */}
      <div className="flip-card-face flip-card-bottom">
        <span>{animating ? stableDigit : digit}</span>
      </div>
      {/* Flipping overlay — remounts on each new flip via key */}
      {animating && (
        <div key={`flip-${flipId}`}>
          {/* Top flap: OLD digit top half → folds DOWN (rotateX 0→-90deg),
              revealing the NEW digit static top behind it */}
          <div className="flip-card-face flip-card-top-flip">
            <span>{stableDigit}</span>
          </div>
          {/* Bottom flap: NEW digit bottom half → unfolds UP (rotateX 90deg→0),
              covering the OLD digit static bottom */}
          <div className="flip-card-face flip-card-bottom-flip" onAnimationEnd={handleAnimEnd}>
            <span>{digit}</span>
          </div>
        </div>
      )}
      <div className="flip-card-divider" />
    </div>
  );
}

export function FlipNumber({ value, minDigits = 2 }: FlipNumberProps) {
  const digits = String(value).padStart(minDigits, '0').split('');

  return (
    <span className="inline-flex gap-px">
      {digits.map((d, i) => (
        <FlipCard key={i} digit={d} />
      ))}
    </span>
  );
}
