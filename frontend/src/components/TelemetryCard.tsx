import React, { useState } from 'react';
import { Gauge, Scale, Plus } from 'lucide-react';
import type { CategoryBreakdownItem } from '../types';
import { EMISSION_FACTORS } from '../types';

interface TelemetryCardProps {
  weeklyTotalCo2: number;
  targetKg: number | null;
  overageKg: number;
  isOverTarget: boolean;
  categories: CategoryBreakdownItem[];
  onLogActivity: (
    type: string,
    quantity: number,
    note?: string,
    loggedAt?: string
  ) => void;
  onOpenThresholdModal: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  flight: '#8C6824',
  electricity: '#74C043',
  car: '#132B20',
  veg_meal: '#2F4F2F',
  bus: '#4B6B58',
  non_veg_meal: '#B83220',
};

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  weeklyTotalCo2,
  targetKg,
  overageKg,
  isOverTarget,
  categories,
  onLogActivity,
  onOpenThresholdModal,
}) => {
  const [activityType, setActivityType] = useState<string>('car');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activityNote, setActivityNote] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const factorMeta = EMISSION_FACTORS[activityType] || {
    rate: 0.2,
    unit: 'units',
    label: activityType,
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const val = parseFloat(quantityInput);
    if (isNaN(val) || val <= 0) {
      setFormError('Enter a valid positive number.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const loggedAt = !activityDate || activityDate === todayStr
      ? undefined
      : new Date(`${activityDate}T12:00:00Z`).toISOString();

    onLogActivity(
      activityType,
      val,
      activityNote.trim() || undefined,
      loggedAt
    );

    setQuantityInput('');
    setActivityNote('');
  };

  return (
    <div
      id="telemetry-card"
      className="bg-[#F5F2EB] rounded-[32px] p-5 sm:p-6 agrone-card-shadow border border-white/80 relative flex flex-col justify-between space-y-4"
    >
      {/* Corner Action Circle  */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
        <div
          onClick={onOpenThresholdModal}
          className="w-9 h-9 rounded-full bg-[#E3EDE5] text-[#132B20] flex items-center justify-center shadow-sm font-bold hover:scale-105 transition-transform cursor-pointer border border-[#C8D9CB]"
          title="Pacing overview"
        >
          <Scale className="w-4 h-4 stroke-[2]" />
        </div>
      </div>

      {/* Telemetry Header */}
      <div className="flex items-center space-x-2 text-xs font-bold tracking-wider uppercase text-[#132B20]/70">
        <div className="w-6 h-6 rounded-full bg-[#E3EDE5] flex items-center justify-center text-[#132B20]">
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <span>Weekly Telemetry &amp; Quick Logger</span>
      </div>

      {/* Big Metric with Status Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-5">
          <div className="flex items-baseline space-x-2 flex-wrap">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#132B20]">
              {weeklyTotalCo2.toFixed(1)}
            </span>
            <span className="text-xl font-bold text-[#132B20]">kg CO₂</span>
            {isOverTarget ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EAE4D5] text-[#8C6824] border border-[#DDD5C0] text-[10px] font-bold uppercase tracking-wide ml-1">
                +{overageKg.toFixed(1)} kg
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E3EDE5] text-[#132B20] border border-[#C8D9CB] text-[10px] font-bold uppercase tracking-wide ml-1">
                On Track
              </span>
            )}
          </div>
          <p className="text-[11px] font-semibold text-[#132B20]/60 uppercase tracking-wider mt-0.5">
            Current week emissions {targetKg ? `(Target: ${targetKg.toFixed(1)} kg)` : ''}
          </p>
        </div>

        <div className="sm:col-span-7 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold text-[#132B20]/75">
            <span>Category Breakdown</span>
            {isOverTarget && (
              <span className="text-[#8C6824] font-bold">
                +{overageKg.toFixed(1)} kg balance
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full rounded-full bg-[#DDD8CA] overflow-hidden flex p-0.5 border border-[#132B20]/10">
            {categories.length === 0 ? (
              <div className="h-full w-full bg-[#C8D9CB]/50 rounded-full" />
            ) : (
              categories.map((cat, idx) => {
                const color = CATEGORY_COLORS[cat.activity_type] || '#132B20';
                return (
                  <div
                    key={idx}
                    style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                    title={`${cat.activity_type}: ${cat.co2_kg.toFixed(1)} kg (${cat.percentage}%)`}
                    className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                  />
                );
              })
            )}
          </div>

          {/* Breakdown pills */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {categories.map((cat, idx) => {
              const color = CATEGORY_COLORS[cat.activity_type] || '#132B20';
              const label =
                EMISSION_FACTORS[cat.activity_type]?.label || cat.activity_type;
              return (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-[#EAE6DA] font-semibold text-[#132B20]"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>
                    {label}: {cat.co2_kg.toFixed(1)}kg
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Logger Form */}
      <form
        id="quick-log"
        onSubmit={handleQuickSubmit}
        className="pt-3 border-t border-[#132B20]/10 space-y-2.5"
      >
        <div className="grid grid-cols-12 gap-2 sm:gap-3">
          <div className="col-span-12 sm:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#132B20]/70 mb-1">
              Activity
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="agrone-input w-full px-3 py-2 rounded-xl text-xs font-bold text-[#132B20] cursor-pointer"
            >
              <option value="car">Car travel (0.20 kg/km)</option>
              <option value="bus">Bus travel (0.08 kg/km)</option>
              <option value="flight">Flight (0.25 kg/km)</option>
              <option value="electricity">Electricity (0.80 kg/kWh)</option>
              <option value="veg_meal">Veg meal (0.50 kg/meal)</option>
              <option value="non_veg_meal">Non-veg meal (2.00 kg/meal)</option>
            </select>
          </div>

          <div className="col-span-6 sm:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#132B20]/70 mb-1">
              Qty ({factorMeta.unit})
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 24"
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              className="agrone-input w-full px-3 py-2 rounded-xl text-xs font-bold text-[#132B20]"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#132B20]/70 mb-1">
              Date
            </label>
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="agrone-input w-full px-2 py-2 rounded-xl text-xs text-[#132B20]"
            />
          </div>

          <div className="col-span-12 sm:col-span-4">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#132B20]/70 mb-1">
              Note / Label
            </label>
            <input
              type="text"
              placeholder="e.g. Commute to office"
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
              className="agrone-input w-full px-3 py-2 rounded-xl text-xs text-[#132B20]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs font-bold text-[#132B20]">
            <span className="text-[11px] text-[#132B20]/60 font-normal">Est: </span>
            <span className="text-sm font-extrabold text-[#132B20]">
              {quantityInput &&
              !isNaN(parseFloat(quantityInput)) &&
              parseFloat(quantityInput) > 0
                ? (parseFloat(quantityInput) * factorMeta.rate).toFixed(2)
                : '0.00'}
            </span>
            <span className="text-[11px] text-[#74C043] ml-1 font-bold">
              kg CO₂
            </span>
          </div>

          {formError && (
            <span className="text-[11px] text-[#8C6824] font-bold">{formError}</span>
          )}

          <button
            type="submit"
            className="inline-flex items-center space-x-2 bg-[#132B20] hover:bg-[#1f4331] text-white text-xs font-bold px-4 py-2 rounded-full agrone-pill-shadow transition-all group cursor-pointer"
          >
            <span>Record Activity</span>
            <span className="w-5 h-5 rounded-full bg-[#74C043] text-[#132B20] flex items-center justify-center group-hover:rotate-45 transition-transform">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
