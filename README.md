# Ozones

A simple Pomodoro focus timer with task tracking, built with Next.js.

## Features

- Pomodoro / Short Break / Long Break timer with automatic mode switching (long break every 4th pomodoro)
- Start / Pause / Skip controls, manual mode switching
- Settings: per-mode durations, auto-start toggles, alarm sound + volume
- Task list: add / edit / delete / mark done, estimated vs. completed pomodoros per task, active-task selection
- Alarm sound + Browser Notification when a session ends, live countdown in the tab title
- Background color shifts per mode; everything persists to `localStorage`
- Responsive, keyboard-accessible (focus rings, ARIA tabs, focus-trapped settings dialog)

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · React state only (`useState`/`useReducer`/Context — no Redux/Zustand) · Vitest

## Getting started

```bash
cd web
npm install
npm run dev       # http://localhost:3000
```

Other scripts (run from `web/`):

```bash
npm run build      # production build
npm run start      # serve the production build
npm run test       # run the Vitest suite
npm run lint       # eslint
```

## Project structure

```
web/src/
├── app/            # routes, layout, metadata, generated icons/OG image
├── components/     # TimerDisplay, ModeTabs, Controls, SettingsModal, TaskList, TaskItem
├── hooks/          # useTimer, useLocalStorage, useNotification
├── lib/            # timerMachine (pure state machine), format, constants
└── types/
```

`lib/timerMachine.ts` is a pure function module (no React, no DOM) so the timer's state
transitions are unit-tested in isolation from the UI.

## Roadmap

See [Ozones.md](Ozones.md) for the full build plan, locked design decisions, and pre-release
checklist. Phase 2 (accounts, cloud sync, stats) is intentionally out of scope for this phase.

## Deployment

Deployed on Vercel, auto-deploying from `main`.
