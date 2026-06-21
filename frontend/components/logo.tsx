import Link from "next/link";

/**
 * Brand wordmark rebuilt with the logo's exact colors:
 * an orange athlete tile, the green "TALEH" and the blue "GYM".
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Taleh GYM home"
    >
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-brand-orange shadow-[0_8px_20px_-8px_rgba(245,130,32,0.7)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor" aria-hidden>
          {/* Stylized athlete in motion */}
          <path d="M14.5 4.2a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0Z" />
          <path d="M5.2 19.7c-.5.3-1.1.1-1.4-.4-.3-.5-.1-1.1.4-1.4l3.7-2.3-1.3-3.1c-.4-1 .1-2.2 1.2-2.5l4.2-1.4a2 2 0 0 1 2 .5l2.2 2.2 2.7-.7c.6-.1 1.2.2 1.3.8.2.6-.2 1.2-.8 1.3l-3.3.9a1.6 1.6 0 0 1-1.5-.4l-1.1-1.1-1 3 2.3 2.1c.3.3.5.7.5 1.1l.2 3c0 .6-.4 1.1-1 1.1-.6 0-1.1-.4-1.1-1l-.2-2.6-3.3-3-4.2 2.5Z" />
        </svg>
      </span>
      <span className="font-display text-lg font-extrabold leading-none tracking-tight">
        <span className="text-brand-green">TALEH</span>{" "}
        <span className="text-brand-blue">GYM</span>
      </span>
    </Link>
  );
}
