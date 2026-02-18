// ============================================================
// @ihss/shared-types
// Single source of truth for all shared DTOs and entity interfaces
// ============================================================

// ---- Users ----
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Auth ----
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  profile: UserProfile;
}

// ---- Shifts ----
export type ShiftStatus = 'active' | 'completed';

export interface Shift {
  id: string;
  userId: string;
  status: ShiftStatus;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StartShiftRequest {
  // future: clientId optional
}

export interface EndShiftRequest {
  notes?: string;
}

// ---- Shift Events ----
export type ShiftEventType =
  | 'meal'
  | 'medication'
  | 'personal_care'
  | 'mobility'
  | 'companionship'
  | 'housekeeping'
  | 'transportation'
  | 'note';

export interface ShiftEvent {
  id: string;
  shiftId: string;
  userId: string;
  type: ShiftEventType;
  description: string;
  occurredAt: string;
  createdAt: string;
}

export interface CreateShiftEventRequest {
  type: ShiftEventType;
  description: string;
  occurredAt?: string;
}

// ---- Structured Notes ----
export interface StructuredNote {
  id: string;
  shiftId: string;
  userId: string;
  version: number;
  isFinal: boolean;
  content: StructuredNoteContent;
  modelUsed: string;
  promptVersion: string;
  createdAt: string;
}

export interface StructuredNoteContent {
  summary: string;
  activitiesPerformed: string[];
  careHighlights: string;
  duration: string;
  generatedAt: string;
}

// ---- Weekly Exports ----
export interface WeeklyExport {
  id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  content: WeeklyExportContent;
  pdfPath?: string;
  createdAt: string;
}

export interface WeeklyExportContent {
  weekRange: string;
  totalHours: number;
  days: DaySummary[];
  submissionChecklist: string[];
}

export interface DaySummary {
  date: string;
  shifts: ShiftSummary[];
  totalHours: number;
}

export interface ShiftSummary {
  shiftId: string;
  startedAt: string;
  endedAt: string;
  hours: number;
  highlights: string[];
}

// ---- Incidents ----
export interface Incident {
  id: string;
  userId: string;
  description: string;
  structuredJson?: IncidentStructured;
  modelUsed?: string;
  promptVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentStructured {
  summary: string;
  timeline: string;
  involvedParties: string[];
  actionsTaken: string[];
  recommendedFollowUp: string;
}

export interface CreateIncidentRequest {
  description: string;
}

// ---- Knowledge ----
export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  jurisdiction?: string;
  effectiveDate?: string;
  createdAt: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  title: string;
  source: string;
  content: string;
  chunkIndex: number;
  createdAt: string;
}

export interface AssistantQueryRequest {
  question: string;
}

export interface AssistantQueryResponse {
  answer: string;
  sources: ChunkReference[];
  verificationReminder: string;
  confidence: 'high' | 'low';
}

export interface ChunkReference {
  documentTitle: string;
  source: string;
  snippet: string;
}

// ---- API Envelope ----
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---- Health ----
export interface HealthResponse {
  status: 'ok';
  environment: string;
  version: string;
  database: 'connected' | 'disconnected';
  timestamp: string;
}
