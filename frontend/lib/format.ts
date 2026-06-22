export function money(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function monthLabel(d: Date): string {
  return d.toLocaleString("en-US", { month: "short" });
}

export function dateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function timeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
