import React from 'react';
import { ShieldAlert, ShieldCheck, Save, KeyRound } from 'lucide-react';
import type { IdentityMode } from '../api/client';

interface IdentityBannerProps {
  identityMode: IdentityMode;
  deviceId: string;
  onSavePersistentIdentity: () => void;
  onOpenRestoreModal: () => void;
}

export const IdentityBanner: React.FC<IdentityBannerProps> = ({
  identityMode,
  deviceId,
  onSavePersistentIdentity,
  onOpenRestoreModal,
}) => {
  if (identityMode === 'persistent') {
    return (
      <div className="w-full mb-3 bg-[#E3EDE5]/90 border border-[#C8D9CB] rounded-2xl px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#132B20] gap-2 shadow-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#74C043]" />
          <span className="font-bold">Persistent Profile Active</span>
          <span className="opacity-70">— Your data is saved under key:</span>
          <code className="bg-white/80 px-2 py-0.5 rounded font-mono text-[11px] border border-[#C8D9CB]">
            {deviceId.substring(0, 8)}...
          </code>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenRestoreModal}
            className="inline-flex items-center space-x-1 font-bold text-[11px] text-[#132B20] hover:text-[#74C043] bg-white/70 hover:bg-white px-3 py-1 rounded-full border border-[#C8D9CB] transition cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            <span>Switch / Restore Key</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-3 bg-[#EFE9DC]/95 border border-[#D9D1BF] rounded-2xl px-4 py-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#132B20] gap-2 shadow-xs animate-fade-in">
      <div className="flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 text-[#8C6824]" />
        <span className="font-bold text-[#8C6824]">
          Session Active (Temporary)
        </span>
        <span className="opacity-90">— Save identity to preserve data across sessions</span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenRestoreModal}
          className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#132B20] bg-white/60 hover:bg-white px-3 py-1 rounded-full border border-[#D9D1BF] transition cursor-pointer"
        >
          <KeyRound className="w-3 h-3" />
          <span>Restore Session</span>
        </button>

        <button
          onClick={onSavePersistentIdentity}
          className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-white bg-[#132B20] hover:bg-[#1a382a] px-3.5 py-1 rounded-full agrone-pill-shadow transition cursor-pointer"
        >
          <Save className="w-3 h-3 text-[#74C043]" />
          <span>Save Identity (Generate UUID)</span>
        </button>
      </div>
    </div>
  );
};
