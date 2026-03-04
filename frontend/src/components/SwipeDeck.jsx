import { AnimatePresence, motion } from 'framer-motion';
import MusicCard from './MusicCard';

const ACTION_STYLES = {
  like: 'border-emerald-300/30 text-emerald-200',
  dislike: 'border-rose-300/30 text-rose-200',
  save: 'border-cyan-300/30 text-cyan-200',
  skip: 'border-amber-300/30 text-amber-100',
};

const BUTTONS = [
  { action: 'dislike', label: '← Dislike' },
  { action: 'skip', label: '↓ Skip' },
  { action: 'save', label: '↑ Save' },
  { action: 'like', label: 'Like →' },
];

function detectSwipe(offsetX, offsetY) {
  const threshold = 120;
  if (offsetX > threshold) return 'like';
  if (offsetX < -threshold) return 'dislike';
  if (offsetY < -threshold) return 'save';
  if (offsetY > threshold) return 'skip';
  return null;
}

function SwipeDeck({ track, onAction }) {
  if (!track) {
    return (
      <div className="rounded-3xl border border-white/20 bg-black/40 p-8 text-center text-white/80 backdrop-blur-lg">
        No more tracks. Refresh your mood or mode for a new run.
      </div>
    );
  }

  return (
    <div className="z-10 flex w-full max-w-md flex-col items-center gap-4 px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={(_, info) => {
            const result = detectSwipe(info.offset.x, info.offset.y);
            if (result) onAction(result);
          }}
          whileDrag={{ scale: 1.01, rotate: 0.8 }}
        >
          <MusicCard track={track} />
        </motion.div>
      </AnimatePresence>

      <div className="grid w-full grid-cols-2 gap-2">
        {BUTTONS.map((item) => (
          <button
            key={item.action}
            type="button"
            onClick={() => onAction(item.action)}
            className={`rounded-xl border bg-white/5 px-3 py-2 text-sm font-medium backdrop-blur ${ACTION_STYLES[item.action]}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SwipeDeck;
