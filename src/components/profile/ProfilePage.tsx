"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { PetProfilesList } from "./PetProfilesList";
import { PetShowPostsMiniGrid } from "./PetShowPostsMiniGrid";
import { ProfileActivitySummary } from "./ProfileActivitySummary";
import { UserProfileCard } from "./UserProfileCard";

type ProfileView = "overview" | "edit";

export function ProfilePage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [view, setView] = useState<ProfileView>("overview");

  if (view === "edit") {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setView("overview")}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
        >
          <span aria-hidden>←</span>
          {isKo ? "마이페이지로" : "Back to profile"}
        </button>

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">{isKo ? "계정 상세" : "Account settings"}</h1>
          <p className="mt-2 text-sm text-plum/65">
            {isKo ? "닉네임, 언어, 시간대와 계정 보안을 관리하세요." : "Manage your display name, language, timezone, and account."}
          </p>
        </div>

        <UserProfileCard showEditor presentation="settings" />

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-primary">{isKo ? "펫 프로필 수정" : "Edit pet profiles"}</h2>
          <p className="text-sm text-plum/60">
            {isKo ? "반려동물 이름, 종류, 성별, 생일 정보를 수정할 수 있어요." : "Update your pet's name, species, gender, and birth details."}
          </p>
          <PetProfilesList editable cardStyle="glass" />
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <UserProfileCard presentation="hero" onEdit={() => setView("edit")} />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3 px-2">
          <h3 className="text-xl font-bold text-primary">{isKo ? "나의 반려동물" : "My pets"}</h3>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary"
          >
            <span aria-hidden>+</span>
            {isKo ? "사주로 추가" : "Add via saju"}
          </Link>
        </div>
        <PetProfilesList compact cardStyle="glass" />
      </section>

      <ProfileActivitySummary />

      <section className="space-y-3">
        <PetShowPostsMiniGrid />
        <AdSlot />
      </section>

      <GlassCard className="divide-y divide-plum/10 overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setView("edit")}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/40"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <span aria-hidden>✏️</span>
            {isKo ? "계정 정보 수정" : "Edit account"}
          </span>
          <span className="text-plum/40" aria-hidden>
            ›
          </span>
        </button>
        <Link
          href="/terms"
          className="flex items-center justify-between px-5 py-4 transition hover:bg-white/40"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <span aria-hidden>📄</span>
            {isKo ? "이용약관" : "Terms"}
          </span>
          <span className="text-plum/40" aria-hidden>
            ›
          </span>
        </Link>
        <Link
          href="/privacy"
          className="flex items-center justify-between px-5 py-4 transition hover:bg-white/40"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-on-surface">
            <span aria-hidden>🔒</span>
            {isKo ? "개인정보처리방침" : "Privacy"}
          </span>
          <span className="text-plum/40" aria-hidden>
            ›
          </span>
        </Link>
      </GlassCard>
    </div>
  );
}
