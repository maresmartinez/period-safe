# Spec: Privacy-Respecting Analytics + Privacy Page

## Context
PeriodSafe's core promise is that health data never leaves the browser. We want to add opt-in
anonymous usage analytics (via Vercel Analytics) while staying true to that promise, by:
- Being transparent about what we collect on a dedicated `/privacy` page
- Making analytics opt-in with default OFF
- Updating the PrivacyBanner "Learn more" to link to the new page (currently opens a modal)
- Adding a footer link to the privacy page on desktop

---

## Files to Create (2 new)

| File | Purpose |
|------|---------|
| `src/components/navigation/PrivacyPage.tsx` | Full privacy philosophy + analytics explainer page |
| `src/components/navigation/Footer.tsx` | Desktop-only footer with "Privacy & Analytics" link |

## Files to Modify (7 existing)

| File | Change |
|------|--------|
| `src/types.ts` | Add `analyticsEnabled: boolean` to `UserSettings` interface |
| `src/services/settingsService.ts` | Add `analyticsEnabled: false` to `DEFAULTS` |
| `src/App.tsx` | Add `useSettings`, conditional `<Analytics>`, `/privacy` route, `<Footer>`, `flex flex-col` + `flex-1` on layout |
| `src/components/settings/SettingsPage.tsx` | Add 4th "Privacy & Analytics" card section with toggle + link |
| `src/components/PrivacyBanner.tsx` | Replace Modal + button with `<Link to="/privacy">`, update copy |
| `src/components/navigation/Navigation.test.tsx` | Add PrivacyPage + Footer tests |
| `src/components/settings/SettingsPage.test.tsx` | Fix `getByRole('switch')` ambiguity, add `MemoryRouter` wrapper, add analytics toggle tests |

## Package install (1 command)
```
npm install @vercel/analytics
```

---

## Step-by-Step Implementation

### 1. Install package
```
npm install @vercel/analytics
```

### 2. `src/types.ts`
Add `analyticsEnabled: boolean` between `theme` and `schemaVersion`:
```typescript
export interface UserSettings {
  cycleLengthAverage: number;
  cycleVariance: number;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  theme: 'light' | 'dark';
  analyticsEnabled: boolean;   // NEW
  schemaVersion: 1;
}
```
Safe for existing users: `settingsService` uses `{ ...DEFAULTS, ...parsed }` so missing field
defaults to `false`.

### 3. `src/services/settingsService.ts`
Add to `DEFAULTS`:
```typescript
analyticsEnabled: false,   // opt-in, default OFF
```
No other changes needed.

### 4. `src/components/navigation/PrivacyPage.tsx` (NEW)
Full-page document with 5 sections using `aria-labelledby` on each `<section>`:
1. **What we store locally** — IndexedDB (periods), localStorage (settings); health data never leaves device
2. **What analytics we collect (opt-in only)** — page views + web vitals via Vercel Analytics (cookieless)
3. **What we do NOT collect** — dates, symptoms, flow, mood, notes; no health data whatsoever
4. **Technical safeguard** — `beforeSend` filter drops any event whose URL contains health-related strings; belt-and-suspenders since routes never contain health data anyway
5. **Managing your preference** — analytics off by default; link to `Settings → Privacy & Analytics`

Footer of page: "← Back to app" link to `/`.
Styling: `max-w-2xl mx-auto px-4 py-8`, `text-rose-600 dark:text-rose-400` for links.
No props needed — pure presentational.

### 5. `src/components/navigation/Footer.tsx` (NEW)
Desktop-only (`hidden md:block`), sits below `<main>` in the layout:
```tsx
<footer aria-label="Site footer" className="hidden md:block border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-4 px-4">
  <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
    <span><strong>PeriodSafe</strong> — your health data, your device</span>
    <Link to="/privacy" className="underline hover:text-neutral-700 dark:hover:text-neutral-200 ...">
      Privacy &amp; Analytics
    </Link>
  </div>
</footer>
```
`max-w-4xl` matches `Header.tsx` so content aligns. Hidden on mobile (BottomNav covers bottom).

### 6. `src/App.tsx`
Three changes:

**a) New lazy import + route:**
```typescript
const PrivacyPage = lazy(() => import('./components/navigation/PrivacyPage.tsx'));
// add inside <Routes> before * catch-all:
<Route path="/privacy" element={<PrivacyPage />} />
```

**b) Conditional Analytics — add at module level (outside component to avoid re-renders):**
```typescript
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import useSettings from './hooks/useSettings.ts';
import Footer from './components/navigation/Footer.tsx';

const BLOCKED_TERMS = ['symptom', 'cramp', 'flow', 'mood', 'period-data'];
function filterSensitiveData(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = event.url.toLowerCase();
  return BLOCKED_TERMS.some((t) => url.includes(t)) ? null : event;
}
```
Inside `App()`:
```typescript
const { settings } = useSettings();
// render conditionally:
{settings.analyticsEnabled && <Analytics beforeSend={filterSensitiveData} />}
```

