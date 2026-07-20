"use client";

import type { TimerMode } from "@/types";

const TABS: { mode: TimerMode; label: string }[] = [
  { mode: "focus", label: "Pomodoro" },
  { mode: "short", label: "Short Break" },
  { mode: "long", label: "Long Break" },
];

export function ModeTabs({
  mode,
  onSelect,
}: {
  mode: TimerMode;
  onSelect: (mode: TimerMode) => void;
}) {
  return (
    <div className="flex justify-center gap-1" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.mode}
          type="button"
          role="tab"
          aria-selected={tab.mode === mode}
          onClick={() => onSelect(tab.mode)}
          className={`rounded px-3 py-1 text-base text-text ${
            tab.mode === mode ? "bg-black/15 font-bold" : "opacity-85"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
