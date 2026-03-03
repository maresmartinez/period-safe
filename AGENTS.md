# AGENTS.md — PeriodSafe Developer Guide

This file provides context for agentic coding agents working in this repository.

## Project Overview

PeriodSafe is a local-first period tracker web app. No backend. All data stays in the browser (IndexedDB + localStorage).

- **Framework:** React 19 + TypeScript
- **Build:** Vite 7
- **Styling:** Tailwind CSS v4 (CSS-first config)
- **Testing:** Vitest + React Testing Library + fake-indexeddb
- **Router:** React Router v7 (HashRouter)
- **State:** React Context + useReducer

---

## Commands

```bash
# Development
npm run dev              # Start Vite dev server at http://localhost:5173

# Build & Preview
npm run build            # Production build → dist/
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint on entire codebase
npm run lint -- --fix    # Auto-fix lint issues

# Type Checking
npm run typecheck        # Run TypeScript type checker (noEmit)

# Testing
npm run test             # Run all tests once (Vitest)
npm run test:watch       # Run tests in watch mode
npm run test -- path/to/file.test.tsx    # Run single test file
npm run test -- -t "test name"          # Run single test by name
npm run test -- --grep "pattern"         # Run tests matching pattern

# Bundle Size
npm run check-size        # Check gzipped bundle < 100KB
```

---

## Code Style Guidelines

### General

- **2-space indents** (no tabs)
- **Prettier + ESLint** enforcement — run both before committing
- **No comments** unless explaining complex algorithms or non-obvious decisions
- **No new dependencies** without discussing with the team

### File Organization

```
src/
  components/          # React components (one file per component)
    calendar/          # Calendar-related components
    period-form/       # Period logging form
    settings/          # Settings page
    import-export/     # Import/export page
    navigation/        # Header, BottomNav, TabNav
  hooks/               # Custom React hooks (one file per hook)
  services/            # Data access layer (IndexedDB + localStorage)
  utils/               # Pure utility functions
  stores/              # Context providers
```

### Naming Conventions

| Type              | Convention              | Example                  |
| ----------------- | ----------------------- | ------------------------ |
| Components        | PascalCase              | `CalendarGrid.tsx`       |
| Hooks             | camelCase, `use` prefix | `usePeriodData.ts`       |
| Services          | camelCase               | `periodService.ts`       |
| Utilities         | camelCase               | `dateUtils.ts`           |
| Types/Interfaces  | PascalCase              | `Period`, `UserSettings` |
| Constants         | SCREAMING_SNAKE         | `SCHEMA_VERSION`         |
| Files (utilities) | camelCase               | `cyclePrediction.ts`     |

### Imports

- **Use explicit `.ts`/`.tsx` extensions** in imports
- **Absolute-style paths** via relative imports from `src/`
- **Type imports** via `import type { ... }`
- **Group order:** React imports → external libs → internal services/hooks → internal utils → internal components

```typescript
// Good
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as periodService from '../services/periodService.ts';
import { useToast } from '../hooks/useToast.ts';
import { formatShortDate } from '../utils/dateUtils.ts';
import Button from '../components/Button.tsx';
import type { Period, FlowLevel } from '../types.ts';
```

### TypeScript

- **Always use explicit types** for function parameters and return types
- **Avoid `any`** — use `unknown` with proper narrowing if needed
- **Use `type` for simple type aliases**, `interface` for object shapes
- **Export types** that are used across modules

```typescript
// Good
interface PeriodFormFields {
  startDate: string;
  endDate: string;
  flow: FlowLevel | '';
}

export async function getPeriod(id: string): Promise<Period | null>

// Avoid
const getPeriod = async (id) => { ... }
```

### React Patterns

- **Default export** for page components, **named exports** for hooks/utilities
- **Function components only** — no class components
- **useCallback/useMemo** for functions/values passed to memoized children
- **useEffect dependencies** — include all used values; use `// eslint-disable-next-line` sparingly for known-safe omissions

```typescript
// Hook pattern (named export)
export default function usePeriodData(): UsePeriodDataReturn { ... }

// Component pattern (default export)
export default function PeriodForm({ ... }) { ... }
```

