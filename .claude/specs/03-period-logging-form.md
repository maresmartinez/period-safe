# Spec 03 — Period Logging Form

## Goal

Build the `PeriodForm` component that lets users log a period with all MVP fields, validates input, writes to `periodService.createPeriod`, and provides toast feedback on success or error.

**Dependency:** Requires spec 08 (UI design system) primitives — `Button`, `Modal`, `Toast` — to be available before building this component.

---

## Deliverable Definition

- `src/components/period-form/PeriodForm.jsx` — fully functional form component
- `src/components/period-form/PeriodForm.test.jsx` — behavior tests with React Testing Library
- Form is accessible and works on mobile (320px viewport)

---

## Scope

**In this slice:**
- All form fields: startDate (required), endDate, flow select, symptoms multi-select, mood picker (1–5), notes textarea
- Client-side validation with user-visible error messages
- `periodService.createPeriod` integration
- Toast notification on success and error
- Loading state while saving
- Edit mode (pre-populate fields when editing existing period) — same component, different prop

**Not in this slice:**
- Navigation away from form after save (that's spec 09)
- Displaying logged periods on the calendar (spec 04)
- The modal shell that contains this form (the form renders inside whatever container its parent provides)
- Delete period functionality (out of MVP form scope; done from detail view)

---

## Implementation Notes

### Component API
```jsx
<PeriodForm
  initialData={period | null}   // null = create, Period object = edit
  onSuccess={(period) => void}  // called with saved period on success
  onCancel={() => void}         // called when user cancels
/>
```

### Fields

| Field | Input type | Required | Validation |
|-------|-----------|----------|------------|
| Start date | `<input type="date">` | Yes | Must be valid date; not in the future |
| End date | `<input type="date">` | No | Must be ≥ start date |
| Flow | `<select>` | No | Options: Light, Medium, Heavy |
| Symptoms | Checkbox group | No | Multi-select; predefined list |
| Mood | Radio group (1–5) or button row | No | 1–5 integer |
| Notes | `<textarea>` | No | Max 500 chars |

### Symptoms list (predefined)
`['cramps', 'fatigue', 'headache', 'bloating', 'mood swings', 'back pain', 'nausea', 'breast tenderness']`

### Mood picker
Render 5 clickable buttons labeled 1–5 (or emoji scale). Selected value highlighted with a distinct style. Accessible: each button has `aria-label` like "Mood: 3 out of 5".

### Validation behavior
- Show errors inline below the relevant field (not a summary at top)
- Error styling: red border + red helper text
- Do not prevent form submission — show errors on submit attempt (not on blur for MVP)
- Clear error for a field when the user changes its value

### Service integration
```js
// In form submit handler:
try {
  setLoading(true);
  const saved = await periodService.createPeriod(formData);
  showToast({ type: 'success', message: 'Period logged successfully.' });
  onSuccess(saved);
} catch (err) {
  showToast({ type: 'error', message: 'Failed to save. Please try again.' });
} finally {
  setLoading(false);
}
```

### State management
Use local component state (`useState`) — no global state needed for the form itself. Parent components update global state via the `onSuccess` callback.

### Accessibility requirements
- All inputs have associated `<label>` elements (not placeholder-only)
- Error messages have `role="alert"` and are associated with their input via `aria-describedby`
- Form has a submit button that shows a loading spinner (from spec 08) while saving
- Symptom checkboxes grouped in a `<fieldset>` with a `<legend>`
- Mood picker buttons have clear `aria-label` values
- Tab order is logical (top to bottom)

### Test cases to cover
- Renders all fields
- Submit without startDate → shows validation error
- Submit with endDate before startDate → shows validation error
- Submit valid form → calls `periodService.createPeriod` with correct shape
- `periodService.createPeriod` throws → shows error toast, does not call `onSuccess`
- `periodService.createPeriod` succeeds → shows success toast, calls `onSuccess` with period
- Edit mode: form pre-populates with `initialData` values

---

## Acceptance Criteria

- [ ] Form renders all 6 field types without console errors
- [ ] Submitting with missing `startDate` shows inline error; `createPeriod` is NOT called
- [ ] Submitting with `endDate` before `startDate` shows inline error
- [ ] Successful submit: `createPeriod` called with correct data shape including `symptoms` array and `schemaVersion`
- [ ] Success toast visible after successful save
- [ ] Error toast visible when `createPeriod` throws
- [ ] Loading state (button disabled + spinner) shown during save
- [ ] Form is keyboard-navigable (Tab through all fields, Space/Enter on checkboxes/buttons)
- [ ] All inputs have visible labels (no placeholder-only labels)
- [ ] All tests pass (`npm run test`)
- [ ] Renders correctly at 320px viewport width (no horizontal overflow)

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `03-period-logging-form.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record the `PeriodForm` component API (props), the symptoms list, any hook or utility added during implementation (e.g., `useForm` helper if created), and the validation approach used.

3. **Update `README.md`:** Add "Period Logging" to the features list with a brief description.
