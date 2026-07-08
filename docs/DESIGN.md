# Design — Molsnap

## Aesthetic direction

**Blueprint/technical.** Molsnap looks like a chemist's cyanotype notebook:
deep blueprint-navy canvas, faint graph-paper grid, glowing cyan structure
lines, and amber annotation accents for the numbers (formula, weight). The
UI reads as precise measuring instrument, not a marketing page — it should
feel like the tool a lab actually uses.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b1f33` | page background |
| `--surface-1` | `#122a4a` | panel background |
| `--surface-2` | `#1a3a63` | raised panel / input background |
| `--text` | `#eaf2fb` | primary text |
| `--text-muted` | `#93aac4` | secondary/annotation text |
| `--accent` | `#7dd3fc` | structure lines, primary actions, focus ring |
| `--accent-support` | `#fbbf24` | formula/weight readout, signature highlights |
| `--success` | `#34d399` | valid SMILES state |
| `--danger` | `#f87171` | invalid SMILES / parse error state |

- **Display font:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
  — wordmark and headings.
- **UI font:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
  — body, labels, the formula readout, and the SMILES input itself (a
  monospace input makes bond characters like `=` and `#` easy to scan).
- **Spacing unit:** 8px scale (8/16/24/32/48/64).
- **Corner radius:** 4px — sharp and instrument-like, never pill-shaped.
- **Shadow/glow:** soft `--accent` glow (`0 0 24px rgba(125, 211, 252, 0.25)`)
  around the active panel and focused controls; panels otherwise sit on a
  subtle two-step navy elevation, no drop shadows.
- **Motion:** UI transitions 160ms ease-out; the 3D viewer's auto-rotate is
  continuous and slow (one revolution ≈ 12s); a freshly rendered structure
  fades + scales in over 200ms.

## Layout intent

The hero is the **structure stage**: a side-by-side pair of panels — 2D
render (left) and 3D viewer (right) — that together take ~65% of viewport
height on desktop. Above it, a full-width monospace input strip (paste +
render) styled like an annotation line on graph paper. Below/beside the 3D
panel, the formula and molecular weight sit in an amber-accented readout
badge, like a measurement stamped on the page.

- **1440×900 desktop:** header (compact, wordmark + tagline) → full-width
  input strip → two-column stage (2D | 3D, each ~45vw, ~65vh tall) →
  formula/weight badge anchored to the 3D panel's corner.
- **390×844 phone:** header → input strip → 2D panel (full width, ~40vh) →
  3D panel (full width, ~40vh) → formula/weight badge as its own full-width
  strip below. No dead margins — panels always fill the available width.

## Signature detail

The background carries a faint blueprint grid (1px lines, low-opacity
`--accent` on `--bg`, 32px cells) that scrolls very slowly, and the wordmark
"molsnap" renders with the second "o" replaced by a small drawn bond glyph
(two parallel lines, like a double bond) that pulses once on page load.

## Juice plan

Molsnap is a utility, not a game, but rendering still needs to feel alive:

- Parsing a valid SMILES: input border pulses `--success` once, then the 2D
  and 3D panels fade + scale in (200ms).
- Invalid SMILES: input border flashes `--danger` and shakes briefly
  (4px, 2 cycles, ~150ms) — no sound, this is a precision tool, not a game.
- The 3D viewer auto-rotates on render and is grab-to-orbit; a subtle cyan
  glow pulses around the panel for 400ms the instant a new structure lands.
- Respect `prefers-reduced-motion`: disable the grid scroll, the shake, and
  the glow pulse, keep the fade/scale functional but instant.
