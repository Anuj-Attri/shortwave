# Shortwave

Shortwave is a swipe-first music discovery app focused on helping users find their next favorite track quickly.

This MVP foundation delivers a premium, mobile-first UI with gesture controls, seed data, and local saved-state behavior while intentionally deferring provider ingestion and recommendation services.

## CI

![Frontend CI](https://github.com/Anuj-Attri/shortwave/actions/workflows/ci.yml/badge.svg?branch=main)

## Frontend quick start

Required runtime: Node.js LTS.

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
```

## MVP interactions

- Swipe right → Like
- Swipe left → Dislike
- Swipe up → Save
- Swipe down → Skip

Action buttons are also available for non-gesture users.

## Onboarding flow

- First visit shows a three-step onboarding modal before swiping starts.
- Onboarding appears only once by storing `shortwave:onboarded=true` in `localStorage`.
- User selections are persisted in `localStorage` under `shortwave:profileSeed`:

```json
{
  "vibes": ["dreamy", "night-drive", "indie"],
  "artists": ["Frank Ocean", "SZA", "Tame Impala"]
}
```

- Seed data is intentionally stored for future recommender use and does not alter current ranking logic.

## Notes

- Preview audio is optional per track and gracefully handled when missing.
- Provider links (Spotify / Apple / YouTube) are rendered only when available.
- Saved tracks persist in localStorage.
- Mood + mode controls currently drive local filtering/reshuffling only.

## Deferred (future PRs)

- Real provider ingestion APIs
- AI recommender and ranking engine
- Backend persistence and accounts
