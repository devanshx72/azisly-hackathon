import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import type { OutlierWarningResponse } from '../types';

interface OutlierConfirmModalProps {
  warning: OutlierWarningResponse | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OutlierConfirmModal: React.FC<OutlierConfirmModalProps> = ({
  warning,
  onConfirm,
  onCancel,
}) => {
  if (!warning) return null;

  const { message, quantity, unit, activity_type, threshold } = warning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 agrone-modal-backdrop animate-fade-in">
      <div className="bg-[#F9F7F2] rounded-[36px] max-w-lg w-full p-6 sm:p-8 agrone-card-shadow border border-[#E6E1D7] text-[#132B20] relative space-y-5">
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#132B20]/5 hover:bg-[#132B20]/15 flex items-center justify-center text-[#132B20]/70 hover:text-[#132B20] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-full bg-[#EFE9DC] border border-[#D9D1BF] text-[#8C6824] flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAE4D5] text-[#8C6824] border border-[#DDD5C0] mb-1.5">
              DP2 Absurd Input Triggered ({activity_type})
            </span>
            <h2 className="text-xl font-bold text-[#132B20] tracking-tight">
              Unusual Activity Quantity
            </h2>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[#132B20]">
          <p className="leading-relaxed bg-white p-4 rounded-2xl border border-[#E6E1D7] font-medium text-[#132B20]/90">
            {message}
          </p>

          <div className="bg-[#F0ECE1] rounded-2xl p-4 border border-[#E6E1D7] space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2F4F2F] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>DP2 Isolated Outlier Isolation Protocol</span>
            </div>
            <p className="text-xs text-[#132B20]/80 leading-relaxed">
              If confirmed, this entry will be saved with <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">flagged = true</code>. It will appear in your audit trail with an Outlier badge, but <strong>will be excluded from your weekly target calculation</strong> so single-entry typos won't distort your weekly progress.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-[#E6E1D7]">
                <span className="text-[10px] font-bold text-[#132B20]/60 uppercase block">Entered Quantity</span>
                <span className="font-extrabold text-[#132B20] text-sm">{quantity} {unit}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E6E1D7]">
                <span className="text-[10px] font-bold text-[#132B20]/60 uppercase block">Normal Threshold</span>
                <span className="font-extrabold text-[#8C6824] text-sm">{threshold} {unit}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-[#E6E1D7]">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-[#132B20]/20 text-[#132B20] text-xs font-semibold hover:bg-[#132B20]/5 transition-colors text-center cursor-pointer"
          >
            Cancel / Correct Entry
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-[#132B20] hover:bg-[#1f4331] text-white text-xs font-bold px-5 py-2.5 rounded-full agrone-pill-shadow transition-all cursor-pointer"
          >
            Confirm &amp; Flag Outlier
          </button>
        </div>
      </div>
    </div>
  );
};
