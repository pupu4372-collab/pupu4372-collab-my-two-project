interface AdSlotProps {
  label?: string;
  className?: string;
  size?: "banner" | "card";
}

export function AdSlot({ label = "AD", className = "", size = "banner" }: AdSlotProps) {
  const sizeClass = size === "card" ? "min-h-40" : "min-h-24";

  return (
    <aside
      className={`flex ${sizeClass} items-center justify-center rounded-[1.5rem] border border-dashed border-plum/15 bg-white/35 px-4 py-5 text-xs font-bold uppercase tracking-[0.18em] text-plum/30 ${className}`}
      aria-label="Advertisement placeholder"
    >
      {label}
    </aside>
  );
}
