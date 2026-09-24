import React, { useState } from 'react';
import { Trash2, ShieldCheck, Search } from 'lucide-react';
import type { Activity } from '../types';
import { EMISSION_FACTORS } from '../types';
import { ActivityIcon } from './ActivityIcon';

interface AuditTableProps {
  activities: Activity[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onDeleteActivity: (id: string) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  activities,
  searchQuery,
  setSearchQuery,
  onDeleteActivity,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredActivities = activities.filter((act) => {
    if (filterType !== 'ALL' && act.activity_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const meta = EMISSION_FACTORS[act.activity_type];
      const label = meta ? meta.label.toLowerCase() : act.activity_type.toLowerCase();
      if (!label.includes(q)) return false;
    }
    return true;
  });

  return (
    <div
      id="telemetry-audit"
      className="bg-[#F5F2EB] rounded-[32px] p-5 sm:p-6 agrone-card-shadow border border-white/80 flex flex-col justify-between space-y-3"
    >
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#132B20]/10">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-extrabold text-[#132B20] tracking-tight">
            Telemetry Log &amp; Audit
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E3EDE5] text-[#132B20] border border-[#C8D9CB]">
            {filteredActivities.length} logs
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {/* Table Search Input */}
          <div className="flex items-center space-x-1.5 bg-white/80 border border-[#132B20]/15 px-2.5 py-1 rounded-full text-xs text-[#132B20]">
            <Search className="w-3 h-3 text-[#132B20]/50" />
            <input
              type="text"
              placeholder="Search audit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[11px] text-[#132B20] placeholder-[#132B20]/40 focus:outline-none w-24 font-medium"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 text-[11px] font-bold">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'flight', label: 'Flights' },
              { id: 'car', label: 'Car' },
              { id: 'bus', label: 'Bus' },
              { id: 'electricity', label: 'Elec' },
              { id: 'veg_meal', label: 'Veg' },
              { id: 'non_veg_meal', label: 'Non-Veg' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                  filterType === f.id
                    ? 'bg-[#132B20] text-white'
                    : 'bg-[#EAE6DA] text-[#132B20]/75 hover:bg-[#DDD8CA]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-x-auto max-h-[220px] pr-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#132B20]/60 font-extrabold border-b border-[#132B20]/10">
              <th className="py-1.5 px-2">Activity</th>
              <th className="py-1.5 px-2">Volume</th>
              <th className="py-1.5 px-2">Factor</th>
              <th className="py-1.5 px-2">Output</th>
              <th className="py-1.5 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#132B20]/10">
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#132B20]/50 italic">
                  No telemetry entries found for this filter.
                </td>
              </tr>
            ) : (
              filteredActivities.map((item) => {
                const config = EMISSION_FACTORS[item.activity_type] || {
                  rate: 0.2,
                  unit: item.unit,
                  label: item.activity_type,
                };
                const isFlagged = item.flagged;

                return (
                  <tr
                    key={item.id}
                    className={`transition ${
                      isFlagged
                        ? 'bg-[#EAE4D5]/60 hover:bg-[#EAE4D5]/80 font-medium'
                        : 'hover:bg-[#EAE6DA]/70'
                    }`}
                  >
                    <td className="py-2 px-2 text-[#132B20] flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[#132B20] text-[#85D450]">
                        <ActivityIcon type={item.activity_type} className="w-3 h-3" />
                      </span>
                      <div>
                        <div className="font-bold text-xs text-[#132B20]">
                          {config.label}
                        </div>
                        <div className="text-[10px] text-[#132B20]/60">
                          {new Date(item.logged_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 font-bold text-[#132B20]">
                      {item.quantity}{' '}
                      <span className="text-[10px] font-normal text-[#132B20]/60">
                        {item.unit}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-[11px] text-[#132B20]/70 font-medium">
                      {config.rate.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 font-extrabold text-[#132B20]">
                      {item.co2_kg.toFixed(2)}{' '}
                      <span className="text-[#2F4F2F] font-bold text-[10px]">kg</span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => onDeleteActivity(item.id)}
                        title="Delete entry"
                        className="w-6 h-6 rounded-full hover:bg-[#132B20]/10 text-[#132B20]/40 hover:text-[#132B20] transition inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Equivalence Footer */}
      <div className="pt-2 border-t border-[#132B20]/10 flex items-center justify-between text-[11px] text-[#132B20]/75 font-medium">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F4F2F]" />
          <span>IPCC Tier 1 Telemetry: Rolling Weekly Audit Trail</span>
        </div>
        <span className="text-[#132B20]/80 font-semibold">
          Active telemetry cycle
        </span>
      </div>
    </div>
  );
};
