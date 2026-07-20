"use client";

import { Controls } from "@/components/Controls";
import { ModeTabs } from "@/components/ModeTabs";
import { TimerDisplay } from "@/components/TimerDisplay";
import { useTimer } from "@/hooks/useTimer";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export default function Home() {
  const { state, remainingMs, start, pause, skip, setMode } = useTimer(DEFAULT_SETTINGS);
  const isRunning = state.status === "running";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-[480px] rounded-lg bg-surface py-6 text-center">
        <ModeTabs mode={state.mode} onSelect={setMode} />
        <TimerDisplay remainingMs={remainingMs} />
        <Controls isRunning={isRunning} onToggle={isRunning ? pause : start} onSkip={skip} />
      </div>
    </main>
  );
}
