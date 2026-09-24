import React from 'react';
import { SlidersHorizontal, Calendar } from 'lucide-react';
import type { CurrentWeekSummary } from '../types';

interface TargetCardProps {
  currentWeek: CurrentWeekSummary;
  onOpenThresholdModal: () => void;
  onOpenTargetAdjustModal: () => void;
}

export const TargetCard: React.FC<TargetCardProps> = ({
  currentWeek,
  onOpenThresholdModal,
  onOpenTargetAdjustModal,
}) => {
  const {
    week_co2_kg,
    target_kg,
    effective_target_kg,
    progress_percent,
    is_over_target,
    overage_kg,
    days_remaining,
    pacing_message,
    rollover_debt_kg,
  } = currentWeek;

  const targetDisplay = effective_target_kg || target_kg || 30.0;
  const progressDisplay =
    progress_percent !== null && progress_percent !== undefined
      ? progress_percent
      : Math.round((week_co2_kg / Math.max(0.1, targetDisplay)) * 100);

  const isOver = is_over_target || week_co2_kg > targetDisplay;
  const overageVal = isOver
    ? overage_kg > 0
      ? overage_kg
      : Math.round((week_co2_kg - targetDisplay) * 10) / 10
    : 0;

  // Compute progress bar segment widths
  const baselineWidth = isOver
    ? Math.min(100, Math.round((targetDisplay / Math.max(0.1, week_co2_kg)) * 100))
    : Math.min(100, Math.round(progressDisplay));
  const overageWidth = isOver ? 100 - baselineWidth : 0;

  return (
    <div className="bg-[#74C043] rounded-[32px] p-5 sm:p-6 shadow-xl relative overflow-hidden border border-white/20 text-[#132B20] flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-[#132B20]/80">
            Weekly Budget &amp; Target
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenTargetAdjustModal}
              className="text-[11px] font-extrabold text-[#132B20] bg-[#132B20]/15 hover:bg-[#132B20]/25 px-3 py-1 rounded-full transition cursor-pointer"
            >
              {target_kg ? 'Adjust Goal' : 'Set Goal'}
            </button>

            <button
              onClick={onOpenThresholdModal}
              className="w-8 h-8 rounded-full bg-[#132B20]/15 hover:bg-[#132B20]/25 text-[#132B20] flex items-center justify-center transition cursor-pointer"
              title="View Rebalancing Options"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Headline */}
        <div>
          <div className="flex items-baseline space-x-2 flex-wrap">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#132B20]">
              {Math.round(progressDisplay)}%
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#132B20]/90">
              Target Used
            </span>
          </div>
          <p className="text-xs font-bold text-[#132B20]/80 mt-1">
            {week_co2_kg.toFixed(1)} kg consumed of {targetDisplay.toFixed(1)} kg weekly allowance
          </p>
        </div>

        {/* Progress meter */}
        <div className="w-full bg-[#132B20]/20 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#132B20] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round(progressDisplay))}%` }}
          ></div>
        </div>

        {/* Pacing row */}
        <div className="flex items-center justify-between text-xs font-bold text-[#132B20]">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#132B20]" />
            <span>{days_remaining} days remaining</span>
          </div>

          <span className="bg-[#132B20] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
            {isOver ? `+${overageVal.toFixed(1)} kg over` : `${(targetDisplay - week_co2_kg).toFixed(1)} kg left`}
          </span>
        </div>

        {/* Pacing recommendation callout */}
        <div className="text-xs text-[#132B20] font-semibold leading-relaxed bg-[#132B20]/10 border border-[#132B20]/15 p-3 rounded-2xl flex items-center justify-between">
          <span>
            {isOver
              ? `${overageVal.toFixed(1)} kg logged above allowance. You can comfortably rebalance into next week.`
              : 'Great pacing! You are on track to stay comfortably below your IPCC carbon ceiling this Sunday.'}
          </span>
          {isOver && (
            <button
              onClick={onOpenThresholdModal}
              className="ml-2 whitespace-nowrap text-[10px] font-black bg-[#132B20] text-white px-3 py-1 rounded-full hover:bg-[#1a382a] transition cursor-pointer"
            >
              Rebalance
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