### Error Handling

- **Service layer throws structured errors:**
  ```typescript
  throw { code: 'DB_ERROR', message: 'Failed to get period' };
  throw { code: 'VALIDATION_ERROR', message: 'startDate is required' };
  throw { code: 'NOT_FOUND', message: 'Period not found' };
  ```
- **Error codes:** `'DB_ERROR'`, `'NOT_FOUND'`, `'VALIDATION_ERROR'`
- **Callers must use try/catch** for all async service calls
- **Use `isServiceError()` guard** to distinguish service errors from unexpected exceptions

```typescript
try {
  const period = await periodService.getPeriod(id);
} catch (err) {
  if (isServiceError(err)) {
    showToast({ type: 'error', message: err.message });
  } else {
    showToast({ type: 'error', message: 'An unexpected error occurred' });
  }
}
```

### Tailwind CSS v4

- **CSS-first config** — no `tailwind.config.js`
- **Define custom properties** in `src/index.css` `@theme {}` block
- **Dark mode:** Use `dark:` variant; apply `dark` class to `document.documentElement`
- **No arbitrary values** — extend theme instead (e.g., add `--color-rose-500` to theme)
- **Touch targets:** Minimum 48px height for buttons/inputs

```tsx
// Dark mode
<div className="bg-white dark:bg-neutral-800">
  <button className="min-h-[48px] ...">
```

### Accessibility (WCAG 2.1 AA)

- **All interactive elements** must be keyboard-reachable
- **Color contrast:** 4.5:1 for text, 3:1 for large text
- **Use semantic HTML:** `<button>`, `<input>`, `<fieldset>`, `<legend>`
- **ARIA attributes:** `aria-label`, `aria-pressed`, `role="alert"`, `aria-live`
- **Forms:** Labels linked via `htmlFor`/`id`, errors with `role="alert"`

### Testing

- **Test file location:** Same directory as source, `.test.tsx` or `.test.ts` suffix
- **Use RTL (React Testing Library)** — test user-facing behavior, not implementation
- **Fake timers:** Use `vi.useFakeTimers()` with `fireEvent` (not `userEvent`)
- **IndexedDB:** Use `import 'fake-indexeddb/auto'` in test setup
- **Reset DB between tests:** Call `resetDB()` from `src/services/db.ts` in `beforeEach`

```typescript
// Test pattern
import { render, screen, fireEvent } from '@testing-library/react';
import PeriodForm from './PeriodForm.tsx';

describe('PeriodForm', () => {
  beforeEach(() => {
    resetDB();
    clearAllPeriods();
    resetSettings();
  });

  it('shows error when start date is empty', () => {
    render(<PeriodForm onSuccess={fn} onCancel={fn} />);
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByRole('alert')).toHaveTextContent('Start date is required');
  });
});
```

---

## Key Files

| File                               | Purpose                         |
| ---------------------------------- | ------------------------------- |
| `src/services/periodService.ts`    | IndexedDB CRUD for periods      |
| `src/services/settingsService.ts`  | localStorage for user settings  |
| `src/services/db.ts`               | IndexedDB initialization        |
| `src/hooks/usePeriodData.ts`       | Period data + CRUD actions      |
| `src/hooks/usePeriodPrediction.ts` | Cycle prediction logic          |
| `src/types.ts`                     | All TypeScript interfaces/types |
| `src/config.ts`                    | App constants (version, schema) |
| `src/index.css`                    | Tailwind v4 theme + base styles |

---

## Important Constraints

1. **No data transmission** — no fetch/XHR to external servers
2. **No PII logging** — console logs must never contain dates, symptoms, or user data
3. **48px minimum touch targets** on mobile
4. **Bundle size < 100KB gzipped** — run `npm run check-size` before deploying
5. **"Clear all data" must clear ALL data** — when adding new data types (periods, intimacy, symptoms, medications, etc.), you MUST update `ImportExportPage.handleClearConfirm()` to call the corresponding `clearAll*()` function. This button should delete everything.
