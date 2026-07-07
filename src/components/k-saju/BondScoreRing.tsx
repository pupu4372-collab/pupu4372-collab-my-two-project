"use client";

import { useId } from "react";

function ringGradient(score: number): { from: string; to: string } {
  if (score >= 90) return { from: "#B8860B", to: "#FFD700" };
  if (score >= 82) return { from: "#2563EB", to: "#93C5FD" };
  if (score >= 64) return { from: "#16A34A", to: "#86EFAC" };
  return { from: "#442656", to: "#d1abe4" };
}

export function BondScoreRing({ score, bondLabel }: { score: number; bondLabel?: string }) {
  const gradientId = useId();
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference * (1 - clamped / 100);
  const gradient = ringGradient(clamped);

  return (
    <div className="relative inline-flex h-32 w-32 items-center justify-center">
      <svg className="-rotate-90" width="128" height="128" viewBox="0 0 128 128" aria-hidden>
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          className="text-surface-container"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="transparent"
          stroke={`url(#${gradientId})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-primary">
          {clamped}
          <span className="text-sm font-bold">%</span>
        </span>
        {bondLabel ? (
          <span className="mt-0.5 max-w-[5.5rem] text-center text-[10px] font-bold leading-tight text-plum/75">
            {bondLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
