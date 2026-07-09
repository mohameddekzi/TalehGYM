"use client";

import { useEffect, useState } from "react";
import { Send, MessageSquare, Mail, Smartphone, Bell } from "lucide-react";
import { supabase, type Notification } from "@/lib/supabase";
import { dateShort, timeShort } from "@/lib/format";

const CHANNELS = [
  { key: "SMS", icon: Smartphone, color: "text-brand-orange" },
  { key: "WhatsApp", icon: MessageSquare, color: "text-brand-green" },
  { key: "Email", icon: Mail, color: "text-brand-blue" },
  { key: "Push", icon: Bell, color: "text-amber-500" },
];
const AUDIENCES = ["All members", "Active members", "Expired members", "Coaches", "Leads"];

export default function NotificationsPage() {
  const [log, setLog] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState("SMS");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function load() {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    setLog((data as Notification[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    const { data } = await supabase.from("notifications").insert({ channel, audience, message: message.trim(), status: "sent" }).select("*").single();
    if (data) setLog((x) => [data as Notification, ...x]);
    setMessage(""); setSent(true); setTimeout(() => setSent(false), 2000);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-foreground">Notifications</h1>
      <p className="mt-1 text-sm text-muted">Send SMS, WhatsApp, Email and push messages to members.</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={send} className="card h-fit p-6 lg:col-span-1">
          <h3 className="font-display text-base font-bold text-foreground">Compose</h3>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-muted">Channel</label>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map((c) => (
                <button type="button" key={c.key} onClick={() => setChannel(c.key)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${channel === c.key ? "border-brand-orange bg-brand-orange/5 text-foreground" : "border-line/10 text-muted"}`}>
                  <c.icon size={15} className={c.color} /> {c.key}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-medium text-muted">Audience</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none">
              {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-sm font-medium text-muted">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Type your message…" className="w-full rounded-xl border border-line/10 bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:outline-none" />
          </div>
          <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-orange-dark">
            <Send size={15} /> {sent ? "Sent ✓" : "Send message"}
          </button>
        </form>

        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-line/10 px-6 py-4"><h3 className="font-display text-base font-bold text-foreground">History</h3></div>
          {loading ? <p className="p-8 text-center text-sm text-muted">Loading…</p> : log.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">No messages sent yet.</p>
          ) : (
            <ul className="divide-y divide-line/5">
              {log.map((n) => {
                const ch = CHANNELS.find((c) => c.key === n.channel) ?? CHANNELS[0];
                return (
                  <li key={n.id} className="flex items-start gap-3 px-6 py-4">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line/5 bg-surface-2"><ch.icon size={16} className={ch.color} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{n.channel}</span>
                        <span className="rounded-full bg-line/10 px-2 py-0.5 text-[11px] text-muted">{n.audience}</span>
                        <span className="text-[11px] text-subtle">{dateShort(n.created_at)} · {timeShort(n.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{n.message}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
