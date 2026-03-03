import { useState } from 'react';
import * as periodService from '../../services/periodService.ts';
import * as intimacyService from '../../services/intimacyService.ts';
import { useToast } from '../../hooks/useToast.ts';
import { periodsOverlap, formatShortDate } from '../../utils/dateUtils.ts';
import Button from '../Button.tsx';
import type { Period, FlowLevel, Intimacy } from '../../types.ts';

const SYMPTOMS = [
  'cramps',
  'fatigue',
  'headache',
  'bloating',
  'mood swings',
  'back pain',
  'nausea',
  'breast tenderness',
];

interface FlowOption {
  value: FlowLevel | '';
  label: string;
}

const FLOW_OPTIONS: FlowOption[] = [
  { value: '', label: 'Select flow...' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const MOOD_CONFIG: Record<1 | 2 | 3 | 4 | 5, { face: string; label: string }> = {
  1: { face: '😣', label: 'Horrible' },
  2: { face: '😟', label: 'Bad' },
  3: { face: '😐', label: 'Okay' },
  4: { face: '🙂', label: 'Good' },
  5: { face: '😄', label: 'Great' },
};

interface PeriodFormFields {
  startDate: string;
  endDate: string;
  flow: FlowLevel | '';
  symptoms: string[];
  mood: 1 | 2 | 3 | 4 | 5 | null;
  notes: string;
}

interface IntimacyFormFields {
  date: string;
  protection: 'protected' | 'unprotected' | '';
  notes: string;
}

interface FormErrors {
  startDate?: string;
  endDate?: string;
  date?: string;
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function handleDateInputClick(e: React.MouseEvent<HTMLInputElement>) {
  const isTouchDevice = navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    const input = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
    if (typeof input.showPicker === 'function') {
      e.preventDefault();
      input.showPicker();
    }
  }
}

function validate(fields: PeriodFormFields, existingPeriods: Period[], editId?: string): FormErrors {
  const errors: FormErrors = {};
  if (!fields.startDate) {
    errors.startDate = 'Start date is required.';
  } else if (fields.startDate > getTodayISO()) {
    errors.startDate = 'Start date cannot be in the future.';
  }
  if (fields.endDate && fields.startDate && fields.endDate < fields.startDate) {
    errors.endDate = 'End date must be on or after the start date.';
  }
  if (!errors.startDate) {
    const candidate = { startDate: fields.startDate, endDate: fields.endDate || null };
    const conflict = existingPeriods.find(
      (p) => p.id !== editId && periodsOverlap(candidate, p)
    );
    if (conflict) {
      errors.startDate = `These dates overlap with a period already logged starting ${formatShortDate(conflict.startDate)}. Please choose different dates.`;
    }
  }
  return errors;
}

function validateIntimacy(fields: IntimacyFormFields): { date?: string } {
  const errors: { date?: string } = {};
  if (!fields.date) {
    errors.date = 'Date is required.';
  } else if (fields.date > getTodayISO()) {
    errors.date = 'Date cannot be in the future.';
  }
  return errors;
}

const inputBase =
  'w-full rounded-lg border px-3 py-2 text-neutral-900 dark:text-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 min-h-[48px]';
const inputNormal = 'border-neutral-300 dark:border-neutral-600 focus:ring-rose-500';
const inputAmber = 'border-neutral-300 dark:border-neutral-600 focus:ring-amber-500';
const inputError = 'border-red-500 focus:ring-red-500';

interface LogEntryFormProps {
  initialData?: Period | null;
  existingPeriods?: Period[];
  onSuccess: (period: Period | Intimacy) => void;
  onCancel: () => void;
  initialMode?: 'period' | 'intimacy';
}

export default function LogEntryForm({
  initialData = null,
  existingPeriods = [],
  onSuccess,
  onCancel,
  initialMode = 'period',
}: LogEntryFormProps) {
  const isEditMode = Boolean(initialData?.id);

  const [mode, setMode] = useState<'period' | 'intimacy'>(initialMode);

  const [fields, setFields] = useState<PeriodFormFields>({
    startDate: initialData?.startDate ?? '',
    endDate: initialData?.endDate ?? '',
    flow: initialData?.flow ?? '',
    symptoms: initialData?.symptoms ?? [],
    mood: initialData?.mood ?? null,
    notes: initialData?.notes ?? '',
  });

  const [intimacyFields, setIntimacyFields] = useState<IntimacyFormFields>({
    date: '',
    protection: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  function setField<K extends keyof PeriodFormFields>(name: K, value: PeriodFormFields[K]) {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  }

  function setIntimacyField<K extends keyof IntimacyFormFields>(name: K, value: IntimacyFormFields[K]) {
    setIntimacyFields((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  }

  function toggleSymptom(symptom: string) {
    setFields((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === 'intimacy') {
      const validationErrors = validateIntimacy(intimacyFields);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const data: Omit<Intimacy, 'id' | 'schemaVersion'> = {
        date: intimacyFields.date,
        protection: intimacyFields.protection || null,
        notes: intimacyFields.notes || null,
      };

      try {
        setLoading(true);
        const saved = await intimacyService.createIntimacy(data);
        showToast({ type: 'success', message: 'Intimacy logged successfully.' });
        onSuccess(saved);
      } catch {
        showToast({ type: 'error', message: 'Failed to save. Please try again.' });
      } finally {
        setLoading(false);
      }
      return;
    }

    const validationErrors = validate(fields, existingPeriods, initialData?.id);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data: Omit<Period, 'id' | 'schemaVersion'> = {
      startDate: fields.startDate,
      endDate: fields.endDate || null,
      flow: fields.flow || null,
      symptoms: fields.symptoms,
      mood: fields.mood,
      notes: fields.notes || null,
    };

    try {
      setLoading(true);
      const saved = isEditMode
        ? await periodService.updatePeriod(initialData!.id, data)
        : await periodService.createPeriod(data);
      showToast({ type: 'success', message: 'Period logged successfully.' });
      onSuccess(saved);
    } catch {
      showToast({ type: 'error', message: 'Failed to save. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  const today = getTodayISO();

  const submitButtonText = mode === 'intimacy'
    ? 'Log intimacy'
    : (isEditMode ? 'Save changes' : 'Log period');

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={mode === 'intimacy' ? 'Log intimacy' : 'Log period'}>
      {/* Type Toggle */}
      <div role="tablist" className="flex mb-6 border-b border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'period'}
          onClick={() => setMode('period')}
          className={[
            'flex-1 min-h-[48px] text-sm font-medium transition-colors border-b-2 -mb-px',
            mode === 'period'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
          ].join(' ')}
        >
          Period
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'intimacy'}
          onClick={() => setMode('intimacy')}
          className={[
            'flex-1 min-h-[48px] text-sm font-medium transition-colors border-b-2 -mb-px',
            mode === 'intimacy'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
          ].join(' ')}
        >
          Intimacy
        </button>
      </div>

      {mode === 'intimacy' ? (
        <>
          {/* Date */}
          <div className="mb-4">
            <label
              htmlFor="intimacy-date"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Date{' '}
              <span aria-hidden="true" className="text-amber-500">
                *
              </span>
            </label>
            <input
              type="date"
              id="intimacy-date"
              name="date"
              value={intimacyFields.date}
              max={today}
              onClick={handleDateInputClick}
              onChange={(e) => setIntimacyField('date', e.target.value)}
              aria-required="true"
              aria-describedby={errors.date ? 'intimacy-date-error' : undefined}
              className={`${inputBase} ${errors.date ? inputError : inputAmber}`}
            />
            {errors.date && (
              <p id="intimacy-date-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.date}
              </p>
            )}
          </div>

          {/* Protection */}
          <fieldset className="mb-4">
            <legend className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Protection
            </legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer min-h-[48px]">
                <input
                  type="radio"
                  name="protection"
                  value="protected"
                  checked={intimacyFields.protection === 'protected'}
                  onChange={() => setIntimacyField('protection', 'protected')}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Protected</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer min-h-[48px]">
                <input
                  type="radio"
                  name="protection"
                  value="unprotected"
                  checked={intimacyFields.protection === 'unprotected'}
                  onChange={() => setIntimacyField('protection', 'unprotected')}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Unprotected</span>
              </label>
            </div>
          </fieldset>

          {/* Notes */}
          <div className="mb-6">
            <label
              htmlFor="intimacy-notes"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Notes
            </label>
            <textarea
              id="intimacy-notes"
              name="notes"
              value={intimacyFields.notes}
              onChange={(e) => setIntimacyField('notes', e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Optional notes..."
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
            />
            <p className="mt-1 text-xs text-neutral-400 text-right" aria-live="polite">
              {intimacyFields.notes.length}/500
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Start Date */}
          <div className="mb-4">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Start date{' '}
              <span aria-hidden="true" className="text-rose-500">
                *
              </span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={fields.startDate}
              max={today}
              onClick={handleDateInputClick}
              onChange={(e) => setField('startDate', e.target.value)}
              aria-required="true"
              aria-describedby={errors.startDate ? 'startDate-error' : undefined}
              className={`${inputBase} ${errors.startDate ? inputError : inputNormal}`}
            />
            {errors.startDate && (
              <p id="startDate-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.startDate}
              </p>
            )}
          </div>

          {/* End Date */}
          <div className="mb-4">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
            >
              End date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={fields.endDate}
              max={today}
              min={fields.startDate || undefined}
              onClick={handleDateInputClick}
              onChange={(e) => setField('endDate', e.target.value)}
              aria-describedby={errors.endDate ? 'endDate-error' : undefined}
              className={`${inputBase} ${errors.endDate ? inputError : inputNormal}`}
            />
            {errors.endDate && (
              <p id="endDate-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.endDate}
              </p>
            )}
          </div>

          {/* Flow */}
          <div className="mb-4">
            <label
              htmlFor="flow"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Flow
            </label>
            <select
              id="flow"
              name="flow"
              value={fields.flow}
              onChange={(e) => setField('flow', e.target.value as FlowLevel | '')}
              className={`${inputBase} ${inputNormal}`}
            >
              {FLOW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Symptoms */}
          <fieldset className="mb-4">
            <legend className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Symptoms
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {SYMPTOMS.map((symptom) => (
                <label key={symptom} className="flex items-center gap-2 cursor-pointer min-h-[40px]">
                  <input
                    type="checkbox"
                    checked={fields.symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="w-4 h-4 accent-rose-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 capitalize">
                    {symptom}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Mood */}
          <div className="mb-4">
            <p
              id="mood-label"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Mood
            </p>
            <div role="group" aria-labelledby="mood-label" className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setField('mood', fields.mood === n ? null : n)}
                  aria-label={`Mood: ${MOOD_CONFIG[n].label}`}
                  aria-pressed={fields.mood === n}
                  className={[
                    'min-h-[48px] min-w-[48px] flex-1 rounded-lg border font-medium text-sm transition-colors py-2',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',
                    fields.mood === n
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-rose-300',
                  ].join(' ')}
                >
                  <span className="flex flex-col items-center gap-1">
                    <span className="text-xl leading-none" aria-hidden="true">{MOOD_CONFIG[n].face}</span>
                    <span className="text-xs leading-none">{MOOD_CONFIG[n].label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={fields.notes}
              onChange={(e) => setField('notes', e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Optional notes..."
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-neutral-900 dark:text-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-y"
            />
            <p className="mt-1 text-xs text-neutral-400 text-right" aria-live="polite">
              {fields.notes.length}/500
            </p>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
