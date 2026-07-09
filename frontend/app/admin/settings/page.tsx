"use client";

import { useEffect, useState } from "react";
import {
  Building2, CreditCard, Bell, Fingerprint, Check, Loader2, Save, Globe,
} from "lucide-react";
import { loadSettings, saveSettings, DEFAULT_SETTINGS, type Settings } from "@/lib/settings";

const API_KEY = "taleh-zkt-2026";

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => { setS(await loadSettings()); setLoading(false); })();
  }, []);

  function set<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try { await saveSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); } finally { setSaving(false); }
  }

  if (loading) {
    return <div className="py-10 text-sm text-muted">Loading settings…</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted">Configure your gym, billing, notifications and access control.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>

      {/* Gym profile */}
      <Section icon={Building2} title="Gym profile" desc="Your club's public identity and contact details.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gym name" value={s.gymName} onChange={(v) => set("gymName", v)} />
          <Field label="Tagline" value={s.tagline} onChange={(v) => set("tagline", v)} />
          <Field label="Phone" value={s.phone} onChange={(v) => set("phone", v)} />
          <Field label="Email" value={s.email} onChange={(v) => set("email", v)} />
          <Field label="WhatsApp" value={s.whatsapp} onChange={(v) => set("whatsapp", v)} />
          <Field label="Address" value={s.address} onChange={(v) => set("address", v)} />
        </div>
      </Section>

      {/* Access & subscription */}
      <Section icon={Fingerprint} title="Access & subscription" desc="How long a paid membership grants door access.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Subscription length (days)" type="number" value={String(s.subscriptionDays)} onChange={(v) => set("subscriptionDays", Number(v) || 30)} />
          <Field label="Grace period (days)" type="number" value={String(s.graceDays)} onChange={(v) => set("graceDays", Number(v) || 0)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">ZKTeco API key</label>
            <div className="flex items-center gap-2 rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5">
              <code className="flex-1 truncate text-sm text-foreground">{API_KEY}</code>
              <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-semibold text-brand-green">Active</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Payment methods */}
      <Section icon={CreditCard} title="Payment methods" desc="Which methods reception can accept.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle label="EVC Plus" on={s.payments.evc} onChange={(v) => set("payments", { ...s.payments, evc: v })} />
          <Toggle label="E-Dahab" on={s.payments.edahab} onChange={(v) => set("payments", { ...s.payments, edahab: v })} />
          <Toggle label="Bank Transfer" on={s.payments.bank} onChange={(v) => set("payments", { ...s.payments, bank: v })} />
          <Toggle label="Cash" on={s.payments.cash} onChange={(v) => set("payments", { ...s.payments, cash: v })} />
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" desc="Channels and reminders sent to members.">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-subtle">Channels</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle label="SMS" on={s.notify.sms} onChange={(v) => set("notify", { ...s.notify, sms: v })} />
          <Toggle label="Email" on={s.notify.email} onChange={(v) => set("notify", { ...s.notify, email: v })} />
          <Toggle label="WhatsApp" on={s.notify.whatsapp} onChange={(v) => set("notify", { ...s.notify, whatsapp: v })} />
        </div>
        <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-widest text-subtle">Reminders</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle label="Membership expiry" on={s.reminders.expiry} onChange={(v) => set("reminders", { ...s.reminders, expiry: v })} />
          <Toggle label="Payment due" on={s.reminders.payment} onChange={(v) => set("reminders", { ...s.reminders, payment: v })} />
          <Toggle label="Workout reminders" on={s.reminders.workout} onChange={(v) => set("reminders", { ...s.reminders, workout: v })} />
        </div>
      </Section>

      {/* Localization */}
      <Section icon={Globe} title="Localization" desc="Currency shown across the dashboard.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Currency symbol" value={s.currency} onChange={(v) => set("currency", v)} />
        </div>
      </Section>

      <div className="mt-8 flex justify-end">
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }: { icon: typeof Building2; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="card mt-5 p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line/5 bg-surface-2">
          <Icon size={18} className="text-brand-orange" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted">{desc}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-muted">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:border-brand-orange/60 focus:outline-none" />
    </div>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className="flex items-center justify-between rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-left transition-colors hover:border-line/25">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-brand-green" : "bg-line/20"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
