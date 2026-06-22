import type { ComponentPropsWithoutRef, ReactNode } from "react";

type DivProps = ComponentPropsWithoutRef<"div">;

export function PageContainer({ className = "", children, ...props }: DivProps) {
  return (
    <main className={`mx-auto w-full max-w-7xl px-5 pb-28 pt-8 md:px-10 md:pb-16 md:pt-12 ${className}`} {...props}>
      {children}
    </main>
  );
}

type GlassCardProps = DivProps & {
  variant?: "glass" | "solid";
};

export function GlassCard({ className = "", variant = "glass", children, ...props }: GlassCardProps) {
  const surface =
    variant === "solid"
      ? "rounded-[2rem] border border-white/35 bg-white/95 p-5 shadow-[0_12px_40px_rgba(15,19,79,0.16)] md:p-7"
      : "glass-card rounded-[2rem] p-5 shadow-sm md:p-7";

  return (
    <div className={`${surface} ${className}`} {...props}>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
  onDark?: boolean;
}

export function SectionHeader({ eyebrow, title, subtitle, action, align = "left", className = "", onDark = false }: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <div className={`flex flex-col gap-4 ${isCenter ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"} ${className}`}>
      <div>
        {eyebrow && <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-channel-community">{eyebrow}</p>}
        <h2 className={`mt-2 text-2xl font-extrabold tracking-tight md:text-4xl ${onDark ? "text-white" : "text-primary"}`}>{title}</h2>
        {subtitle && <p className={`mt-2 max-w-2xl text-sm leading-6 md:text-base ${onDark ? "text-white/75" : "text-plum/65"}`}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function NightPageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen overflow-x-hidden bg-[#0c134f] ${className}`}>
      {children}
    </div>
  );
}
