const TOKEN_SPLIT_REGEX = /[^a-z0-9]+/i;

export function normalizeToken(value) {
  return String(value || '').trim().toLowerCase();
}

export function tokenize(value) {
  return normalizeToken(value)
    .split(TOKEN_SPLIT_REGEX)
    .map((token) => token.trim())
    .filter(Boolean);
}

function addWeight(vector, key, amount) {
  vector[key] = (vector[key] || 0) + amount;
}

export function buildTrackVector(track) {
  const vector = {};

  for (const rawTag of track.tags || []) {
    const tag = normalizeToken(rawTag);
    if (!tag) continue;
    addWeight(vector, `tag:${tag}`, 1);
  }

  for (const token of tokenize(track.title)) {
    addWeight(vector, `title:${token}`, 0.35);
  }

  const artist = normalizeToken(track.artist);
  if (artist) {
    addWeight(vector, `artist:${artist}`, 0.5);
  }

  return vector;
}

export function dotProduct(a, b) {
  let score = 0;
  const [smaller, larger] = Object.keys(a).length < Object.keys(b).length ? [a, b] : [b, a];
  for (const key of Object.keys(smaller)) {
    if (larger[key]) score += smaller[key] * larger[key];
  }
  return score;
}
