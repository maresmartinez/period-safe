# Spec 09 — Navigation & Layout

## Goal

Wire up the full application shell: `App.jsx` with React Router v6 routes, a `Header` component, bottom navigation for mobile / tab navigation for desktop, active route indicators, page-level lazy loading with Suspense, and a 404 fallback. This spec integrates all page components built in specs 03–08 into a unified navigable app.

**Dependency:** Requires specs 03, 04, 06, 07, and 08 to be complete (the pages and design system must exist to route to them).

---

## Deliverable Definition

- `src/App.jsx` — router setup + page routes + Suspense
- `src/components/navigation/Header.jsx` — top bar with title + settings icon
- `src/components/navigation/BottomNav.jsx` — mobile bottom navigation
- `src/components/navigation/TabNav.jsx` — desktop tab navigation
- `src/components/navigation/NotFoundPage.jsx` — 404 fallback page
- Tests for route rendering and active state

---

## Scope

**In this slice:**
- React Router v6 setup (`BrowserRouter` or `HashRouter` — use `HashRouter` for Vercel SPA compatibility)
- Route definitions for all four pages: Home (Calendar), Log Period, Settings, Import/Export
- `Header` with app title ("PeriodSafe") and a settings icon link
- Bottom nav for mobile (≤768px): icons + labels for all 4 routes
- Tab nav for desktop (>768px): horizontal tabs with active indicator
- Active route highlighted in nav
- Lazy loading: each page component wrapped in `React.lazy()` + `Suspense`
- 404 page for unmatched routes
- "Log Period" button accessible from the calendar page (floating action button on mobile)

**Not in this slice:**
- Breadcrumbs or deeply nested navigation
- Animated page transitions (deferred)
- Back-button handling beyond React Router defaults

---

## Implementation Notes

### Router choice

Use `HashRouter` (routes like `/#/settings`) for Vercel SPA deployments without custom rewrite rules.

```jsx
// src/main.jsx
import { HashRouter } from 'react-router-dom';
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
```

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `CalendarPage` (lazy) | Calendar view — default/home |
| `/log` | `PeriodFormPage` (lazy) | Log/edit period form |
| `/settings` | `SettingsPage` (lazy) | Settings page |
| `/export` | `ImportExportPage` (lazy) | Import/Export page |
| `*` | `NotFoundPage` | 404 fallback |

### `App.jsx` structure

```jsx
function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header />
        <main className="pb-20 md:pb-0 md:pt-4">  {/* pb-20 = space for bottom nav */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/log" element={<PeriodFormPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/export" element={<ImportExportPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav className="md:hidden" />
        <TabNav className="hidden md:flex" />
      </div>
    </ToastProvider>
  );
}
```

### `Header` component

```jsx
// Desktop: "PeriodSafe" title on left + settings gear icon on right
// Mobile: "PeriodSafe" title centered, settings icon right
// Settings icon is an SVG gear or Heroicons icon; links to /settings
// Sticky top (position: sticky, top: 0, z-index high enough to overlay content)
// Height: 56px; background matches page bg with shadow-sm
// Privacy indicator: small lock icon + "Local only" text (subtle, in header)
```

### `BottomNav` component (mobile)

```jsx
// 4 items: Calendar (home icon), Log (plus icon), Export (download icon), Settings (gear icon)
// Fixed bottom, full width, height 64px
// Active item: highlighted with rose-500 color
// Each item: icon (SVG, 24px) + label (text-xs) stacked vertically
// Uses NavLink from react-router-dom for automatic active class
// aria-label on nav element: "Main navigation"
// aria-current="page" on active item
```

### `TabNav` component (desktop)

```jsx
// Horizontal tabs below the header (or integrated into header)
// Same 4 items as bottom nav
// Active indicator: rose underline or background pill
// Uses NavLink; keyboard navigable (Tab + Enter)
```

### "Log Period" floating action button (FAB)

On the Calendar page only, render a FAB (bottom-right, above bottom nav) that links to `/log`:
```jsx
// Mobile only (md:hidden)
// Circular button, rose-500 background, white plus icon
// aria-label="Log new period"
// z-index: above calendar, below modal
```

### `NotFoundPage`

```jsx
// Minimal: "Page not found" heading + link back to home
// No distracting UI
```

### Theme initialization

In `main.jsx` (before React renders), read the saved theme from localStorage and apply the `dark` class:

```js
const settings = JSON.parse(localStorage.getItem('periodSafe_userSettings') || '{}');
if (settings.theme === 'dark') {
  document.documentElement.classList.add('dark');
}
```

This prevents flash of wrong theme on load.

### Test cases
- Renders CalendarPage at route `/`
- Renders SettingsPage at route `/settings`
- Renders NotFoundPage for unknown route
- BottomNav active item changes when route changes
- Header renders with title "PeriodSafe"
- Navigating to `/log` renders the period form

---

## Acceptance Criteria

- [ ] `npm run dev` → all 4 routes navigable without 404
- [ ] `HashRouter` used (URLs contain `#/`)
- [ ] Bottom nav visible on mobile (≤768px), hidden on desktop
- [ ] Tab nav visible on desktop, hidden on mobile
- [ ] Active route item highlighted in both nav variants
- [ ] Navigating between routes renders the correct page component
- [ ] `*` route renders `NotFoundPage` with link back to home
- [ ] Page components are lazy-loaded (check network tab for code splitting)
- [ ] FAB visible on calendar page on mobile; links to `/log`
- [ ] Dark/light theme applied before first render (no flash)
- [ ] All tests pass (`npm run test`)

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `09-navigation-layout.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record the router type (`HashRouter`), all route paths, the `App.jsx` structure, the `ToastProvider` wrapping pattern, and the theme initialization pattern in `main.jsx`.

3. **Update `README.md`:** Add a "Navigation" or "App Structure" section listing the four pages and what each does. Update the setup instructions if `react-router-dom` is a new dependency.
