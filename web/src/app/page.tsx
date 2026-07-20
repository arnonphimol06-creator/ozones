"use client";

import { useEffect, useRef, useState } from "react";
import { Controls } from "@/components/Controls";
import { ModeTabs } from "@/components/ModeTabs";
import { SettingsModal } from "@/components/SettingsModal";
import { TaskList } from "@/components/TaskList";
import { TimerDisplay } from "@/components/TimerDisplay";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTimer } from "@/hooks/useTimer";
import { DEFAULT_APP_STATE, DEFAULT_SETTINGS, MODE_LABEL, STORAGE_KEYS } from "@/lib/constants";
import type { AppState, Task, TimerSettings } from "@/types";

function createTaskId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function Home() {
  const [settings, setSettings] = useLocalStorage<TimerSettings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  );
  const [appState, setAppState] = useLocalStorage<AppState>(STORAGE_KEYS.state, DEFAULT_APP_STATE);
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { state, remainingMs, start, pause, skip, setMode } = useTimer(settings, {
    mode: appState.mode,
    completedCount: appState.completedCount,
  });
  const isRunning = state.status === "running";

  // Keep persisted mode/completedCount in sync with the timer's own state.
  useEffect(() => {
    setAppState((prev) =>
      prev.mode === state.mode && prev.completedCount === state.completedCount
        ? prev
        : { ...prev, mode: state.mode, completedCount: state.completedCount },
    );
  }, [state.mode, state.completedCount, setAppState]);

  // Whenever a focus session completes, credit the pomodoro to the active task.
  const prevCompletedCount = useRef(state.completedCount);
  useEffect(() => {
    if (state.completedCount > prevCompletedCount.current && appState.activeTaskId) {
      const activeId = appState.activeTaskId;
      setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, completed: t.completed + 1 } : t)));
    }
    prevCompletedCount.current = state.completedCount;
  }, [state.completedCount, appState.activeTaskId, setTasks]);

  const selectTask = (id: string) =>
    setAppState((prev) => ({ ...prev, activeTaskId: prev.activeTaskId === id ? null : id }));

  const addTask = (title: string, estimated: number) => {
    const task: Task = {
      id: createTaskId(),
      title,
      note: "",
      estimated,
      completed: 0,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, task]);
    setAppState((prev) => (prev.activeTaskId ? prev : { ...prev, activeTaskId: task.id }));
  };

  const editTask = (id: string, title: string, estimated: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title, estimated } : t)));

  const toggleTaskDone = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setAppState((prev) => (prev.activeTaskId === id ? { ...prev, activeTaskId: null } : prev));
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-2 p-4">
      <div className="flex w-full max-w-[480px] justify-end pt-2">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="rounded bg-surface px-3 py-1.5 text-text"
        >
          ⚙
        </button>
      </div>

      <div className="relative w-full max-w-[480px] rounded-lg bg-surface py-6 text-center">
        <ModeTabs mode={state.mode} onSelect={setMode} />
        <TimerDisplay remainingMs={remainingMs} />
        <Controls isRunning={isRunning} onToggle={isRunning ? pause : start} onSkip={skip} />
      </div>

      <div className="w-full max-w-[480px] text-center text-text">
        <div className="text-base opacity-70">#{state.completedCount + 1}</div>
        <div className="mt-1 text-[17px]">{MODE_LABEL[state.mode]}</div>
      </div>

      <div className="w-full max-w-[480px]">
        <TaskList
          tasks={tasks}
          activeTaskId={appState.activeTaskId}
          onAdd={addTask}
          onSelect={selectTask}
          onToggleDone={toggleTaskDone}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      </div>

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(next) => {
            setSettings(next);
            setSettingsOpen(false);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  );
}
