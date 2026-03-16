const ITUNES_BASE_URL = 'https://itunes.apple.com/search';
const FALLBACK_COVER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="%230b1020"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d1d5db" font-size="24" font-family="Arial">No Cover</text></svg>';

function isValidHttpUrl(url) {
  if (typeof url !== 'string' || url.trim().length === 0) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function safeUrl(url) {
  return isValidHttpUrl(url) ? url : null;
}

function toProviderLinks(track) {
  const apple = safeUrl(track.trackViewUrl);
  const youtubeQuery = `${track.artistName || ''} ${track.trackName || ''}`.trim();
  const youtube = youtubeQuery
    ? safeUrl(`https://music.youtube.com/search?q=${encodeURIComponent(youtubeQuery)}`)
    : null;

  return {
    spotify: null,
    apple,
    youtube,
  };
}

export function normalizeTrack(result) {
  const id = result?.trackId ? `itunes-${result.trackId}` : `itunes-${Math.random().toString(36).slice(2)}`;
  const title = String(result?.trackName || 'Untitled track').trim() || 'Untitled track';
  const artist = String(result?.artistName || 'Unknown artist').trim() || 'Unknown artist';
  const coverUrl = safeUrl(result?.artworkUrl100?.replace('100x100bb', '600x600bb')) || FALLBACK_COVER;
  const previewUrl = safeUrl(result?.previewUrl);

  const tags = [result?.primaryGenreName, result?.collectionName]
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.toLowerCase().trim());

  return {
    id,
    title,
    artist,
    coverUrl,
    previewUrl,
    links: toProviderLinks(result),
    tags,
  };
}

export async function searchTracks(query, limit = 20) {
  const normalizedQuery = String(query || '').trim();
  if (!normalizedQuery) return [];

  const url = new URL(ITUNES_BASE_URL);
  url.searchParams.set('term', normalizedQuery);
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 50)));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`iTunes search failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload?.results)) return [];

  return payload.results.map(normalizeTrack);
}

export function getProviderName() {
  return 'iTunes Search API';
}
