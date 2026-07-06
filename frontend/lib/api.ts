/**
 * Client-side data layer for Taleh GYM.
 * All calls go to Next.js API routes (/api/*) which talk to MongoDB on the
 * server. The database connection string never reaches the browser.
 */

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

export type Payment = {
  id: string; created_at: string; member_id: string | null; member_name: string | null;
  amount: number; method: string; type: string; status: string; paid_at: string;
};

export type Attendance = {
  id: string; created_at: string; member_id: string | null; member_name: string | null;
  branch: string | null; checked_in_at: string; checked_out_at: string | null; method: string;
};

export type MembershipType = {
  id: string; created_at: string; name: string; price: number; duration_days: number; color: string;
};

export type Group = {
  id: string; created_at: string; name: string; description: string | null; color: string;
};

export type GymEvent = {
  id: string; created_at: string; title: string; event_date: string; start_time: string | null; type: string; color: string;
};

export type Role = "admin" | "accountant" | "staff";
export type PortalRole = "member" | "coach";

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`);
  return r.json();
}
async function jsend<T>(url: string, method: string, body?: unknown): Promise<T> {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Request failed (${r.status})`);
  return r.json();
}

export const api = {
  members: {
    list: () => jget<Member[]>("/api/members"),
    create: (payload: NewMember) => jsend<{ id: string; member_code: string }>("/api/members", "POST", payload),
    setStatus: (id: string, status: MemberStatus) => jsend(`/api/members/${id}`, "PATCH", { status }),
    remove: (id: string) => jsend(`/api/members/${id}`, "DELETE"),
  },
  payments: { list: () => jget<Payment[]>("/api/payments") },
  attendance: { list: () => jget<Attendance[]>("/api/attendance") },
  types: {
    list: () => jget<MembershipType[]>("/api/membership-types"),
    create: (p: Partial<MembershipType>) => jsend<MembershipType>("/api/membership-types", "POST", p),
    remove: (id: string) => jsend(`/api/membership-types/${id}`, "DELETE"),
  },
  groups: {
    list: () => jget<Group[]>("/api/groups"),
    create: (p: Partial<Group>) => jsend<Group>("/api/groups", "POST", p),
    remove: (id: string) => jsend(`/api/groups/${id}`, "DELETE"),
  },
  events: {
    list: () => jget<GymEvent[]>("/api/events"),
    create: (p: Partial<GymEvent>) => jsend<GymEvent>("/api/events", "POST", p),
    remove: (id: string) => jsend(`/api/events/${id}`, "DELETE"),
  },
  async authStaff(email: string, passcode: string): Promise<{ name: string; role: Role } | null> {
    const r = await fetch("/api/auth/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, passcode }) });
    return r.ok ? r.json() : null;
  },
  async authPortal(email: string, passcode: string, role: PortalRole): Promise<{ name: string; role: PortalRole; email: string } | null> {
    const r = await fetch("/api/auth/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, passcode, role }) });
    return r.ok ? r.json() : null;
  },
};
