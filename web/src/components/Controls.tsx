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
        className={`focus-ring select-none rounded px-10 py-3.5 text-lg font-bold uppercase tracking-widest text-bg shadow-[0_6px_0_rgba(235,235,235,1)] transition-colors duration-500 bg-btn-face sm:px-14 sm:text-xl ${
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
          className="focus-ring absolute bottom-9 right-5 flex h-11 w-11 items-center justify-center rounded-full text-2xl text-text opacity-90 transition-transform hover:scale-110"
        >
          ⏭
        </button>
      )}
    </>
  );
}
