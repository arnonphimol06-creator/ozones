/* ═══════════ Ozones — focus timer + time-blocking calendar ═══════════ */
"use strict";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem("ozones." + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem("ozones." + key, JSON.stringify(value));
  },
};

/* ═══════════ Settings ═══════════ */

const DEFAULT_SETTINGS = {
  pomodoro: 25,
  short: 5,
  long: 15,
  autoBreak: false,
  autoPomo: false,
  interval: 4,   // pomodoros before a long break
  sound: true,
};

let settings = { ...DEFAULT_SETTINGS, ...store.get("settings", {}) };

/* ═══════════ Timer ═══════════ */

const MODE_LABEL = { pomodoro: "Time to focus!", short: "Time for a break!", long: "Time for a long break!" };

const timer = {
  mode: "pomodoro",
  running: false,
  remaining: settings.pomodoro * 60, // seconds
  endAt: null,                       // ms timestamp while running
  tickHandle: null,
};

// pomodoros completed today (drives "#N" and long-break cadence)
let daily = store.get("daily", { date: todayKey(), done: 0 });
if (daily.date !== todayKey()) daily = { date: todayKey(), done: 0 };

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function modeSeconds(mode) {
  return settings[mode] * 60;
}

function setMode(mode, { keepRunning = false } = {}) {
  if (!keepRunning) stopTicking();
  timer.mode = mode;
  timer.remaining = modeSeconds(mode);
  timer.endAt = null;
  document.body.dataset.mode = mode;
  $$(".mode-tab").forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
  renderTimer();
}

function startTimer() {
  if (timer.running) return;
  timer.running = true;
  timer.endAt = Date.now() + timer.remaining * 1000;
  timer.tickHandle = setInterval(tick, 250);
  renderTimer();
}

function pauseTimer() {
  if (!timer.running) return;
  timer.remaining = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
  stopTicking();
  renderTimer();
}

function stopTicking() {
  timer.running = false;
  timer.endAt = null;
  if (timer.tickHandle) { clearInterval(timer.tickHandle); timer.tickHandle = null; }
}

function tick() {
  timer.remaining = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
  renderTimer();
  if (timer.remaining <= 0) finishSession();
}

function finishSession(skipped = false) {
  stopTicking();
  if (!skipped && settings.sound) playAlarm();

  if (timer.mode === "pomodoro") {
    daily = { date: todayKey(), done: daily.done + 1 };
    store.set("daily", daily);
    bumpCurrentTask();
    const next = daily.done % settings.interval === 0 ? "long" : "short";
    setMode(next);
    if (settings.autoBreak) startTimer();
  } else {
    setMode("pomodoro");
    if (settings.autoPomo) startTimer();
  }
  renderTasks();
}

function renderTimer() {
  const m = String(Math.floor(timer.remaining / 60)).padStart(2, "0");
  const s = String(timer.remaining % 60).padStart(2, "0");
  $("#timeDisplay").textContent = `${m}:${s}`;
  document.title = `${m}:${s} - ${MODE_LABEL[timer.mode]} | Ozones`;

  const btn = $("#startBtn");
  btn.textContent = timer.running ? "PAUSE" : "START";
  btn.classList.toggle("running", timer.running);
  $("#skipBtn").classList.toggle("hidden", !timer.running);

  $("#sessionCount").textContent = `#${daily.done + 1}`;
  const current = tasks.find((t) => t.id === currentTaskId && !t.done);
  $("#sessionMsg").textContent =
    timer.mode === "pomodoro" && current ? current.title : MODE_LABEL[timer.mode];
}

/* ═══════════ Alarm sound (WebAudio, no assets) ═══════════ */

let audioCtx = null;

// AudioContext must be created/resumed inside a user gesture, or the
// end-of-session alarm plays into a suspended context and stays silent.
function unlockAudio() {
  if (!settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch { /* audio unavailable — ignore */ }
}

function playAlarm() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    [0, 0.35, 0.7].forEach((offset) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.32);
    });
  } catch { /* audio unavailable — ignore */ }
}

/* ═══════════ Tasks ═══════════ */

let tasks = store.get("tasks", []);
let currentTaskId = store.get("currentTaskId", null);

function saveTasks() {
  store.set("tasks", tasks);
  store.set("currentTaskId", currentTaskId);
}

