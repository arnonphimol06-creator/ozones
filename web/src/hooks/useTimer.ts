"use client";

import { useCallback, useEffect, useState } from "react";
import * as machine from "@/lib/timerMachine";
import type { TimerMode, TimerSettings, TimerState } from "@/types";

const TICK_MS = 250;

export function useTimer(settings: TimerSettings) {
  const [state, setState] = useState<TimerState>(() => machine.createInitialState(settings));
  const [now, setNow] = useState(() => Date.now());

  // Drives re-renders while running so remainingMs (derived from endAt) stays live.
  // Never decrements a stored seconds counter — endAt - now is recomputed every tick.
  useEffect(() => {
    if (state.status !== "running") return;

    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, TICK_MS);

    // Background tabs throttle setInterval; recheck immediately on return so a
    // session that finished while hidden is caught right away, not on the next tick.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [state.status]);

  useEffect(() => {
    if (machine.isExpired(state, now)) {
      setState(machine.complete(state, settings));
    }
  }, [state, now, settings]);

  const remainingMs = machine.getRemainingMs(state, now);

  const start = useCallback(() => setState((s) => machine.start(s, Date.now())), []);
  const pause = useCallback(() => setState((s) => machine.pause(s, Date.now())), []);
  const skip = useCallback(() => setState((s) => machine.skip(s, settings)), [settings]);
  const reset = useCallback(() => setState((s) => machine.reset(s, settings)), [settings]);
  const setMode = useCallback(
    (mode: TimerMode) => setState((s) => machine.setMode(s, mode, settings)),
    [settings],
  );

  return { state, remainingMs, start, pause, skip, reset, setMode };
}
