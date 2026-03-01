// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type FlowLevel = 'light' | 'medium' | 'heavy';

export interface Period {
  id: string;
  startDate: string; // ISO 8601 YYYY-MM-DD
  endDate: string | null;
  flow: FlowLevel | null;
  symptoms: string[];
  mood: 1 | 2 | 3 | 4 | 5 | null;
  notes: string | null;
  schemaVersion: 1;
}

export interface UserSettings {
  cycleLengthAverage: number;
  cycleVariance: number;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  theme: 'light' | 'dark';
  schemaVersion: 1;
}

export interface Prediction {
  id: string;
  predictedStartDate: string;
  predictedEndDate: string;
  confidence: number; // 0–1
  schemaVersion: 1;
}

export interface CycleSummary {
  averageCycleLength: number;
  variance: number; // population standard deviation
  cycleLengths: number[];
}

export interface AnomalyResult {
  flagged: boolean;
  reason: string | null;
}

// ---------------------------------------------------------------------------
// Service error types
// ---------------------------------------------------------------------------

export type ServiceErrorCode = 'DB_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR';

export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
}

export function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as ServiceError).code === 'string'
  );
}

// ---------------------------------------------------------------------------
// Import / Export types
// ---------------------------------------------------------------------------

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  appName: string;
  data: {
    periods: Period[];
    settings: UserSettings | null;
  };
}

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Calendar types
// ---------------------------------------------------------------------------

export type CalendarView = 'week' | 'month' | 'year';

// ---------------------------------------------------------------------------
// Toast types
// ---------------------------------------------------------------------------

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export interface ShowToastOptions {
  type?: ToastType;
  message: string;
  duration?: number;
}
