"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { plans, branches } from "@/lib/content";
import { supabase, type NewMember } from "@/lib/supabase";
import { Check, CheckCircle2, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const steps = ["Your plan", "Your details", "Confirm"] as const;

const accentText = {
  orange: "text-brand-orange",
  green: "text-brand-green",
  blue: "text-brand-blue",
} as const;

type FormState = {
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  gender: string;
  branch: string;
  emergency_contact: string;
  goal: string;
};

const empty: FormState = {
  full_name: "", phone: "", email: "", date_of_birth: "",
  gender: "Female", branch: branches[0].name, emergency_contact: "",
  goal: "General Fitness",
};

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(plans[1].name);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string | null } | null>(null);

  function set<K extends keyof FormState>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError(null);
    if (!form.full_name.trim()) {
      setError("Please enter the member's full name.");
      setStep(1);
      return;
    }
    setSaving(true);
    const payload: NewMember = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      gender: form.gender || undefined,
      date_of_birth: form.date_of_birth || undefined,
      emergency_contact: form.emergency_contact.trim() || undefined,
      plan,
      branch: form.branch || undefined,
      goal: form.goal || undefined,
    };
    const { data, error: err } = await supabase
      .from("members")
      .insert(payload)
      .select("member_code")
      .single();
    setSaving(false);
    if (err) {
      setError(err.message || "Something went wrong. Please try again.");
      return;
    }
    setDone({ code: data?.member_code ?? null });
  }

  if (done) {
    return (
      <>
        <PageHeader eyebrow="Registration" title="Welcome to Taleh GYM" />
        <section className="container-px py-16">
          <div className="card mx-auto max-w-lg p-10 text-center">
            <CheckCircle2 size={56} className="mx-auto text-brand-green" />
            <h2 className="mt-5 font-display text-2xl font-bold text-foreground">You&apos;re in!</h2>
            <p className="mt-3 text-muted">
              {form.full_name || "Your"} membership ({plan}) has been created and
              saved. Your member ID is{" "}
              <span className="font-semibold text-brand-orange">{done.code ?? "—"}</span>.
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
                <Field label="Full name" value={form.full_name} onChange={(v) => set("full_name", v)} placeholder="e.g. Fadumo Ahmed" />
                <Field label="Phone number" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+252 ..." />
                <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="you@email.com" />
                <Field label="Date of birth" type="date" value={form.date_of_birth} onChange={(v) => set("date_of_birth", v)} />
                <Select label="Gender" value={form.gender} onChange={(v) => set("gender", v)} options={["Female", "Male"]} />
                <Select label="Preferred branch" value={form.branch} onChange={(v) => set("branch", v)} options={branches.map((b) => b.name)} />
                <Field label="Emergency contact" value={form.emergency_contact} onChange={(v) => set("emergency_contact", v)} placeholder="Name & phone" />
                <Select label="Goal" value={form.goal} onChange={(v) => set("goal", v)} options={["Weight Loss", "Muscle Gain", "Strength", "General Fitness", "Athletic Performance"]} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-foreground">Review &amp; confirm</h3>
                <div className="rounded-xl border border-line/10 bg-surface-2 p-5">
                  <Row label="Full name" value={form.full_name || "—"} />
                  <Row label="Selected plan" value={plan} />
                  <Row label="Branch" value={form.branch} />
                  <Row label="Goal" value={form.goal} />
                  <Row label="Billing" value={`$${plans.find((p) => p.name === plan)?.monthly}/month`} last />
                </div>
                <label className="flex items-start gap-3 text-sm text-muted">
                  <input type="checkbox" required className="mt-1 accent-brand-orange" />
                  I agree to the Taleh GYM terms, conditions and club rules.
                </label>
              </div>
            )}

            {error ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle size={16} /> {error}
              </div>
            ) : null}

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
                <Button variant="green" onClick={submit} disabled={saving}>
                  {saving ? (<><Loader2 size={16} className="animate-spin" /> Saving…</>) : "Complete registration"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label, type = "text", placeholder, value, onChange,
}: { label: string; type?: string; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
      />
    </div>
  );
}

function Select({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none"
      >
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
