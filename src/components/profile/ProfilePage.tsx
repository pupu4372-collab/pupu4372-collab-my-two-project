"use client";

import { PetProfilesList } from "./PetProfilesList";
import { UserProfileCard } from "./UserProfileCard";
import { useLocale } from "next-intl";
import { useState } from "react";

type ProfileTab = "info" | "edit";

export function ProfilePage() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");

  const tabs: Array<{ id: ProfileTab; label: string }> = [
    { id: "info", label: isKo ? "내 정보" : "My Info" },
    { id: "edit", label: isKo ? "프로필 수정" : "Edit Profile" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 rounded-2xl bg-white/55 p-1 text-xs font-bold text-plum shadow-sm sm:text-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "rounded-xl bg-channel-saju px-3 py-2.5 text-white shadow-sm"
                : "rounded-xl px-3 py-2.5 text-plum/55 transition hover:bg-white/60 hover:text-plum"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div className="space-y-6">
          <section className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-plum">{isKo ? "주인 프로필" : "Owner Profile"}</h2>
              <p className="text-sm text-plum/60">
                {isKo ? "집사님 계정과 로그인 상태" : "Your account and login status"}
              </p>
            </div>
            <UserProfileCard />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-base font-bold text-plum">{isKo ? "펫 프로필" : "Pet Profiles"}</h2>
              <p className="text-sm text-plum/60">
                {isKo ? "저장된 반려동물과 K-사주 결과" : "Saved pets and K-Saju results"}
              </p>
            </div>
            <PetProfilesList />
          </section>
        </div>
      )}

      {activeTab === "edit" && (
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-plum">{isKo ? "프로필 수정" : "Edit Profile"}</h2>
            <p className="text-sm text-plum/60">
              {isKo ? "닉네임, 언어, 시간대를 수정할 수 있어요." : "Update your display name, language, and timezone."}
            </p>
          </div>
          <UserProfileCard showEditor />
          <div className="pt-4">
            <h3 className="text-sm font-bold text-plum">{isKo ? "펫 프로필 수정" : "Edit Pet Profiles"}</h3>
            <p className="mt-1 text-sm text-plum/60">
              {isKo ? "반려동물 이름, 종류, 성별, 생일 정보를 수정할 수 있어요." : "Update your pet's name, species, gender, and birth details."}
            </p>
          </div>
          <PetProfilesList editable />
        </section>
      )}
    </div>
  );
}
