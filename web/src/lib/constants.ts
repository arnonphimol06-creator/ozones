import type { AppState, TimerMode, TimerSettings } from "@/types";

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: "default",
  alarmVolume: 1,
};

export const DEFAULT_APP_STATE: AppState = {
  mode: "focus",
  completedCount: 0,
  activeTaskId: null,
};

export const STORAGE_KEYS = {
  settings: "focusflow.settings",
  tasks: "focusflow.tasks",
  state: "focusflow.state",
} as const;

export const MODE_LABEL: Record<TimerMode, string> = {
  focus: "Time to focus!",
  short: "Time for a break!",
  long: "Time for a long break!",
};
