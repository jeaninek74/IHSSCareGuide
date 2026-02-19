const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: { user: User; profile: UserProfile };
}

export const authApi = {
  register: (email: string, password: string, name: string, timezone?: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, timezone }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ success: boolean }>('/auth/logout', { method: 'POST', body: JSON.stringify({}) }),

  me: () =>
    request<AuthResponse>('/auth/me'),

  updateProfile: (data: { name?: string; timezone?: string }) =>
    request<{ success: boolean; data: { profile: UserProfile } }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ── Shifts ────────────────────────────────────────────────────────────────────

export interface ShiftEvent {
  id: string;
  shiftId: string;
  userId: string;
  type: string;
  description: string;
  occurredAt: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  userId: string;
  status: 'active' | 'completed';
  startedAt: string;
  endedAt: string | null;
  recipientName: string | null;
  createdAt: string;
  updatedAt: string;
  events: ShiftEvent[];
}

export interface ShiftResponse {
  success: boolean;
  data: { shift: Shift };
}

export interface ShiftsResponse {
  success: boolean;
  data: { shifts: Shift[] };
}

export const shiftsApi = {
  start: (recipientName?: string) =>
    request<ShiftResponse>('/shifts/start', {
      method: 'POST',
      body: JSON.stringify({ recipientName }),
    }),

  end: (shiftId: string) =>
    request<ShiftResponse>(`/shifts/${shiftId}/end`, { method: 'POST', body: JSON.stringify({}) }),

  addEvent: (shiftId: string, type: string, description: string, occurredAt?: string) =>
    request<{ success: boolean; data: { event: ShiftEvent } }>(`/shifts/${shiftId}/events`, {
      method: 'POST',
      body: JSON.stringify({ type, description, occurredAt }),
    }),

  getAll: () =>
    request<ShiftsResponse>('/shifts'),

  getActive: () =>
    request<{ success: boolean; data: { shift: Shift | null } }>('/shifts/active'),

  getOne: (shiftId: string) =>
    request<ShiftResponse>(`/shifts/${shiftId}`),

  getWeeklyRange: (weekStart: string, weekEnd: string) =>
    request<ShiftsResponse>(`/shifts/weekly-range?weekStart=${weekStart}&weekEnd=${weekEnd}`),
};

// ── Incidents ─────────────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  userId: string;
  description: string;
  structuredJson: unknown | null;
  modelUsed: string | null;
  promptVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export const incidentsApi = {
  create: (description: string) =>
    request<{ success: boolean; data: { incident: Incident } }>('/incidents', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }),

  getAll: () =>
    request<{ success: boolean; data: { incidents: Incident[] } }>('/incidents'),

  getOne: (incidentId: string) =>
    request<{ success: boolean; data: { incident: Incident } }>(`/incidents/${incidentId}`),
  structure: (incidentId: string) =>
    request<{ success: boolean; data: { incident: Incident } }>(`/incidents/${incidentId}/structure`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};

// ── Notes ─────────────────────────────────────────────────────────────────────

export interface StructuredNote {
  id: string;
  shiftId: string;
  structuredOutput: Record<string, unknown>;
  promptVersion: string;
  createdAt: string;
  updatedAt: string;
}

export const notesApi = {
  generate: (shiftId: string) =>
    request<{ success: boolean; data: { note: StructuredNote } }>(`/notes/shifts/${shiftId}/generate`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  getForShift: (shiftId: string) =>
    request<{ success: boolean; data: { note: StructuredNote } }>(`/notes/shifts/${shiftId}`),
};

// ── Exports ───────────────────────────────────────────────────────────────────

export interface WeeklyExport {
  id: string;
  weekStart: string;
  weekEnd: string;
  structuredOutput: Record<string, unknown>;
  promptVersion: string;
  createdAt: string;
}

export const exportsApi = {
  generateWeekly: (weekStart: string, weekEnd: string) =>
    request<{ success: boolean; data: { export: WeeklyExport; summary: Record<string, unknown> } }>('/exports/weekly', {
      method: 'POST',
      body: JSON.stringify({ weekStart, weekEnd }),
    }),
  getAll: () =>
    request<{ success: boolean; data: { exports: WeeklyExport[] } }>('/exports'),
  getOne: (exportId: string) =>
    request<{ success: boolean; data: { export: WeeklyExport } }>(`/exports/${exportId}`),
};
