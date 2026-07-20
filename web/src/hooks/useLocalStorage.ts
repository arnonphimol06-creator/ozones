"use client";

import { useEffect, useState } from "react";

const STORAGE_VERSION = 1;

interface StoredEnvelope<T> {
  version: number;
  value: T;
}

/**
 * Persists a value to localStorage under `key`, wrapped with a version so a
 * future schema change can migrate old envelopes instead of silently misreading them.
 * Initial render always uses `initialValue` (matches SSR output); the persisted
 * value is applied client-side after mount to avoid a hydration mismatch.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return;
      const parsed = JSON.parse(raw) as StoredEnvelope<T>;
      if (parsed && parsed.version === STORAGE_VERSION) setValue(parsed.value);
    } catch {
      // localStorage unavailable (e.g. some incognito modes) or corrupted — keep initialValue
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      const envelope: StoredEnvelope<T> = { version: STORAGE_VERSION, value };
      window.localStorage.setItem(key, JSON.stringify(envelope));
    } catch {
      // storage disabled or quota exceeded — persistence degrades gracefully to in-memory only
    }
  }, [key, value]);

  return [value, setValue] as const;
}
