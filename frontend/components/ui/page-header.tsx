export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line/5">
      <div className="absolute inset-0 -z-10 opacity-60 bg-grid-faint [background-size:44px_44px] [mask-image:radial-gradient(60%_80%_at_50%_0%,black,transparent)]" />
      <div className="container-px py-16 text-center sm:py-20">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
