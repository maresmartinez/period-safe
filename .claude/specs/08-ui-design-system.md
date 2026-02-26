# Spec 08 — UI Design System

## Goal

Build shared UI primitive components and configure Tailwind design tokens so that all other spec slices can use a consistent, accessible, brand-appropriate visual language. This spec should be implemented early — treat it as a dependency of spec 03 and beyond.

---

## Deliverable Definition

- `src/components/Button.jsx` — all four variants
- `src/components/Card.jsx` — container primitive
- `src/components/Modal.jsx` — focus-trapping overlay
- `src/components/Toast.jsx` + `src/hooks/useToast.js` — notification system
- `src/components/LoadingSpinner.jsx` — accessible loading indicator
- `tailwind.config.js` — extended with color tokens, font, and spacing
- Visual regression baseline: all components render correctly at 320px and 1024px

---

## Scope

**In this slice:**
- The five component primitives (Button, Card, Modal, Toast, LoadingSpinner)
- Tailwind config extended with design tokens
- `useToast` hook for triggering toasts from anywhere
- `ToastContainer` for rendering active toasts
- Basic Storybook-free visual test: a `DesignSystem.jsx` demo page (dev-only, not linked in nav)

**Not in this slice:**
- Page-level layout (that's spec 09)
- Form inputs / select / textarea primitives (those are built inline in spec 03)
- Icon set (use inline SVG or Heroicons as needed per component)
- Animation beyond simple Tailwind transitions

---

## Implementation Notes

### Tailwind color tokens

Extend `tailwind.config.js` with a custom palette:

```js
theme: {
  extend: {
    colors: {
      rose: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e',
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337',
      },
      mauve: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#e879f9',  // accent
        400: '#d946ef',
        500: '#a21caf',
        600: '#86198f',
      },
      neutral: {
        // Warm neutrals (slightly warm undertone)
        50: '#fafaf9',
        100: '#f5f5f4',
        200: '#e7e5e4',
        300: '#d6d3d1',
        400: '#a8a29e',
        500: '#78716c',
        600: '#57534e',
        700: '#44403c',
        800: '#292524',
        900: '#1c1917',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    spacing: {
      // 8px base unit — Tailwind's default uses 4px units; extend as needed
      // Tailwind already has: 1=4px, 2=8px, 4=16px, 8=32px, etc.
      // No extension needed — just document the convention
    },
  },
}
```

Also add `darkMode: 'class'` to the top level of `tailwind.config.js`.

### Inter font

In `index.html`, add to `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### `Button` component

```jsx
// Props:
// variant: 'primary' | 'secondary' | 'ghost' | 'danger'  (default: 'primary')
// size: 'sm' | 'md' | 'lg'  (default: 'md')
// disabled: boolean
// loading: boolean  (shows LoadingSpinner, disables button)
// onClick, type, children, className (passthrough)

// Minimum touch target: 48px height on md/lg
// Focus style: visible ring (focus-visible:ring-2 focus-visible:ring-rose-500)
```

Variant styles:
- `primary`: `bg-rose-500 text-white hover:bg-rose-600`
- `secondary`: `bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-100`
- `ghost`: `bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300`
- `danger`: `bg-red-600 text-white hover:bg-red-700`

### `Card` component

```jsx
// Props: children, className (for layout overrides)
// Base style: rounded-2xl bg-white dark:bg-neutral-800 shadow-sm p-4 (or p-6)
```

### `Modal` component

```jsx
// Props:
// isOpen: boolean
// onClose: () => void
// title: string
// children
// size: 'sm' | 'md' | 'lg'  (default: 'md')

// Behavior:
// - Renders via React Portal into document.body
// - Backdrop: semi-transparent overlay
// - ESC key calls onClose
// - Focus trap: Tab cycles only through focusable elements inside the modal
// - On open: move focus to first focusable element (or close button)
// - On close: return focus to the element that triggered the modal
// - aria-modal="true", role="dialog", aria-labelledby pointing to title
```

Focus trap implementation: use the `tabbable` package or implement manually by querying all focusable elements and intercepting Tab keydown.

### `Toast` system

```jsx
// useToast hook:
const { showToast } = useToast();
showToast({ type: 'success' | 'error' | 'info', message: string, duration?: number });
// Default duration: 4000ms

// ToastContainer:
// Position: top-right corner (desktop), top-center (mobile)
// Stacks multiple toasts
// Auto-dismisses after duration
// Manual dismiss via X button
// ARIA: role="alert" aria-live="polite" (for success/info) or aria-live="assertive" (for error)
```

Implement using a context + reducer pattern:
- `ToastContext.jsx` provides `showToast` via context
- `ToastContainer.jsx` reads from context and renders active toasts
- Wrap `App.jsx` in `<ToastProvider>`

### `LoadingSpinner` component

```jsx
// Props: size: 'sm' | 'md' | 'lg'  (default: 'md'), label?: string
// Render: SVG spinning circle with CSS animation
// Accessibility: role="status" aria-label={label || 'Loading...'}
```

### Minimum touch target enforcement

All interactive elements (Button, close buttons, toggles) must have a minimum rendered height and width of 48px. Use Tailwind's `min-h-[48px] min-w-[48px]` or `h-12 w-12` utilities. Verify in tests with a `getComputedStyle` or by asserting class presence.

### Dev-only design system demo page

Create `src/components/DesignSystem.jsx` that renders all variants of each component side by side. Add a route `/design` in development mode only. This is for visual inspection — not linked in production nav.

### Test cases
- Button renders with correct variant class for each of the 4 variants
- Button with `loading={true}` renders `LoadingSpinner` and has `disabled` attribute
- Modal renders when `isOpen=true`; does not render when `isOpen=false`
- Modal ESC keydown calls `onClose`
- Modal traps focus (Tab from last focusable → wraps to first)
- `showToast({ type: 'success', message: 'Done' })` → toast appears with message
- Toast auto-dismisses after `duration` ms
- LoadingSpinner has `role="status"` and `aria-label`

---

## Acceptance Criteria

- [ ] `Button` renders all 4 variants with correct background colors
- [ ] `Button` with `loading={true}` is disabled and shows spinner
- [ ] `Button` has minimum 48px height in `md` size
- [ ] `Modal` renders as a portal; focus moves inside on open; ESC closes
- [ ] `Modal` traps Tab key focus inside the modal
- [ ] `Toast` appears after `showToast()` call; disappears after `duration` ms
- [ ] `Toast` for errors has `aria-live="assertive"`
- [ ] `LoadingSpinner` has `role="status"` attribute
- [ ] Tailwind config has `darkMode: 'class'` and custom rose/mauve/neutral palette
- [ ] Inter font loads in `index.html`
- [ ] All tests pass (`npm run test`)

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `08-ui-design-system.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record the final Tailwind color token names, `Button` variant names and classes, `Modal` behavior (focus trap, ESC, portal), `useToast` API, and any package installed (e.g., `tabbable` for focus management).

3. **Update `README.md`:** Add a brief "Design" section noting the color palette, Inter font, and accessibility targets. No user-facing feature to announce — this is infrastructure.
