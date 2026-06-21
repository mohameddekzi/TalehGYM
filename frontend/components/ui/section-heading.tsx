export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-zinc-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
