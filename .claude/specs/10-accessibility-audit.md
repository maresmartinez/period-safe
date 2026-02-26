# Spec 10 — Accessibility Audit

## Goal

Systematically verify and remediate WCAG 2.1 AA compliance across the entire app. Integrate axe-core into the Vitest test suite, create a keyboard navigation checklist, audit ARIA on the calendar grid, verify color contrast ratios, and produce a screen reader test script.

**Dependency:** All prior specs (01–09) must be complete before this audit is meaningful.

---

## Deliverable Definition

- `src/utils/axe-helper.js` — utility to run axe-core in tests
- Axe-core integrated into existing component tests (not a separate test file per component)
- `docs/a11y-audit.md` — filled-in audit results with remediation status
- All critical and serious axe violations resolved
- Color contrast verified for all text/background combinations

---

## Scope

**In this slice:**
- Install `axe-core` + `@axe-core/react` (or `vitest-axe`)
- Run automated axe checks on all page components
- Manual keyboard nav checklist
- ARIA audit of the `CalendarGrid` component (highest complexity)
- Color contrast verification (4.5:1 for normal text, 3:1 for large text/UI components)
- Screen reader test script (manual procedure, not automated)
- Remediation of all `critical` and `serious` violations found

**Not in this slice:**
- Full automated E2E accessibility testing with a real browser (deferred)
- AAA-level compliance
- Accessibility statement page (covered in spec 12 polish)

---

## Implementation Notes

### Install axe-core for Vitest

```bash
npm install -D axe-core vitest-axe
```

Or use `@testing-library/jest-dom` + `axe-core` directly:
```bash
npm install -D axe-core jest-axe
```

Use `vitest-axe` if available for Vitest; otherwise wrap axe manually:

```js
// src/utils/axe-helper.js
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

export async function checkA11y(container) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}
```

### Axe integration in component tests

Add to existing test files (not new files per component):

```js
// In CalendarGrid.test.jsx:
it('has no accessibility violations', async () => {
  const { container } = render(<CalendarGrid periods={[]} predictions={[]} />);
  await checkA11y(container);
});
```

Add axe checks to: `PeriodForm`, `CalendarGrid`, `PeriodDetailModal`, `SettingsPage`, `ImportExportPage`, `Button`, `Modal`, `Toast`.

### Keyboard navigation checklist

Verify each item manually and document results in `docs/a11y-audit.md`:

**PeriodForm:**
- [ ] Tab reaches all inputs in logical order
- [ ] Symptom checkboxes reachable and togglable via Space
- [ ] Mood picker buttons activatable via Space/Enter
- [ ] Submit button reachable and activatable via Enter
- [ ] Error messages announced to screen reader when form is submitted invalid

**CalendarGrid:**
- [ ] Arrow keys navigate between cells
- [ ] Enter/Space opens detail modal on period days
- [ ] Home/End navigate to first/last day of week
- [ ] PageUp/PageDown change month
- [ ] ESC closes detail modal and returns focus to triggering cell

**Settings page:**
- [ ] Cycle length input reachable; increment/decrement via keyboard
- [ ] Theme toggle activatable via keyboard
- [ ] Save button reachable and functional

**Navigation:**
- [ ] Tab through all bottom nav items
- [ ] Tab through all header links
- [ ] Skip-to-main-content link (add one if missing)

**Modal (generic):**
- [ ] Focus moves inside modal on open
- [ ] Tab cycles only within modal (focus trap)
- [ ] ESC closes modal
- [ ] Focus returns to trigger element on close

### ARIA audit of CalendarGrid

Verify the following programmatically (add specific assertions to `CalendarGrid.test.jsx`):

- `<table>` has `role="grid"` and `aria-label` with month/year
- Column headers have `role="columnheader"` and `abbr` attribute for day abbreviation
- Each cell has `role="gridcell"`
- Period cells have `aria-label` in format: "Monday, January 15, 2025, has period"
- Predicted period cells include "predicted period" in `aria-label`
- `aria-selected` is set on the currently focused cell
- `tabIndex={0}` on focused cell only; `-1` on all others (roving tabindex)

### Color contrast verification

Use the [WCAG contrast ratio formula](https://www.w3.org/TR/WCAG21/#contrast-minimum).

Check all combinations that appear in the UI:

| Foreground | Background | Expected | Must meet |
|------------|-----------|----------|-----------|
| `neutral-900` | `neutral-50` (light mode body) | ≥ 4.5:1 | Normal text |
| `white` | `rose-500` (primary button) | ≥ 4.5:1 | Normal text |
| `neutral-100` | `neutral-700` (secondary btn dark) | ≥ 4.5:1 | Normal text |
| `white` | period day cell background | ≥ 4.5:1 | Normal text |
| `rose-500` | `neutral-50` (active nav, light mode) | ≥ 3:1 | UI component |
| `neutral-500` | `neutral-50` (placeholder text) | ≥ 4.5:1 | Normal text |

Use a contrast checker tool (e.g., `polished` library or manual calculation). Document results in `docs/a11y-audit.md`. Adjust color tokens in `tailwind.config.js` if any fail.

### Skip link

Add a skip-to-content link as the first element in `<body>` (in `App.jsx`):

```jsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow"
>
  Skip to main content
</a>
<main id="main-content" ...>
```

### Screen reader test script (manual)

Document in `docs/a11y-audit.md` — a step-by-step procedure for testing with a screen reader:

1. **Tool:** VoiceOver (macOS/iOS) or NVDA (Windows)
2. **Test: Log a period**
   - Navigate to Log Period page
   - Verify form fields are announced with their labels
   - Verify error messages are announced after invalid submission
   - Verify success toast is announced
3. **Test: Calendar navigation**
   - Navigate to Calendar page
   - Verify month/year announced
   - Move through cells with arrow keys; verify date announced with period status
   - Open period detail; verify all fields announced
4. **Test: Settings**
   - Navigate to Settings
   - Verify toggle states announced (on/off)
5. **Document:** Pass / Fail / Issue for each step

---

## Acceptance Criteria

- [ ] `npm run test` — zero axe violations at `critical` or `serious` severity on all audited components
- [ ] Calendar grid has correct ARIA grid roles and roving tabindex
- [ ] All form fields have programmatically associated labels (`<label for>` or `aria-labelledby`)
- [ ] Modal focus trap works — Tab cannot escape the open modal
- [ ] Skip-to-content link present and functional
- [ ] Color contrast: all text combinations ≥ 4.5:1; UI components ≥ 3:1 (verified and documented)
- [ ] Keyboard navigation checklist completed and documented with no unresolved blockers
- [ ] `docs/a11y-audit.md` exists and contains audit results

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `10-accessibility-audit.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record the axe-core setup pattern, the skip link pattern, any color token adjustments made to pass contrast checks, and the roving tabindex pattern used in the calendar.

3. **Update `README.md`:** Add an "Accessibility" section noting WCAG 2.1 AA target, keyboard navigation support, and screen reader compatibility (VoiceOver/NVDA tested).
