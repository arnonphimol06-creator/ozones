"use client";

import { useState } from "react";
import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";

export function TaskList({
  tasks,
  activeTaskId,
  onAdd,
  onSelect,
  onToggleDone,
  onDelete,
  onEdit,
}: {
  tasks: Task[];
  activeTaskId: string | null;
  onAdd: (title: string, estimated: number) => void;
  onSelect: (id: string) => void;
  onToggleDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, estimated: number) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [estimated, setEstimated] = useState(1);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd(trimmed, Math.max(0, Math.min(99, estimated)));
    setTitle("");
    setEstimated(1);
    setFormOpen(false);
  };

  return (
    <section className="mt-6">
      <h2 className="mb-3.5 border-b-2 border-white/60 pb-3 text-[17px] font-bold text-text">Tasks</h2>

      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isActive={task.id === activeTaskId}
            onSelect={() => onSelect(task.id)}
            onToggleDone={() => onToggleDone(task.id)}
            onDelete={() => onDelete(task.id)}
            onEdit={(title, estimated) => onEdit(task.id, title, estimated)}
          />
        ))}
      </ul>

      {formOpen ? (
        <form onSubmit={submit} className="mt-2.5 rounded-lg bg-white p-4.5 text-[#333]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you working on?"
            maxLength={120}
            autoFocus
            className="w-full border-none text-xl font-bold italic text-[#555] outline-none placeholder:text-[#ccc]"
          />
          <div className="mt-4">
            <label className="mb-2 block text-sm font-bold text-[#555]">Est Pomodoros</label>
            <input
              type="number"
              min={0}
              max={99}
              value={estimated}
              onChange={(e) => setEstimated(Number(e.target.value) || 0)}
              className="w-[70px] rounded-md bg-[#efefef] p-2 text-center font-bold text-[#555]"
            />
          </div>
          <div className="-mx-4.5 -mb-4.5 mt-4.5 flex justify-end gap-2.5 rounded-b-lg bg-[#efefef] p-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-3 py-2 text-sm font-bold text-[#888]"
            >
              Cancel
            </button>
            <button type="submit" className="rounded bg-[#222] px-5 py-2 text-sm font-bold text-white">
              Save
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="mt-2.5 w-full rounded-lg border-2 border-dashed border-white/50 p-4 text-[15px] font-bold text-white/85 hover:bg-black/10 hover:text-text"
        >
          ＋ Add Task
        </button>
      )}
    </section>
  );
}
