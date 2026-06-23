"use client";

import {
  BRANCH_META,
  formatTenGodLabel,
  STEM_META,
} from "@/lib/saju/sipseong";
import type { SajuPillars } from "./report-helpers";

const STEM_ORDER = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function emptyBranchesForDay(dayPillar: SajuPillars["day"]): string[] {
  const stem = dayPillar.stemHanja || dayPillar.stem || dayPillar.pillar.charAt(0);
  const branch = dayPillar.branchHanja || dayPillar.branch || dayPillar.pillar.charAt(1);
  const stemIndex = STEM_ORDER.indexOf(stem);
  const branchIndex = BRANCH_ORDER.indexOf(branch);
  if (stemIndex < 0 || branchIndex < 0) return [];

  const cycleStartBranchIndex =
    (branchIndex - stemIndex + BRANCH_ORDER.length) % BRANCH_ORDER.length;
  return [
    BRANCH_ORDER[(cycleStartBranchIndex + 10) % BRANCH_ORDER.length],
    BRANCH_ORDER[(cycleStartBranchIndex + 11) % BRANCH_ORDER.length],
  ];
}

export function ManseTable({
  pillars,
  hasHour,
  isKo,
}: {
  pillars: SajuPillars;
  hasHour: boolean;
  isKo: boolean;
}) {
  const emptyBranches = emptyBranchesForDay(pillars.day);
  const emptyBranchText =
    emptyBranches.length > 0
      ? `${emptyBranches.join("")} ${isKo ? "공망" : "void"}`
      : "-";

  const cols: {
    key: keyof SajuPillars;
    label: string;
    fortune: string;
    hint: string;
    relation: string;
    emphasis?: boolean;
  }[] = [
    ...(hasHour && pillars.hour
      ? [
          {
            key: "hour" as const,
            label: isKo ? "생시" : "Hour",
            fortune: isKo ? "말년운" : "Late life",
            hint: isKo ? "자녀운, 결실" : "Legacy, results",
            relation: isKo ? "자녀" : "Legacy",
          },
        ]
      : []),
    {
      key: "day",
      label: isKo ? "생일" : "Day",
      fortune: isKo ? "중년운" : "Midlife",
      hint: isKo ? "정체성, 자아" : "Identity, self",
      relation: isKo ? "본인" : "Self",
      emphasis: true,
    },
    {
      key: "month",
      label: isKo ? "생월" : "Month",
      fortune: isKo ? "청년운" : "Youth",
      hint: isKo ? "부모, 사회상" : "Parents, society",
      relation: isKo ? "사회" : "Society",
    },
    {
      key: "year",
      label: isKo ? "생년" : "Year",
      fortune: isKo ? "초년운" : "Early life",
      hint: isKo ? "조상, 시대상" : "Ancestry, era",
      relation: isKo ? "조상" : "Ancestry",
    },
  ];

  return (
    <div className="human-premium-lattice overflow-x-auto bg-white/50 p-4 sm:p-6">
      <div className="min-w-[620px]">
        <div
          className="grid gap-0 pl-12 text-center text-sm font-semibold text-[var(--jig-ink)]"
          style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
        >
          {cols.map((col) => (
            <div key={col.key} className="pb-2">
              {col.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[3rem_1fr] items-stretch">
          <div className="grid grid-rows-[74px_74px_38px_74px_38px_38px] text-sm font-semibold text-[var(--jig-ink)]">
            <div />
            <div className="flex items-center">{isKo ? "천간" : "Stem"}</div>
            <div className="flex items-center">{isKo ? "십성" : "Ten god"}</div>
            <div className="flex items-center">{isKo ? "지지" : "Branch"}</div>
            <div className="flex items-center">{isKo ? "십성" : "Ten god"}</div>
            <div className="flex items-center">{isKo ? "공망" : "Void"}</div>
          </div>

          <div
            className="human-premium-paper grid overflow-hidden rounded-lg border border-[var(--jig-ink)]/15 text-center"
            style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}
          >
            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-fortune`}
                  className="border-b border-r border-[var(--jig-ink)]/10 p-3 last:border-r-0"
                >
                  <p className="human-premium-serif text-lg font-semibold">{col.fortune}</p>
                  <p className="mt-1 text-xs text-[var(--jig-muted)]">{col.hint}</p>
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-stem`}
                  className={`relative border-b border-r border-[var(--jig-ink)]/10 p-3 last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  <div className="flex items-end justify-center gap-2">
                    <span
                      className={`human-premium-serif text-3xl font-bold sm:text-4xl ${
                        col.emphasis ? "text-[var(--jig-ink)]" : "text-[var(--jig-muted)]"
                      }`}
                    >
                      {pillar.stemHanja}
                    </span>
                    <span className="text-sm font-bold">{pillar.stemLabel}</span>
                  </div>
                  <span className="absolute bottom-2 right-3 text-xs font-bold text-[var(--jig-muted)]">
                    {col.relation}
                  </span>
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-stem-ten-god`}
                  className={`border-b border-r border-[var(--jig-ink)]/10 px-3 py-2 text-sm font-medium last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  {formatTenGodLabel(
                    pillars.day.stemHanja,
                    STEM_META[pillar.stemHanja],
                    isKo ? "ko" : "en"
                  )}
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-branch`}
                  className={`relative border-b border-r border-[var(--jig-ink)]/10 p-3 last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  <div className="flex items-end justify-center gap-2">
                    <span className="human-premium-serif text-3xl font-bold sm:text-4xl">
                      {pillar.branchHanja}
                    </span>
                    <span className="text-sm font-bold">{pillar.branchLabel}</span>
                  </div>
                  <span className="absolute bottom-2 right-3 text-xs font-bold text-[var(--jig-muted)]">
                    {col.emphasis ? (isKo ? "배우자" : "Partner") : col.relation}
                  </span>
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              return (
                <div
                  key={`${col.key}-branch-ten-god`}
                  className={`border-b border-r border-[var(--jig-ink)]/10 px-3 py-2 text-sm font-medium last:border-r-0 ${
                    col.emphasis ? "bg-[var(--jig-seal)]/5" : ""
                  }`}
                >
                  {formatTenGodLabel(
                    pillars.day.stemHanja,
                    BRANCH_META[pillar.branchHanja],
                    isKo ? "ko" : "en"
                  )}
                </div>
              );
            })}

            {cols.map((col) => {
              const pillar = pillars[col.key];
              if (!pillar) return null;
              const branch = pillar.branchHanja || pillar.branch || pillar.pillar.charAt(1);
              const isVoid = emptyBranches.includes(branch);
              return (
                <div
                  key={`${col.key}-void`}
                  className={`border-r border-[var(--jig-ink)]/10 px-3 py-2 text-sm font-medium last:border-r-0 ${
                    isVoid ? "bg-[var(--jig-ink)] text-[var(--jig-hanji)]" : "text-[var(--jig-muted)]"
                  }`}
                >
                  {isVoid ? (isKo ? "공망 해당" : "Void hit") : emptyBranchText}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