function bumpCurrentTask() {
  const t = tasks.find((x) => x.id === currentTaskId);
  if (t) { t.act += 1; saveTasks(); }
}

function renderTasks() {
  const list = $("#taskList");
  list.innerHTML = "";
  for (const t of tasks) {
    const li = document.createElement("li");
    li.className = "task-item" + (t.done ? " done" : "") + (t.id === currentTaskId ? " current" : "");
    li.dataset.id = t.id;
    li.innerHTML = `
      <button class="task-check" title="Mark done">✓</button>
      <span class="task-name"></span>
      <span class="task-pomos">${t.act}/${t.est}</span>
      <button class="task-del" title="Delete task">🗑</button>`;
    li.querySelector(".task-name").textContent = t.title;
    list.appendChild(li);
  }
  renderSummary();
  renderTimer();
}

function renderSummary() {
  const box = $("#tasksSummary");
  const open = tasks.filter((t) => !t.done);
  if (!tasks.length) { box.classList.add("hidden"); return; }
  box.classList.remove("hidden");

  const remainingPomos = open.reduce((sum, t) => sum + Math.max(0, t.est - t.act), 0);
  const totalAct = tasks.reduce((s, t) => s + t.act, 0);
  const totalEst = tasks.reduce((s, t) => s + t.est, 0);

  // estimated finish time, pomofocus-style: pomodoros + breaks ahead
  const perCycle = settings.pomodoro + settings.short;
  const minutesLeft = remainingPomos * perCycle;
  const finish = new Date(Date.now() + minutesLeft * 60000);
  const hh = String(finish.getHours()).padStart(2, "0");
  const mm = String(finish.getMinutes()).padStart(2, "0");

  box.innerHTML = `Pomos: <b>${totalAct}</b> / <b>${totalEst}</b> &nbsp;·&nbsp; Finish At: <b>${hh}:${mm}</b> (${(minutesLeft / 60).toFixed(1)}h)`;
}

$("#taskList").addEventListener("click", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const t = tasks.find((x) => x.id === li.dataset.id);
  if (!t) return;

  if (e.target.closest(".task-check")) {
    t.done = !t.done;
  } else if (e.target.closest(".task-del")) {
    tasks = tasks.filter((x) => x.id !== t.id);
    if (currentTaskId === t.id) currentTaskId = null;
  } else {
    currentTaskId = t.id === currentTaskId ? null : t.id;
  }
  saveTasks();
  renderTasks();
});

$("#addTaskToggle").addEventListener("click", () => {
  $("#addTaskToggle").classList.add("hidden");
  $("#taskForm").classList.remove("hidden");
  $("#taskTitle").focus();
});

function closeTaskForm() {
  $("#taskForm").classList.add("hidden");
  $("#taskForm").reset();
  $("#taskEst").value = 1;
  $("#addTaskToggle").classList.remove("hidden");
}

$("#taskCancel").addEventListener("click", closeTaskForm);

$("#taskForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#taskTitle").value.trim();
  if (!title) return;
  const est = Math.max(0, Math.min(99, parseInt($("#taskEst").value, 10) || 1));
  const task = { id: uid(), title, est, act: 0, done: false };
  tasks.push(task);
  if (!currentTaskId) currentTaskId = task.id;
  saveTasks();
  renderTasks();
  closeTaskForm();
});

$("#estUp").addEventListener("click", () => { $("#taskEst").value = Math.min(99, (+$("#taskEst").value || 0) + 1); });
$("#estDown").addEventListener("click", () => { $("#taskEst").value = Math.max(0, (+$("#taskEst").value || 0) - 1); });

$("#clearTasksBtn").addEventListener("click", () => {
  if (!tasks.some((t) => t.done)) return;
  if (!confirm("Clear all finished tasks?")) return;
  tasks = tasks.filter((t) => !t.done);
  if (!tasks.some((t) => t.id === currentTaskId)) currentTaskId = null;
  saveTasks();
  renderTasks();
});

/* ═══════════ Timer controls ═══════════ */

$("#startBtn").addEventListener("click", () => {
  unlockAudio();
  timer.running ? pauseTimer() : startTimer();
});

$("#skipBtn").addEventListener("click", () => finishSession(true));

