"use client";

import { useRef } from "react";
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveFocus = (fromIndex: number, delta: number) => {
    const nextIndex = (fromIndex + delta + TABS.length) % TABS.length;
    onSelect(TABS[nextIndex].mode);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(index, 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(index, -1);
    }
  };

  return (
    <div className="flex justify-center gap-1" role="tablist" aria-label="Timer mode">
      {TABS.map((tab, index) => {
        const selected = tab.mode === mode;
        return (
          <button
            key={tab.mode}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(tab.mode)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`focus-ring rounded px-2 py-1 text-sm text-text sm:px-3 sm:text-base ${
              selected ? "bg-black/15 font-bold" : "opacity-85"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
