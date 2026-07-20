import type { TimerSettings } from "@/types";

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
