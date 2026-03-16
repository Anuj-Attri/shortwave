import { useEffect, useMemo, useState } from 'react';
import OnboardingFlow, { ONBOARDED_KEY } from './components/OnboardingFlow';
import SwipeDeck from './components/SwipeDeck';
import TopBar from './components/TopBar';
import seedTracks from './data/tracks.seed.json';
import { generateDeck, loadUserProfile, saveUserProfile, updateUserProfile } from './reco/recoEngine';
import useProfileSeed from './hooks/useProfileSeed';

const SAVED_KEY = 'shortwave:savedTracks';
const LEGACY_SAVED_KEY = 'shortwave_saved_tracks';

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function loadSavedTracks() {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(SAVED_KEY) || storage.getItem(LEGACY_SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function shouldShowOnboarding() {
  const storage = getStorage();
  if (!storage) return true;
  return storage.getItem(ONBOARDED_KEY) !== 'true';
}

function hasProfileSignals(profile) {
  return Object.keys(profile?.likedTags || {}).length > 0 || Object.keys(profile?.artistWeights || {}).length > 0;
}

function mergeSeedIntoProfile(profile, seed) {
  const next = {
    likedTags: { ...(profile?.likedTags || {}) },
    dislikedTags: { ...(profile?.dislikedTags || {}) },
    artistWeights: { ...(profile?.artistWeights || {}) },
    recentHistory: Array.isArray(profile?.recentHistory) ? [...profile.recentHistory] : [],
  };

  for (const vibe of seed?.vibes || []) {
    const key = String(vibe).trim().toLowerCase();
    if (!key) continue;
    next.likedTags[key] = Math.max(next.likedTags[key] || 0, 1);
  }

  for (const artist of seed?.artists || []) {
    const key = String(artist).trim().toLowerCase();
    if (!key) continue;
    next.artistWeights[key] = Math.max(next.artistWeights[key] || 0, 0.75);
  }

  return next;
}

function App() {
  const [mood, setMood] = useState('');
  const [mode, setMode] = useState('Comfort');
  const [deckIndex, setDeckIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(() => loadUserProfile());
  const [saved, setSaved] = useState(() => loadSavedTracks());
  const [savedOpen, setSavedOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());

  const profileSeed = useProfileSeed();

  const deck = useMemo(() => generateDeck(seedTracks, mood, mode, userProfile), [mode, mood, userProfile]);
  const currentEntry = deck[deckIndex];
  const currentTrack = currentEntry?.track;

  useEffect(() => {
    if (!profileSeed || hasProfileSignals(userProfile)) return;
    const seeded = mergeSeedIntoProfile(userProfile, profileSeed);
    setUserProfile(seeded);
    saveUserProfile(seeded);
  }, [profileSeed, userProfile]);

  useEffect(() => {
    setDeckIndex(0);
  }, [mode, mood]);

  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(SAVED_KEY, JSON.stringify(saved));
      if (storage.getItem(LEGACY_SAVED_KEY)) storage.removeItem(LEGACY_SAVED_KEY);
    } catch {
      // Ignore storage quota/security errors; in-memory state still works.
    }
  }, [saved]);

  const handleAction = (action) => {
    if (!currentTrack) return;
    setHistory((prev) => [...prev, { trackId: currentTrack.id, action, timestamp: Date.now() }]);

    const nextProfile = updateUserProfile(userProfile, currentTrack, action);
    setUserProfile(nextProfile);
    saveUserProfile(nextProfile);

    if (action === 'save') {
      setSaved((prev) => {
        if (prev.some((item) => item.id === currentTrack.id)) return prev;
        return [currentTrack, ...prev];
      });
    }

    setDeckIndex((prev) => prev + 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink pb-8 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,.3),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(34,211,238,.24),transparent_40%),radial-gradient(circle_at_40%_80%,rgba(236,72,153,.2),transparent_35%)] animate-drift" />
        <div className="noise" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col items-center gap-4">
        <TopBar
          mood={mood}
          setMood={setMood}
          mode={mode}
          setMode={setMode}
          savedCount={saved.length}
          onOpenSaved={() => setSavedOpen(true)}
        />

        <SwipeDeck track={currentTrack} why={currentEntry?.why} onAction={handleAction} />

        <p className="px-4 text-xs text-white/50">Session actions: {history.length}</p>
      </section>

      {showOnboarding && <OnboardingFlow onComplete={() => setShowOnboarding(false)} />}

      {savedOpen && (
        <div className="absolute inset-0 z-30 flex items-end bg-black/45 p-4 backdrop-blur-sm">
          <div className="max-h-[70vh] w-full rounded-3xl border border-white/20 bg-[#0c1120] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved tracks</h2>
              <button type="button" className="text-white/70" onClick={() => setSavedOpen(false)}>
                Close
              </button>
            </div>
            <div className="space-y-2 overflow-auto">
              {saved.length === 0 ? (
                <p className="text-sm text-white/60">No saved tracks yet.</p>
              ) : (
                saved.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
                    <img src={track.coverUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{track.title}</p>
                      <p className="truncate text-xs text-white/60">{track.artist}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
