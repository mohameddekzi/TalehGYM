<div align="center">

# Taleh GYM
### Fitness & Wellness Management System

**Train hard. Track everything.**

Brand palette (from the official logo): `#F58220` orange · `#16C13A` green · `#1E2ED1` blue

</div>

---

Taleh GYM is a premium, multi-branch fitness platform — a public marketing
website, a member/coach/admin portal, and the management system (ERP) behind a
modern gym chain. This repository hosts the product, starting with the **web
frontend** and the architecture for the full stack.

## What's in this repo today

| Area | Status | Path |
| --- | --- | --- |
| **Web frontend** (Next.js 15 + TypeScript + Tailwind) | ✅ Built & runnable | [`/frontend`](./frontend) |
| Public website (11 pages) | ✅ | `frontend/app` |
| Member portal dashboard (preview) | ✅ | `frontend/app/dashboard` |
| Online registration flow | ✅ | `frontend/app/register` |
| Design system & brand tokens | ✅ | `frontend/tailwind.config.ts` |
| Backend REST API (Laravel 12 + MySQL) | 📐 Specified | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |
| Mobile apps (Flutter) | 📐 Specified | [`ARCHITECTURE.md`](./ARCHITECTURE.md) |

> The full program (Laravel API, Flutter iOS/Android, payment integrations,
> ERP modules) is a multi-developer effort. This repo delivers a production-grade
> frontend foundation and a complete, buildable architecture for the rest —
> see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Frontend pages

Public: **Home · About · Membership · Personal Training · Classes · Trainers ·
Branches · Contact · Online Registration**
Platform: **Member Login · Member Dashboard (portal preview)**

Every page uses the dark, premium fitness theme and the brand colors pulled
directly from the Taleh GYM logo.

## Run the frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
# production build
npm run build && npm start
```

Requires Node 18.18+ (Node 20+ recommended).

## Tech stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, lucide-react
- **Backend (planned):** PHP Laravel 12, REST API, MySQL
- **Mobile (planned):** Flutter (Android & iOS)
- **Infra (planned):** Ubuntu VPS, Nginx, SSL, daily automated backups

## Core modules (product scope)

Public website · Member management · Member portal · Multi-branch management ·
Roles & permissions · QR attendance · Coach management · Diet & nutrition ·
Workout management · Progress tracking · Finance & billing (EVC Plus, E-Dahab,
bank, cash) · Inventory · Notifications (SMS/Email/WhatsApp) · Analytics
dashboard with PDF/Excel export.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the data model, API surface,
roles matrix and delivery roadmap.
