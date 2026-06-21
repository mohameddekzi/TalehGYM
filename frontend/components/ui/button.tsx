import Link from "next/link";
import { ComponentProps } from "react";

type Variant = "primary" | "outline" | "ghost" | "green";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/60 disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-orange text-white hover:bg-brand-orange-dark shadow-[0_10px_30px_-10px_rgba(245,130,32,0.8)] hover:-translate-y-0.5",
  green:
    "bg-brand-green text-ink-950 hover:bg-brand-green-dark shadow-[0_10px_30px_-10px_rgba(22,193,58,0.7)] hover:-translate-y-0.5",
  outline:
    "border border-line/15 text-foreground hover:border-line/40 hover:bg-line/5",
  ghost: "text-muted hover:text-foreground hover:bg-line/5",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type ButtonAsLink = {
  href: string;
  variant?: Variant;
  size?: Size;
} & ComponentProps<typeof Link>;

type ButtonAsButton = {
  href?: undefined;
  variant?: Variant;
  size?: Size;
} & ComponentProps<"button">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", className = "", ...rest } = props;
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return <Link href={href} className={cls} {...linkRest} />;
  }
  return <button className={cls} {...(rest as ButtonAsButton)} />;
}
