import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeTrack, searchTracks } from './itunes.js';

describe('itunes provider', () => {
  it('normalizes tracks into shortwave schema safely', () => {
    const normalized = normalizeTrack({
      trackId: 123,
      trackName: 'Sunset Blvd',
      artistName: 'Nova',
      artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/test/100x100bb.jpg',
      previewUrl: 'https://audio-ssl.itunes.apple.com/sample.m4a',
      trackViewUrl: 'https://music.apple.com/us/album/test/123?i=123',
      primaryGenreName: 'Pop',
      collectionName: 'Night Tape',
    });

    assert.equal(normalized.id, 'itunes-123');
    assert.equal(normalized.title, 'Sunset Blvd');
    assert.equal(normalized.artist, 'Nova');
    assert.equal(normalized.links.apple, 'https://music.apple.com/us/album/test/123?i=123');
    assert.equal(normalized.links.spotify, null);
    assert.match(normalized.coverUrl, /600x600bb/);
    assert.ok(Array.isArray(normalized.tags));
  });

  it('returns empty when query is missing', async () => {
    const result = await searchTracks('');
    assert.deepEqual(result, []);
  });

  it('throws when provider request fails', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 503 });

    try {
      await assert.rejects(() => searchTracks('house'), /itunes search failed: 503/i);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
