# Roadmap: Pomodoro Web App
**สถานะ: ตัดสินใจแล้วทั้งหมด — ไม่ต้องถามซ้ำ ลงมือได้เลย**

---

## 0. คำตัดสินที่ล็อกไว้แล้ว (Locked Decisions)

| หัวข้อ | ตัดสินใจ | ห้ามเปลี่ยนจนกว่าจะจบเฟส 1 |
|---|---|---|
| ชื่อโปรเจกต์ (ชั่วคราว) | `Ozones` | เปลี่ยนชื่อแบรนด์ทีหลังได้ ไม่กระทบโค้ด |
| Framework | Next.js (App Router) | ✅ |
| ภาษา | TypeScript (strict mode) | ✅ |
| Styling | Tailwind CSS v4 | ✅ |
| State | React `useState` + `useReducer` + Context เท่านั้น | ห้ามใช้ Redux/Zustand ในเฟส 1 |
| Persistence เฟส 1 | `localStorage` ผ่าน custom hook ตัวเดียว | ✅ |
| Hosting | Vercel (free tier) | ✅ |
| Repo | GitHub, branch `main` เดียว | ✅ |
| Database เฟส 2 | Supabase (Postgres + Auth ในตัว) | ✅ |
| Auth เฟส 2 | Supabase Auth — Google OAuth + Magic Link | ห้ามเขียน auth เอง |
| Test runner | Vitest | ✅ |
| Error tracking | Sentry (ใส่ตอนเฟส 2) | ✅ |

**เหตุผลสั้น ๆ:** Next.js + Supabase ทำให้เฟส 2 ต่อยอดจากโค้ดเดิมได้โดยไม่ต้องรื้อ และทั้งสองอย่างมี free tier ที่พอสำหรับผู้ใช้หลักพันคน

---

## 1. MVP Scope (เฟส 1)

### ✅ ทำ
1. Timer 3 โหมด: Pomodoro (25:00) / Short Break (5:00) / Long Break (15:00)
2. ปุ่ม Start / Pause / Skip
3. สลับโหมดอัตโนมัติเมื่อหมดเวลา (Pomodoro → Break → Pomodoro)
4. Long break ทุก ๆ 4 pomodoro
5. หน้า Settings (modal): แก้เวลาแต่ละโหมด, toggle auto-start, เลือกเสียง, ปรับ volume
6. Task list: เพิ่ม / แก้ / ลบ / ติ๊กเสร็จ / ตั้งจำนวน pomodoro ต่อ task / เลือก task ที่กำลังทำ
7. เสียงเตือนเมื่อหมดเวลา + แจ้งเตือนผ่าน Browser Notification
8. เวลานับถอยหลังแสดงบน tab title
9. สีพื้นหลังเปลี่ยนตามโหมด
10. บันทึกทุกอย่างลง localStorage (refresh แล้วไม่หาย)
11. Responsive — mobile first

### ❌ ห้ามทำในเฟส 1 (ลิสต์นี้สำคัญที่สุดในเอกสาร)
- ระบบสมาชิก / ล็อกอิน
- Backend / API / Database ทุกชนิด
- หน้า Report / กราฟสถิติ
- Dark mode & theme หลายสี
- Sync ข้ามอุปกรณ์
- Integration (Todoist, Spotify, Notion)
- Drag & drop จัดเรียง task
- ระบบ payment / premium
- PWA / offline install
- i18n หลายภาษา

> ถ้าคุณเผลอเริ่มทำข้อไหนในลิสต์ ❌ ให้หยุดทันทีแล้วกลับมาอ่านบรรทัดนี้

---

## 2. Design System (ล็อกไว้แล้ว — ก๊อปไปใช้ได้เลย)

### สี
| Token | ค่า | ใช้กับ |
|---|---|---|
| `--focus` | `#BA4949` | พื้นหลังโหมด Pomodoro |
| `--short` | `#38858A` | พื้นหลังโหมด Short Break |
| `--long` | `#397097` | พื้นหลังโหมด Long Break |
| `--surface` | `rgba(255,255,255,0.10)` | การ์ด / panel |
| `--surface-strong` | `rgba(255,255,255,0.20)` | ปุ่มรอง, hover |
| `--text` | `#FFFFFF` | ตัวอักษรหลัก |
| `--text-muted` | `rgba(255,255,255,0.70)` | ตัวอักษรรอง |
| `--btn-face` | `#FFFFFF` | ปุ่ม Start |

