function getTopTag(track) {
  return track.tags?.[0] || 'untagged';
}

function hasRecentArtist(deck, artist, windowSize) {
  return deck.slice(-windowSize).some((item) => item.track.artist === artist);
}

function canKeepStrictTagCap(candidates, topTagCounts, maxPerTag, slotsLeft) {
  const availableWithoutCap = candidates.filter((candidate) => {
    const topTag = getTopTag(candidate.track);
    return (topTagCounts[topTag] || 0) < maxPerTag;
  }).length;

  return availableWithoutCap >= slotsLeft;
}

function pickCandidateIndex(candidates, deck, topTagCounts, maxPerTag, artistWindow, allowTagOverflow) {
  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const topTag = getTopTag(candidate.track);
    const artistRepeat = hasRecentArtist(deck, candidate.track.artist, artistWindow);
    const tagCapReached = (topTagCounts[topTag] || 0) >= maxPerTag;
    if (!artistRepeat && (!tagCapReached || allowTagOverflow)) return i;
  }

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    const topTag = getTopTag(candidate.track);
    const tagCapReached = (topTagCounts[topTag] || 0) >= maxPerTag;
    if (!tagCapReached || allowTagOverflow) return i;
  }

  return -1;
}

export function enforceDiversity(candidates, deckSize = 20, options = {}) {
  const maxTagPercent = options.maxTagPercent || 0.3;
  const artistWindow = options.artistWindow || 5;
  const maxPerTag = Math.max(1, Math.floor(deckSize * maxTagPercent));
  const remaining = [...candidates];
  const deck = [];
  const topTagCounts = {};

  while (deck.length < deckSize && remaining.length > 0) {
    const slotsLeft = deckSize - deck.length;
    const allowTagOverflow = !canKeepStrictTagCap(remaining, topTagCounts, maxPerTag, slotsLeft);
    const index = pickCandidateIndex(remaining, deck, topTagCounts, maxPerTag, artistWindow, allowTagOverflow);
    if (index === -1) break;

    const [selected] = remaining.splice(index, 1);
    deck.push(selected);
    const topTag = getTopTag(selected.track);
    topTagCounts[topTag] = (topTagCounts[topTag] || 0) + 1;
  }

  return deck;
}
