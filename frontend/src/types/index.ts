export interface Activity {
  id: string;
  device_id: string;
  activity_type: string;
  unit: string;
  quantity: number;
  co2_kg: number;
  flagged: boolean;
  logged_at: string;
  created_at: string;
}

export interface ActivityCreatePayload {
  activity_type: string;
  quantity: number;
  confirm_outlier?: boolean;
  logged_at?: string;
}

export interface OutlierWarningResponse {
  is_outlier: boolean;
  threshold: number;
  activity_type: string;
  quantity: number;
  unit: string;
  message: string;
  requires_confirmation: boolean;
}

export interface CategoryBreakdownItem {
  activity_type: string;
  unit: string;
  total_quantity: number;
  co2_kg: number;
  activity_count: number;
  percentage: number;
}

export interface CurrentWeekSummary {
  week_start: string;
  week_end: string;
  day_of_week: number;
  days_remaining: number;
  elapsed_days: number;
  expected_pace_percent: number;
  week_co2_kg: number;
  flagged_co2_kg: number;
  target_kg?: number | null;
  rollover_debt_kg: number;
  effective_target_kg?: number | null;
  progress_percent?: number | null;
  is_over_target: boolean;
  overage_kg: number;
  pacing_status: string;
  pacing_message: string;
}

export interface DashboardResponse {
  device_id: string;
  total_co2_kg: number;
  total_activities: number;
  categories: CategoryBreakdownItem[];
  current_week: CurrentWeekSummary;
  recent_activities: Activity[];
}

export interface NudgeInfo {
  level: 'warning' | 'caution' | 'success';
  title: string;
  message: string;
  can_rollover: boolean;
  suggested_rollover_kg: number;
  rollover_applied: boolean;
  reduction_tips: string[];
}

export interface WeeklyTargetResponse {
  device_id: string;
  target_kg: number;
  rollover_debt_kg: number;
  effective_target_kg: number;
  current_week_co2_kg: number;
  progress_percent: number;
  is_over_target: boolean;
  overage_kg: number;
  days_remaining: number;
  nudge: NudgeInfo;
  updated_at: string;
}

export interface FactorMeta {
  rate: number;
  unit: string;
  label: string;
  category: string;
  iconName: string;
}

export const EMISSION_FACTORS: Record<string, FactorMeta> = {
  car: { rate: 0.20, unit: 'km', label: 'Car travel', category: 'Transport', iconName: 'Car' },
  bus: { rate: 0.08, unit: 'km', label: 'Bus travel', category: 'Transport', iconName: 'Bus' },
  flight: { rate: 0.25, unit: 'km', label: 'Flight', category: 'Transport', iconName: 'Plane' },
  electricity: { rate: 0.80, unit: 'kWh', label: 'Electricity', category: 'Energy', iconName: 'Zap' },
  veg_meal: { rate: 0.50, unit: 'meal', label: 'Veg meal', category: 'Food', iconName: 'Salad' },
  non_veg_meal: { rate: 2.00, unit: 'meal', label: 'Non-veg meal', category: 'Food', iconName: 'Beef' },
};

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  include_progress?: boolean;
}

export interface ChatResponse {
  reply: string;
  model: string;
}

