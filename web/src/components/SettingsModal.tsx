"use client";

import { useEffect, useRef, useState } from "react";
import type { TimerSettings } from "@/types";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<TimerSettings>(settings);
  const dialogRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const clampInt = (value: string, min: number, max: number, fallback: number) => {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-6"
      onClick={onClose}
    >
      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
        className="w-full max-w-[420px] rounded-lg bg-white p-5 text-[#333]"
      >
        <h3 id="settings-title" className="mb-4 text-sm font-bold uppercase tracking-wide text-[#888]">
          Settings
        </h3>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-bold text-[#777]">Pomodoro</span>
            <input
              ref={firstFieldRef}
              type="number"
              min={1}
              max={180}
              value={draft.focusMin}
              onChange={(e) =>
                setDraft((d) => ({ ...d, focusMin: clampInt(e.target.value, 1, 180, d.focusMin) }))
              }
              className="focus-ring-dark w-full rounded bg-[#efefef] p-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold text-[#777]">Short Break</span>
            <input
              type="number"
              min={1}
              max={60}
              value={draft.shortMin}
              onChange={(e) =>
                setDraft((d) => ({ ...d, shortMin: clampInt(e.target.value, 1, 60, d.shortMin) }))
              }
              className="focus-ring-dark w-full rounded bg-[#efefef] p-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-bold text-[#777]">Long Break</span>
            <input
              type="number"
              min={1}
              max={90}
              value={draft.longMin}
              onChange={(e) =>
                setDraft((d) => ({ ...d, longMin: clampInt(e.target.value, 1, 90, d.longMin) }))
              }
              className="focus-ring-dark w-full rounded bg-[#efefef] p-2"
            />
          </label>
        </div>

        <label className="mb-3 flex items-center justify-between text-sm">
          <span>Auto Start Breaks</span>
          <input
            type="checkbox"
            checked={draft.autoStartBreaks}
            onChange={(e) => setDraft((d) => ({ ...d, autoStartBreaks: e.target.checked }))}
            className="focus-ring-dark"
          />
        </label>
        <label className="mb-3 flex items-center justify-between text-sm">
          <span>Auto Start Pomodoros</span>
          <input
            type="checkbox"
            checked={draft.autoStartPomodoros}
            onChange={(e) => setDraft((d) => ({ ...d, autoStartPomodoros: e.target.checked }))}
            className="focus-ring-dark"
          />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-bold text-[#777]">Long Break interval</span>
          <input
            type="number"
            min={1}
            max={12}
            value={draft.longInterval}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                longInterval: clampInt(e.target.value, 1, 12, d.longInterval),
              }))
            }
            className="focus-ring-dark w-full rounded bg-[#efefef] p-2"
          />
        </label>

        <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#aaa]">Sound</h4>
        <label className="mb-3 flex items-center justify-between text-sm">
          <span>Alarm sound</span>
          <input
            type="checkbox"
            checked={draft.alarmSound !== "none"}
            onChange={(e) =>
              setDraft((d) => ({ ...d, alarmSound: e.target.checked ? "default" : "none" }))
            }
            className="focus-ring-dark"
          />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-bold text-[#777]">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={draft.alarmVolume}
            onChange={(e) => setDraft((d) => ({ ...d, alarmVolume: Number(e.target.value) }))}
            className="focus-ring-dark w-full"
          />
        </label>

        <div className="-mx-5 -mb-5 flex items-center justify-end gap-2 rounded-b-lg bg-[#efefef] p-3">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring-dark rounded px-3 py-2 text-sm font-bold text-[#888]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="focus-ring-dark rounded bg-[#222] px-5 py-2 text-sm font-bold text-white"
          >
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
