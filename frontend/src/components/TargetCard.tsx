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
    <div className="bg-[#F5F2EB] rounded-[32px] p-5 sm:p-6 agrone-card-shadow relative overflow-hidden border border-[#D9D1BF] text-[#132B20] flex flex-col justify-between space-y-3.5 shadow-xl">
      {/* Gentle Pacing Button in Top-Right Corner */}
      <div
        onClick={onOpenThresholdModal}
        className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 rounded-full bg-[#E3EDE5] text-[#132B20] flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform border border-[#C8D9CB]"
        title="View Rebalancing Options"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </div>

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pr-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#132B20]/75">
              Weekly Budget &amp; Target
            </span>
            {isOver ? (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAE4D5] text-[#8C6824] border border-[#DDD5C0] text-[10px] font-bold uppercase tracking-wider">
                Goal Reached
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-[#E3EDE5] text-[#132B20] border border-[#C8D9CB] text-[10px] font-bold uppercase tracking-wider">
                On Track
              </span>
            )}
          </div>

          <button
            onClick={onOpenTargetAdjustModal}
            className="text-[11px] font-bold text-[#132B20] hover:text-white bg-[#EAE6DA] hover:bg-[#132B20] px-3 py-1 rounded-full border border-[#D9D1BF] transition cursor-pointer"
          >
            {target_kg ? 'Adjust Target' : 'Set Target'}
          </button>
        </div>

        {/* Headline */}
        <div>
          <div className="flex items-baseline space-x-2 flex-wrap">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#132B20]">
              {Math.round(progressDisplay)}%
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#132B20]/90">
              of Weekly Target
            </span>
          </div>
          <p className="text-xs font-semibold text-[#132B20]/75 mt-0.5">
            {week_co2_kg.toFixed(1)} kg logged of {targetDisplay.toFixed(1)} kg weekly budget
            {rollover_debt_kg > 0 ? ` (Rollover debt: -${rollover_debt_kg.toFixed(1)} kg)` : ''}
          </p>
        </div>

        {/* Progress meter */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#132B20]/15 h-3.5 rounded-full overflow-hidden p-0.5 flex">
            {/* Baseline Segment */}
            <div
              className="h-full rounded-l-full bg-[#132B20] transition-all duration-500 flex items-center justify-end pr-1"
              style={{ width: `${baselineWidth}%` }}
              title={`${targetDisplay.toFixed(1)} kg allowance`}
            >
              {baselineWidth > 20 && (
                <span className="text-[8px] text-white/80 font-bold hidden sm:inline">
                  {Math.round(baselineWidth)}%
                </span>
              )}
            </div>
            {/* Overflow segment in warm amber */}
            {isOver && (
              <div
                className="h-full rounded-r-full bg-[#8C6824] transition-all duration-500 flex items-center justify-center"
                style={{ width: `${overageWidth}%` }}
                title={`+${overageVal.toFixed(1)} kg balance`}
              >
                {overageWidth > 8 && (
                  <span className="text-[8px] text-white font-bold hidden sm:inline">
                    +{overageVal.toFixed(1)}kg
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-[#132B20]/70 px-1">
            <span className="text-[#132B20] font-bold">0 kg baseline</span>
            <span className="text-[#132B20] font-bold">{targetDisplay.toFixed(1)} kg target</span>
            {isOver ? (
              <span className="text-[#8C6824] font-bold">
                +{overageVal.toFixed(1)} kg balance ({week_co2_kg.toFixed(1)} kg total)
              </span>
            ) : (
              <span className="text-[#132B20] font-bold">
                {(targetDisplay - week_co2_kg).toFixed(1)} kg remaining
              </span>
            )}
          </div>
        </div>

        {/* Status note & Days Remaining */}
        <div className="pt-2 border-t border-[#132B20]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center space-x-1.5 font-medium text-[#132B20]/80">
            <Calendar className="w-3.5 h-3.5 text-[#2F4F2F]" />
            <span>{pacing_message}</span>
          </div>
          {isOver && (
            <span className="font-bold px-3 py-1 rounded-full bg-[#EAE4D5] text-[#8C6824] border border-[#DDD5C0] text-[11px] self-start sm:self-auto">
              +{overageVal.toFixed(1)} kg balance
            </span>
          )}
        </div>

        {/* Pacing recommendation callout */}
        <div className="text-[11px] text-[#132B20] font-medium leading-relaxed bg-[#EAE6DA]/80 border border-[#D9D1BF] p-2.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-full bg-[#E3EDE5] flex items-center justify-center text-[#132B20] text-xs">
              🌱
            </span>
            <span>
              {isOver
                ? `${overageVal.toFixed(1)} kg logged above baseline today. You can comfortably rebalance into next week's cycle.`
                : `Pacing comfortably with ${days_remaining} day(s) remaining in cycle.`}
            </span>
          </div>
          {isOver && (
            <button
              onClick={onOpenThresholdModal}
              className="ml-2 whitespace-nowrap text-[10px] font-bold bg-[#132B20] text-white px-2.5 py-1 rounded-full hover:bg-[#1a382a] transition cursor-pointer"
            >
              Rebalance
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
