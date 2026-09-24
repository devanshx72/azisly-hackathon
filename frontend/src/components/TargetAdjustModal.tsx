import React, { useState } from 'react';
import { Target, X } from 'lucide-react';

interface TargetAdjustModalProps {
  isOpen: boolean;
  currentTargetKg: number | null;
  onSetTarget: (newTargetKg: number) => void;
  onClose: () => void;
}

export const TargetAdjustModal: React.FC<TargetAdjustModalProps> = ({
  isOpen,
  currentTargetKg,
  onSetTarget,
  onClose,
}) => {
  const [targetInput, setTargetInput] = useState<string>(
    currentTargetKg ? currentTargetKg.toString() : '30.0'
  );
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(targetInput);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid target budget > 0 kg CO₂.');
      return;
    }

    onSetTarget(val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 agrone-modal-backdrop animate-fade-in">
      <div className="bg-[#F9F7F2] rounded-[36px] max-w-md w-full p-6 sm:p-8 agrone-card-shadow border border-[#E6E1D7] text-[#132B20] relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#132B20]/5 hover:bg-[#132B20]/15 flex items-center justify-center text-[#132B20]/70 hover:text-[#132B20] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3.5 pr-8">
          <div className="w-10 h-10 rounded-full bg-[#E3EDE5] border border-[#C8D9CB] text-[#132B20] flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#132B20]/60">
              Budget Management
            </span>
            <h2 className="text-xl font-bold text-[#132B20] tracking-tight">
              Adjust Weekly CO₂ Target
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#132B20]/70 mb-1.5">
              Weekly CO₂ Budget (kg)
            </label>
            <input
              type="number"
              step="any"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="e.g. 30.0"
              className="agrone-input w-full px-4 py-2.5 rounded-2xl text-base font-extrabold text-[#132B20]"
            />
            <p className="text-[11px] text-[#132B20]/60 mt-1">
              Standard IPCC recommendation for a low-carbon lifestyle is 25-35 kg CO₂/week.
            </p>
          </div>

          {error && (
            <p className="text-xs text-[#8C6824] font-bold">{error}</p>
          )}

          <div className="pt-2 flex justify-end space-x-2 border-t border-[#E6E1D7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#132B20]/20 text-xs font-semibold hover:bg-[#132B20]/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#132B20] hover:bg-[#1f4331] text-white text-xs font-bold px-5 py-2 rounded-full agrone-pill-shadow transition cursor-pointer"
            >
              Save Target Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
