# Accessibility (A11y) Blueprint — KaljiHome

KaljiHome is specifically designed for older adults and family caregivers, adhering to **WCAG 2.2 Level AA** standards.

---

## 1. Ergonomic Touch Targets (WCAG 2.2 AA 2.5.8)
* **Large Primary Actions:** All interactive buttons, action controls, and form inputs feature a minimum touch target height of 48px (`min-h-touch: 48px` in `tailwind.config.js`), exceeding the WCAG 2.2 AA 24px minimum to accommodate age-related tremor or reduced dexterity.

## 2. High-Contrast Typography & Visual Hierarchy
* **Color Contrast:** Base text utilizes deep slate (`#1E293B`) on warm cream (`#FAF8F5`), delivering a contrast ratio exceeding 11:1 (well above the 4.5:1 requirement).
* **Relative Font Sizing:** Base body font size is set to 17–18px (`1.0625rem`) with generous line height (`leading-relaxed`) to support comfortable reading without eye strain.
* **Reflow & Zoom:** Fluid responsive layout cleanly scales up to 200% zoom without horizontal scrolling or clipping.

## 3. Keyboard Navigation & Visible Focus
* **Prominent Focus Indicators:** Custom CSS `:focus-visible` ring provides an unmistakable 3px solid outline with 3px offset (`outline: 3px solid #0F766E !important`) on all active elements.
* **Skip to Main Content:** Accessible landmark link (`.skip-to-content`) allows keyboard users to bypass navigation headers directly to `#main-content`.

## 4. Multi-Modal Status Communication (No Color-Alone States)
* Every status badge combines explicit text labels with distinct icons:
  * **Reported Taken:** CheckCircle2 icon + *"Reported Taken by [Name] at [Time]"*
  * **Unconfirmed after grace:** AlertTriangle icon + *"No status recorded after grace period"*
  * **Snoozed:** BellOff icon + *"Snoozed (15m reminder active)"*
  * **Scheduled:** Clock icon + *"Scheduled for today"*
  * **Skipped:** XCircle icon + *"Reported Skipped by [Name]"*

## 5. Screen Reader Announcements & ARIA
* Dynamic live regions use `aria-live="polite"` to announce persona switching, passcode copying, and status recording to assistive devices.
* Form dialogs implement `role="dialog"`, `aria-modal="true"`, and labeled headings.
