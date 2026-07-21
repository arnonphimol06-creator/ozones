"use client";

import { useCallback, useEffect, useState } from "react";
import { unlockAudio, playAlarm } from "@/lib/audio";
import { MODE_LABEL } from "@/lib/constants";
import { formatDuration } from "@/lib/format";
import * as machine from "@/lib/timerMachine";
import type { TimerMode, TimerSettings, TimerState } from "@/types";
import { useNotification } from "./useNotification";

const TICK_MS = 250;

export function useTimer(
  settings: TimerSettings,
  initial?: { mode: TimerMode; completedCount: number },
) {
  const [state, setState] = useState<TimerState>(() => {
    const base = machine.createInitialState(settings);
    if (!initial) return base;
    return {
      ...base,
      mode: initial.mode,
      completedCount: initial.completedCount,
      remainingMs: machine.durationMs(initial.mode, settings),
    };
  });
  const [now, setNow] = useState(() => Date.now());
  const { requestPermission, notify } = useNotification();

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

  // Settings can change while idle (e.g. editing focus minutes before starting);
  // keep the displayed duration in sync instead of showing a stale value.
  useEffect(() => {
    setState((s) =>
      s.status === "idle" ? { ...s, remainingMs: machine.durationMs(s.mode, settings) } : s,
    );
  }, [settings]);

  useEffect(() => {
    if (!machine.isExpired(state, now)) return;

    let next = machine.complete(state, settings);
    const shouldAutoStart =
      next.mode === "focus" ? settings.autoStartPomodoros : settings.autoStartBreaks;
    if (shouldAutoStart) next = machine.start(next, Date.now());

    playAlarm(settings.alarmSound, settings.alarmVolume);
    notify(MODE_LABEL[next.mode], { body: "Ozones", tag: "ozones-session" });

    setState(next);
  }, [state, now, settings, notify]);

  const remainingMs = machine.getRemainingMs(state, now);

  // Tab-title countdown so the time is visible even when the app isn't the focused tab.
  useEffect(() => {
    document.title = `${formatDuration(remainingMs)} - ${MODE_LABEL[state.mode]} | Ozones`;
  }, [remainingMs, state.mode]);

  const start = useCallback(() => {
    unlockAudio();
    void requestPermission();
    setState((s) => machine.start(s, Date.now()));
  }, [requestPermission]);
  const pause = useCallback(() => setState((s) => machine.pause(s, Date.now())), []);
  const skip = useCallback(() => setState((s) => machine.skip(s, settings)), [settings]);
  const reset = useCallback(() => setState((s) => machine.reset(s, settings)), [settings]);
  const setMode = useCallback(
    (mode: TimerMode) => setState((s) => machine.setMode(s, mode, settings)),
    [settings],
  );

  return { state, remainingMs, start, pause, skip, reset, setMode };
}
