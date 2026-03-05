import { useEffect, useMemo, useRef, useState } from 'react';

function formatTime(time) {
  if (!Number.isFinite(time)) return '0:00';
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60)
    .toString()
    .padStart(2, '0');
  return `${min}:${sec}`;
}

function ProviderButton({ href, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
    >
      {label}
    </a>
  );
}

function MusicCard({ track, why }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [track.id]);

  const previewAvailable = Boolean(track.previewUrl);
  const progressPercent = useMemo(() => {
    if (!audioRef.current?.duration) return 0;
    return Math.min((progress / audioRef.current.duration) * 100, 100);
  }, [progress]);

  const togglePlay = async () => {
    if (!previewAvailable || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <article className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-black/45 p-4 text-white shadow-2xl backdrop-blur-xl">
      <div className="mb-4 overflow-hidden rounded-2xl">
        <img src={track.coverUrl} alt={`${track.title} cover`} className="aspect-square w-full object-cover" />
      </div>
      <div className="space-y-2">
        <h2 className="line-clamp-1 text-xl font-semibold">{track.title}</h2>
        <p className="line-clamp-1 text-sm text-white/75">{track.artist}</p>
        <div className="flex flex-wrap gap-2">
          {track.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[11px] text-white/80">
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-cyan-100/80">{why || 'Play more tracks to personalize recommendations.'}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-white/70">
          <span>{previewAvailable ? 'Preview' : 'Preview unavailable'}</span>
          <span>{formatTime(progress)}</span>
        </div>
        <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/15">
          <div className="h-full bg-gradient-to-r from-violet-400 to-cyan-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!previewAvailable}
          className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        {previewAvailable && (
          <audio
            ref={audioRef}
            src={track.previewUrl}
            onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ProviderButton href={track.links.spotify} label="Spotify" />
        <ProviderButton href={track.links.apple} label="Apple" />
        <ProviderButton href={track.links.youtube} label="YouTube" />
      </div>
    </article>
  );
}

export default MusicCard;
