import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for Taleh GYM.
 * The project URL and publishable (anon) key are safe to expose in the
 * browser by design — row-level security governs what this key can do.
 * Values fall back to the project defaults so the app works without extra
 * env configuration, but can be overridden via NEXT_PUBLIC_* env vars.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://mmnavtwjwxlevqrqwazf.supabase.co";

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_fnoPdY5Hha-MgGNp1OxrDQ_NsbYY2K2";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type MemberStatus = "active" | "frozen" | "expired";

export type Member = {
  id: string;
  created_at: string;
  member_code: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  emergency_contact: string | null;
  plan: string;
  branch: string | null;
  goal: string | null;
  status: MemberStatus;
};

export type NewMember = {
  full_name: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  plan: string;
  branch?: string;
  goal?: string;
};
