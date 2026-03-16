import { useSyncExternalStore } from 'react';

export const PROFILE_SEED_KEY = 'shortwave:profileSeed';
export const PROFILE_SEED_UPDATED_EVENT = 'shortwave:profileSeedUpdated';

let cachedRawProfileSeed = undefined;
let cachedParsedProfileSeed = null;

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
  if (raw === cachedRawProfileSeed) {
    return cachedParsedProfileSeed;
  }

  cachedRawProfileSeed = raw;

  if (!raw) {
    cachedParsedProfileSeed = null;
    return cachedParsedProfileSeed;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.vibes) || !Array.isArray(parsed?.artists)) {
      cachedParsedProfileSeed = null;
      return cachedParsedProfileSeed;
    }

    cachedParsedProfileSeed = {
      vibes: parsed.vibes.filter((value) => typeof value === 'string'),
      artists: parsed.artists.filter((value) => typeof value === 'string'),
    };

    return cachedParsedProfileSeed;
  } catch {
    cachedParsedProfileSeed = null;
    return cachedParsedProfileSeed;
  }
}

export default function useProfileSeed() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};

      const handleStorage = (event) => {
        if (!event || event.key === PROFILE_SEED_KEY) {
          onStoreChange();
        }
      };

      window.addEventListener('storage', handleStorage);
      window.addEventListener(PROFILE_SEED_UPDATED_EVENT, onStoreChange);

      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(PROFILE_SEED_UPDATED_EVENT, onStoreChange);
      };
    },
    readProfileSeed,
    () => null,
  );
}