$$(".mode-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.dataset.mode === timer.mode) return;
    if (timer.running && !confirm("The timer is still running — switch anyway?")) return;
    setMode(tab.dataset.mode);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
  if (!$("#viewTimer").classList.contains("active")) return;
  if ($$(".modal-overlay").some((ov) => !ov.classList.contains("hidden"))) return;
  e.preventDefault();
  unlockAudio();
  timer.running ? pauseTimer() : startTimer();
});

/* ═══════════ View switching ═══════════ */

function showView(name) {
  $("#viewTimer").classList.toggle("active", name === "timer");
  $("#viewCalendar").classList.toggle("active", name === "calendar");
  $("#navTimer").classList.toggle("active", name === "timer");
  $("#navCalendar").classList.toggle("active", name === "calendar");
  if (name === "calendar") renderCalendar();
}

$("#navTimer").addEventListener("click", () => showView("timer"));
$("#navCalendar").addEventListener("click", () => showView("calendar"));
$("#logo").addEventListener("click", (e) => { e.preventDefault(); showView("timer"); });

/* ═══════════ Modals ═══════════ */

function openModal(id) { $("#" + id).classList.remove("hidden"); }
function closeModal(id) { $("#" + id).classList.add("hidden"); }

$$("[data-close]").forEach((btn) =>
  btn.addEventListener("click", () => closeModal(btn.dataset.close))
);
$$(".modal-overlay").forEach((ov) =>
  ov.addEventListener("pointerdown", (e) => { if (e.target === ov) ov.classList.add("hidden"); })
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $$(".modal-overlay").forEach((ov) => ov.classList.add("hidden"));
});

/* ═══════════ Settings modal ═══════════ */

$("#navSettings").addEventListener("click", () => {
  $("#setPomodoro").value = settings.pomodoro;
  $("#setShort").value = settings.short;
  $("#setLong").value = settings.long;
  $("#setAutoBreak").checked = settings.autoBreak;
  $("#setAutoPomo").checked = settings.autoPomo;
  $("#setInterval").value = settings.interval;
  $("#setSound").checked = settings.sound;
  openModal("settingsModal");
});

$("#settingsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  settings = {
    pomodoro: clampInt($("#setPomodoro").value, 1, 180, 25),
    short: clampInt($("#setShort").value, 1, 60, 5),
    long: clampInt($("#setLong").value, 1, 90, 15),
    autoBreak: $("#setAutoBreak").checked,
    autoPomo: $("#setAutoPomo").checked,
    interval: clampInt($("#setInterval").value, 1, 12, 4),
    sound: $("#setSound").checked,
  };
  store.set("settings", settings);
  if (!timer.running) setMode(timer.mode); // apply new duration immediately when idle
  renderSummary();
  closeModal("settingsModal");
});

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

/* ═══════════ Calendar — time blocking ═══════════ */

const BLOCK_COLORS = ["#e05252", "#e08e3c", "#d4b13f", "#4fa361", "#3f9bd4", "#7a63d0", "#c95fa8", "#6b7b8c"];
const SNAP = 15;            // minutes
const MIN_BLOCK = 15;       // minutes

let blocks = store.get("blocks", []); // {id, date, start, end, title, color, focus}
let calDate = new Date();
let editingBlockId = null;  // null = creating
let pendingRange = null;    // {start,end} while creating
let hourH = 64;

function saveBlocks() { store.set("blocks", blocks); }

function minutesToLabel(min) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}
function labelToMinutes(label) {
  const [h, m] = label.split(":").map(Number);
  return h * 60 + (m || 0);
}

function renderCalendar() {
  hourH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hour-h")) || 64;

  const canvas = $("#calCanvas");
  canvas.style.height = 24 * hourH + "px";

  // hour labels
  const hours = $("#calHours");
  hours.innerHTML = "";
  for (let h = 0; h < 24; h++) {
    const div = document.createElement("div");
    div.className = "cal-hour-label";
    div.textContent = `${String(h).padStart(2, "0")}:00`;
    hours.appendChild(div);
  }

  // date header
  const isToday = todayKey(calDate) === todayKey();
  $("#calDate").textContent = isToday
    ? "Today — " + calDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : calDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // blocks
  canvas.querySelectorAll(".cal-block").forEach((el) => el.remove());
  const key = todayKey(calDate);
  for (const b of blocks.filter((x) => x.date === key)) canvas.appendChild(buildBlockEl(b));

  updateNowLine();
  if (isToday && !canvas.dataset.scrolled) {
    canvas.dataset.scrolled = "1";
    const now = new Date();
    $("#calScroll").scrollTop = Math.max(0, (now.getHours() - 1) * hourH);
  }
}

