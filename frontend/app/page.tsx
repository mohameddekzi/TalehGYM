import Link from "next/link";
import {
  Dumbbell, QrCode, HeartPulse, Salad, LineChart, Users,
  Building2, CreditCard, Bell, ArrowRight, Check, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  stats, plans, trainingPrograms, trainers, testimonials,
} from "@/lib/content";

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

const accentBorder = {
  orange: "hover:border-brand-orange/40",
  green: "hover:border-brand-green/40",
  blue: "hover:border-brand-blue/40",
} as const;

const platformModules = [
  { icon: Users, title: "Member Management", desc: "Registration, renewals, freezes, transfers and digital cards in one place.", accent: "orange" as const },
  { icon: QrCode, title: "QR Attendance", desc: "Check in and out with a scan. Live attendance across every branch.", accent: "green" as const },
  { icon: Dumbbell, title: "Workout Plans", desc: "Personalized programs, an exercise library and progress tracking.", accent: "blue" as const },
  { icon: Salad, title: "Diet & Nutrition", desc: "Meal plans, calorie and protein targets, water and weight tracking.", accent: "green" as const },
  { icon: LineChart, title: "Progress Tracking", desc: "Weight, BMI, body-fat and measurements with before/after photos.", accent: "orange" as const },
  { icon: Building2, title: "Multi-Branch", desc: "Unlimited branches with revenue, attendance and performance reports.", accent: "blue" as const },
  { icon: CreditCard, title: "Finance & Billing", desc: "EVC Plus, E-Dahab, bank and cash. Invoices, receipts and revenue.", accent: "orange" as const },
  { icon: Bell, title: "Notifications", desc: "SMS, Email and WhatsApp alerts for expiry, payments and reminders.", accent: "green" as const },
];

export default function HomePage() {
  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid-faint [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="container-px grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
              6 branches · 12,400+ members
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Train hard.
              <br />
              <span className="text-gradient">Track everything.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Taleh GYM blends a premium fitness club with a complete management
              platform — memberships, coaching, nutrition and progress, all in
              one experience for members, coaches and operators.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/register" size="lg">
                Start your membership <ArrowRight size={18} />
              </Button>
              <Button href="/membership" variant="outline" size="lg">
                View plans
              </Button>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-2xl font-extrabold text-foreground">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs text-subtle">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero showcase card */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="card relative overflow-hidden p-6">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-orange/20 blur-3xl" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-subtle">
                    Digital Membership
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-foreground">
                    Fadumo Ahmed
                  </p>
                  <p className="text-sm text-brand-green">Pro · Hodan Branch</p>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-xl bg-white p-2">
                  <QrCode size={64} className="text-ink-950" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Streak", value: "23 days", icon: HeartPulse, a: "orange" as const },
                  { label: "This week", value: "5 visits", icon: QrCode, a: "green" as const },
                  { label: "Goal", value: "-4.2 kg", icon: LineChart, a: "blue" as const },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-line/5 bg-surface-2 p-3">
                    <m.icon size={16} className={accentText[m.a]} />
                    <p className="mt-2 text-sm font-semibold text-foreground">{m.value}</p>
                    <p className="text-[11px] text-subtle">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-line/5 bg-surface-2 p-4">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Weekly goal</span>
                  <span className="text-foreground">5 / 6 sessions</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line/10">
                  <div className="h-full w-[83%] rounded-full bg-brand-gradient" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── Platform modules ───────────────────── */}
      <section className="container-px py-20">
        <SectionHeading
          eyebrow="One platform"
          title={<>Everything your gym runs on, <span className="text-gradient">connected</span></>}
          subtitle="From the first sign-up to the latest PR, Taleh GYM keeps members, coaches and management on the same page."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {platformModules.map((m) => (
            <div
              key={m.title}
              className={`card group p-6 transition-colors ${accentBorder[m.accent]}`}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-line/5 bg-surface-2">
                <m.icon size={20} className={accentText[m.accent]} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                {m.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Programs ───────────────────────── */}
      <section className="border-y border-line/5 bg-surface/40 py-20">
        <div className="container-px">
          <SectionHeading
            align="center"
            eyebrow="Programs"
            title="Built around your goal"
            subtitle="Pick a path and get a structured plan, the right coach and weekly accountability."
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trainingPrograms.map((p) => (
              <Link
                key={p.name}
                href="/training"
                className={`card group p-6 transition-all hover:-translate-y-1 ${accentBorder[p.accent]}`}
              >
                <div className={`text-xs font-semibold uppercase tracking-widest ${accentText[p.accent]}`}>
                  Program
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  Explore <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Pricing ───────────────────────── */}
      <section className="container-px py-20">
        <SectionHeading
          align="center"
          eyebrow="Membership"
          title="Simple plans, serious results"
          subtitle="No contracts you'll regret. Upgrade, freeze or transfer any time from the member portal."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative p-7 ${
                plan.featured ? "ring-1 ring-brand-orange/50" : ""
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-7 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-extrabold text-foreground">
                  ${plan.monthly}
                </span>
                <span className="mb-1 text-sm text-subtle">/ month</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-muted">
                    <Check size={16} className={`mt-0.5 shrink-0 ${accentText[plan.accent]}`} />
                    {perk}
                  </li>
                ))}
              </ul>
              <Button
                href="/register"
                variant={plan.featured ? "primary" : "outline"}
                className="mt-7 w-full"
              >
                Choose {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Trainers ───────────────────────── */}
      <section className="border-y border-line/5 bg-surface/40 py-20">
        <div className="container-px">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="The team"
              title="Coaches who get you results"
            />
            <Button href="/trainers" variant="outline" size="sm">
              Meet all coaches <ArrowRight size={16} />
            </Button>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trainers.map((t) => (
              <div key={t.name} className="card overflow-hidden">
                <div className="relative grid h-40 place-items-center bg-gradient-to-br from-surface-2 to-surface">
                  <div className={`grid h-20 w-20 place-items-center rounded-full text-2xl font-bold text-white ${
                    t.accent === "orange" ? "bg-brand-orange" : t.accent === "green" ? "bg-brand-green text-ink-950" : "bg-brand-blue"
                  }`}>
                    {t.initials}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-foreground">{t.name}</h3>
                  <p className={`text-xs font-medium ${accentText[t.accent]}`}>{t.role}</p>
                  <p className="mt-2 text-xs text-subtle">{t.specialty}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Testimonials ───────────────────────── */}
      <section className="container-px py-20">
        <SectionHeading
          align="center"
          eyebrow="Results"
          title="Members who put in the work"
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="card flex flex-col p-7">
              <div className="flex gap-0.5 text-brand-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-line/10 text-sm font-bold text-foreground">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-subtle">{t.detail}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="container-px pb-24">
        <div className="card relative overflow-hidden px-8 py-14 text-center sm:px-16">
          <div className="absolute inset-0 -z-10 opacity-30 bg-brand-gradient blur-2xl" />
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Your strongest year starts today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Join Taleh GYM and get a coach, a plan and a club that tracks every
            step of your progress.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/register" size="lg">
              Join Taleh GYM <ArrowRight size={18} />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Book a tour
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
