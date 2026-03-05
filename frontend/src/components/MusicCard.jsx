import { useEffect, useMemo, useRef, useState } from 'react';

function formatTime(time) {
  if (!Number.isFinite(time)) return '0:00';
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60)
    .toString()
    .padStart(2, '0');
  return `${min}:${sec}`;
}

function isValidPreviewUrl(url) {
  if (typeof url !== 'string' || url.trim().length === 0) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function stopAudio(audioEl) {
  if (!audioEl) return;
  audioEl.pause();
  audioEl.currentTime = 0;
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

function MusicCard({ track }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const previewAvailable = useMemo(() => isValidPreviewUrl(track.previewUrl), [track.previewUrl]);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    stopAudio(audioRef.current);
  }, [track.id]);

  useEffect(
    () => () => {
      stopAudio(audioRef.current);
    },
    [],
  );

  const progressPercent = useMemo(() => {
    if (!track.durationSec) return 0;
    return Math.min(100, (progress / track.durationSec) * 100);
  }, [progress, track.durationSec]);

  const togglePlayback = async () => {
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
    <article className="w-full rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl shadow-glow">
      <div className="aspect-square overflow-hidden rounded-2xl">
        <img src={track.coverUrl} alt={`${track.title} cover`} className="h-full w-full object-cover" />
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">{track.genre}</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{track.title}</h2>
        <p className="text-white/80">{track.artist}</p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent2" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(track.durationSec)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-white/60">{previewAvailable ? '30s preview' : 'Preview unavailable'}</div>
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!previewAvailable}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        {previewAvailable && (
          <audio
            ref={audioRef}
            src={track.previewUrl}
            onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
            onEnded={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
            onError={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ProviderButton href={track.links?.spotify} label="Spotify" />
        <ProviderButton href={track.links?.apple} label="Apple" />
        <ProviderButton href={track.links?.youtube} label="YouTube" />
      </div>
    </article>
  );
}

export default MusicCard;
