# DESIGN.md — Smart Percent & Salary Calculator

> Visual language derived from the [Wise](https://getdesign.md/) analysis on [getdesign.md](https://getdesign.md/): bright green accent, forest typography, friendly clarity for money tools. Typography: [Pretendard](https://noonnu.cc/) (commercial-use Korean sans, via noonnu catalog).

## Intent

- Trust-first fintech calculator (salary, percent, payroll-adjacent copy).
- High legibility for numbers; calm surfaces; one accent color for actions and results.
- **Ads (AdSense):** `VITE_ADSENSE_ENABLED=false` until re-approval. After approval: set env on Vercel, create display units, fill `VITE_ADSENSE_SLOT_FOOTER` (required first) and optionally `VITE_ADSENSE_SLOT_SALARY`. Slots: footer above legal nav; salary tab after comparison table only—never above tabs or on `/about/` `/privacy/`.

## Color

| Token | Value | Usage |
|-------|-------|--------|
| `--color-bg` | `#f2f0e9` | Page background (warm neutral) |
| `--color-surface` | `#ffffff` | Cards, inputs |
| `--color-text` | `#163300` | Headings, primary text (Wise forest) |
| `--color-text-muted` | `#5d6558` | Secondary, hints |
| `--color-text-subtle` | `#8a9189` | Labels, ad placeholders |
| `--color-border` | `#dfe3d6` | Borders, dividers |
| `--color-accent` | `#9fe870` | Primary CTA, active chips, brand mark |
| `--color-accent-soft` | `#ecfccb` | Result panels, selected rows |
| `--color-accent-deep` | `#2b5800` | Positive amounts, live badge |
| `--color-primary` | `#163300` | Active tab, primary button text on accent |
| `--color-focus-ring` | `rgba(159, 232, 112, 0.45)` | Focus visible |

## Typography

- **Family:** `Pretendard`, system-ui fallbacks.
- **Scale:** Title `clamp(1.25rem, 3.2vw, 1.625rem)` weight 700, tracking `-0.03em`.
- **Eyebrow / step:** 0.6875rem, weight 700, letter-spacing `0.1em`, uppercase, muted green.
- **Body:** 0.9375rem; **numbers in inputs/results:** weight 600–700, tabular-nums.

## Spacing & radius

- Page max width: `760px`; horizontal padding `24px` (mobile `16px`).
- Card padding: `clamp(20px, 4vw, 28px)`; radius `--radius-lg` `20px`.
- Control radius `--radius-md` `12px`; pills `--radius-pill` `999px`.
- Section gap: `20–24px`.

## Components

- **Tabs:** Stadium container (white surface, border); active = forest fill + white text OR accent fill + forest text (use forest + white for contrast).
- **Inputs:** White surface, 1px border; focus ring accent.
- **Result box:** Soft accent background, forest headline numbers.
## Motion

- Transitions 0.2s ease; respect `prefers-reduced-motion`.

## Do not change without explicit request

1. Primary nav: three tabs — Raise / Payroll / Percent; payroll uses horizontal chips inside.
2. Legal footer links: `/about/`, `/privacy/` (AdSense-required pages).
3. Toast `bottom: calc(24px + env(safe-area-inset-bottom))`.
