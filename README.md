# Shortwave

Shortwave is a swipe-first music discovery app with a mobile-first UI, onboarding-based taste seeding, and local recommendation logic.

## CI

![Frontend CI](https://github.com/Anuj-Attri/shortwave/actions/workflows/ci.yml/badge.svg?branch=main)

## Repository layout

- `frontend/` – React + Vite application
- `.github/workflows/ci.yml` – CI checks for install/lint/test/build

## Runtime requirements (Windows-first)

- **Node.js 20 LTS** (recommended: latest 20.x)
- **npm 10+**
- Git

Version hints:
- `frontend/package.json` uses engines: `node >=20 <23`, `npm >=10`
- `frontend/.nvmrc` is set to `20`

## Quick start (Windows PowerShell)

```powershell
git clone https://github.com/Anuj-Attri/shortwave
cd shortwave/frontend
npm install
npm run lint
npm run test
npm run build
npm run dev
```

Then open: `http://localhost:5173`

## Quick start (macOS / Linux)

```bash
git clone https://github.com/Anuj-Attri/shortwave
cd shortwave/frontend
npm install
npm run lint
npm run test
npm run build
npm run dev
```

## Product behavior

### Onboarding

- First run shows a 3-step onboarding flow.
- Completion persists:
  - `shortwave:onboarded=true`
  - `shortwave:profileSeed` JSON payload
- Onboarding seed is merged into initial recommendation profile when no prior profile signals exist.

### Core interactions

- Swipe right → Like
- Swipe left → Dislike
- Swipe up → Save
- Swipe down → Skip
- Action buttons mirror swipe behavior.

### Persistence keys

- `shortwave:onboarded`
- `shortwave:profileSeed`
- `shortwave:savedTracks` (current)
- `shortwave_saved_tracks` (legacy key automatically migrated)
- `shortwave_user_taste_profile_v1`

## First Run Checklist (manual QA)

1. Launch app; confirm onboarding appears.
2. Select exactly 3 vibes; Continue becomes enabled.
3. Select 3 artists; continue to Ready and start swiping.
4. Confirm cards render, including fallback text when preview is unavailable.
5. Use both gestures and action buttons; confirm behavior parity.
6. Save at least one track; open Saved drawer and verify persistence after refresh.
7. Toggle modes (Comfort / Explore / Rabbit Hole) and enter mood text; confirm deck updates without crash.
8. Confirm provider links open in new tab safely.
9. Confirm no blank screens or runtime exceptions in browser console.

## Security and stability notes

- `localStorage` access is guarded for restricted/non-browser environments.
- External provider links are rendered only for valid `http/https` URLs and use `rel="noopener noreferrer"`.
- Missing preview URLs do not crash UI; playback controls degrade gracefully.
- Track card rendering includes fallbacks for missing title/artist/cover/genre/duration fields.

## Known limitations

- Recommendations are still local/heuristic (no backend personalization service yet).
- Seed data and interaction history are stored locally only.
- Audio previews depend on remote sample URLs and browser autoplay policy.

## Deferred roadmap

- Provider API ingestion
- Backend persistence/accounts
- Online recommendation service
