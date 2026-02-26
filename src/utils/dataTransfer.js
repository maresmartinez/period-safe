import { SCHEMA_VERSION, APP_NAME } from '../config.js';
import { getAllPeriods, clearAllPeriods, getPeriod } from '../services/periodService.js';
import { getSettings, saveSettings } from '../services/settingsService.js';
import { initDB } from '../services/db.js';

export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isValidISODate(str) {
  if (!str || typeof str !== 'string') return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(str);
}

export async function exportData() {
  const periods = await getAllPeriods();
  const settings = getSettings();
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: APP_NAME,
    data: { periods, settings },
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJSON(jsonString, filename) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getExportFilename() {
  const today = new Date().toISOString().slice(0, 10);
  return `periodsafe-export-${today}.json`;
}

export function validateImportShape(parsed) {
  const errors = [];

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    errors.push('File is not a valid JSON object');
    return { valid: false, errors };
  }

  if (typeof parsed.schemaVersion !== 'number') {
    errors.push('schemaVersion must be a number');
  } else if (parsed.schemaVersion > SCHEMA_VERSION) {
    errors.push(
      `schemaVersion ${parsed.schemaVersion} is newer than supported version (${SCHEMA_VERSION})`
    );
  }

  if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
    errors.push('data field is missing or invalid');
    return { valid: false, errors };
  }

  if (!Array.isArray(parsed.data.periods)) {
    errors.push('data.periods must be an array');
  } else {
    for (let i = 0; i < parsed.data.periods.length; i++) {
      const p = parsed.data.periods[i];
      if (!p || typeof p.id !== 'string' || p.id.trim() === '') {
        errors.push(`Period at index ${i} is missing a valid id`);
      }
      if (!isValidISODate(p?.startDate)) {
        errors.push(`Period at index ${i} is missing a valid startDate`);
      }
    }
  }

  // data.settings being null/missing is recoverable — defaults will be used
  // Only flag it if it's present but clearly wrong type
  if (
    parsed.data.settings !== undefined &&
    parsed.data.settings !== null &&
    (typeof parsed.data.settings !== 'object' || Array.isArray(parsed.data.settings))
  ) {
    errors.push('data.settings must be an object if present');
  }

  return { valid: errors.length === 0, errors };
}

export async function importData(parsedPayload, strategy) {
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
    const record = {
      flow: null,
      symptoms: [],
      mood: null,
      notes: null,
      endDate: null,
      ...period,
      schemaVersion: SCHEMA_VERSION,
    };
    await db.put('periods', record);
  }
}
