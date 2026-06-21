import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { plans, faqs } from "@/lib/content";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Membership Packages" };

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title={<>Find your <span className="text-gradient">plan</span></>}
        subtitle="Every plan includes the Taleh GYM app, your QR membership card and progress tracking. Pay annually and save two months."
      />

      <section className="container-px py-16">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative flex flex-col p-7 ${
                plan.featured ? "ring-1 ring-brand-orange/50" : ""
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-7 rounded-full bg-brand-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{plan.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-extrabold text-white">${plan.monthly}</span>
                <span className="mb-1 text-sm text-zinc-500">/ month</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">or ${plan.annual} billed yearly</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-zinc-300">
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

      <section className="container-px pb-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-3xl font-extrabold text-white">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card group p-5">
                <summary className="cursor-pointer list-none font-display text-base font-semibold text-white marker:hidden">
                  <span className="flex items-center justify-between">
                    {f.q}
                    <span className="text-brand-orange transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
