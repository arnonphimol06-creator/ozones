"use client";

export function Controls({
  isRunning,
  onToggle,
  onSkip,
}: {
  isRunning: boolean;
  onToggle: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={`select-none rounded px-14 py-3.5 text-xl font-bold uppercase tracking-widest text-bg shadow-[0_6px_0_rgba(235,235,235,1)] transition-colors duration-500 bg-btn-face ${
          isRunning
            ? "translate-y-1.5 shadow-none"
            : "active:translate-y-1.5 active:shadow-none"
        }`}
      >
        {isRunning ? "Pause" : "Start"}
      </button>
      {isRunning && (
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip to next"
          className="absolute bottom-10 right-7 text-2xl text-text opacity-90 transition-transform hover:scale-110"
        >
          ⏭
        </button>
      )}
    </>
  );
}
