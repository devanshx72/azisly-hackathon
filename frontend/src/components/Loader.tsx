import React, { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';
import './Loader.css';

interface LoaderProps {
  durationMs?: number;
  onComplete?: () => void;
}

export const Loader: React.FC<LoaderProps> = ({
  durationMs = 6000,
  onComplete,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Cultivating carbon intelligence...'
  );

  // Store onComplete in ref so prop reference changes never restart the timer
  const onCompleteRef = React.useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTime = performance.now();
    let animationFrameId: number;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let hasFinished = false;

    const updateProgress = (currentTime: number) => {
      if (hasFinished) return;

      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / durationMs, 1);
      const currentPct = progressRatio * 100;
      setProgress(currentPct);

      // Stage status progression across the 6 seconds
      if (progressRatio < 0.28) {
        setStatusMessage('Cultivating carbon intelligence...');
      } else if (progressRatio < 0.58) {
        setStatusMessage('Calibrating verified IPCC emission metrics...');
      } else if (progressRatio < 0.84) {
        setStatusMessage('Synchronizing zero-auth session & rollover state...');
      } else {
        setStatusMessage('Welcome to PlanetPulse — Ready to curb emissions.');
      }

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        hasFinished = true;
        // Trigger fade out at exactly 6s
        setIsFadingOut(true);
        exitTimer = setTimeout(() => {
          onCompleteRef.current?.();
        }, 600); // 600ms smooth fade transition
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (exitTimer) {
        clearTimeout(exitTimer);
      }
    };
  }, [durationMs]);

  return (
    <div
      className={`planetpulse-loader-overlay ${isFadingOut ? 'fade-out' : ''}`}
      aria-label="Loading PlanetPulse"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Background ambient glow */}
      <div className="loader-ambient-glow" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full px-6">
        
        {/* Brand Pill Badge */}
        <div className="flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#132B20]/80 border border-white/10 shadow-lg backdrop-blur-md mb-8">
          <div className="w-8 h-8 rounded-full bg-[#132B20] border border-[#74C043]/30 flex items-center justify-center text-[#85D450] shadow-sm">
            <Sprout className="w-4 h-4 text-[#85D450] stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-wide text-[#F5F2EB]">
            PlanetPulse
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#74C043]/20 text-[#85D450] border border-[#74C043]/30">
            Eco Engine
          </span>
        </div>

        {/* 3D Geometric Rotating Pine Tree */}
        <div className="tree-stage">
          <div className="tree-scale-wrapper">
            <div className="tree-container">
              <div className="tree">
                {/* Branch Tier 0 */}
                <div className="branch" style={{ '--x': 0 } as React.CSSProperties}>
                  <span style={{ '--i': 0 } as React.CSSProperties} />
                  <span style={{ '--i': 1 } as React.CSSProperties} />
                  <span style={{ '--i': 2 } as React.CSSProperties} />
                  <span style={{ '--i': 3 } as React.CSSProperties} />
                </div>
                {/* Branch Tier 1 */}
                <div className="branch" style={{ '--x': 1 } as React.CSSProperties}>
                  <span style={{ '--i': 0 } as React.CSSProperties} />
                  <span style={{ '--i': 1 } as React.CSSProperties} />
                  <span style={{ '--i': 2 } as React.CSSProperties} />
                  <span style={{ '--i': 3 } as React.CSSProperties} />
                </div>
                {/* Branch Tier 2 */}
                <div className="branch" style={{ '--x': 2 } as React.CSSProperties}>
                  <span style={{ '--i': 0 } as React.CSSProperties} />
                  <span style={{ '--i': 1 } as React.CSSProperties} />
                  <span style={{ '--i': 2 } as React.CSSProperties} />
                  <span style={{ '--i': 3 } as React.CSSProperties} />
                </div>
                {/* Branch Tier 3 */}
                <div className="branch" style={{ '--x': 3 } as React.CSSProperties}>
                  <span style={{ '--i': 0 } as React.CSSProperties} />
                  <span style={{ '--i': 1 } as React.CSSProperties} />
                  <span style={{ '--i': 2 } as React.CSSProperties} />
                  <span style={{ '--i': 3 } as React.CSSProperties} />
                </div>
                {/* Stem / Trunk */}
                <div className="stem">
                  <span style={{ '--i': 0 } as React.CSSProperties} />
                  <span style={{ '--i': 1 } as React.CSSProperties} />
                  <span style={{ '--i': 2 } as React.CSSProperties} />
                  <span style={{ '--i': 3 } as React.CSSProperties} />
                </div>
                {/* Ambient Floor Shadow */}
                <span className="shadow" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Status Label */}
        <div className="mt-8 text-center min-h-[30px] flex items-center justify-center">
          <p className="text-sm sm:text-base font-medium text-[#C8D9CB] transition-all duration-300">
            {statusMessage}
          </p>
        </div>

        {/* 6-Second Precision Progress Bar */}
        <div className="w-full mt-4">
          <div className="w-full h-2 rounded-full bg-[#132B20] border border-white/10 overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#74C043] via-[#85D450] to-[#A6E97B] transition-all duration-100 ease-linear rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="progress-shimmer" />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-[#85D450]/80 font-mono mt-2 px-0.5">
            <span>{(progress * 0.06).toFixed(1)}s / 6.0s</span>
            <span className="font-semibold text-[#85D450]">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Bottom Subtitle Badge */}
        <div className="mt-6 flex items-center space-x-2 text-[11px] text-[#C8D9CB]/60">
          <span>Zero-Auth Climate Analytics</span>
          <span>•</span>
          <span>IPCC Standard Models</span>
        </div>

      </div>
    </div>
  );
};

export default Loader;
