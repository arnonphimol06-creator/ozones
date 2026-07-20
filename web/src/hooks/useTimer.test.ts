import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { TimerSettings } from "@/types";
import { useTimer } from "./useTimer";

describe("useTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts idle at the full focus duration", () => {
    const { result } = renderHook(() => useTimer(DEFAULT_SETTINGS));
    expect(result.current.state.status).toBe("idle");
    expect(result.current.remainingMs).toBe(25 * 60_000);
  });

  it("counts down in real time once started, derived from endAt rather than a decrementing counter", () => {
    const { result } = renderHook(() => useTimer(DEFAULT_SETTINGS));

    act(() => result.current.start());
    expect(result.current.state.status).toBe("running");

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.remainingMs).toBe(25 * 60_000 - 10_000);
  });

  it("freezes remainingMs on pause and ignores further elapsed time", () => {
    const { result } = renderHook(() => useTimer(DEFAULT_SETTINGS));

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    act(() => result.current.pause());

    expect(result.current.state.status).toBe("paused");
    const frozen = result.current.remainingMs;

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(result.current.remainingMs).toBe(frozen);
  });

  it("resumes from the frozen remainingMs instead of the full duration", () => {
    const { result } = renderHook(() => useTimer(DEFAULT_SETTINGS));

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    act(() => result.current.pause());
    act(() => result.current.start());

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.remainingMs).toBe(25 * 60_000 - 5_000 - 1_000);
  });

  it("auto-completes and switches mode once the full duration elapses, without needing a manual complete() call", () => {
    // short focus duration keeps this test fast while still exercising real elapsed time
    const settings: TimerSettings = { ...DEFAULT_SETTINGS, focusMin: 0.1 }; // 6s
    const { result } = renderHook(() => useTimer(settings));

    act(() => result.current.start());
    act(() => {
      vi.advanceTimersByTime(6_000);
    });

    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.mode).toBe("short");
    expect(result.current.state.completedCount).toBe(1);
    expect(result.current.remainingMs).toBe(settings.shortMin * 60_000);
  });
});