function buildBlockEl(b) {
  const el = document.createElement("div");
  el.className = "cal-block";
  el.dataset.id = b.id;
  el.style.top = (b.start / 60) * hourH + "px";
  el.style.height = Math.max(18, ((b.end - b.start) / 60) * hourH - 2) + "px";
  el.style.background = b.color;
  el.innerHTML = `
    <div class="blk-title"></div>
    <div class="blk-time">${minutesToLabel(b.start)} – ${minutesToLabel(b.end)}</div>
    ${b.focus ? '<span class="blk-focus" title="Start pomodoro">⏱</span>' : ""}
    <div class="blk-resize"></div>`;
  el.querySelector(".blk-title").textContent = b.title || "(untitled)";
  return el;
}

function updateNowLine() {
  const line = $("#nowLine");
  if (todayKey(calDate) !== todayKey()) { line.classList.add("hidden"); return; }
  const now = new Date();
  line.style.top = ((now.getHours() * 60 + now.getMinutes()) / 60) * hourH + "px";
  line.classList.remove("hidden");
}
setInterval(updateNowLine, 60000);

/* — day navigation — */

function shiftDay(delta) {
  calDate.setDate(calDate.getDate() + delta);
  delete $("#calCanvas").dataset.scrolled;
  renderCalendar();
}
$("#calPrev").addEventListener("click", () => shiftDay(-1));
$("#calNext").addEventListener("click", () => shiftDay(1));
$("#calToday").addEventListener("click", () => { calDate = new Date(); delete $("#calCanvas").dataset.scrolled; renderCalendar(); });

/* — pointer interactions: create / move / resize / click-to-edit — */

const drag = { kind: null, id: null, startY: 0, anchorMin: 0, origStart: 0, origEnd: 0, moved: false, ghost: null, onFocusIcon: false };

function canvasMinutes(e) {
  const rect = $("#calCanvas").getBoundingClientRect();
  const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
  return Math.round(((y / hourH) * 60) / SNAP) * SNAP;
}

$("#calCanvas").addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const blockEl = e.target.closest(".cal-block");
  const canvas = $("#calCanvas");
  canvas.setPointerCapture(e.pointerId);
  drag.moved = false;
  drag.startY = e.clientY;

  if (blockEl) {
    const b = blocks.find((x) => x.id === blockEl.dataset.id);
    if (!b) return;
    drag.id = b.id;
    drag.origStart = b.start;
    drag.origEnd = b.end;
    drag.anchorMin = canvasMinutes(e);
    drag.kind = e.target.closest(".blk-resize") ? "resize" : "move";
    // pointer capture retargets later events to the canvas, so remember this now
    drag.onFocusIcon = !!e.target.closest(".blk-focus");
    blockEl.classList.add("dragging");
  } else {
    drag.kind = "create";
    drag.anchorMin = canvasMinutes(e);
    drag.ghost = document.createElement("div");
    drag.ghost.className = "cal-ghost";
    canvas.appendChild(drag.ghost);
    positionGhost(drag.anchorMin, drag.anchorMin + SNAP);
  }
});

function positionGhost(start, end) {
  drag.ghost.style.top = (start / 60) * hourH + "px";
  drag.ghost.style.height = ((end - start) / 60) * hourH + "px";
}

$("#calCanvas").addEventListener("pointermove", (e) => {
  if (!drag.kind) return;
  if (Math.abs(e.clientY - drag.startY) > 4) drag.moved = true;
  const cur = canvasMinutes(e);

  if (drag.kind === "create") {
    const start = Math.min(drag.anchorMin, cur);
    const end = Math.max(drag.anchorMin, cur, start + SNAP);
    positionGhost(start, end);
  } else {
    const b = blocks.find((x) => x.id === drag.id);
    const el = $(`.cal-block[data-id="${drag.id}"]`);
    if (!b || !el) return;
    if (drag.kind === "move") {
      const dur = drag.origEnd - drag.origStart;
      let start = drag.origStart + (cur - drag.anchorMin);
      start = Math.max(0, Math.min(24 * 60 - dur, start));
      b.start = start;
      b.end = start + dur;
    } else { // resize
      b.end = Math.max(drag.origStart + MIN_BLOCK, Math.min(24 * 60, cur));
    }
    el.style.top = (b.start / 60) * hourH + "px";
    el.style.height = Math.max(18, ((b.end - b.start) / 60) * hourH - 2) + "px";
    el.querySelector(".blk-time").textContent = `${minutesToLabel(b.start)} – ${minutesToLabel(b.end)}`;
  }
});

