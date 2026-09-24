import React from 'react';
import { Scale, Repeat, ArrowRight, X } from 'lucide-react';
import type { CurrentWeekSummary } from '../types';

interface ThresholdModalProps {
  isOpen: boolean;
  currentWeek: CurrentWeekSummary;
  onApplyRollover: () => void;
  onDismiss: () => void;
}

export const ThresholdModal: React.FC<ThresholdModalProps> = ({
  isOpen,
  currentWeek,
  onApplyRollover,
  onDismiss,
}) => {
  if (!isOpen) return null;

  const {
    week_co2_kg,
    target_kg,
    effective_target_kg,
    overage_kg,
    is_over_target,
    rollover_debt_kg,
  } = currentWeek;

  const baseTarget = target_kg || 30.0;
  const currentOverage = is_over_target ? overage_kg : 0.0;
  const nextTarget = Math.max(0.1, baseTarget - currentOverage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 agrone-modal-backdrop animate-fade-in">
      <div className="bg-[#F9F7F2] rounded-[36px] max-w-xl w-full p-6 sm:p-8 agrone-card-shadow border border-[#E6E1D7] text-[#132B20] relative space-y-5">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#132B20]/5 hover:bg-[#132B20]/15 flex items-center justify-center text-[#132B20]/70 hover:text-[#132B20] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-full bg-[#E3EDE5] border border-[#C8D9CB] text-[#132B20] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Scale className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E3EDE5] text-[#132B20] border border-[#C8D9CB] mb-1.5">
              Weekly Budget Pacing (DP1 Nudge)
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#132B20] tracking-tight leading-snug">
              {is_over_target ? 'Weekly Allowance Reached' : 'Budget Pacing Status'}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs sm:text-sm text-[#132B20]">
          <p className="leading-relaxed bg-white/70 p-4 rounded-2xl border border-[#E6E1D7] text-[#132B20]/90">
            You have reached{' '}
            <strong className="text-[#132B20] font-extrabold">
              {week_co2_kg.toFixed(1)} kg CO₂
            </strong>{' '}
            against your{' '}
            <strong className="text-[#132B20] font-bold">
              {effective_target_kg?.toFixed(1) || baseTarget.toFixed(1)} kg
            </strong>{' '}
            weekly target
            {is_over_target ? (
              <span className="text-[#2F4F2F] font-bold">
                {' '}
                (+{currentOverage.toFixed(1)} kg balance)
              </span>
            ) : (
              <span> (within budget limits)</span>
            )}
            . You can rebalance your footprint cleanly into next week's budget.
          </p>

          {/* Compensation Card Box */}
          <div className="bg-[#F0ECE1] rounded-2xl p-4 border border-[#E6E1D7] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#2F4F2F] uppercase tracking-wider">
              <Repeat className="w-4 h-4 stroke-[2]" />
              <span>DP1 Rollover Compensation Mechanism</span>
            </div>

            <p className="text-xs text-[#132B20]/80 leading-relaxed">
              Deduct current excess emissions from next week's allowance (target reduces from{' '}
              <strong>{baseTarget.toFixed(1)} kg → {nextTarget.toFixed(1)} kg CO₂</strong>) to keep your overall climate pledge balanced.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white rounded-xl p-3 border border-[#E6E1D7] shadow-xs">
                <span className="block text-[10px] uppercase font-bold text-[#132B20]/60 tracking-wider">
                  Current Excess / Debt
                </span>
                <span className="text-base font-extrabold text-[#132B20] mt-0.5 block">
                  +{currentOverage.toFixed(1)} kg CO₂
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#E6E1D7] shadow-xs">
                <span className="block text-[10px] uppercase font-bold text-[#132B20]/60 tracking-wider">
                  Adjusted Next Target
                </span>
                <span className="text-base font-extrabold text-[#132B20] mt-0.5 block">
                  {nextTarget.toFixed(1)} kg CO₂
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5 border-t border-[#E6E1D7]">
          <button
            onClick={onDismiss}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-[#132B20]/20 text-[#132B20] text-xs font-semibold hover:bg-[#132B20]/5 transition-colors text-center cursor-pointer"
          >
            Keep Standard Budget
          </button>

          <button
            onClick={onApplyRollover}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#132B20] hover:bg-[#1f4331] text-white text-xs font-bold px-5 py-2.5 rounded-full agrone-pill-shadow transition-all shadow-md group cursor-pointer"
          >
            <span>
              {rollover_debt_kg > 0
                ? 'Clear Rollover Debt'
                : `Apply -${currentOverage.toFixed(1)} kg Rollover to Next Week`}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