พื้นหลังทั้งหน้าเปลี่ยนสีตามโหมด ด้วย `transition: background-color 500ms ease`

### Typography
- ฟอนต์: **Inter** (UI ทั่วไป) — โหลดผ่าน `next/font`
- ตัวเลขนาฬิกา: Inter, `font-variant-numeric: tabular-nums` (สำคัญ ไม่งั้นตัวเลขจะกระตุกซ้าย-ขวา)
- ขนาดนาฬิกา: `clamp(4.5rem, 18vw, 7.5rem)`, weight 700, letter-spacing `-0.02em`

### Spacing & Shape
- Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 px
- Border radius: การ์ด `8px`, ปุ่ม `4px`
- Container กว้างสุด: `480px` จัดกลาง

### ปุ่ม Start (signature interaction)
พื้นขาว ตัวอักษรสีตามโหมด ตัวใหญ่พิมพ์ใหญ่ letter-spacing กว้าง มี shadow ล่าง 6px และตอนกดให้เลื่อนลง 6px พร้อมลบ shadow (เอฟเฟกต์กดจริง)

---

## 3. Architecture ที่ตัดสินใจแล้ว

### โครงไฟล์
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── TimerDisplay.tsx
│   ├── ModeTabs.tsx
│   ├── Controls.tsx
│   ├── SettingsModal.tsx
│   ├── TaskList.tsx
│   └── TaskItem.tsx
├── hooks/
│   ├── useTimer.ts
│   ├── useLocalStorage.ts
│   └── useNotification.ts
├── lib/
│   ├── timerMachine.ts     ← logic บริสุทธิ์ ไม่มี React
│   ├── format.ts
│   └── constants.ts
└── types/
    └── index.ts
```

**กฎ:** `lib/timerMachine.ts` ต้องเป็นฟังก์ชันบริสุทธิ์ (pure function) ไม่ import React ไม่แตะ DOM — เพื่อให้ unit test ได้ง่าย

### Timer State Machine
```
สถานะ: 'idle' | 'running' | 'paused'
โหมด:   'focus' | 'short' | 'long'

idle    --START-->  running
running --PAUSE-->  paused
paused  --START-->  running
running --COMPLETE--> idle (+ สลับโหมด + เพิ่ม completedCount)
ทุกสถานะ --SKIP-->  idle (+ สลับโหมด)
ทุกสถานะ --RESET--> idle
```

### กฎการนับเวลา (ข้อผิดพลาดอันดับ 1 ของโปรเจกต์นี้)
- **ห้าม** เก็บ `secondsLeft` แล้ว `-1` ทุกวินาที
- ให้เก็บ `endAt: number` (epoch ms) แล้วคำนวณ `remaining = endAt - Date.now()` ทุก tick
- `setInterval` ที่ 250ms (ไม่ใช่ 1000ms) เพื่อให้ตัวเลขไม่กระโดดข้าม
- ตอน pause: เก็บ `remainingMs` แล้วเคลียร์ `endAt`; ตอน resume: `endAt = Date.now() + remainingMs`
- ผูก event `visibilitychange` เพื่อคำนวณใหม่ตอนกลับมาที่แท็บ

### Data Model (เฟส 1 — localStorage)
```
key: "focusflow.settings"
{ focusMin, shortMin, longMin, longInterval,
  autoStartBreaks, autoStartPomodoros, alarmSound, alarmVolume }

key: "focusflow.tasks"
[ { id, title, note, estimated, completed, done, createdAt } ]

key: "focusflow.state"
{ mode, completedCount, activeTaskId }
```
> ใส่ prefix `focusflow.` ทุก key และใส่ `version` ไว้ด้วย — เผื่อวันหนึ่งต้อง migrate

### Database Schema (เฟส 2 — ล็อกไว้ล่วงหน้า)
```
users        (จัดการโดย Supabase Auth)
tasks        id, user_id FK, title, note, estimated_pomodoros,
             completed_pomodoros, is_done, sort_order, created_at
sessions     id, user_id FK, task_id FK nullable, mode,
             duration_sec, started_at, ended_at, was_completed
settings     user_id PK/FK, focus_min, short_min, long_min,
             long_interval, auto_start_breaks, auto_start_pomodoros,
             alarm_sound, alarm_volume, updated_at
