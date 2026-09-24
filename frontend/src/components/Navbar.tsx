import React, { useState } from 'react';
import { Sprout, RotateCcw, KeyRound, Copy, Check, LogOut } from 'lucide-react';
import { getDeviceId, switchToEphemeralMode, logoutSession } from '../api/client';

interface NavbarProps {
  onOpenThresholdModal: () => void;
  onOpenRestoreModal: () => void;
  onRefreshData: () => void;
  onLogout?: () => void;
  isOverTarget: boolean;
  overageKg: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenThresholdModal,
  onOpenRestoreModal,
  onRefreshData,
  onLogout,
  isOverTarget,
  overageKg,
}) => {
  const deviceId = getDeviceId();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(deviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetIdentity = () => {
    switchToEphemeralMode();
    onRefreshData();
  };

  const handleLogout = () => {
    logoutSession();
    if (onLogout) {
      onLogout();
    } else {
      onRefreshData();
    }
  };

  return (
    <header className="w-full mb-3 lg:mb-4">
      <nav className="bg-[#F5F2EB]/95 backdrop-blur-md rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between border border-white/80 shadow-md gap-3">
        
        {/* Left: Prominent Logo with Sprout Icon */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#132B20] flex items-center justify-center text-[#85D450] shadow-md border border-white/20">
            <Sprout className="w-6 h-6 text-[#85D450] stroke-[2.5]" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight text-[#132B20] drop-shadow-sm">
            PlanetPulse
          </span>
        </div>

        {/* Right: Full Untruncated UUID Identity Display + Restore Session + Status Badge */}
        <div className="flex flex-wrap items-center space-x-2 sm:space-x-3 gap-y-2">
          {/* Full Untruncated UUID Identity Pill */}
          <div className="flex items-center space-x-2 bg-white/90 border border-[#132B20]/20 px-3.5 py-1.5 rounded-xl sm:rounded-full text-xs font-bold text-[#132B20] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#74C043]"></span>
            <span className="font-extrabold uppercase text-[10px] text-[#132B20]/60 tracking-wider">
              Device ID:
            </span>
            <code className="font-mono text-xs font-bold text-[#132B20] tracking-tight">
              {deviceId}
            </code>
            
            {/* Quick Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-[#132B20]/10 rounded-md transition text-[#132B20] cursor-pointer ml-1"
              title="Copy full Device ID"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#74C043]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#132B20]/70" />
              )}
            </button>

            {/* Reset to Ephemeral button */}
            <button
              onClick={handleResetIdentity}
              className="p-1 hover:bg-[#132B20]/10 rounded-md transition text-[#132B20] cursor-pointer"
              title="Switch to temporary Ephemeral session"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#132B20]/60" />
            </button>
          </div>

          {/* Restore Session Button */}
          <button
            onClick={onOpenRestoreModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 hover:bg-white border border-[#132B20]/20 text-[#132B20] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            title="Restore or paste an existing UUID key"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#132B20]" />
            <span>Restore Session</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black border border-black cursor-pointer transition-all duration-300 ease-in-out shadow-[0_0_0_0_black] hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_black] active:translate-y-0.5 active:translate-x-0.25 active:shadow-[0_0_0_0_black]"
            title="Log out of current session"
          >
            <LogOut className="w-3.5 h-3.5 text-black" />
            <span>Logout</span>
          </button>

          {/* Status Badge */}
          {isOverTarget ? (
            <button
              onClick={onOpenThresholdModal}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black border border-black cursor-pointer transition-all duration-300 ease-in-out shadow-[0_0_0_0_black] hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_black] active:translate-y-0.5 active:translate-x-0.25 active:shadow-[0_0_0_0_black]"
              title="Click to review threshold rebalancing"
            >
              <span className="font-semibold tracking-tight text-black">
                Target Reached (+{overageKg.toFixed(1)} kg)
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenThresholdModal}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black border border-black cursor-pointer transition-all duration-300 ease-in-out shadow-[0_0_0_0_black] hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[2px_5px_0_0_black] active:translate-y-0.5 active:translate-x-0.25 active:shadow-[0_0_0_0_black]"
            >
              <span className="font-semibold tracking-tight text-black">
                Budget Active
              </span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
