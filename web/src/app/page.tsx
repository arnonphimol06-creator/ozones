"use client";

import { TimerDisplay } from "@/components/TimerDisplay";
import { useTimer } from "@/hooks/useTimer";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export default function Home() {
  const { state, remainingMs, start, pause } = useTimer(DEFAULT_SETTINGS);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      {/* Temporary click-to-toggle for today's demo; real Start/Pause/Skip buttons land in D6. */}
      <div
        onClick={state.status === "running" ? pause : start}
        className="w-full max-w-[480px] cursor-pointer rounded-lg bg-surface p-6"
      >
        <TimerDisplay remainingMs={remainingMs} />
      </div>
    </main>
  );
}
