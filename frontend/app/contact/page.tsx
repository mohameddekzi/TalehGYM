"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { contact } from "@/lib/content";
import { Phone, Mail, MapPin, MessageCircle, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={<>Let&apos;s <span className="text-gradient">talk</span></>}
        subtitle="Questions about membership, training or a corporate plan? Our team replies within one business day."
      />

      <section className="container-px py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {[
              { icon: Phone, label: "Call us", value: contact.phone, a: "text-brand-orange" },
              { icon: MessageCircle, label: "WhatsApp", value: contact.whatsapp, a: "text-brand-green" },
              { icon: Mail, label: "Email", value: contact.email, a: "text-brand-blue" },
              { icon: MapPin, label: "Head office", value: contact.hq, a: "text-brand-orange" },
            ].map((c) => (
              <div key={c.label} className="card flex items-start gap-4 p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line/5 bg-surface-2">
                  <c.icon size={20} className={c.a} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-subtle">{c.label}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-7 lg:col-span-3">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 size={48} className="text-brand-green" />
                <h3 className="mt-4 font-display text-xl font-bold text-foreground">Message sent</h3>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  Thanks for reaching out. A member of the Taleh GYM team will get
                  back to you shortly.
                </p>
                <Button onClick={() => setSent(false)} variant="outline" className="mt-6">
                  Send another
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" placeholder="Your name" />
                  <Field label="Phone" name="phone" placeholder="+252 ..." />
                </div>
                <Field label="Email" name="email" type="email" placeholder="you@email.com" />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted">Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="How can we help?"
                    className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
                  />
                </div>
                <Button type="submit" className="w-full">Send message</Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label, name, type = "text", placeholder,
}: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-brand-orange/60 focus:outline-none"
      />
    </div>
  );
}
