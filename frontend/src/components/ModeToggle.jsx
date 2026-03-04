const MODES = ['Comfort', 'Explore', 'Rabbit Hole'];

function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="inline-flex rounded-full border border-white/20 bg-white/5 p-1 backdrop-blur">
      {MODES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onModeChange(item)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            mode === item
              ? 'bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-glow'
              : 'text-white/70 hover:text-white'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default ModeToggle;
