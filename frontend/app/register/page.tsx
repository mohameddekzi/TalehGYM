"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { plans, branches } from "@/lib/content";
import { Check, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

const steps = ["Your plan", "Your details", "Confirm"] as const;

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(plans[1].name);
  const [done, setDone] = useState(false);

  const accentText = {
    orange: "text-brand-orange",
    green: "text-brand-green",
    blue: "text-brand-blue",
  } as const;

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Registration" title="Welcome to Taleh GYM" />
        <section className="container-px py-16">
          <div className="card mx-auto max-w-lg p-10 text-center">
            <CheckCircle2 size={56} className="mx-auto text-brand-green" />
            <h2 className="mt-5 font-display text-2xl font-bold text-foreground">You&apos;re in!</h2>
            <p className="mt-3 text-muted">
              Your {plan} membership request has been received. Check your email
              for your digital membership card and next steps.
            </p>
            <Button href="/login" className="mt-7">Go to member portal</Button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Online Registration"
        title={<>Join <span className="text-gradient">Taleh GYM</span></>}
        subtitle="Three quick steps to your membership and your digital QR card."
      />

      <section className="container-px py-14">
        <div className="mx-auto max-w-3xl">
          {/* Stepper */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                  i <= step ? "bg-brand-orange text-white" : "bg-surface-2 text-subtle"
                }`}>
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className={`hidden text-sm sm:block ${i <= step ? "text-foreground" : "text-subtle"}`}>{s}</span>
                {i < steps.length - 1 ? <div className="h-px w-8 bg-line/10 sm:w-12" /> : null}
              </div>
            ))}
          </div>

          <div className="card p-7">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setPlan(p.name)}
                    className={`rounded-2xl border p-5 text-left transition-all ${
                      plan === p.name
                        ? "border-brand-orange bg-brand-orange/5"
                        : "border-line/10 hover:border-line/25"
                    }`}
                  >
                    <p className="font-display text-lg font-bold text-foreground">{p.name}</p>
                    <p className="mt-1 text-sm text-muted">{p.tagline}</p>
                    <p className={`mt-3 font-display text-2xl font-extrabold ${accentText[p.accent]}`}>
                      ${p.monthly}<span className="text-sm font-normal text-subtle">/mo</span>
                    </p>
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" placeholder="e.g. Fadumo Ahmed" />
                <Field label="Phone number" placeholder="+252 ..." />
                <Field label="Email" type="email" placeholder="you@email.com" />
                <Field label="Date of birth" type="date" />
                <Select label="Gender" options={["Female", "Male"]} />
                <Select label="Preferred branch" options={branches.map((b) => b.name)} />
                <Field label="Emergency contact" placeholder="Name & phone" />
                <Select label="Goal" options={["Weight Loss", "Muscle Gain", "Strength", "General Fitness"]} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground">Review &amp; confirm</h3>
                <div className="rounded-xl border border-line/10 bg-surface-2 p-5">
                  <Row label="Selected plan" value={plan} />
                  <Row label="Billing" value={`$${plans.find((p) => p.name === plan)?.monthly}/month`} />
                  <Row label="QR membership card" value="Issued on activation" />
                  <Row label="Member portal" value="Access granted instantly" last />
                </div>
                <label className="flex items-start gap-3 text-sm text-muted">
                  <input type="checkbox" required className="mt-1 accent-brand-orange" />
                  I agree to the Taleh GYM terms, conditions and club rules.
                </label>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className={step === 0 ? "invisible" : ""}
              >
                <ArrowLeft size={16} /> Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Continue <ArrowRight size={16} />
                </Button>
              ) : (
                <Button variant="green" onClick={() => setDone(true)}>
                  Complete registration
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
      />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <select className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none">
        {options.map((o) => (
          <option key={o} className="bg-surface-2">{o}</option>
        ))}
      </select>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 ${last ? "" : "border-b border-line/5"}`}>
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
