# PeriodSafe MVP Smoke Test

This document outlines the manual smoke test procedure for the PeriodSafe MVP. Execute this checklist in all major browsers (Chrome, Firefox, Safari) and on at least one real mobile device before marking the MVP as complete.

---

## Test Environment

**Test Date:** [Insert date]  
**Tester Name:** [Insert name]  
**Production URL:** [Insert Vercel URL]

---

## Browser & Device Combinations

- [ ] Chrome (latest) — desktop
- [ ] Firefox (latest) — desktop
- [ ] Safari (latest) — desktop
- [ ] Safari — real iOS device (ideally iPhone)
- [ ] Chrome — real Android device

---

## Test Procedure

For each browser/device, follow the steps below in order:

### 1. Initial Load & Privacy Banner

- [ ] Load app from production URL
- [ ] Privacy banner appears at bottom of screen on first visit
- [ ] Banner contains text: "Your privacy matters. PeriodSafe stores all data locally..."
- [ ] "Learn more" link opens a modal with full privacy explanation
- [ ] Close modal via "Close" button
- [ ] Click "Got it" button on banner
- [ ] Banner disappears
- [ ] Refresh page — banner does NOT reappear (localStorage flag persisted)

### 2. Period Logging — Create

- [ ] Click "Log" button in navigation (mobile bottom nav or desktop sidebar)
- [ ] Form appears with fields: Start Date, End Date, Flow, Symptoms, Mood, Notes
- [ ] Start Date: enter today's date (or any valid date)
- [ ] End Date: enter a date 5 days after Start Date
- [ ] Flow: select "Medium"
- [ ] Symptoms: check "Cramps" and "Fatigue"
- [ ] Mood: click the "4" button (toggle to mood level 4)
- [ ] Notes: type "Test period for smoke test"
- [ ] Click "Save" button
- [ ] Form disappears; success toast appears ("Period logged successfully" or similar)
- [ ] App navigates back to calendar

### 3. Calendar View — Logged Period

- [ ] Calendar view displays current month grid
- [ ] The periods logged above appears on the calendar in the correct date range
- [ ] Period is highlighted in rose color (distinct visual style)
- [ ] Clicking on the period cell opens a read-only detail modal
- [ ] Detail modal shows all logged data (Start Date, End Date, Flow, Symptoms, Mood, Notes)
- [ ] Close the modal via ESC key or close button
- [ ] Modal closes cleanly

### 4. Calendar Navigation

- [ ] Click "Next" or right arrow button — calendar advances to next month
- [ ] Month/year header updates correctly
- [ ] Click "Previous" or left arrow button — calendar goes back one month
- [ ] Click "Today" button — calendar returns to current month
- [ ] No performance lag or stuttering visible during month navigation

### 5. Log a Second Period (for Prediction)

- [ ] Click "Log" again
- [ ] Enter a second period:
  - Start Date: 28 days before the first period's start date (or any valid date)
  - End Date: 5 days after start
  - Flow: "Light"
  - Symptoms: "Headache"
  - Mood: "3"
  - Notes: "Second test period"
- [ ] Save the period
- [ ] Navigate back to calendar

### 6. Cycle Prediction

- [ ] Navigate to the calendar month view after logging the second period
- [ ] A predicted period window may appear on the calendar (depends on cycle length)
- [ ] If visible, the predicted period has a lighter/distinct visual style (e.g., lighter rose, dashed border) compared to logged periods
- [ ] Prediction appears ~28 days after the logged period (based on cycle analysis)

### 7. Calendar Keyboard Navigation (desktop only)

- [ ] Focus any day cell on the calendar (click it)
- [ ] Press ArrowRight — focus moves one day right
- [ ] Press ArrowLeft — focus moves one day left
- [ ] Press ArrowDown — focus moves one week down
- [ ] Press ArrowUp — focus moves one week up
- [ ] Press Home — focus moves to first day of the week (Sunday)
- [ ] Press End — focus moves to last day of the week (Saturday)
- [ ] Press PageDown — focus moves to same day in next month
- [ ] Press PageUp — focus moves to same day in previous month
- [ ] Verify ArrowLeft/Right on the first/last day of month navigates to previous/next month automatically
- [ ] Press Enter on a period day cell — detail modal opens
- [ ] Press ESC in modal — modal closes