$("#calCanvas").addEventListener("pointerup", (e) => {
  const kind = drag.kind;
  drag.kind = null;
  $$(".cal-block.dragging").forEach((el) => el.classList.remove("dragging"));

  if (kind === "create") {
    const cur = canvasMinutes(e);
    drag.ghost && drag.ghost.remove();
    drag.ghost = null;
    let start = Math.min(drag.anchorMin, cur);
    let end = Math.max(drag.anchorMin, cur);
    if (end - start < MIN_BLOCK) end = Math.min(24 * 60, start + 30); // plain click → 30-min block
    openBlockModal(null, { start, end });
  } else if (kind === "move" || kind === "resize") {
    const b = blocks.find((x) => x.id === drag.id);
    if (drag.moved) {
      saveBlocks();
      renderCalendar();
    } else if (b) {
      // treat as click — undo any snap-boundary jitter from sub-threshold movement
      b.start = drag.origStart;
      b.end = drag.origEnd;
      renderCalendar();
      if (drag.onFocusIcon) {
        showView("timer");
        if (timer.mode !== "pomodoro") setMode("pomodoro");
        unlockAudio();
        startTimer();
      } else {
        openBlockModal(b.id);
      }
    }
    drag.id = null;
  }
});

$("#calCanvas").addEventListener("pointercancel", () => {
  if (!drag.kind) return;
  if (drag.kind === "move" || drag.kind === "resize") {
    const b = blocks.find((x) => x.id === drag.id);
    if (b) { b.start = drag.origStart; b.end = drag.origEnd; }
  }
  drag.ghost && drag.ghost.remove();
  drag.ghost = null;
  drag.kind = null;
  drag.id = null;
  $$(".cal-block.dragging").forEach((el) => el.classList.remove("dragging"));
  renderCalendar();
});

/* — block modal — */

let selectedColor = BLOCK_COLORS[0];

function renderSwatches() {
  const wrap = $("#blockColors");
  wrap.innerHTML = "";
  for (const c of BLOCK_COLORS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "swatch" + (c === selectedColor ? " selected" : "");
    btn.style.background = c;
    btn.addEventListener("click", () => { selectedColor = c; renderSwatches(); });
    wrap.appendChild(btn);
  }
}

function openBlockModal(blockId, range) {
  editingBlockId = blockId;
  pendingRange = range || null;
  const b = blockId ? blocks.find((x) => x.id === blockId) : null;

  $("#blockModalTitle").textContent = b ? "Edit Time Block" : "New Time Block";
  $("#blockTitle").value = b ? b.title : "";
  $("#blockStart").value = minutesToLabel(b ? b.start : range.start);
  $("#blockEnd").value = minutesToLabel(b ? b.end : range.end);
  $("#blockFocus").checked = b ? !!b.focus : false;
  selectedColor = b ? b.color : BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  renderSwatches();
  $("#blockDelete").classList.toggle("hidden", !b);
  openModal("blockModal");
  $("#blockTitle").focus();
}

$("#blockForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let start = labelToMinutes($("#blockStart").value || "09:00");
  let end = labelToMinutes($("#blockEnd").value || "09:30");
  if (end <= start) end = Math.min(24 * 60, start + MIN_BLOCK);

  const data = {
    title: $("#blockTitle").value.trim(),
    start, end,
    color: selectedColor,
    focus: $("#blockFocus").checked,
  };

  if (editingBlockId) {
    Object.assign(blocks.find((x) => x.id === editingBlockId), data);
  } else {
    blocks.push({ id: uid(), date: todayKey(calDate), ...data });
  }
  saveBlocks();
  closeModal("blockModal");
  renderCalendar();
});

$("#blockDelete").addEventListener("click", () => {
  blocks = blocks.filter((x) => x.id !== editingBlockId);
  saveBlocks();
  closeModal("blockModal");
  renderCalendar();
});

window.addEventListener("resize", () => {
  if ($("#viewCalendar").classList.contains("active")) renderCalendar();
});

/* ═══════════ Init ═══════════ */

setMode("pomodoro");
renderTasks();
