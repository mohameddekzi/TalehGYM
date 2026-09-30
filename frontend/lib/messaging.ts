import type { Payment, Member } from "./supabase";

const GYM = "Taleh GYM";

/** Human invoice number from a payment. */
export function invoiceNo(p: { id: string; paid_at: string }): string {
  return `INV-${p.paid_at.replace(/-/g, "")}-${p.id.slice(0, 4).toUpperCase()}`;
}

/** Plain-text invoice for WhatsApp / email body. */
export function invoiceText(p: Payment): string {
  return [
    `${GYM} — Invoice`,
    `No: ${invoiceNo(p)}`,
    `Macmiil: ${p.member_name ?? "-"}`,
    `Nooc: ${p.type}`,
    `Qiimo: $${Number(p.amount).toFixed(2)}`,
    `Hab: ${p.method}`,
    `Taariikh: ${p.paid_at}`,
    `Xaalad: LA BIXIYAY ✓`,
    ``,
    `Mahadsanid! — ${GYM}`,
  ].join("\n");
}

/** Reminder message for a member whose monthly payment is due. */
export function reminderText(m: Member, daysOverdue: number | null): string {
  const d = daysOverdue != null ? ` (${Math.abs(daysOverdue)} maalmood ka dib)` : "";
  return [
    `Salaan ${m.full_name},`,
    `Xusuusin: lacagta bille ee ${GYM} way dhacday${d}.`,
    `Fadlan bixi si aad u sii gasho GYM-ka. Albaabku wuu kuu furmi doonaa marka aad bixiso.`,
    ``,
    `Mahadsanid — ${GYM}`,
  ].join("\n");
}

/** wa.me deep link — strips non-digits from the phone. */
export function waLink(phone: string | null, text: string): string {
  const num = (phone ?? "").replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** mailto link. */
export function emailLink(email: string | null, subject: string, body: string): string {
  return `mailto:${email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