**c) Layout — add `flex flex-col` + `flex-1` so Footer pushes to bottom:**
```tsx
<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
  <Header />
  <TabNav />
  <main className="pb-20 md:pb-0 md:pt-4 flex-1">...</main>
  <Footer />      {/* NEW — above BottomNav */}
  <BottomNav />
</div>
```

### 7. `src/components/settings/SettingsPage.tsx`
Add 4th Card section between Appearance and the Reset button. New import: `Link` from `react-router-dom`.

New handler:
```typescript
const handleAnalyticsToggle = () => {
  saveSettings({ analyticsEnabled: !settings.analyticsEnabled });
};
```

New section JSX — follows the same `role="switch"` + `aria-checked` pattern as Reminders, but NOT disabled:
```tsx
<section aria-labelledby="privacy-analytics-heading" className="mb-6">
  <Card>
    <h2 id="privacy-analytics-heading" ...>Privacy &amp; Analytics</h2>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium ...">Share anonymous usage metrics</p>
        <p id="analytics-desc" className="text-xs text-neutral-500 mt-1">
          Sends page views and web vitals to Vercel. No health data ever included.{' '}
          <Link to="/privacy" className="text-rose-600 underline ...">Learn more</Link>
        </p>
      </div>
      <button
        role="switch"
        aria-checked={settings.analyticsEnabled}
        aria-label="Share anonymous usage metrics"
        aria-describedby="analytics-desc"
        onClick={handleAnalyticsToggle}
        className={`... ${settings.analyticsEnabled ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-600'}`}
      >
        <span className={`... ${settings.analyticsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  </Card>
</section>
```
Toggle is a pill switch (h-6 w-11) with a sliding thumb (h-4 w-4 bg-white). Min touch target: `min-h-[48px]` on the button.

### 8. `src/components/PrivacyBanner.tsx`
- Remove: `showDetails` state, `Modal` import, entire `{showDetails && <Modal>...</Modal>}` block, `<>` fragment wrapper
- Add: `import { Link } from 'react-router-dom'`
- Replace the `<button onClick={() => setShowDetails(true)}>Learn more</button>` with:
  ```tsx
  <Link to="/privacy" className="text-sm text-rose-600 dark:text-rose-400 underline hover:no-underline font-medium">
    Learn more
  </Link>
  ```
- Update banner copy from:
  > "PeriodSafe stores all data locally on your device. Nothing is sent to any server."

  to:
  > "Health data stays on your device. Anonymous usage metrics are **off by default**."

- Add `items-center` to the button row div (Link + Got it button should align vertically).

### 9. `src/components/settings/SettingsPage.test.tsx`
- Wrap `renderWithToast` helper with `MemoryRouter` (needed because new section includes `<Link>`):
  ```typescript
  function renderWithToast(ui: ReactNode) {
    return render(<MemoryRouter><ToastProvider>{ui}</ToastProvider></MemoryRouter>);
  }
  ```
- Fix `'reminder toggle is disabled'` test: `getByRole('switch')` → `getByRole('switch', { name: /reminder/i })`
- Fix `'reminder toggle has aria-checked=false'` test: same query fix
- Add tests: renders "Privacy & Analytics" heading; analytics toggle defaults to `aria-checked="false"`; clicking toggle sets `aria-checked="true"`; "Learn more" link has `href="/privacy"`

### 10. `src/components/navigation/Navigation.test.tsx`
Add describe blocks for `PrivacyPage` and `Footer`:
- PrivacyPage: renders h1, has settings link `/settings`, has "← Back to app" link `/`, renders section headings
- Footer: renders app name, has link to `/privacy`, has `contentinfo` landmark role

---

## Implementation Order
Steps 2 & 3 must be done together (types + defaults).
Steps 4 & 5 can be done in parallel (no inter-dependency).
Step 6 depends on 4 & 5 (imports them).
Steps 7 & 8 are independent of each other.
Steps 9 & 10 come last.

---

## Verification

```bash
npm run typecheck   # 0 errors — verify BeforeSendEvent import, analyticsEnabled as boolean
npm run lint        # clean — verify no unused showDetails/Modal refs remain in PrivacyBanner
npm run test        # all tests pass including new ones
npm run build       # succeeds; bundle stays under 100KB gzip (@vercel/analytics is ~2KB)
```

**Manual checks:**
- Analytics OFF (default): no requests to `_vercel/insights` in DevTools Network tab
- Toggle analytics ON in Settings → requests appear on navigation
- "Learn more" in banner → navigates to `/#/privacy` (no modal)
- Footer visible on desktop, hidden on mobile
- PrivacyPage "Settings" link → navigates to `/#/settings`
- All new interactive elements reachable by keyboard with visible focus ring
- Dark mode: all new elements render correctly
