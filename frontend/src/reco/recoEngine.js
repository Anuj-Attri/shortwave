import { enforceDiversity } from './diversity.js';
import { buildTrackVector, dotProduct, normalizeToken, tokenize } from './vectorize.js';

export const USER_PROFILE_KEY = 'shortwave_user_taste_profile_v1';

const DEFAULT_PROFILE = {
  likedTags: {},
  dislikedTags: {},
  artistWeights: {},
  recentHistory: [],
};

const MODE_CONFIG = {
  Comfort: { epsilon: 0.1 },
  Explore: { epsilon: 0.35 },
  'Rabbit Hole': { epsilon: 0.2 },
};

function getStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

function toProfile(profile) {
  return {
    likedTags: profile?.likedTags || {},
    dislikedTags: profile?.dislikedTags || {},
    artistWeights: profile?.artistWeights || {},
    recentHistory: profile?.recentHistory || [],
  };
}

export function loadUserProfile() {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_PROFILE };
  const raw = storage.getItem(USER_PROFILE_KEY);
  if (!raw) return { ...DEFAULT_PROFILE };

  try {
    return toProfile(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveUserProfile(profile) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(USER_PROFILE_KEY, JSON.stringify(toProfile(profile)));
}

function upsertWeight(map, key, delta) {
  map[key] = (map[key] || 0) + delta;
}

export function updateUserProfile(profile, track, action) {
  const source = toProfile(profile);
  const next = {
    likedTags: { ...source.likedTags },
    dislikedTags: { ...source.dislikedTags },
    artistWeights: { ...source.artistWeights },
    recentHistory: [...source.recentHistory],
  };

  if (!track) return next;

  next.recentHistory = [track.id, ...next.recentHistory.filter((id) => id !== track.id)].slice(0, 100);
  if (action === 'skip') return next;

  const tagDelta = action === 'save' ? 2 : action === 'like' ? 1 : action === 'dislike' ? -1 : 0;
  const artistDelta = action === 'save' ? 1 : action === 'like' ? 0.5 : action === 'dislike' ? -0.25 : 0;

  for (const rawTag of track.tags || []) {
    const tag = normalizeToken(rawTag);
    if (!tag) continue;

    if (tagDelta > 0) {
      upsertWeight(next.likedTags, tag, tagDelta);
    } else if (tagDelta < 0) {
      upsertWeight(next.dislikedTags, tag, Math.abs(tagDelta));
    }
  }

  const artist = normalizeToken(track.artist);
  if (artist && artistDelta !== 0) {
    upsertWeight(next.artistWeights, artist, artistDelta);
  }

  return next;
}

function buildTasteVector(profile) {
  const vector = {};

  for (const [tag, weight] of Object.entries(profile.likedTags || {})) {
    vector[`tag:${tag}`] = (vector[`tag:${tag}`] || 0) + weight;
  }

  for (const [tag, weight] of Object.entries(profile.dislikedTags || {})) {
    vector[`tag:${tag}`] = (vector[`tag:${tag}`] || 0) - weight;
  }

  for (const [artist, weight] of Object.entries(profile.artistWeights || {})) {
    vector[`artist:${artist}`] = (vector[`artist:${artist}`] || 0) + weight;
  }

  return vector;
}

function getMoodBoost(track, moodQuery) {
  if (!moodQuery.trim()) return 0;
  const tokens = tokenize(moodQuery);
  if (tokens.length === 0) return 0;

  const fields = [track.title, track.artist, ...(track.tags || [])].map((item) => normalizeToken(item));
  return tokens.reduce((boost, token) => {
    if (fields.some((field) => field.includes(token))) return boost + 0.75;
    return boost;
  }, 0);
}

function getTopLikedTag(profile) {
  const entries = Object.entries(profile.likedTags || {});
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function getRepeatPenalty(track, profile) {
  const index = (profile.recentHistory || []).indexOf(track.id);
  if (index === -1) return 0;
  return Math.max(0.5, 3 - index * 0.2);
}

function shuffleWithRng(items, rng) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function explainRecommendation(track, profile) {
  const artist = normalizeToken(track.artist);
  const artistWeight = profile.artistWeights?.[artist] || 0;
  if (artistWeight > 0) {
    return `Because you liked: ${track.artist}`;
  }

  const matchingTags = (track.tags || [])
    .map((tag) => normalizeToken(tag))
    .map((tag) => ({ tag, score: profile.likedTags?.[tag] || 0 }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matchingTags[0]) {
    return `Because you liked: ${matchingTags[0].tag}`;
  }

  return null;
}

export function generateDeck(tracks, moodQuery, mode, userProfile, options = {}) {
  const rng = options.rng || Math.random;
  const deckSize = options.deckSize || 20;
  const profile = toProfile(userProfile || DEFAULT_PROFILE);
  const tasteVector = buildTasteVector(profile);
  const modeSettings = MODE_CONFIG[mode] || MODE_CONFIG.Comfort;
  const exploring = rng() < modeSettings.epsilon;
  const rabbitHoleTag = mode === 'Rabbit Hole' ? getTopLikedTag(profile) : null;

  const scored = tracks.map((track) => {
    const trackVector = buildTrackVector(track);
    const dot = dotProduct(tasteVector, trackVector);
    const moodBoost = getMoodBoost(track, moodQuery || '');
    const noveltyBoost = (track.tags || []).every((tag) => !profile.likedTags?.[normalizeToken(tag)]) ? 0.2 : 0;
    const rabbitHoleBoost = rabbitHoleTag && (track.tags || []).map(normalizeToken).includes(rabbitHoleTag) ? 0.9 : 0;
    const explorationBonus = exploring ? noveltyBoost : 0;
    const repeatPenalty = getRepeatPenalty(track, profile);

    return {
      track,
      score: dot + moodBoost + rabbitHoleBoost + explorationBonus - repeatPenalty,
      why: explainRecommendation(track, profile),
    };
  });

  const ranked = scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return String(a.track.id).localeCompare(String(b.track.id));
  });

  const diversePool = shuffleWithRng(
    ranked.filter((entry) => (entry.track.tags || []).some((tag) => !profile.likedTags?.[normalizeToken(tag)])),
    rng,
  );

  let candidateOrder = ranked;
  if (exploring) {
    const explorationHead = diversePool.slice(0, Math.ceil(deckSize / 2));
    const seenTrackIds = new Set(explorationHead.map((entry) => entry.track.id));
    const remainder = ranked.filter((entry) => !seenTrackIds.has(entry.track.id));
    candidateOrder = [...explorationHead, ...remainder];
  }

  return enforceDiversity(candidateOrder, deckSize);
}
