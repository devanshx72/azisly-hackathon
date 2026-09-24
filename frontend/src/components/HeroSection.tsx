import React from 'react';
import { Sprout, ArrowUpRight, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenThresholdModal: () => void;
  auditCount: number;
  isOverTarget: boolean;
  overageKg: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenThresholdModal,
  auditCount,
  isOverTarget,
  overageKg,
}) => {
  return (
    <div className="space-y-3 px-2 pt-1">
      <div className="inline-flex items-center space-x-2 bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold border border-white/30">
        <span className="w-2 h-2 rounded-full bg-[#85D450]"></span>
        <span>Weekly Budget Pacing Companion</span>
      </div>

      <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-white leading-[1.06] tracking-tight drop-shadow-md">
        Part of future <br />
        <span className="inline-flex items-center space-x-3">
          <span className="text-white">Climate Action</span>
          <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur border border-white/40 text-white shadow-inner">
            <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-[#85D450]" />
          </span>
        </span>
      </h1>

      <p className="text-white/90 text-xs sm:text-sm max-w-lg font-normal leading-relaxed drop-shadow-xs">
        Track, compute, and curb your weekly footprint using verified IPCC emission factors. Rebalance emissions seamlessly with rollover accounting.
      </p>

      {/* Pill Action Buttons */}
      <div className="pt-1 flex flex-wrap items-center gap-3">
        <button
          onClick={onOpenThresholdModal}
          className="inline-flex items-center space-x-2.5 bg-[#132B20] hover:bg-[#1a382a] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full agrone-pill-shadow transition-all group shadow-lg border border-white/20 cursor-pointer"
        >
          <span>
            {isOverTarget
              ? `Review Rebalancing (-${overageKg.toFixed(1)} kg)`
              : 'Review Budget Pacing'}
          </span>
          <span className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center transition-transform group-hover:rotate-45">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </span>
        </button>

        <a
          href="#telemetry-audit"
          className="inline-flex items-center space-x-2 bg-black/25 hover:bg-black/35 backdrop-blur text-white border border-white/30 text-xs font-semibold px-4 py-2.5 rounded-full transition"
        >
          <span>Review Audit History ({auditCount})</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#85D450]" />
        </a>
      </div>
    </div>
  );
};
