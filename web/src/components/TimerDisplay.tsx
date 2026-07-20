import { formatDuration } from "@/lib/format";

export function TimerDisplay({ remainingMs }: { remainingMs: number }) {
  return (
    <div className="clock text-center" aria-live="off">
      {formatDuration(remainingMs)}
    </div>
  );
}
