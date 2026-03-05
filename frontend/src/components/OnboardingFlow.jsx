import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { PROFILE_SEED_KEY } from '../hooks/useProfileSeed';

export const ONBOARDED_KEY = 'shortwave:onboarded';

const VIBE_OPTIONS = [
  'melancholic',
  'night-drive',
  'hype',
  'dreamy',
  'cinematic',
  'techno',
  'indie',
  'soulful',
  'sunset',
  'lo-fi',
];

const ARTIST_SUGGESTIONS = ['Frank Ocean', 'SZA', 'Tame Impala', 'Fred again..', 'Lana Del Rey', 'The Weeknd', 'ODESZA', 'Kendrick Lamar'];

const motionProps = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-cyan-300/80 bg-cyan-400/20 text-cyan-100'
          : 'border-white/20 bg-white/5 text-white/85 hover:border-white/35'
      }`}
    >
      {children}
    </button>
  );
}

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [vibes, setVibes] = useState([]);
  const [artists, setArtists] = useState([]);
  const [artistInput, setArtistInput] = useState('');

  const stepLabel = useMemo(() => ['Vibes', 'Artists', 'Ready'][step], [step]);

  const toggleVibe = (vibe) => {
    setVibes((prev) => {
      if (prev.includes(vibe)) return prev.filter((item) => item !== vibe);
      if (prev.length >= 3) return prev;
      return [...prev, vibe];
    });
  };

  const addArtist = (value) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    setArtists((prev) => {
      if (prev.length >= 3) return prev;
      if (prev.some((item) => item.toLowerCase() === cleaned.toLowerCase())) return prev;
      return [...prev, cleaned];
    });
    setArtistInput('');
  };

  const removeArtist = (name) => {
    setArtists((prev) => prev.filter((item) => item !== name));
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(PROFILE_SEED_KEY, JSON.stringify({ vibes, artists }));
    onComplete();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end bg-[#05060a]/80 p-4 backdrop-blur-md sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0a0f1d]/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,.55)]">
        <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/45">
          <span>Shortwave setup</span>
          <span>{step + 1}/3 · {stepLabel}</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.section key="vibes" {...motionProps} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Pick 3 vibes</h2>
                <p className="mt-1 text-sm text-white/60">Choose the moods that should shape your first wave.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((vibe) => (
                  <Chip key={vibe} active={vibes.includes(vibe)} onClick={() => toggleVibe(vibe)}>
                    {vibe}
                  </Chip>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={vibes.length < 3}
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </motion.section>
          )}

          {step === 1 && (
            <motion.section key="artists" {...motionProps} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Pick 3 artists you like</h2>
                <p className="mt-1 text-sm text-white/60">Add names manually or tap quick picks.</p>
              </div>

              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  addArtist(artistInput);
                }}
              >
                <input
                  value={artistInput}
                  onChange={(event) => setArtistInput(event.target.value)}
                  placeholder="Type an artist"
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/45 focus:border-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={artists.length >= 3}
                  className="rounded-xl border border-white/20 px-3 text-sm disabled:opacity-40"
                >
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {ARTIST_SUGGESTIONS.map((name) => {
                  const selected = artists.includes(name);
                  return (
                    <Chip key={name} active={selected} onClick={() => (selected ? removeArtist(name) : addArtist(name))}>
                      {name}
                    </Chip>
                  );
                })}
              </div>

              {artists.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/45">Selected</p>
                  <div className="flex flex-wrap gap-2">
                    {artists.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => removeArtist(name)}
                        className="rounded-full border border-cyan-300/60 bg-cyan-400/20 px-3 py-1 text-sm text-cyan-100"
                      >
                        {name} ×
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="w-1/3 rounded-2xl border border-white/20 px-4 py-3 text-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={artists.length < 3}
                  className="w-2/3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="ready" {...motionProps} className="space-y-4 text-center">
              <h2 className="text-2xl font-semibold">Ready</h2>
              <p className="text-sm text-white/65">
                Your first set blends {vibes.join(', ')} with artists like {artists.join(', ')}.
              </p>
              <button
                type="button"
                onClick={completeOnboarding}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 px-4 py-3 text-sm font-semibold text-black"
              >
                Start swiping
              </button>
              <button type="button" onClick={() => setStep(1)} className="text-sm text-white/60">
                Back
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
