import React from 'react';
import { ArrowUpRight, ChevronRight, Sprout } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="space-y-4 px-1 pt-1 pb-2 relative">
      {/* Top Pill Tag */}
      <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 rounded-full text-xs font-extrabold text-white shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#85D450]"></span>
        <span>IPCC Verified Carbon Telemetry</span>
      </div>

      {/* Main Hero Headline */}
      <div className="relative">
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.04] tracking-tight drop-shadow-lg">
          Part of future <br />
          The planet doesn't notice <br />
          good intentions. It notices <br />
          Tuesdays.
        </h1>
        {/* Floating Sprout Icon Badge */}
        <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 items-center justify-center text-white shadow-md">
          <Sprout className="w-6 h-6 text-[#85D450]" />
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-white/95 text-xs sm:text-sm max-w-xl font-medium leading-relaxed drop-shadow-md">
        Track, compute, and curb your weekly footprint using verified IPCC emission factors. Transform daily routines into measurable impact.
      </p>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-1">
        <a
          href="#quick-logger"
          className="inline-flex items-center space-x-2 bg-white hover:bg-white/90 text-[#132B20] px-5 py-2.5 rounded-full text-xs font-black shadow-md transition-transform hover:scale-105 cursor-pointer"
        >
          <span>Log Daily Emissions</span>
          <ArrowUpRight className="w-4 h-4 text-[#132B20] stroke-[3]" />
        </a>

        <a
          href="#telemetry-audit"
          className="inline-flex items-center space-x-1.5 bg-[#132B20]/60 hover:bg-[#132B20]/80 backdrop-blur-md text-white border border-white/20 px-4 py-2.5 rounded-full text-xs font-bold transition cursor-pointer"
        >
          <span>Review Audit History</span>
          <ChevronRight className="w-4 h-4 text-white/70" />
        </a>
      </div>
    </div>
  );
};
