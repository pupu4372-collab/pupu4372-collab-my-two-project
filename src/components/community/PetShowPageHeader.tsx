interface PetShowPageHeaderProps {
  title: string;
  subtitle?: string;
}

/** Compact in-page title for Pet Show / Challenge (no channel eyebrow). */
export function PetShowPageHeader({ title, subtitle }: PetShowPageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">{title}</h1>
      {subtitle ? <p className="text-sm font-medium text-white/75">{subtitle}</p> : null}
    </div>
  );
}
