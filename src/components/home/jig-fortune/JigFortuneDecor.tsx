import type { ReactNode } from "react";

type CornerPosition = "tl" | "tr" | "bl" | "br";

function FrameCorner({ corner }: { corner: CornerPosition }) {
  return (
    <span className={`jig-fortune-frame-corner jig-fortune-frame-corner--${corner}`} aria-hidden>
      <span className="jig-fortune-frame-ornament" />
    </span>
  );
}

export function JigFortuneOrnateCorners() {
  return (
    <>
      <FrameCorner corner="tl" />
      <FrameCorner corner="tr" />
      <FrameCorner corner="bl" />
      <FrameCorner corner="br" />
    </>
  );
}

export function JigFortuneContentBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`jig-fortune-content-box relative text-center ${className}`}>{children}</div>;
}

export function JigFortuneWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.05]">
      <span className="human-premium-serif text-8xl text-[var(--jig-ink)]">福</span>
    </div>
  );
}

export function JigFortuneFoldButton({
  isKo,
  onClick,
  label,
}: {
  isKo: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <div className="jig-fortune-fold-bar">
      <button
        type="button"
        onClick={onClick}
        className="text-xs font-bold text-[var(--jig-muted)] transition hover:text-[var(--jig-seal)]"
      >
        {label ?? (isKo ? "접기" : "Fold")}
      </button>
    </div>
  );
}

export function JigFortuneToggleButton({
  expanded,
  isKo,
  onClick,
  expandedLabel,
  collapsedLabel,
}: {
  expanded: boolean;
  isKo: boolean;
  onClick: () => void;
  expandedLabel?: string;
  collapsedLabel?: string;
}) {
  const label = expanded
    ? expandedLabel ?? (isKo ? "접기" : "Fold")
    : collapsedLabel ?? (isKo ? "운세 보기" : "View fortune");

  return (
    <button
      type="button"
      onClick={onClick}
      className="jig-fortune-reveal-btn mx-auto flex w-full max-w-xs items-center justify-center gap-3 bg-[var(--jig-ink)] text-white transition hover:opacity-90 active:scale-[0.98]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[var(--jig-seal)]">
        <span className="human-premium-serif text-base italic text-white">{expanded ? "卷" : "知"}</span>
      </span>
      <span className="human-premium-label-caps text-sm tracking-widest">{label}</span>
    </button>
  );
}
