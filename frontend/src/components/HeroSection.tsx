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

      <p className="text-white/95 text-sm sm:text-base max-w-xl font-medium leading-relaxed drop-shadow-md pt-1">
        Track, compute, and curb your weekly footprint using verified IPCC emission factors. Rebalance emissions seamlessly with rollover accounting.
      </p>
    </div>
  );
};
