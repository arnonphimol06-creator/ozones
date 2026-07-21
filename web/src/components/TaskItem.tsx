"use client";

import { useState } from "react";
import type { Task } from "@/types";

export function TaskItem({
  task,
  isActive,
  onSelect,
  onToggleDone,
  onDelete,
  onEdit,
}: {
  task: Task;
  isActive: boolean;
  onSelect: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
  onEdit: (title: string, estimated: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [estimated, setEstimated] = useState(task.estimated);

  if (editing) {
    return (
      <li className="rounded bg-white p-3.5 text-[#333]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = title.trim();
            if (trimmed) onEdit(trimmed, Math.max(0, Math.min(99, estimated)));
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex items-center gap-2"
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">Task title</span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="focus-ring-dark w-full min-w-0 rounded bg-[#efefef] p-1.5 text-sm"
            />
          </label>
          <label>
            <span className="sr-only">Estimated pomodoros</span>
            <input
              type="number"
              min={0}
              max={99}
              value={estimated}
              onChange={(e) => setEstimated(Number(e.target.value) || 0)}
              className="focus-ring-dark w-14 rounded bg-[#efefef] p-1.5 text-center text-sm"
            />
          </label>
          <button
            type="submit"
            className="focus-ring-dark rounded bg-[#222] px-2.5 py-1.5 text-xs font-bold text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="focus-ring-dark rounded px-1.5 py-1.5 text-xs font-bold text-[#888]"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${isActive ? "Deselect" : "Select"} task: ${task.title}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`focus-ring-dark flex cursor-pointer items-center gap-2.5 rounded bg-white p-3.5 text-[#333] ${
        isActive ? "border-l-[6px] border-[#222]" : "border-l-[6px] border-transparent"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone();
        }}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        className={`focus-ring-dark flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full text-xs text-white ${
          task.done ? "bg-focus" : "bg-[#dfdfdf]"
        }`}
      >
        ✓
      </button>
      <span
        className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${task.done ? "text-[#aaa] line-through" : ""}`}
      >
        {task.title}
      </span>
      <span className="flex-none text-[13px] font-bold text-[#999]">
        {task.completed}/{task.estimated}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setTitle(task.title);
          setEstimated(task.estimated);
          setEditing(true);
        }}
        aria-label="Edit task"
        className="focus-ring-dark flex-none rounded px-1.5 py-0.5 text-[#bbb] hover:bg-[#f6f6f6] hover:text-[#555]"
      >
        ✎
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete task"
        className="focus-ring-dark flex-none rounded px-1.5 py-0.5 text-[#bbb] hover:bg-[#f6f6f6] hover:text-[#d55]"
      >
        🗑
      </button>
    </li>
  );
}
