import { initDB } from './db.ts';
import { SCHEMA_VERSION } from '../config.ts';
import { isServiceError } from '../types.ts';
import type { Intimacy, ProtectionLevel } from '../types.ts';

const VALID_PROTECTION: Array<ProtectionLevel | null> = ['protected', 'unprotected', null];

function isValidISODate(str: unknown): boolean {
  if (!str || typeof str !== 'string') return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(str);
}

function validate(data: Partial<Intimacy>): void {
  if (!data.date || !isValidISODate(data.date)) {
    throw { code: 'VALIDATION_ERROR', message: 'date is required and must be a valid ISO date string' };
  }
  const todayStr = new Date().toISOString().split('T')[0];
  if (data.date > todayStr) {
    throw { code: 'VALIDATION_ERROR', message: 'date cannot be in the future' };
  }
  if (data.protection !== undefined && !VALID_PROTECTION.includes(data.protection ?? null)) {
    throw { code: 'VALIDATION_ERROR', message: "protection must be 'protected', 'unprotected', or null" };
  }
  if (data.notes !== undefined && data.notes !== null) {
    if (typeof data.notes !== 'string' || data.notes.length > 500) {
      throw { code: 'VALIDATION_ERROR', message: 'notes must be a string of 500 characters or less' };
    }
  }
}

export async function getIntimacy(id: string): Promise<Intimacy | null> {
  try {
    const db = await initDB();
    const record = await db.get('intimacy', id);
    return (record as Intimacy) ?? null;
  } catch (err) {
    if (isServiceError(err)) throw err;
    throw { code: 'DB_ERROR', message: (err as Error).message ?? 'Failed to get intimacy' };
  }
}

export async function getAllIntimacy(): Promise<Intimacy[]> {
  try {
    const db = await initDB();
    const all = await db.getAll('intimacy') as Intimacy[];
    return all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  } catch (err) {
    if (isServiceError(err)) throw err;
    throw { code: 'DB_ERROR', message: (err as Error).message ?? 'Failed to get all intimacy' };
  }
}

type CreateIntimacyInput = Pick<Intimacy, 'date'> & Partial<Omit<Intimacy, 'id' | 'schemaVersion' | 'date'>>;

export async function createIntimacy(data: CreateIntimacyInput): Promise<Intimacy> {
  try {
    validate(data);
    const record: Intimacy = {
      protection: null,
      notes: null,
      ...data,
      id: crypto.randomUUID(),
      schemaVersion: SCHEMA_VERSION,
    };
    const db = await initDB();
    await db.add('intimacy', record);
    return record;
  } catch (err) {
    if (isServiceError(err)) throw err;
    throw { code: 'DB_ERROR', message: (err as Error).message ?? 'Failed to create intimacy' };
  }
}

export async function updateIntimacy(id: string, data: Partial<Omit<Intimacy, 'id' | 'schemaVersion'>>): Promise<Intimacy> {
  try {
    const db = await initDB();
    const existing = await db.get('intimacy', id) as Intimacy | undefined;
    if (!existing) {
      throw { code: 'NOT_FOUND', message: `Intimacy entry with id '${id}' not found` };
    }
    const merged: Intimacy = { ...existing, ...data, id, schemaVersion: SCHEMA_VERSION };
    validate(merged);
    await db.put('intimacy', merged);
    return merged;
  } catch (err) {
    if (isServiceError(err)) throw err;
    throw { code: 'DB_ERROR', message: (err as Error).message ?? 'Failed to update intimacy' };
  }
}

export async function deleteIntimacy(id: string): Promise<void> {
  try {
    const db = await initDB();
    await db.delete('intimacy', id);
  } catch (err) {
    if (isServiceError(err)) throw err;
    throw { code: 'DB_ERROR', message: (err as Error).message ?? 'Failed to delete intimacy' };
  }
}

export async function clearAllIntimacy(): Promise<void> {
  try {
    const db = await initDB();
    await db.clear('intimacy');
  } catch (err) {
    if (isServiceError(err)) throw err;
    throw { code: 'DB_ERROR', message: (err as Error).message ?? 'Failed to clear intimacy' };
  }
}
