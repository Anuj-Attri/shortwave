import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateDeck, loadUserProfile, saveUserProfile, updateUserProfile } from './recoEngine.js';

const baseTrack = { id: '1', title: 'Test Song', artist: 'Artist A', tags: ['electro', 'night'] };

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe('profile storage + updates', () => {
  it('handles storage calls safely when localStorage is unavailable', () => {
    assert.deepEqual(loadUserProfile(), { likedTags: {}, dislikedTags: {}, artistWeights: {}, recentHistory: [] });
    assert.doesNotThrow(() => saveUserProfile({ likedTags: { electro: 1 } }));
  });

  it('applies tag and artist weights for like/dislike/save and records seen tracks', () => {
    const initial = { likedTags: {}, dislikedTags: {}, artistWeights: {}, recentHistory: [] };

    const liked = updateUserProfile(initial, baseTrack, 'like');
    assert.equal(liked.likedTags.electro, 1);
    assert.equal(liked.artistWeights['artist a'], 0.5);

    const disliked = updateUserProfile(liked, baseTrack, 'dislike');
    assert.equal(disliked.dislikedTags.electro, 1);
    assert.equal(disliked.artistWeights['artist a'], 0.25);

    const saved = updateUserProfile(disliked, baseTrack, 'save');
    assert.equal(saved.likedTags.electro, 3);
    assert.equal(saved.artistWeights['artist a'], 1.25);
    assert.equal(saved.recentHistory[0], '1');

    const skipped = updateUserProfile(saved, { ...baseTrack, id: '2' }, 'skip');
    assert.equal(skipped.recentHistory[0], '2');
    assert.equal(skipped.likedTags.electro, 3);
  });
});

describe('generateDeck', () => {
  it('is deterministic for seeded random input', () => {
    const tracks = Array.from({ length: 8 }, (_, idx) => ({
      id: `${idx}`,
      title: `Track ${idx}`,
      artist: `Artist ${idx % 3}`,
      tags: idx % 2 === 0 ? ['electro'] : ['ambient'],
    }));

    const profile = {
      likedTags: { electro: 2 },
      dislikedTags: {},
      artistWeights: {},
      recentHistory: [],
    };

    const deckA = generateDeck(tracks, 'electro', 'Explore', profile, { rng: seededRandom(42), deckSize: 6 }).map(
      (entry) => entry.track.id,
    );
    const deckB = generateDeck(tracks, 'electro', 'Explore', profile, { rng: seededRandom(42), deckSize: 6 }).map(
      (entry) => entry.track.id,
    );

    assert.deepEqual(deckA, deckB);
  });
});
