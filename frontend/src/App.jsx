import { useEffect, useState } from 'react';
import OnboardingFlow, { ONBOARDED_KEY } from './components/OnboardingFlow';
import SwipeDeck from './components/SwipeDeck';
import TopBar from './components/TopBar';
import seedTracks from './data/tracks.seed.json';
import { generateDeck, loadUserProfile, saveUserProfile, updateUserProfile } from './reco/recoEngine';
import useProfileSeed from './hooks/useProfileSeed';

const SAVED_KEY = 'shortwave_saved_tracks';

function App() {
  const [mood, setMood] = useState('');
  const [mode, setMode] = useState('Comfort');
  const [deckIndex, setDeckIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState(() => loadUserProfile());
  const [deck, setDeck] = useState(() => generateDeck(seedTracks, '', 'Comfort', userProfile));
  const [saved, setSaved] = useState(() => {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  });
  const [savedOpen, setSavedOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem(ONBOARDED_KEY) !== 'true');

  useProfileSeed();

  const currentEntry = deck[deckIndex];
  const currentTrack = currentEntry?.track;

  useEffect(() => {
    setDeck(generateDeck(seedTracks, mood, mode, userProfile));
    setDeckIndex(0);
  }, [mode, mood]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved]);

  const handleAction = (action) => {
    if (!currentTrack) return;
    setHistory((prev) => [...prev, { trackId: currentTrack.id, action, timestamp: Date.now() }]);

    let nextProfile = userProfile;
    setUserProfile((prev) => {
      nextProfile = updateUserProfile(prev, currentTrack, action);
      saveUserProfile(nextProfile);
      return nextProfile;
    });

    if (action === 'save') {
      setSaved((prev) => {
        if (prev.some((item) => item.id === currentTrack.id)) return prev;
        return [currentTrack, ...prev];
      });
    }

    setDeckIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= deck.length) {
        setDeck(generateDeck(seedTracks, mood, mode, nextProfile));
        return 0;
      }
      return nextIndex;
    });
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
