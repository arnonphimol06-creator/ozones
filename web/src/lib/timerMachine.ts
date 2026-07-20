import type { TimerMode, TimerSettings, TimerState } from "@/types";

const INITIAL_MODE: TimerMode = "focus";

export function durationMs(mode: TimerMode, settings: TimerSettings): number {
  const minutes =
    mode === "focus" ? settings.focusMin : mode === "short" ? settings.shortMin : settings.longMin;
  return minutes * 60_000;
}

export function createInitialState(settings: TimerSettings): TimerState {
  return {
    status: "idle",
    mode: INITIAL_MODE,
    endAt: null,
    remainingMs: durationMs(INITIAL_MODE, settings),
    completedCount: 0,
  };
}

export function nextMode(mode: TimerMode, completedCount: number, longInterval: number): TimerMode {
  if (mode !== "focus") return "focus";
  return completedCount > 0 && completedCount % longInterval === 0 ? "long" : "short";
}

export function getRemainingMs(state: TimerState, now: number): number {
  if (state.status === "running" && state.endAt !== null) {
    return Math.max(0, state.endAt - now);
  }
  return state.remainingMs;
}

export function isExpired(state: TimerState, now: number): boolean {
  return state.status === "running" && getRemainingMs(state, now) <= 0;
}

export function start(state: TimerState, now: number): TimerState {
  if (state.status === "running") return state;
  return { ...state, status: "running", endAt: now + state.remainingMs };
}

export function pause(state: TimerState, now: number): TimerState {
  if (state.status !== "running") return state;
  return { ...state, status: "paused", remainingMs: getRemainingMs(state, now), endAt: null };
}

export function reset(state: TimerState, settings: TimerSettings): TimerState {
  return { ...state, status: "idle", endAt: null, remainingMs: durationMs(state.mode, settings) };
}

export function skip(state: TimerState, settings: TimerSettings): TimerState {
  const mode = nextMode(state.mode, state.completedCount, settings.longInterval);
  return {
    status: "idle",
    mode,
    endAt: null,
    remainingMs: durationMs(mode, settings),
    completedCount: state.completedCount,
  };
}

export function complete(state: TimerState, settings: TimerSettings): TimerState {
  const completedCount = state.mode === "focus" ? state.completedCount + 1 : state.completedCount;
  const mode = nextMode(state.mode, completedCount, settings.longInterval);
  return {
    status: "idle",
    mode,
    endAt: null,
    remainingMs: durationMs(mode, settings),
    completedCount,
  };
}
