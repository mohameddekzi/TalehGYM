import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { stats } from "@/lib/content";
import { Target, Heart, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "About Us" };

const values = [
  { icon: Target, title: "Results first", desc: "Every program is built around measurable progress — not vanity metrics.", a: "text-brand-orange" },
  { icon: Heart, title: "People-centered", desc: "Coaches who know your name, your goals and your story.", a: "text-brand-green" },
  { icon: ShieldCheck, title: "Trust & safety", desc: "Clean facilities, certified staff and secure handling of member data.", a: "text-brand-blue" },
  { icon: Sparkles, title: "Always improving", desc: "We invest in equipment, technology and our team — continuously.", a: "text-brand-orange" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Taleh GYM"
        title={<>More than a gym — a <span className="text-gradient">movement</span></>}
        subtitle="Founded to make world-class training accessible across Somalia, Taleh GYM pairs premium facilities with technology that keeps every member moving forward."
      />

      <section className="container-px py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="From one room to six branches"
            />
            <div className="mt-6 space-y-4 text-muted">
              <p>
                Taleh GYM started with a simple belief: that great coaching and
                serious equipment shouldn&apos;t be a luxury. What began as a single
                training floor has grown into a network of premium clubs serving
                thousands of members.
              </p>
              <p>
                As we grew, we built the software we always wished existed — a
                single platform connecting members, coaches and managers, so the
                experience stays personal at any scale.
              </p>
              <p>
                Today every membership, workout, meal plan and check-in lives in
                one system, giving our team the insight to help members reach
                goals faster than ever.
              </p>
            </div>
            <Button href="/branches" className="mt-8">Visit a branch</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`card p-6 ${i % 2 ? "mt-8" : ""}`}>
                <p className="font-display text-3xl font-extrabold text-gradient">{s.value}</p>
                <p className="mt-2 text-sm text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line/5 bg-surface/40 py-20">
        <div className="container-px">
          <SectionHeading align="center" eyebrow="What we stand for" title="Our values" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="card p-6">
                <v.icon className={v.a} size={24} />
                <h3 className="mt-4 font-display text-base font-bold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
