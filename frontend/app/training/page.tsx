import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { trainingPrograms } from "@/lib/content";
import { Dumbbell, Salad, LineChart, ClipboardList, MessagesSquare, CalendarCheck } from "lucide-react";

export const metadata: Metadata = { title: "Personal Training" };

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

const included = [
  { icon: ClipboardList, title: "Assessment & goal setting", desc: "InBody scan, movement screen and a clear plan with milestones." },
  { icon: Dumbbell, title: "Personalized workouts", desc: "A program built for your level, schedule and equipment access." },
  { icon: Salad, title: "Nutrition coaching", desc: "Meal plans with calorie and protein targets you can actually follow." },
  { icon: CalendarCheck, title: "Weekly check-ins", desc: "Accountability sessions to adjust your plan as you progress." },
  { icon: LineChart, title: "Progress tracking", desc: "Weight, body-fat, measurements and before/after photos in-app." },
  { icon: MessagesSquare, title: "Direct coach messaging", desc: "Reach your coach between sessions, right from the member portal." },
];

export default function TrainingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Personal Training"
        title={<>One coach. One plan. <span className="text-gradient">Real progress.</span></>}
        subtitle="Personal training at Taleh GYM pairs you with a certified coach and a structured program tracked end-to-end in our platform."
      />

      <section className="container-px py-20">
        <SectionHeading align="center" eyebrow="Choose a focus" title="Training programs" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainingPrograms.map((p) => (
            <div key={p.name} className="card p-6">
              <div className={`text-xs font-semibold uppercase tracking-widest ${accentText[p.accent]}`}>
                Program
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-white">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-ink-900/40 py-20">
        <div className="container-px">
          <SectionHeading align="center" eyebrow="What's included" title="Everything you need to win" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((i) => (
              <div key={i.title} className="card p-6">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/5 bg-ink-850">
                  <i.icon size={20} className="text-brand-orange" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-white">{i.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{i.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href="/register" size="lg">Start with a coach</Button>
          </div>
        </div>
      </section>
    </>
  );
}
