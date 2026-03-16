import { useEffect, useMemo, useRef, useState } from 'react';

const FALLBACK_COVER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="%230b1020"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23d1d5db" font-size="24" font-family="Arial">No Cover</text></svg>';

function formatTime(time) {
  if (!Number.isFinite(time)) return '0:00';
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60)
    .toString()
    .padStart(2, '0');
  return `${min}:${sec}`;
}

function isValidHttpUrl(url) {
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
  if (!isValidHttpUrl(href)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/90 hover:bg-white/10"
      aria-label={`Open ${label}`}
    >
      {label}
    </a>
  );
}

function MusicCard({ track, why }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const title = track?.title || 'Untitled track';
  const artist = track?.artist || 'Unknown artist';
  const genre = track?.genre || 'Discovery';
  const durationSec = Number.isFinite(track?.durationSec) && track.durationSec > 0 ? track.durationSec : 30;
  const coverUrl = isValidHttpUrl(track?.coverUrl) ? track.coverUrl : FALLBACK_COVER;
  const previewAvailable = useMemo(() => isValidHttpUrl(track?.previewUrl), [track?.previewUrl]);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    stopAudio(audioRef.current);
  }, [track?.id]);

  useEffect(
    () => () => {
      stopAudio(audioRef.current);
    },
    [],
  );

  const progressPercent = useMemo(() => Math.min(100, (progress / durationSec) * 100), [progress, durationSec]);

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
        <img src={coverUrl} alt={`${title} cover`} className="h-full w-full object-cover" />
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">{genre}</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
        <p className="text-white/80">{artist}</p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent2" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(durationSec)}</span>
        </div>
        <p className="text-xs text-cyan-100/80">{why || 'Play more tracks to personalize recommendations.'}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
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
        <ProviderButton href={track?.links?.spotify} label="Spotify" />
        <ProviderButton href={track?.links?.apple} label="Apple" />
        <ProviderButton href={track?.links?.youtube} label="YouTube" />
      </div>
    </article>
  );
}

export default MusicCard;
