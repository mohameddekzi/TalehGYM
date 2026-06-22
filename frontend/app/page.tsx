import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  stats, plans, trainingPrograms, trainers, testimonials, classes,
} from "@/lib/content";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

export default function HomePage() {
  return (
    <>
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="relative isolate min-h-[88vh] overflow-hidden">
        <Image
          src={img("1517836357463-d25dfeac3438")}
          alt="Athlete training at Taleh GYM"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />

        <div className="container-px relative flex min-h-[88vh] flex-col justify-center py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-sm font-medium text-zinc-300">
              <span className="h-px w-10 bg-brand-orange" />
              Mogadishu · Two branches
            </div>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-7xl">
              Stronger every
              <br />
              day at <span className="text-brand-orange">Taleh</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              A serious training floor, coaches who know your name, and a plan
              that follows your progress — from your first session to your
              hundredth.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/register" size="lg">
                Become a member <ArrowRight size={18} />
              </Button>
              <Button href="/membership" variant="outline" size="lg">
                See pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-line/10 bg-surface/40">
        <div className="container-px grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-subtle">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── Story / About teaser ───────────────── */}
      <section className="container-px py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image src={img("1540497077202-7c8a3999166f", 1000)} alt="Inside Taleh GYM" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden rounded-2xl border border-line/10 bg-surface p-5 shadow-card sm:block">
              <p className="font-display text-2xl font-extrabold text-foreground">Since 2019</p>
              <p className="text-sm text-muted">Built in Mogadishu</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 text-sm font-medium text-muted">
              <span className="h-px w-10 bg-brand-green" /> Who we are
            </div>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              A gym that treats your goals like its own
            </h2>
            <div className="mt-6 space-y-4 text-muted">
              <p>
                Taleh GYM started with a single room and a simple promise: real
                coaching and proper equipment, without the intimidation. Today we
                train hundreds of members across two Mogadishu branches.
              </p>
              <p>
                Everything we do is built around people — friendly coaches,
                honest advice, and a clean, well-equipped floor that makes you
                want to come back.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Coaches who learn your name and your goals",
                "Plans that adapt as you get stronger",
                "Spotless equipment, looked after daily",
                "A community that shows up for each other",
              ].map((t) => (
                <div key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <Check size={18} className="mt-0.5 shrink-0 text-brand-orange" /> {t}
                </div>
              ))}
            </div>
            <Button href="/about" variant="ghost" className="mt-8 px-0 hover:bg-transparent hover:text-brand-orange">
              Read our story <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Programs ───────────────────────── */}
      <section className="border-y border-line/10 bg-surface/40 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Programs"
            title="Find the right path for you"
            subtitle="Whatever you're chasing, there's a structured program and a coach to match."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line/10 bg-line/10 sm:grid-cols-2 lg:grid-cols-4">
            {trainingPrograms.map((p) => (
              <Link key={p.name} href="/training" className="group bg-background p-7 transition-colors hover:bg-surface">
                <div className={`text-xs font-semibold uppercase tracking-widest ${accentText[p.accent]}`}>Program</div>
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  Learn more <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Classes ───────────────────────── */}
      <section className="container-px py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Group classes" title="Train with the room behind you" />
          <Button href="/classes" variant="outline" size="sm">All classes <ArrowRight size={16} /></Button>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {classes.slice(0, 3).map((c) => (
            <article key={c.name} className="group overflow-hidden rounded-2xl border border-line/10 bg-surface">
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">{c.category}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>
                <p className="mt-4 text-xs uppercase tracking-widest text-subtle">{c.duration} · {c.intensity} intensity</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Pricing ───────────────────────── */}
      <section className="border-y border-line/10 bg-surface/40 py-24">
        <div className="container-px">
          <SectionHeading align="center" eyebrow="Membership" title="Honest pricing, no surprises" subtitle="Every plan includes the app, your QR card and progress tracking. Freeze or upgrade whenever you need." />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative flex flex-col rounded-2xl border bg-background p-7 ${plan.featured ? "border-brand-orange shadow-card" : "border-line/10"}`}>
                {plan.featured ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Most popular</span>
                ) : null}
                <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="font-display text-4xl font-extrabold text-foreground">${plan.monthly}</span>
                  <span className="mb-1 text-sm text-subtle">/ month</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-muted">
                      <Check size={16} className={`mt-0.5 shrink-0 ${accentText[plan.accent]}`} /> {perk}
                    </li>
                  ))}
                </ul>
                <Button href="/register" variant={plan.featured ? "primary" : "outline"} className="mt-7 w-full">Choose {plan.name}</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Trainers ───────────────────────── */}
      <section className="container-px py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="The team" title="Coaches in your corner" />
          <Button href="/trainers" variant="outline" size="sm">Meet the team <ArrowRight size={16} /></Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t) => (
            <article key={t.name} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image src={t.photo} alt={t.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 to-transparent p-4">
                  <h3 className="font-display text-base font-bold text-white">{t.name}</h3>
                  <p className={`text-xs font-medium ${accentText[t.accent]}`}>{t.role}</p>
                </div>
              </div>
              <p className="mt-3 text-xs uppercase tracking-widest text-subtle">{t.specialty}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────────────── Testimonials ───────────────────────── */}
      <section className="border-y border-line/10 bg-surface/40 py-24">
        <div className="container-px">
          <SectionHeading align="center" eyebrow="Member stories" title="Real people, real progress" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-line/10 bg-background p-7">
                <Quote size={28} className="text-brand-orange/40" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">{t.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line/10 pt-5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-line/10 text-sm font-bold text-foreground">{t.initials}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-subtle">{t.detail}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-brand-orange">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Image src={img("1534438327276-14e5300c3a48")} alt="Train at Taleh GYM" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink-950/80" />
        <div className="container-px relative py-24 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Your first session is waiting
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-300">
            Walk in for a tour, or sign up online in two minutes. Either way, we&apos;ll
            help you start strong.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button href="/register" size="lg">Join Taleh GYM <ArrowRight size={18} /></Button>
            <Button href="/contact" variant="outline" size="lg">Book a tour</Button>
          </div>
        </div>
      </section>
    </>
  );
}