### 8. Settings — Cycle & Theme

- [ ] Navigate to Settings page
- [ ] **Cycle Length section:**
  - [ ] Number input shows current cycle length (default 28)
  - [ ] Change to 30 and click "Save"
  - [ ] Confirm toast appears
  - [ ] Refresh the page
  - [ ] Verify cycle length persists (still shows 30)
  - [ ] Change back to 28 and save
- [ ] **Appearance section:**
  - [ ] Two buttons: Light & Dark mode
  - [ ] Click Dark mode button
  - [ ] Entire app theme switches to dark (white text, dark background)
  - [ ] Dark mode button shows as active/selected
  - [ ] Refresh the page — dark mode persists
  - [ ] Click Light mode button
  - [ ] App switches back to light theme
  - [ ] Refresh the page — light mode persists

### 9. Reminders Section (UI-only for MVP)

- [ ] Reminders section is visible
- [ ] Toggle switch is disabled and labeled "Coming soon"
- [ ] Attempting to interact shows no unexpected errors

### 10. Import/Export

- [ ] Navigate to Import/Export page
- [ ] **Export section:**
  - [ ] Privacy banner text: "All your data is never sent anywhere"
  - [ ] "Export as JSON" button is visible
  - [ ] Click "Export as JSON"
  - [ ] A JSON file downloads to the default Downloads folder
  - [ ] File is named `periodsafe-export-YYYY-MM-DD.json` (correct date)
  - [ ] Open the downloaded JSON file in a text editor
  - [ ] Verify JSON structure:
    - [ ] Root object has `schemaVersion`, `exportedAt`, `appName: "PeriodSafe"`, `data` keys
    - [ ] `data` object has `periods` (array) and `settings` (object) keys
    - [ ] `periods` array contains the two periods you logged earlier
    - [ ] Each period has `id`, `startDate`, `endDate`, `flow`, `symptoms`, `mood`, `notes` fields
  - [ ] File size is reasonable (< 10MB)

### 11. Import/Overwrite

- [ ] Still on Import/Export page
- [ ] Click "Choose file" or file picker in Import section
- [ ] Select the JSON file you just exported
- [ ] A modal appears asking "Overwrite or Merge?"
  - [ ] "Overwrite" option is available
  - [ ] "Merge" option is available
- [ ] Click "Overwrite"
- [ ] Success toast appears ("Data imported successfully" or similar)
- [ ] Modal closes
- [ ] Navigate to calendar
- [ ] Verify the two periods are still visible (same as before import, since we overwrote with the same data)

### 12. Clear All Data

- [ ] Return to Import/Export page
- [ ] Scroll to "Danger zone" section
- [ ] "Clear All Data" button is visible and prominent
- [ ] Click "Clear All Data"
- [ ] A confirmation modal appears with warning text
- [ ] Click "Cancel" on the confirmation modal
- [ ] Modal closes; data is NOT cleared (periods still visible on calendar)
- [ ] Click "Clear All Data" again
- [ ] Confirmation modal appears
- [ ] Click "Confirm & Delete All"
- [ ] Success toast appears ("All data cleared")
- [ ] Modal closes
- [ ] Navigate to calendar
- [ ] Calendar is completely empty (no periods, no predictions)
- [ ] Navigate to Settings
- [ ] Settings reset to defaults (cycle length 28, light mode)

### 13. Re-Import Data

- [ ] Return to Import/Export page
- [ ] Click file picker and select the previously exported JSON
- [ ] Choose "Merge" this time
- [ ] Success toast appears
- [ ] Navigate to calendar
- [ ] Verify the two originally logged periods are restored
- [ ] Verify prediction is calculated (if using default cycle length)

