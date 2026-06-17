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
  return <div className={`jig-fortune-content-box relative p-8 text-center ${className}`}>{children}</div>;
}

export function JigFortuneWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.05]">
      <span className="human-premium-serif text-8xl text-[var(--jig-ink)]">福</span>
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
      className="jig-fortune-reveal-btn mx-auto flex w-full max-w-xs items-center justify-center gap-4 bg-[var(--jig-ink)] px-8 py-4 text-white transition hover:opacity-90 active:scale-[0.98]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--jig-seal)]">
        <span className="human-premium-serif text-lg italic text-white">{expanded ? "卷" : "知"}</span>
      </span>
      <span className="human-premium-label-caps text-base tracking-widest">{label}</span>
    </button>
  );
}
