import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="space-y-3 px-2 pt-1">
      {/* High Contrast Bold Hero Typography */}
      <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-black text-white leading-[1.05] tracking-tight drop-shadow-lg">
        Part of future <br />
        <span className="text-white drop-shadow-md">
          Climate Action
        </span>
      </h1>

      <div className="inline-block bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 shadow-[0_0_25px_rgba(255,255,255,0.25)] mt-1 max-w-xl">
        <p className="text-white text-sm sm:text-base font-semibold leading-relaxed drop-shadow-[0_2px_8px_rgba(255,255,255,0.5)]">
          Track, compute, and curb your weekly footprint using verified IPCC emission factors. Rebalance emissions seamlessly with rollover accounting.
        </p>
      </div>
    </div>
  );
};
