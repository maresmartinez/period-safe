import { initDB } from './db.js';
import { SCHEMA_VERSION } from '../config.js';

const VALID_FLOW = ['light', 'medium', 'heavy', null];

function isValidISODate(str) {
  if (!str) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && str.match(/^\d{4}-\d{2}-\d{2}/);
}

function validate(data) {
  if (!data.startDate || !isValidISODate(data.startDate)) {
    throw { code: 'VALIDATION_ERROR', message: 'startDate is required and must be a valid ISO date string' };
  }
  if (data.endDate != null && !isValidISODate(data.endDate)) {
    throw { code: 'VALIDATION_ERROR', message: 'endDate must be a valid ISO date string' };
  }
  if (data.endDate != null && data.endDate < data.startDate) {
    throw { code: 'VALIDATION_ERROR', message: 'endDate must be >= startDate' };
  }
  if (data.flow !== undefined && !VALID_FLOW.includes(data.flow)) {
    throw { code: 'VALIDATION_ERROR', message: "flow must be 'light', 'medium', 'heavy', or null" };
  }
  if (data.mood !== undefined && data.mood !== null) {
    const mood = Number(data.mood);
    if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
      throw { code: 'VALIDATION_ERROR', message: 'mood must be an integer 1–5 or null' };
    }
  }
  if (data.symptoms !== undefined && !Array.isArray(data.symptoms)) {
    throw { code: 'VALIDATION_ERROR', message: 'symptoms must be an array' };
  }
}

export async function getPeriod(id) {
  try {
    const db = await initDB();
    const record = await db.get('periods', id);
    return record ?? null;
  } catch (err) {
    if (err.code) throw err;
    throw { code: 'DB_ERROR', message: err.message ?? 'Failed to get period' };
  }
}

export async function getAllPeriods() {
  try {
    const db = await initDB();
    const all = await db.getAll('periods');
    return all.sort((a, b) => (a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0));
  } catch (err) {
    if (err.code) throw err;
    throw { code: 'DB_ERROR', message: err.message ?? 'Failed to get all periods' };
  }
}

export async function createPeriod(data) {
  try {
    validate(data);
    const record = {
      flow: null,
      symptoms: [],
      mood: null,
      notes: null,
      endDate: null,
      ...data,
      id: crypto.randomUUID(),
      schemaVersion: SCHEMA_VERSION,
    };
    const db = await initDB();
    await db.add('periods', record);
    return record;
  } catch (err) {
    if (err.code) throw err;
    throw { code: 'DB_ERROR', message: err.message ?? 'Failed to create period' };
  }
}

export async function updatePeriod(id, data) {
  try {
    const db = await initDB();
    const existing = await db.get('periods', id);
    if (!existing) {
      throw { code: 'NOT_FOUND', message: `Period with id '${id}' not found` };
    }
    const merged = { ...existing, ...data, id, schemaVersion: SCHEMA_VERSION };
    validate(merged);
    await db.put('periods', merged);
    return merged;
  } catch (err) {
    if (err.code) throw err;
    throw { code: 'DB_ERROR', message: err.message ?? 'Failed to update period' };
  }
}

export async function deletePeriod(id) {
  try {
    const db = await initDB();
    await db.delete('periods', id);
  } catch (err) {
    if (err.code) throw err;
    throw { code: 'DB_ERROR', message: err.message ?? 'Failed to delete period' };
  }
}

export async function clearAllPeriods() {
  try {
    const db = await initDB();
    await db.clear('periods');
  } catch (err) {
    if (err.code) throw err;
    throw { code: 'DB_ERROR', message: err.message ?? 'Failed to clear periods' };
  }
}
