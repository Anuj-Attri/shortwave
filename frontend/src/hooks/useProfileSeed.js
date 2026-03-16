import { useMemo } from 'react';

export const PROFILE_SEED_KEY = 'shortwave:profileSeed';

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readProfileSeed() {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(PROFILE_SEED_KEY);
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
