# Localization, Theme, And Smart Modes

## Urdu And RTL

The web shell supports English and Urdu. The language toggle is available in the top bar from every screen. When Urdu is active, the app sets:

- `html lang="ur"`
- `html dir="rtl"`

Navigation labels, role names, headings, patient form labels, and core module text switch to Urdu-friendly copy.

## Dark Mode

The theme control cycles through:

- System
- Light
- Dark

Theme values are stored on `html[data-theme]`, and CSS variables drive the app palette. `System` follows `prefers-color-scheme`.

## Adaptive Mode

The density control cycles through:

- Adaptive
- Comfortable
- Compact

The app already responds to desktop, tablet, and mobile breakpoints; density mode adds an additional layout preference for clinical workstations versus smaller touch devices.

## Smart Features

The dashboard and security sections expose:

- AI decision support and readmission risk summaries
- Blockchain-style integrity anchoring for prescriptions and critical EMR updates
- Voice assistant controls with browser voice API detection

Related API endpoints live under `/api/smart`.
