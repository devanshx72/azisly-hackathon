import React from 'react';
import { Search, RotateCcw, KeyRound } from 'lucide-react';
import { getDeviceId, switchToEphemeralMode } from '../api/client';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenThresholdModal: () => void;
  onOpenRestoreModal: () => void;
  onRefreshData: () => void;
  isOverTarget: boolean;
  overageKg: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenThresholdModal,
  onOpenRestoreModal,
  onRefreshData,
  isOverTarget,
  overageKg,
}) => {
  const deviceId = getDeviceId();

  const handleResetIdentity = () => {
    switchToEphemeralMode();
    onRefreshData();
  };

  return (
    <header className="w-full mb-3 lg:mb-4">
      <nav className="bg-[#F5F2EB]/95 backdrop-blur-md rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border border-white/80 shadow-md">
        
        {/* Left: Brand Pill */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-[#132B20] flex items-center justify-center text-[#74C043] shadow-inner">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="7" cy="7" r="3" />
              <circle cx="17" cy="7" r="3" fill="#85D450" />
              <circle cx="7" cy="17" r="3" fill="#85D450" />
              <circle cx="17" cy="17" r="3" />
            </svg>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#132B20]">
              PlanetPulse
            </span>
            <span className="hidden md:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#74C043]/20 text-[#132B20] border border-[#74C043]/30 uppercase tracking-wider">
              Climate Tech
            </span>
          </div>
        </div>

        {/* Center Menu Pills */}
        <div className="hidden md:flex items-center space-x-1 text-xs font-semibold text-[#132B20]/80">
          <a href="#overview" className="px-3.5 py-1.5 rounded-full bg-white/70 text-[#132B20] shadow-xs">
            Overview
          </a>
          <a href="#telemetry-card" className="px-3.5 py-1.5 rounded-full hover:bg-white/50 transition">
            Telemetry
          </a>
          <a href="#quick-log" className="px-3.5 py-1.5 rounded-full hover:bg-white/50 transition">
            Log Activity
          </a>
          <a href="#telemetry-audit" className="px-3.5 py-1.5 rounded-full hover:bg-white/50 transition">
            Audit Trail
          </a>
        </div>

        {/* Right: Search Pill + Zero-Auth ID Indicator + Restore Session + Status Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Restore Session Button */}
          <button
            onClick={onOpenRestoreModal}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/70 hover:bg-white border border-[#132B20]/10 text-[#132B20] transition cursor-pointer"
            title="Restore an existing UUID key"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#132B20]/70" />
            <span>Restore Session</span>
          </button>

          {/* Zero-Auth Device Indicator */}
          <div
            onClick={handleResetIdentity}
            className="hidden lg:flex items-center space-x-1.5 bg-white/70 border border-[#132B20]/10 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#132B20] cursor-pointer hover:bg-white transition"
            title="Click to reset to Ephemeral session"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#74C043]"></span>
            <span className="font-mono text-[10px] opacity-75">ID: {deviceId.substring(0, 8)}...</span>
            <RotateCcw className="w-3 h-3 text-[#132B20]/50" />
          </div>

          <div className="hidden sm:flex items-center space-x-2 bg-white/70 border border-[#132B20]/10 px-3 py-1.5 rounded-full text-xs text-[#132B20]">
            <Search className="w-3.5 h-3.5 text-[#132B20]/50" />
            <input
              type="text"
              placeholder="Search telemetry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#132B20] placeholder-[#132B20]/40 focus:outline-none w-24 lg:w-32 font-medium"
            />
          </div>

          {/* Status Badge */}
          {isOverTarget ? (
            <button
              onClick={onOpenThresholdModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border shadow-xs bg-[#EFE9DC] hover:bg-[#E6DEC9] text-[#132B20] border-[#D9D1BF] cursor-pointer"
              title="Click to review threshold rebalancing"
            >
              <span className="w-2 h-2 rounded-full bg-[#8C6824]"></span>
              <span className="font-bold tracking-tight text-[#132B20]">
                Target Reached (+{overageKg.toFixed(1)} kg)
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenThresholdModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition border shadow-xs bg-[#E3EDE5] hover:bg-[#D5E4D8] text-[#132B20] border-[#C8D9CB] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#74C043]"></span>
              <span className="font-bold tracking-tight text-[#132B20]">
                Budget Active
              </span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
