import { describe, expect, it } from "vitest";
import type { TimerSettings } from "@/types";
import {
  complete,
  createInitialState,
  durationMs,
  getRemainingMs,
  isExpired,
  nextMode,
  pause,
  reset,
  skip,
  start,
} from "./timerMachine";

const settings: TimerSettings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: "default",
  alarmVolume: 1,
};

describe("createInitialState", () => {
  it("starts idle, on focus mode, with the full focus duration and no completions", () => {
    const s = createInitialState(settings);
    expect(s.status).toBe("idle");
    expect(s.mode).toBe("focus");
    expect(s.remainingMs).toBe(25 * 60_000);
    expect(s.completedCount).toBe(0);
    expect(s.endAt).toBeNull();
  });
});

describe("durationMs", () => {
  it("maps each mode to its configured minutes in ms", () => {
    expect(durationMs("focus", settings)).toBe(25 * 60_000);
    expect(durationMs("short", settings)).toBe(5 * 60_000);
    expect(durationMs("long", settings)).toBe(15 * 60_000);
  });
});

describe("start", () => {
  it("idle --START--> running, setting endAt from now + remainingMs", () => {
    const idle = createInitialState(settings);
    const running = start(idle, 1_000);
    expect(running.status).toBe("running");
    expect(running.endAt).toBe(1_000 + 25 * 60_000);
  });

  it("paused --START--> running, resuming from the frozen remainingMs", () => {
    const idle = createInitialState(settings);
    const running = start(idle, 0);
    const paused = pause(running, 10_000);
    const resumed = start(paused, 50_000);
    expect(resumed.status).toBe("running");
    expect(resumed.endAt).toBe(50_000 + paused.remainingMs);
  });

  it("is a no-op if already running", () => {
    const idle = createInitialState(settings);
    const running = start(idle, 0);
    const startedAgain = start(running, 5_000);
    expect(startedAgain).toEqual(running);
  });
});

describe("pause", () => {
  it("running --PAUSE--> paused, freezing remainingMs and clearing endAt", () => {
    const idle = createInitialState(settings);
    const running = start(idle, 0);
    const paused = pause(running, 10_000);
    expect(paused.status).toBe("paused");
    expect(paused.endAt).toBeNull();
    expect(paused.remainingMs).toBe(25 * 60_000 - 10_000);
  });

  it("is a no-op if not running (idle or already paused)", () => {
    const idle = createInitialState(settings);
    expect(pause(idle, 1_000)).toEqual(idle);

    const paused = pause(start(idle, 0), 1_000);
    expect(pause(paused, 2_000)).toEqual(paused);
  });
});

describe("getRemainingMs / isExpired", () => {
  it("computes remaining time from endAt - now, never decrementing a stored seconds counter", () => {
    const idle = createInitialState(settings);
    const running = start(idle, 0);
    expect(getRemainingMs(running, 10_000)).toBe(25 * 60_000 - 10_000);
    expect(getRemainingMs(running, 25 * 60_000)).toBe(0);
    expect(isExpired(running, 25 * 60_000 - 1)).toBe(false);
    expect(isExpired(running, 25 * 60_000)).toBe(true);
  });

  it("clamps to zero and never goes negative past the deadline", () => {
    const idle = createInitialState(settings);
    const running = start(idle, 0);
    expect(getRemainingMs(running, 999 * 60_000)).toBe(0);
  });

  it("returns the frozen remainingMs while idle/paused instead of using endAt", () => {
    const idle = createInitialState(settings);
    expect(getRemainingMs(idle, 999_999)).toBe(idle.remainingMs);
  });
});

describe("complete", () => {
  it("running --COMPLETE--> idle, switches mode, and increments completedCount only for focus sessions", () => {
    const idle = createInitialState(settings);
    const running = start(idle, 0);
    const done = complete(running, settings);
    expect(done.status).toBe("idle");
    expect(done.endAt).toBeNull();
    expect(done.completedCount).toBe(1);
    expect(done.mode).toBe("short");
  });

  it("does not increment completedCount when a break completes", () => {
    const afterFocus = complete(start(createInitialState(settings), 0), settings);
    const afterBreak = complete(start(afterFocus, 0), settings);
    expect(afterBreak.mode).toBe("focus");
    expect(afterBreak.completedCount).toBe(1);
  });

  it("gives a long break every longInterval-th completed focus session", () => {
    let s = createInitialState(settings);
    const modesAfterEachFocus: string[] = [];
    for (let i = 0; i < 8; i++) {
      s = start(s, 0);
      s = complete(s, settings); // completes a focus session
      modesAfterEachFocus.push(s.mode);
      s = start(s, 0);
      s = complete(s, settings); // completes the break, back to focus
    }
    expect(modesAfterEachFocus).toEqual([
      "short",
      "short",
      "short",
      "long",
      "short",
      "short",
      "short",
      "long",
    ]);
  });

  it("resets remainingMs to the new mode's full duration", () => {
    const done = complete(start(createInitialState(settings), 0), settings);
    expect(done.remainingMs).toBe(durationMs(done.mode, settings));
  });
});

describe("skip", () => {
  it("any status --SKIP--> idle, switching mode without counting it as completed", () => {
    const running = start(createInitialState(settings), 0);
    const skipped = skip(running, settings);
    expect(skipped.status).toBe("idle");
    expect(skipped.mode).toBe("short");
    expect(skipped.completedCount).toBe(0);
  });

  it("works from paused too", () => {
    const paused = pause(start(createInitialState(settings), 0), 1_000);
    const skipped = skip(paused, settings);
    expect(skipped.status).toBe("idle");
    expect(skipped.mode).toBe("short");
  });

  it("works from idle too", () => {
    const idle = createInitialState(settings);
    const skipped = skip(idle, settings);
    expect(skipped.status).toBe("idle");
    expect(skipped.mode).toBe("short");
  });
});

describe("reset", () => {
  it("any status --RESET--> idle, restoring the current mode's full duration and leaving completedCount untouched", () => {
    const running = start(createInitialState(settings), 0);
    const paused = pause(running, 5_000);
    const wasReset = reset(paused, settings);
    expect(wasReset.status).toBe("idle");
    expect(wasReset.endAt).toBeNull();
    expect(wasReset.mode).toBe("focus");
    expect(wasReset.remainingMs).toBe(25 * 60_000);
    expect(wasReset.completedCount).toBe(paused.completedCount);
  });
});

describe("nextMode", () => {
  it("focus always leads to short, except every longInterval-th completion which leads to long", () => {
    expect(nextMode("focus", 1, 4)).toBe("short");
    expect(nextMode("focus", 4, 4)).toBe("long");
    expect(nextMode("focus", 0, 4)).toBe("short");
  });

  it("short or long always leads back to focus", () => {
    expect(nextMode("short", 5, 4)).toBe("focus");
    expect(nextMode("long", 4, 4)).toBe("focus");
  });
});
