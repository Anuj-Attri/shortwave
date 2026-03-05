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

## Notes

- Preview audio is optional per track and gracefully handled when missing.
- Provider links (Spotify / Apple / YouTube) are rendered only when available.
- Saved tracks persist in localStorage.
- Mood + mode controls currently drive local filtering/reshuffling only.

## Deferred (future PRs)

- Real provider ingestion APIs
- AI recommender and ranking engine
- Backend persistence and accounts
