# Spec 06 — Settings

## Goal

Build the Settings page where users can configure their cycle length override, toggle reminders (UI only), and switch between light and dark mode. All settings persist in localStorage and survive page refresh.

**Dependency:** Requires spec 03 (period form) complete so there is content to configure settings for. Requires spec 08 (design system) for `Button`, `Card`, and `Toast` primitives.

---

## Deliverable Definition

- `src/components/settings/SettingsPage.jsx` — full settings UI
- `src/hooks/useSettings.js` — hook wrapping `settingsService` from spec 02
- Dark mode strategy implemented and working across the app
- Tests for settings persistence and toggle behaviors

---

## Scope

**In this slice:**
- Settings page with three sections: Cycle, Reminders, Appearance
- Cycle length override: numeric input (21–35 range) with save button
- Reminder toggle: on/off switch (UI only — no actual notification API for MVP)
- Light/dark mode toggle using Tailwind `dark:` class strategy
- `useSettings` hook: loads settings on mount, provides save function, exposes current values
- Settings persist across page refresh (localStorage)
- Toast confirmation when settings are saved

**Not in this slice:**
- Actual browser notification API integration (reminder toggle is UI-only)
- Account-level settings or cloud sync
- Cycle length auto-detection (that's the prediction algorithm in spec 05)
- Importing/exporting settings separately (settings are bundled with data export in spec 07)

---

## Implementation Notes

### `useSettings` hook

```js
const {
  settings,          // current UserSettings object
  saveSettings,      // (partial) => void — merges and persists
  resetSettings,     // () => void — resets to defaults
  loading,           // boolean
} = useSettings();
```

Uses `settingsService` from spec 02 internally. No IndexedDB — settings are in localStorage only.

### Dark mode strategy

Use Tailwind's `class` strategy (not `media` strategy). Add `darkMode: 'class'` to `tailwind.config.js`.

Toggle by adding/removing the `dark` class on `document.documentElement`:

```js
// In settings save handler, when theme changes:
document.documentElement.classList.toggle('dark', settings.theme === 'dark');
```

Persist `theme` in `UserSettings.theme` in localStorage. On app init (`App.jsx` or `main.jsx`), read the saved theme and apply the class before first render to avoid flash.

### Settings page sections

**Cycle Settings**
- Label: "Average cycle length"
- Input: `<input type="number" min="21" max="35">` with current saved value
- Description: "This is used to improve prediction accuracy. Typical range: 21–35 days."
- Save button per section (not a single page-level save)
- Validation: reject values outside 21–35; show inline error

**Reminders** *(UI only)*
- Toggle switch (styled checkbox or button toggle)
- Label: "Period reminders"
- Description: "Coming soon — notifications are not yet available in this version."
- Greyed out or disabled to make clear it's not active for MVP

**Appearance**
- Theme toggle: Light / Dark (segmented button or toggle)
- Label: "Color theme"
- Immediately applies theme change (no save button needed — instant apply + auto-persist)

### `UserSettings` shape (reminder)
```js
{
  cycleLengthAverage: number,    // 21–35
  cycleVariance: number,         // read-only for user, computed by prediction
  reminderEnabled: boolean,
  reminderDaysBefore: number,
  theme: 'light' | 'dark',
  schemaVersion: 1
}
```

### Accessibility
- All inputs have associated `<label>` elements
- Number input has `aria-describedby` pointing to the description text
- Theme toggle has `aria-pressed` (if button) or proper `role="switch"` (if toggle)
- Error messages use `role="alert"`
- Settings page heading hierarchy: `<h1>Settings</h1>` → `<h2>` per section

### Test cases
- `useSettings` returns default values on first load
- Saving cycle length persists to localStorage and is returned on next `useSettings` call
- Cycle length validation: value < 21 shows error and does not save
- Theme toggle: applies `dark` class to `document.documentElement`
- Settings page renders all three sections
- Reset restores default values

---

## Acceptance Criteria

- [ ] Settings page renders three sections: Cycle, Reminders, Appearance
- [ ] Cycle length input saves and persists across page refresh
- [ ] Cycle length outside 21–35 shows inline validation error and does not save
- [ ] Dark mode toggle applies `dark` class to `<html>` element immediately
- [ ] Dark mode preference persists across page refresh (no flash of wrong theme)
- [ ] Reminder toggle renders as disabled/coming-soon (no notification API called)
- [ ] All form inputs have visible labels
- [ ] `useSettings` returns defaults when localStorage is empty
- [ ] All tests pass (`npm run test`)

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `06-settings.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record `useSettings` hook contract (actual return shape), the dark mode implementation pattern (`darkMode: 'class'` + `document.documentElement.classList`), and note that reminders are UI-only for MVP.

3. **Update `README.md`:** Add "Settings" to the features list: cycle length customization, dark/light mode, data persistence. Note reminders are planned for a future version.
