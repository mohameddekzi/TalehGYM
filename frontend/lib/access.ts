import type { Member, Payment } from "./supabase";

/**
 * Subscription-based access decision for the ZKTeco door terminal.
 * A member may enter when their membership is active AND their latest
 * monthly membership payment is still within the billing window.
 */
export const SUBSCRIPTION_DAYS = 30;

export type AccessDecision = {
  allowed: boolean;
  reason: string;
  paid_until: string | null; // YYYY-MM-DD
  days_left: number | null;
};

function today0(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function decideAccess(member: Member | null | undefined, payments: Payment[]): AccessDecision {
  if (!member) return { allowed: false, reason: "Member not found", paid_until: null, days_left: null };
  if (member.status === "frozen") return { allowed: false, reason: "Membership frozen", paid_until: null, days_left: null };

  const membershipPays = payments
    .filter((p) => p.type === "Membership")
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  const last = membershipPays[0];
  if (!last) return { allowed: false, reason: "No membership payment on record", paid_until: null, days_left: null };

  const paidUntil = new Date(last.paid_at + "T00:00:00");
  // A payment can cover several months (e.g. prepay 3 or 6 months).
  const months = Math.max(1, Number(last.months) || 1);
  paidUntil.setDate(paidUntil.getDate() + months * SUBSCRIPTION_DAYS);
  const now = today0();
  const daysLeft = Math.round((paidUntil.getTime() - now.getTime()) / 864e5);
  // Access is driven purely by the payment window: paid = open, lapsed = closed.
  // (Frozen members are already blocked above.)
  const allowed = daysLeft >= 0;

  return {
    allowed,
    reason: allowed ? "Subscription active" : "Monthly subscription expired",
    paid_until: paidUntil.toISOString().slice(0, 10),
    days_left: daysLeft,
  };
}
