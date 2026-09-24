import axios from 'axios';
import type {
  Activity,
  ActivityCreatePayload,
  DashboardResponse,
  WeeklyTargetResponse,
  OutlierWarningResponse,
} from '../types';

export type IdentityMode = 'ephemeral' | 'persistent';

export const getIdentityMode = (): IdentityMode => {
  const localId = localStorage.getItem('X-Device-Id');
  return localId ? 'persistent' : 'ephemeral';
};

export const getDeviceId = (): string => {
  const localId = localStorage.getItem('X-Device-Id');
  if (localId) return localId;

  // Ephemeral mode: fallback to 'default' or tab session bookmark
  let session = sessionStorage.getItem('X-Device-Id-Ephemeral');
  if (!session) {
    session = 'default';
    sessionStorage.setItem('X-Device-Id-Ephemeral', session);
  }
  return session;
};

export const createPersistentIdentity = (): string => {
  const newUuid = crypto.randomUUID();
  localStorage.setItem('X-Device-Id', newUuid);
  return newUuid;
};

export const restorePersistentIdentity = (rawKey: string): string => {
  const cleanKey = rawKey.trim();
  if (!cleanKey) throw new Error('Key cannot be empty');
  localStorage.setItem('X-Device-Id', cleanKey);
  return cleanKey;
};

export const switchToEphemeralMode = (): void => {
  localStorage.removeItem('X-Device-Id');
};

const getBaseURL = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject active X-Device-Id on every backend call
api.interceptors.request.use((config) => {
  config.headers['X-Device-Id'] = getDeviceId();
  return config;
});

// API helper methods
export const fetchDashboard = async (): Promise<DashboardResponse> => {
  const res = await api.get<DashboardResponse>('/dashboard');
  return res.data;
};

export const logActivity = async (
  payload: ActivityCreatePayload
): Promise<{ data?: Activity; outlierWarning?: OutlierWarningResponse }> => {
  try {
    const res = await api.post<Activity>('/activities', payload);
    return { data: res.data };
  } catch (err: any) {
    if (err.response && err.response.status === 409) {
      return { outlierWarning: err.response.data as OutlierWarningResponse };
    }
    throw err;
  }
};

export const fetchActivities = async (params?: {
  type?: string;
  from_date?: string;
  to_date?: string;
  include_flagged?: boolean;
}): Promise<Activity[]> => {
  const res = await api.get<Activity[]>('/activities', { params });
  return res.data;
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  await api.delete(`/activities/${activityId}`);
};

export const fetchTarget = async (): Promise<WeeklyTargetResponse> => {
  const res = await api.get<WeeklyTargetResponse>('/target');
  return res.data;
};

export const setTarget = async (
  targetKg: number,
  rolloverDebtKg = 0.0
): Promise<WeeklyTargetResponse> => {
  const res = await api.put<WeeklyTargetResponse>('/target', {
    target_kg: targetKg,
    rollover_debt_kg: rolloverDebtKg,
  });
  return res.data;
};

export const applyRollover = async (
  apply: boolean
): Promise<WeeklyTargetResponse> => {
  const res = await api.post<WeeklyTargetResponse>('/target/rollover', {
    apply_rollover: apply,
  });
  return res.data;
};