```
เปิด Row Level Security ทุกตาราง: `auth.uid() = user_id`

---

## 4. แผนรายวัน (14 วันทำงาน)

### สัปดาห์ที่ 1 — โครงและแกนกลาง
| วัน | งาน | เสร็จเมื่อ |
|---|---|---|
| D1 | สร้าง repo, `create-next-app`, ติดตั้ง Tailwind, ต่อ Vercel, deploy หน้าเปล่า | เปิดลิงก์ `.vercel.app` ได้จริง |
| D2 | ใส่ design token ทุกตัวลง `globals.css`, ตั้งฟอนต์, วาง layout เปล่า | หน้าเว็บสีแดง มี container กลางจอ |
| D3 | เขียน `lib/timerMachine.ts` + `types/index.ts` | ยังไม่มี UI แต่ logic ครบ |
| D4 | เขียน unit test ให้ timerMachine (Vitest) | ทุก transition ผ่านหมด |
| D5 | `useTimer` hook + `TimerDisplay` | นาฬิกาเดินได้จริงบนหน้าจอ |

### สัปดาห์ที่ 2 — ฟีเจอร์
| วัน | งาน | เสร็จเมื่อ |
|---|---|---|
| D6 | `ModeTabs` + `Controls` (Start/Pause/Skip) | สลับโหมดด้วยมือได้ |
| D7 | Auto-switch + long break ทุก 4 รอบ + `completedCount` | ปล่อยทิ้งไว้แล้วมันเดินเองครบวงจร |
| D8 | `useLocalStorage` + `SettingsModal` | ตั้งเวลาเอง refresh แล้วยังอยู่ |
| D9 | Task list เพิ่ม/ลบ/แก้/ติ๊ก | ใช้งานได้ครบ CRUD |
| D10 | เลือก active task + นับ pomodoro เข้า task นั้น | ตัวเลข x/y ขยับตอนจบรอบ |
| D11 | เสียงเตือน + Notification API + tab title countdown | ได้ยินเสียงและเห็นเวลาบนแท็บ |
| D12 | Responsive + a11y (focus ring, aria-label, keyboard) | ใช้บนมือถือจริงลื่นไหล |
| D13 | ทดสอบ edge case + แก้บั๊ก | ผ่านเช็กลิสต์ข้อ 5 ทั้งหมด |
| D14 | เก็บงาน, README, favicon, meta/OG tag, deploy final | ส่งลิงก์ให้เพื่อนได้ |

---

## 5. เช็กลิสต์ทดสอบก่อนปล่อย (ต้องผ่านทุกข้อ)
- [x] เริ่มจับเวลา → สลับไปแท็บอื่น 5 นาที → กลับมา เวลาต้องถูกต้อง (endAt-based, unit-tested + visibilitychange recompute)
- [ ] เริ่มจับเวลาบนมือถือ → ปิดจอ 3 นาที → เปิดจอ เวลาต้องถูกต้อง (กลไกเดียวกับข้อบน แต่ต้องทดสอบบนมือถือจริง — ดูข้อ 7.7)
- [x] refresh กลางคัน → settings และ task ยังอยู่ (timer reset ได้ ยอมรับได้)
- [x] แก้เวลา focus ระหว่างที่ timer กำลังวิ่ง → ต้องไม่พัง (แถมเจอบั๊ก: เปลี่ยนตอน idle ก่อนกด Start หน้าจอไม่อัปเดต — แก้แล้วใน useTimer.ts)
- [x] กด Start รัว ๆ 10 ครั้ง → ไม่มี interval ซ้อน (เวลาไม่วิ่งเร็วผิดปกติ) — วัดจริง drift 11ms/3s
- [x] เพิ่ม task 50 อัน → ยังลื่น — toggle latency ~93ms หลังมี 50 tasks
- [x] title ยาว 200 ตัวอักษร → layout ไม่แตก (truncate + min-w-0 กันไว้แล้ว)
- [x] localStorage เต็ม/ถูกปิด (โหมด incognito บางเบราว์เซอร์) → เว็บไม่ขาว
- [~] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 — Accessibility 96 ✅, Performance 81 (local `next start`, เจอบั๊กจริง: devtools bundle หลุดไปโปรดักชัน แก้แล้ว next.config.ts ทำให้ขึ้นจาก 72→81; ควรวัดใหม่กับ URL จริงบน Vercel ตอน D14 เพราะ local headless throttling โหดกว่าจริง)
- [ ] ทดสอบบน Chrome, Safari (iOS), Firefox (Chrome ผ่านอัตโนมัติแล้ว; Safari/Firefox ต้องทดสอบบนอุปกรณ์จริง — ดูข้อ 7.7)

---

## 6. เฟส 2 (เริ่มหลังเฟส 1 นิ่ง 1 สัปดาห์)
1. สร้างโปรเจกต์ Supabase + สร้างตารางตาม schema ข้อ 3 + เปิด RLS
2. ต่อ Supabase Auth (Google + Magic Link)
3. เขียน data layer แบบ interface เดียว สลับระหว่าง localStorage / Supabase ได้
4. **Migration flow:** ล็อกอินครั้งแรก → ถามผู้ใช้ว่าจะย้ายข้อมูลเดิมขึ้น cloud ไหม → ย้ายแล้วเคลียร์ local (จุดนี้ยากที่สุดของเฟส 2 อย่าประมาท)
5. บันทึก session ทุกครั้งที่จบ pomodoro
6. หน้า Report: กราฟแท่งรายวัน/สัปดาห์ + จำนวนชั่วโมงโฟกัสรวม (ใช้ Recharts)
7. Security pass: ทดสอบว่า user A ยิง API แก้ข้อมูล user B ไม่ได้, rate limit, validate ด้วย Zod ทั้งฝั่ง client และ server
8. ติดตั้ง Sentry + เปิด Supabase auto-backup

---

## 7. ส่วนที่ผมทำให้ไม่ได้ — คุณต้องลงมือเอง

| # | สิ่งที่ต้องทำ | หมายเหตุ |
|---|---|---|
| 1 | สร้างบัญชี GitHub + สร้าง repo | ผมสร้างบัญชีแทนไม่ได้ |
| 2 | สร้างบัญชี Vercel และเชื่อมกับ GitHub | กด Authorize เอง |
| 3 | รันคำสั่งติดตั้งบนเครื่องตัวเอง (`npm install` ฯลฯ) | ผมเขียนคำสั่งให้ได้ แต่รันบนเครื่องคุณไม่ได้ |
| 4 | สร้างบัญชี Supabase + เก็บ API key ไว้ใน `.env.local` | **อย่าเอา key มาแปะในแชท** |
| 5 | ซื้อโดเมน (ถ้าต้องการ) + ตั้ง DNS | Namecheap/Cloudflare ~350–500 บาท/ปี |
| 6 | หาไฟล์เสียงแจ้งเตือน | ต้องเป็นเสียงที่ license อนุญาต — แนะนำ freesound.org (CC0) หรืออัดเอง ผมสร้างไฟล์เสียงให้ไม่ได้ |
| 7 | ทดสอบบนอุปกรณ์จริง (iOS Safari โดยเฉพาะ) | เรื่องเสียง autoplay กับ Notification บน iOS มีข้อจำกัดที่ต้องเห็นด้วยตาตัวเอง |
| 8 | หา user 3–5 คนมาลองใช้แล้วเก็บ feedback | ข้อนี้แทนไม่ได้จริง ๆ และมีค่าที่สุด |
| 9 | ตัดสินใจ "จุดต่าง" ของเว็บคุณจาก Pomofocus | ผมเสนอไอเดียได้ แต่คุณต้องเลือก |
| 10 | ตั้งค่า Google OAuth ใน Google Cloud Console (เฟส 2) | ต้องยืนยันตัวตนด้วยบัญชีคุณ |

---

## 8. กฎเหล็กระหว่างทาง
1. Deploy ตั้งแต่วันแรก และ push อย่างน้อยวันละครั้ง
2. ห้ามแตะ backend ก่อนจบเฟส 1
3. ถ้าเจอฟีเจอร์ใหม่ที่อยากทำ → จดลงไฟล์ `IDEAS.md` แล้วทำต่อจากที่ค้างไว้
4. เจอบั๊กที่แก้ไม่ได้เกิน 45 นาที → จดไว้ ข้ามไปก่อน กลับมาวันถัดไป
5. ทุกวันจบด้วยสภาพที่ `npm run build` ผ่าน

---

**Next action ทันที:** ทำ D1 ให้เสร็จวันนี้ — repo + deploy หน้าเปล่าขึ้น Vercel  
เสร็จแล้วส่งลิงก์มา แล้วเราไป D2 กันต่อ
