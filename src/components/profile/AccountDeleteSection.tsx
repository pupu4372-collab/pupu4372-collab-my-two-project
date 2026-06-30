"use client";

import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { clearSupabaseBrowserSession } from "@/lib/supabase/client";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  isAdmin?: boolean;
};

export function AccountDeleteSection({ isAdmin: isAdminProp }: Props) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, isAnonymous } = useSupabaseSession();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(isAdminProp ?? false);

  useEffect(() => {
    if (isAdminProp !== undefined || !accessToken) return;
    async function loadRole() {
      try {
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        setIsAdmin(data.profile?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
    void loadRole();
  }, [accessToken, isAdminProp]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  if (!ready || isAnonymous || isAdmin) return null;

  async function handleDeleteAccount() {
    if (!accessToken || deletingAccount) return;

    const ok = window.confirm(
      isKo
        ? "정말 탈퇴할까요?\n프로필, 반려동물, 사주 결과, 작성한 게시글이 함께 삭제되며 복구할 수 없습니다."
        : "Delete your account?\nYour profile, pets, saju results, and posts will be deleted and cannot be restored."
    );
    if (!ok) return;

    setDeletingAccount(true);
    setError(null);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? (isKo ? "탈퇴 처리에 실패했어요." : "Could not delete account."));
      }

      await clearSupabaseBrowserSession();
      window.location.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : isKo ? "탈퇴 처리에 실패했어요." : "Could not delete account.");
      setDeletingAccount(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-red-200/80 bg-red-50/70 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <span className="text-sm leading-none" aria-hidden>
            ⚠️
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-red-800">{isKo ? "계정 탈퇴" : "Delete account"}</h3>
            <p className="mt-0.5 text-xs leading-snug text-red-700/75">
              {isKo
                ? "탈퇴하면 계정, 펫 프로필, 사주 결과, 작성한 게시글이 함께 삭제되며 복구할 수 없습니다."
                : "Deleting your account removes your account, pet profiles, saju results, and posts. This cannot be undone."}
            </p>
            {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleDeleteAccount()}
          disabled={deletingAccount}
          className="shrink-0 self-start rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105 disabled:opacity-60 sm:self-center"
        >
          {deletingAccount ? (isKo ? "탈퇴 처리 중…" : "Deleting…") : isKo ? "회원 탈퇴" : "Delete account"}
        </button>
      </div>
    </div>
  );
}
