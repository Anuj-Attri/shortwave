import { describe, expect, it } from 'vitest';
import { enforceDiversity } from './diversity.js';

function makeEntry(i, tag, artist) {
  return {
    track: {
      id: `t${i}`,
      title: `Track ${i}`,
      artist,
      tags: [tag],
    },
    score: 20 - i,
  };
}

describe('enforceDiversity', () => {
  it('caps top-tag representation and avoids artist repeats inside five cards when possible', () => {
    const entries = [
      ...Array.from({ length: 10 }, (_, i) => makeEntry(i, 'electro', `Artist ${i % 2}`)),
      ...Array.from({ length: 10 }, (_, i) => makeEntry(10 + i, `tag-${i}`, `Unique ${i}`)),
    ];

    const deck = enforceDiversity(entries, 20);
    const electroCount = deck.filter((entry) => entry.track.tags[0] === 'electro').length;

    expect(deck).toHaveLength(20);
    expect(electroCount).toBeLessThanOrEqual(6);

    for (let i = 0; i < deck.length; i += 1) {
      const artist = deck[i].track.artist;
      const window = deck.slice(Math.max(0, i - 5), i).map((entry) => entry.track.artist);
      if (window.length >= 1 && window.some((a) => a !== artist)) {
        expect(window.includes(artist)).toBe(false);
      }
    }
  });

  it('fills the deck even when strict tag cap is mathematically impossible', () => {
    const entries = Array.from({ length: 20 }, (_, i) => makeEntry(i, 'electro', `Artist ${i}`));
    const deck = enforceDiversity(entries, 20);
    expect(deck).toHaveLength(20);
  });
});