### 14. Keyboard-Only Navigation (desktop only)

- [ ] Reload the app
- [ ] Put away the mouse entirely; use Tab, Shift+Tab, Enter, Space only
- [ ] Press Tab repeatedly — focus cycles through all interactive elements in a logical order (Header settings link → Calendar cells → Bottom/Tab nav buttons)
- [ ] Navigate to Settings using keyboard tab
- [ ] Adjust cycle length, press Enter to save; Tab to dark mode button, press Space to toggle theme
- [ ] Navigate to Log page using Tab
- [ ] Fill out the period form using only Tab and Space/Enter (including multi-select symptoms)
- [ ] Press Tab through all form fields, then Tab to "Save" button and press Enter
- [ ] Form submits and navigates back to calendar

### 15. Verification Checklist

- [ ] No console errors appear in DevTools
- [ ] All text is readable (sufficient color contrast)
- [ ] All interactive elements have at least 48px touch targets (verify with DevTools mobile emulation or real device)
- [ ] Page load time is acceptable (< 3 seconds on slow 3G)
- [ ] App does not crash or display blank screen on any tested browser
- [ ] Dark/light mode toggle works smoothly without flashing
- [ ] Data persists correctly across page refreshes

---

## Test Results

### Chrome — Desktop

| Step | Status | Notes |
|------|--------|-------|
| 1. Initial Load | [ ] PASS / [ ] FAIL | |
| 2. Period Logging | [ ] PASS / [ ] FAIL | |
| 3. Calendar View | [ ] PASS / [ ] FAIL | |
| 4. Navigation | [ ] PASS / [ ] FAIL | |
| 5. Second Period | [ ] PASS / [ ] FAIL | |
| 6. Prediction | [ ] PASS / [ ] FAIL | |
| 7. Keyboard Nav | [ ] PASS / [ ] FAIL | |
| 8. Settings | [ ] PASS / [ ] FAIL | |
| 9. Reminders | [ ] PASS / [ ] FAIL | |
| 10. Export | [ ] PASS / [ ] FAIL | |
| 11. Import/Overwrite | [ ] PASS / [ ] FAIL | |
| 12. Clear Data | [ ] PASS / [ ] FAIL | |
| 13. Re-Import | [ ] PASS / [ ] FAIL | |
| 14. Keyboard-Only | [ ] PASS / [ ] FAIL | |
| 15. Verification | [ ] PASS / [ ] FAIL | |

**Overall Chrome:** [ ] PASS / [ ] FAIL

---

### Firefox — Desktop

| Step | Status | Notes |
|------|--------|-------|
| 1–15 | [ ] PASS / [ ] FAIL | |

**Overall Firefox:** [ ] PASS / [ ] FAIL

---

### Safari — Desktop

| Step | Status | Notes |
|------|--------|-------|
| 1–15 | [ ] PASS / [ ] FAIL | |

**Overall Safari:** [ ] PASS / [ ] FAIL

---

### iOS Safari — Mobile Device

| Step | Status | Notes |
|------|--------|-------|
| 1–6, 8–13 | [ ] PASS / [ ] FAIL | (skip keyboard tests 7, 14) |

**Overall iOS:** [ ] PASS / [ ] FAIL

---

### Android Chrome — Mobile Device

| Step | Status | Notes |
|------|--------|-------|
| 1–6, 8–13 | [ ] PASS / [ ] FAIL | (skip keyboard tests 7, 14) |

**Overall Android:** [ ] PASS / [ ] FAIL

---

## Final Sign-Off

All browsers and devices tested: **[ ] YES**  
All steps passed: **[ ] YES**  
Ready for release: **[ ] YES**

**Signed:** _________________________ **Date:** _______________

---

## Known Issues (if any)

List any issues encountered and their status:

1. Issue: [description]  
   Status: [ ] Resolved / [ ] Deferred to post-MVP  
   Notes: [details]

---

