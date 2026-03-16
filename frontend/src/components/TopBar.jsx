import { useEffect, useState } from 'react';
import ModeToggle from './ModeToggle';

function TopBar({ mood, setMood, mode, setMode, savedCount, onOpenSaved, onSearchSubmit, loading }) {
  const [draftMood, setDraftMood] = useState(mood);

  useEffect(() => {
    setDraftMood(mood);
  }, [mood]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextMood = draftMood.trim();
    setMood(nextMood);
    onSearchSubmit(nextMood);
  };

  return (
    <header className="z-20 flex w-full max-w-md flex-col gap-3 px-4 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/50">Shortwave</p>
          <h1 className="text-xl font-semibold text-white">Discover your next obsession</h1>
        </div>
        <button
          type="button"
          onClick={onOpenSaved}
          className="rounded-full border border-white/25 bg-white/5 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/10"
        >
          Saved ({savedCount})
        </button>
      </div>

      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          value={draftMood}
          onChange={(event) => setDraftMood(event.target.value)}
          placeholder="Mood: night drive, dreamy, energetic..."
          className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none ring-violet-400/80 transition focus:ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl border border-cyan-300/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      <ModeToggle mode={mode} onModeChange={setMode} />
    </header>
  );
}

export default TopBar;
