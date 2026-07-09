import { supabase } from "./supabase";
import { contact } from "./content";

export type Settings = {
  gymName: string;
  tagline: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  currency: string;
  subscriptionDays: number;
  graceDays: number;
  payments: { evc: boolean; edahab: boolean; bank: boolean; cash: boolean };
  notify: { sms: boolean; email: boolean; whatsapp: boolean };
  reminders: { expiry: boolean; payment: boolean; workout: boolean };
};

export const DEFAULT_SETTINGS: Settings = {
  gymName: "Taleh GYM",
  tagline: "Fitness & Wellness Management System",
  phone: contact.phone,
  email: contact.email,
  whatsapp: contact.whatsapp,
  address: contact.hq,
  currency: "$",
  subscriptionDays: 30,
  graceDays: 0,
  payments: { evc: true, edahab: true, bank: true, cash: true },
  notify: { sms: true, email: true, whatsapp: false },
  reminders: { expiry: true, payment: true, workout: false },
};

export async function loadSettings(): Promise<Settings> {
  try {
    const { data } = await supabase.from("app_settings").select("data").eq("id", 1).maybeSingle();
    return { ...DEFAULT_SETTINGS, ...((data?.data as Partial<Settings>) ?? {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await supabase.from("app_settings").upsert({ id: 1, data: s, updated_at: new Date().toISOString() });
}
