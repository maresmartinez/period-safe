import { SCHEMA_VERSION, APP_NAME } from '../config.ts';
import { getAllPeriods, clearAllPeriods, getPeriod } from '../services/periodService.ts';
import { getSettings, saveSettings } from '../services/settingsService.ts';
import { initDB } from '../services/db.ts';
import type { ExportPayload, ImportValidationResult, Period } from '../types.ts';

export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isValidISODate(str: unknown): boolean {
  if (!str || typeof str !== 'string') return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(str);
}

export async function exportData(): Promise<string> {
  const periods = await getAllPeriods();
  const settings = getSettings();
  const payload: ExportPayload = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: APP_NAME,
    data: { periods, settings },
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJSON(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getExportFilename(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `periodsafe-export-${today}.json`;
}

export function validateImportShape(parsed: unknown): ImportValidationResult {
  const errors: string[] = [];

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    errors.push('File is not a valid JSON object');
    return { valid: false, errors };
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj['schemaVersion'] !== 'number') {
    errors.push('schemaVersion must be a number');
  } else if ((obj['schemaVersion'] as number) > SCHEMA_VERSION) {
    errors.push(
      `schemaVersion ${obj['schemaVersion']} is newer than supported version (${SCHEMA_VERSION})`
    );
  }

  if (!obj['data'] || typeof obj['data'] !== 'object' || Array.isArray(obj['data'])) {
    errors.push('data field is missing or invalid');
    return { valid: false, errors };
  }

  const data = obj['data'] as Record<string, unknown>;

  if (!Array.isArray(data['periods'])) {
    errors.push('data.periods must be an array');
  } else {
    const periods = data['periods'] as unknown[];
    for (let i = 0; i < periods.length; i++) {
      const p = periods[i] as Record<string, unknown> | null | undefined;
      if (!p || typeof p['id'] !== 'string' || (p['id'] as string).trim() === '') {
        errors.push(`Period at index ${i} is missing a valid id`);
      }
      if (!isValidISODate(p?.['startDate'])) {
        errors.push(`Period at index ${i} is missing a valid startDate`);
      }
    }
  }

  // data.settings being null/missing is recoverable — defaults will be used
  // Only flag it if it's present but clearly wrong type
  if (
    data['settings'] !== undefined &&
    data['settings'] !== null &&
    (typeof data['settings'] !== 'object' || Array.isArray(data['settings']))
  ) {
    errors.push('data.settings must be an object if present');
  }

  return { valid: errors.length === 0, errors };
}

export async function importData(parsedPayload: ExportPayload, strategy: 'overwrite' | 'merge'): Promise<void> {
  if (strategy === 'overwrite') {
    await clearAllPeriods();
    if (parsedPayload.data.settings && typeof parsedPayload.data.settings === 'object') {
      saveSettings(parsedPayload.data.settings);
    }
  }

  const db = await initDB();

  for (const period of parsedPayload.data.periods) {
    if (strategy === 'merge') {
      const existing = await getPeriod(period.id);
      if (existing) continue;
    }

    // Use db.put to preserve the original period ID from the export file.
    // createPeriod always generates a new UUID, which would break deduplication.
    // Apply defaults for any fields that may be missing in partially-filled import data.
    const record: Period = {
      ...period,
      flow: period.flow ?? null,
      endDate: period.endDate ?? null,
      symptoms: period.symptoms ?? [],
      mood: period.mood ?? null,
      notes: period.notes ?? null,
      schemaVersion: SCHEMA_VERSION as 1,
    };
    await db.put('periods', record);
  }
}
