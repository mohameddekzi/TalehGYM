# Taleh GYM — System Architecture

This document describes the complete Taleh GYM platform so each part can be
built consistently. The web frontend in [`/frontend`](./frontend) is the first
implemented piece; everything below defines the rest of the system.

## 1. High-level architecture

```
                 ┌──────────────────────────────────────────┐
                 │            Clients                        │
                 │  Next.js Web app   ·   Flutter (iOS/And.) │
                 └───────────────┬──────────────────────────┘
                                 │ HTTPS / JSON (REST)
                                 ▼
                 ┌──────────────────────────────────────────┐
                 │     Laravel 12 REST API (Sanctum auth)    │
                 │  Controllers · Form Requests · Policies   │
                 │  Services · Jobs/Queues · Events          │
                 └───────┬───────────────┬──────────────┬────┘
                         │               │              │
                    ┌────▼────┐   ┌──────▼─────┐  ┌─────▼──────┐
                    │  MySQL  │   │   Redis    │  │  Storage   │
                    │ (data)  │   │ cache/queue│  │ photos/QR  │
                    └─────────┘   └────────────┘  └────────────┘
                         │
          ┌──────────────┼─────────────────────────┐
          ▼              ▼                          ▼
   Payment gateways  Notifications            Reporting
   EVC Plus·E-Dahab  SMS·Email·WhatsApp       PDF · Excel
```

## 2. Tech stack

| Layer | Choice |
| --- | --- |
| Web frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| API | PHP Laravel 12, REST, Laravel Sanctum (token auth) |
| Database | MySQL 8 |
| Cache / queue | Redis |
| Mobile | Flutter (Android & iOS), shared REST client |
| Hosting | Ubuntu VPS, Nginx, SSL (Let's Encrypt) |
| Server | 4 vCPU · 8 GB RAM · 160 GB SSD |
| Backups | Daily automated DB + storage snapshots |

## 3. Roles & permissions matrix

| Capability | Super Admin | Branch Mgr | Reception | Finance | Coach | Member |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| Global settings | ✅ | — | — | — | — | — |
| Manage branches | ✅ | own | — | — | — | — |
| Member registration | ✅ | ✅ | ✅ | — | — | self |
| Attendance check-in/out | ✅ | ✅ | ✅ | — | — | self (QR) |
| Workout & diet plans | ✅ | ✅ | — | — | ✅ | view |
| Progress notes | ✅ | ✅ | — | — | ✅ | view |
| Payments & invoices | ✅ | view | take | ✅ | — | own |
| Financial reports | ✅ | own | — | ✅ | — | — |
| Inventory | ✅ | own | — | — | — | — |
| Analytics dashboard | ✅ | own | — | partial | partial | — |

Enforced server-side with Laravel Policies/Gates; the frontend mirrors it for UX.

## 4. Core data model (MySQL)

Key tables and important columns (FKs in *italics*):

- **branches** — id, name, city, address, hours, phone, is_flagship
- **users** — id, name, email, phone, password, role, *branch_id*, status
- **members** — id, *user_id*, photo, gender, dob, emergency_contact,
  *assigned_coach_id*, *branch_id*, status
- **membership_plans** — id, name, price_monthly, price_annual, perks(json)
- **memberships** — id, *member_id*, *plan_id*, start_date, end_date,
  state(active|frozen|expired|transferred), qr_token
- **attendances** — id, *member_id*, *branch_id*, check_in, check_out, method
- **workout_plans** / **workout_exercises** — *member_id*, *coach_id*, schedule
- **exercises** — id, name, muscle_group, media (exercise library)
- **diet_plans** / **meals** — *member_id*, *coach_id*, calorie_target, protein
- **progress_entries** — id, *member_id*, date, weight, height, bmi, body_fat,
  muscle_mass, waist, chest, photo_before, photo_after
- **payments** — id, *member_id*, amount, method(evc|edahab|bank|cash),
  type(membership|pt|product), *invoice_id*, status
- **invoices** / **receipts** — numbered, branch-scoped
- **products** / **stock_movements** / **suppliers** — inventory
- **notifications** — id, *user_id*, channel(sms|email|whatsapp), type, payload
- **messages** — coach ↔ member threads

## 5. REST API surface (representative)

```
POST   /api/auth/login                 POST /api/auth/logout
GET    /api/me
# Members
GET    /api/members      POST /api/members      GET/PUT /api/members/{id}
POST   /api/members/{id}/freeze         POST /api/members/{id}/transfer
GET    /api/members/{id}/card          # QR membership card
# Attendance
POST   /api/attendance/check-in        POST /api/attendance/check-out
GET    /api/attendance?branch=&from=&to=
# Training & nutrition
GET/POST /api/members/{id}/workout-plans
GET/POST /api/members/{id}/diet-plans
GET/POST /api/members/{id}/progress
# Finance
GET/POST /api/payments                 GET /api/invoices/{id}
# Operations
GET    /api/branches                   GET /api/inventory
GET    /api/analytics/kpis?branch=     GET /api/reports/{type}?format=pdf|xlsx
```

Auth via `Authorization: Bearer <token>` (Sanctum). Responses are JSON with a
consistent envelope `{ data, meta }` and RFC-style error objects.

## 6. QR attendance flow

1. On membership activation the API issues a signed `qr_token` per membership.
2. The member's app/card renders the token as a QR code.
3. Reception/turnstile scanner POSTs the token to `/api/attendance/check-in`.
4. API validates token + membership state, records the row, returns status.
5. Check-out mirrors the flow; reports aggregate by day/week/month/branch.

## 7. Payments

Pluggable `PaymentGateway` interface with drivers:

- **EVC Plus** and **E-Dahab** (mobile money) — initiate/charge/verify webhooks
- **Bank transfer** — reference + manual confirmation
- **Cash** — recorded at reception

Each successful charge creates a payment + invoice + receipt and fires a
`PaymentReceived` event (notifications, revenue analytics).

## 8. Notifications

Channel drivers for **SMS**, **Email** and **WhatsApp**, triggered by queued
jobs for: membership expiry, payment reminders, workout reminders, diet
reminders, and coach messages.

## 9. Delivery roadmap

1. **Phase 1 — Web foundation** *(this repo)*: public site, design system,
   portal/dashboard UI shell, registration flow.
2. **Phase 2 — API & auth**: Laravel scaffold, DB migrations, Sanctum, members,
   memberships, branches, roles.
3. **Phase 3 — Operations**: QR attendance, payments (EVC/E-Dahab), invoicing.
4. **Phase 4 — Coaching**: workout/diet plans, progress tracking, messaging.
5. **Phase 5 — Intelligence**: analytics KPIs, PDF/Excel reports, notifications.
6. **Phase 6 — Mobile**: Flutter member + coach apps on the same API.
7. **Phase 7 — Hardening**: inventory, multi-branch reports, backups, SSL, deploy.
