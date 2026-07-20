export type TimerStatus = "idle" | "running" | "paused";
export type TimerMode = "focus" | "short" | "long";

export interface TimerSettings {
  focusMin: number;
  shortMin: number;
  longMin: number;
  longInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;
}

export interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  /** epoch ms when the current session ends; set only while running */
  endAt: number | null;
  /** authoritative remaining time while idle/paused */
  remainingMs: number;
  completedCount: number;
}

export interface Task {
  id: string;
  title: string;
  note: string;
  estimated: number;
  completed: number;
  done: boolean;
  createdAt: number;
}

export interface AppState {
  mode: TimerMode;
  completedCount: number;
  activeTaskId: string | null;
}
