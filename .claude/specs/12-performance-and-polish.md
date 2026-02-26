# Spec 12 — Performance & Polish

## Goal

Bring the app to MVP-complete quality: meet Lighthouse CI targets, add React error boundaries, verify calendar performance with 500 periods, add a privacy notice banner, and complete a full manual smoke test across browsers. Finalize README for public readability.

**Dependency:** All prior specs (01–11) must be complete. This is the final MVP slice.

---

## Deliverable Definition

- Lighthouse CI: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90, SEO ≥ 80
- React error boundaries on all page-level routes
- Calendar renders 500 periods without visible lag (< 100ms)
- Privacy notice banner on first visit
- Manual smoke test checklist completed and signed off
- `README.md` finalized for public readership

---

## Scope

**In this slice:**
- React error boundary component wrapping each route
- Lighthouse CI: measure current scores and fix any issues blocking targets
- 500-period performance test (manual + automated)
- Privacy notice banner (one-time, dismissible, persisted via localStorage)
- Manual smoke test procedure and results documented in `docs/smoke-test.md`
- README finalization: all sections accurate, setup instructions verified, screenshots if possible

**Not in this slice:**
- Service Worker / offline mode (post-MVP)
- Web Vitals reporting to any external service
- Automated cross-browser E2E testing (manual is sufficient)

---

## Implementation Notes

### React error boundaries

Create `src/components/ErrorBoundary.jsx`:

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Only log non-sensitive info; never log user data
    console.error('[PeriodSafe Error]', error.name, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-neutral-600 mb-4">
            Please refresh the page. Your data is safe and stored locally.
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Wrap each lazy-loaded route in `App.jsx`:
```jsx
<ErrorBoundary>
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>...</Routes>
  </Suspense>
</ErrorBoundary>
```

### Lighthouse CI

Run Lighthouse locally first:
```bash
npx lighthouse http://localhost:5173 --output=html --output-path=./lighthouse-report.html
```

Or install `@lhci/cli`:
```bash
npm install -D @lhci/cli
```

Create `.lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173/", "http://localhost:5173/#/settings"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 1.0}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["warn", {"minScore": 0.8}]
      }
    }
  }
}
```

Common performance fixes if score is low:
- Ensure Inter font uses `font-display: swap` (add `&display=swap` to Google Fonts URL — already in spec 08)
- Verify lazy loading is working (check network waterfall in DevTools)
- Remove unused CSS (Tailwind purge is configured in `content` paths — verify)
- Add `<meta name="description">` to `index.html` for SEO

### 500-period performance check

Write a test helper that seeds 500 periods into `fake-indexeddb` and measures calendar render time:

```js
// src/components/calendar/CalendarGrid.perf.test.jsx
it('renders 500 periods within 100ms', async () => {
  const periods = generateTestPeriods(500); // utility: 500 periods over 10+ years
  const start = performance.now();
  render(<CalendarGrid periods={periods} predictions={[]} />);
  const elapsed = performance.now() - start;
  expect(elapsed).toBeLessThan(100);
});
```

Also test manually in Chrome DevTools Performance tab with 500 seeded periods.

### Privacy notice banner

Show on first visit (check `localStorage.getItem('periodSafe_privacyAcknowledged')`). Persist dismiss action.

```jsx
// src/components/PrivacyBanner.jsx
// Fixed bottom of screen (above bottom nav)
// Content: "PeriodSafe stores all data locally on your device. Nothing is sent to any server."
// Link: "Learn more" → opens a simple modal with full privacy explanation
// Button: "Got it" — sets localStorage flag and dismisses
// aria-live="polite" so screen readers announce it
// Not shown if localStorage flag is set
```

### `meta` tags for SEO / social

Add to `index.html`:
```html
<meta name="description" content="PeriodSafe — a private, local-first period tracker. Your data never leaves your device.">
<meta name="theme-color" content="#f43f5e">
<meta property="og:title" content="PeriodSafe">
<meta property="og:description" content="Track your cycle privately. All data stored locally.">
```

### Manual smoke test

Create `docs/smoke-test.md` with the following procedure. Execute before marking this spec complete:

**Environment:** Chrome (latest), Firefox (latest), Safari (latest), real iOS or Android device

For each browser/device:

- [ ] Load app from production URL (or localhost)
- [ ] Privacy banner appears on first visit; dismissing hides it on next refresh
- [ ] Log a period with all fields filled (flow, symptoms, mood, notes)
- [ ] Period appears on calendar in correct date range with highlighted style
- [ ] Navigate to next/prev month — no performance issues
- [ ] Log a second period; verify prediction appears on calendar
- [ ] Prediction has a visually distinct (lighter) style from logged periods
- [ ] Toggle dark mode in Settings; verify theme applies immediately and persists on refresh
- [ ] Adjust cycle length in Settings; save; verify persists on refresh
- [ ] Export data as JSON; open JSON file; verify correct structure
- [ ] Clear all data; verify calendar shows empty
- [ ] Import the previously exported JSON; choose "Overwrite"; verify periods restored
- [ ] Keyboard-only navigation: complete the log form without mouse
- [ ] Run `npm run test` — all tests pass

**Document results** in `docs/smoke-test.md` with date, browser versions, and any issues found.

### README finalization

Final README must include:
- [ ] Project description (1–2 paragraphs, non-technical)
- [ ] Privacy statement (prominent, near top)
- [ ] Screenshot or demo GIF (add if possible)
- [ ] Features list (all MVP features)
- [ ] Setup instructions (clone, install, `npm run dev`)
- [ ] Deployment instructions (Vercel)
- [ ] Tech stack section
- [ ] Accessibility note
- [ ] Contributing guidelines (brief)
- [ ] License

---

## Acceptance Criteria

- [ ] Lighthouse Performance score ≥ 90 on production URL
- [ ] Lighthouse Accessibility score = 100
- [ ] Error boundary wraps all routes; triggering an error shows friendly UI, not a blank page
- [ ] Calendar renders 500 periods in < 100ms (automated test passes)
- [ ] Privacy banner appears on first visit; dismissed state persists across refresh
- [ ] Manual smoke test completed in Chrome, Firefox, and Safari — all steps pass
- [ ] `docs/smoke-test.md` exists with dated results
- [ ] README is complete and accurate (all sections present)
- [ ] `npm run test` → all tests pass
- [ ] All 12 spec checkboxes in `overview.md` are marked `[x]`

---

## Slice Completion Checklist

This is the final slice. On completion, the MVP is done.

1. **Update `overview.md`:** Mark `12-performance-and-polish.md` checkbox as `[x]` and update the progress counter to "12 / 12 complete". Update "Definition of MVP Complete" smoke test checkboxes.

2. **Update `CLAUDE.md`:** Record the `ErrorBoundary` component location, the privacy banner pattern (`localStorage` flag key: `periodSafe_privacyAcknowledged`), and the Lighthouse CI config file location (`.lighthouserc.json`).

3. **Update `README.md`:** Mark the README as finalized. Ensure the live Vercel URL is included.

**MVP is complete when all 12 boxes in `overview.md` are checked and the smoke test passes.**
