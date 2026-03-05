import { describe, expect, it } from 'vitest';
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
    expect(loadUserProfile()).toEqual({ likedTags: {}, dislikedTags: {}, artistWeights: {}, recentHistory: [] });
    expect(() => saveUserProfile({ likedTags: { electro: 1 } })).not.toThrow();
  });

  it('applies tag and artist weights for like/dislike/save and records seen tracks', () => {
    const initial = { likedTags: {}, dislikedTags: {}, artistWeights: {}, recentHistory: [] };

    const liked = updateUserProfile(initial, baseTrack, 'like');
    expect(liked.likedTags.electro).toBe(1);
    expect(liked.artistWeights['artist a']).toBe(0.5);

    const disliked = updateUserProfile(liked, baseTrack, 'dislike');
    expect(disliked.dislikedTags.electro).toBe(1);
    expect(disliked.artistWeights['artist a']).toBe(0.25);

    const saved = updateUserProfile(disliked, baseTrack, 'save');
    expect(saved.likedTags.electro).toBe(3);
    expect(saved.artistWeights['artist a']).toBe(1.25);
    expect(saved.recentHistory[0]).toBe('1');

    const skipped = updateUserProfile(saved, { ...baseTrack, id: '2' }, 'skip');
    expect(skipped.recentHistory[0]).toBe('2');
    expect(skipped.likedTags.electro).toBe(3);
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

    expect(deckA).toEqual(deckB);
  });
});
