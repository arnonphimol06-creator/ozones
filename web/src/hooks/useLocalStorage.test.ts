import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns the initial value when nothing is persisted yet", () => {
    const { result } = renderHook(() => useLocalStorage("test.key", { count: 0 }));
    expect(result.current[0]).toEqual({ count: 0 });
  });

  it("persists updates to localStorage and reads them back in a fresh hook instance", () => {
    const { result, unmount } = renderHook(() => useLocalStorage("test.key", { count: 0 }));

    act(() => {
      result.current[1]({ count: 5 });
    });

    unmount();

    const { result: reloaded } = renderHook(() => useLocalStorage("test.key", { count: 0 }));
    expect(reloaded.current[0]).toEqual({ count: 5 });
  });

  it("wraps stored values with a version envelope so a future schema change can be detected", () => {
    const { result } = renderHook(() => useLocalStorage("test.versioned", "hello"));
    act(() => {
      result.current[1]("world");
    });

    const raw = window.localStorage.getItem("test.versioned");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed).toEqual({ version: 1, value: "world" });
  });

  it("falls back to the initial value if the persisted envelope has a mismatched version", () => {
    window.localStorage.setItem("test.oldVersion", JSON.stringify({ version: 999, value: "stale" }));
    const { result } = renderHook(() => useLocalStorage("test.oldVersion", "fresh"));
    expect(result.current[0]).toBe("fresh");
  });
});
