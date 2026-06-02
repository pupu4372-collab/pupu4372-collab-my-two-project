"use client";

import { useId } from "react";

export function BondScoreRing({ score }: { score: number }) {
  const gradientId = useId();
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference * (1 - clamped / 100);

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
            <stop offset="0%" stopColor="#442656" />
            <stop offset="100%" stopColor="#d1abe4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-extrabold text-primary">
          {clamped}
          <span className="text-sm font-bold">%</span>
        </span>
      </div>
    </div>
  );
}
