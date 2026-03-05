import { useMemo } from 'react';

export const PROFILE_SEED_KEY = 'shortwave:profileSeed';

function readProfileSeed() {
  const raw = localStorage.getItem(PROFILE_SEED_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.vibes) || !Array.isArray(parsed?.artists)) {
      return null;
    }

    return {
      vibes: parsed.vibes.filter((value) => typeof value === 'string'),
      artists: parsed.artists.filter((value) => typeof value === 'string'),
    };
  } catch {
    return null;
  }
}

export default function useProfileSeed() {
  return useMemo(() => readProfileSeed(), []);
}
