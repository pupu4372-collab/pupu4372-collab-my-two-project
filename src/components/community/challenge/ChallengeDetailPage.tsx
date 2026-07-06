"use client";

import {
  COMMUNITY_DETAIL_BODY_CLASS,
  COMMUNITY_SOLID_CARD_CLASS,
  COMMUNITY_SOLID_SURFACE_CLASS,
} from "@/components/community/CommunityDetailSurface";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PetShowSectionTabs } from "@/components/community/PetShowSectionTabs";
import { NightPageShell, PageContainer } from "@/components/layout/StitchLayout";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Link } from "@/i18n/navigation";
import { localizeChallenge } from "@/lib/community/challenge-localize";
import { compressImageForUpload } from "@/lib/images/upload-compression";
import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";
import type { Challenge, ChallengeChannel, ChallengePostWithRelations } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { use, useEffect, useRef, useState } from "react";

function speciesLabel(species: string | undefined, isKo: boolean) {
  if (!species) return "";
  if (species === "dog") return isKo ? "강아지" : "Dog";
  if (species === "cat") return isKo ? "고양이" : "Cat";
  return isKo ? "다른 동물" : "Other pet";
}

function channelLabel(channel: ChallengeChannel, isKo: boolean) {
  if (channel === "all") return isKo ? "전체" : "All";
  if (channel === "dog") return isKo ? "강아지" : "Dogs";
  if (channel === "cat") return isKo ? "고양이" : "Cats";
  return isKo ? "렙타일" : "Reptile";
}

interface ChallengeDetailPageProps {
  params: Promise<{ id: string }>;
}

export function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const { id } = use(params);
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [posts, setPosts] = useState<ChallengePostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadPosts() {
    const postsRes = await fetch(`/api/community/challenge/${id}/posts`);
    const postsData = (await postsRes.json()) as {
      posts?: ChallengePostWithRelations[];
      error?: string;
    };
    if (!postsRes.ok) {
      throw new Error(postsData.error ?? (isKo ? "인증글을 불러오지 못했어요." : "Could not load posts."));
    }
    setPosts(postsData.posts ?? []);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [challengeRes] = await Promise.all([
          fetch("/api/community/challenge"),
        ]);
        const challengeData = (await challengeRes.json()) as {
          challenges?: Challenge[];
          error?: string;
        };
        if (!challengeRes.ok) {
          setError(challengeData.error ?? (isKo ? "챌린지를 불러오지 못했어요." : "Could not load challenge."));
          return;
        }
        const found = (challengeData.challenges ?? []).find((item) => item.id === id) ?? null;
        if (!found) {
          setError(isKo ? "챌린지를 찾을 수 없어요." : "Challenge not found.");
          return;
        }
        setChallenge(localizeChallenge(found, isKo ? "ko" : "en"));
        await loadPosts();
      } catch (err) {
        setError(err instanceof Error ? err.message : isKo ? "오류가 발생했어요." : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id, isKo]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    try {
      const compressed = await compressImageForUpload(picked);
      setFile(compressed);
      setPreview(URL.createObjectURL(compressed));
      setSubmitError(null);
    } catch {
      setFile(null);
      setPreview(null);
      setSubmitError(isKo ? "이미지를 1MB 이하 WebP로 압축할 수 없어요." : "Could not compress the image under 1MB WebP.");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || isAnonymous) {
      setSubmitError(isKo ? "로그인 후 인증할 수 있어요." : "Log in to verify your mission.");
      return;
    }
    if (!file) {
      setSubmitError(isKo ? "인증 사진을 선택해 주세요." : "Please choose a verification photo.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await fetch("/api/community/pet-show/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        setSubmitError(uploadData.error ?? (isKo ? "업로드 실패" : "Upload failed"));
        return;
      }

      const postRes = await fetch(`/api/community/challenge/${id}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim() || null,
          image_url: uploadData.imageUrl,
        }),
      });
      const postData = await postRes.json();
      if (!postRes.ok) {
        setSubmitError(postData.error ?? (isKo ? "인증글 등록 실패" : "Could not post verification."));
        return;
      }

      setContent("");
      setFile(null);
      setPreview(null);
      setShowComposer(false);
      if (fileRef.current) fileRef.current.value = "";
      await loadPosts();
    } catch {
      setSubmitError(isKo ? "네트워크 오류가 발생했어요." : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <NightPageShell>
      <AppTopNav active="challenge" />
      <PageContainer className="space-y-4 py-4">
        <PetShowSectionTabs />
        <Link
          href="/community/challenge"
          className="inline-flex text-sm font-extrabold text-channel-community hover:underline"
        >
          {isKo ? "← 챌린지 목록" : "← Challenge list"}
        </Link>

        {loading ? (
          <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-8 text-center text-sm text-plum/70`}>
            {isKo ? "불러오는 중…" : "Loading…"}
          </div>
        ) : error || !challenge ? (
          <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-8 text-center text-sm text-channel-cat`}>
            {error ?? (isKo ? "챌린지를 찾을 수 없어요." : "Challenge not found.")}
          </div>
        ) : (
          <>
            <section className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6 md:p-8`}>
              <span className="inline-flex rounded-full bg-channel-community/10 px-3 py-1 text-xs font-extrabold text-channel-community">
                {channelLabel(challenge.channel, isKo)}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-primary md:text-3xl">{challenge.title}</h1>
              {challenge.description && (
                <p className="text-sm leading-7 text-plum/75">{challenge.description}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!configured || !ready || isAnonymous) {
                    setSubmitError(isKo ? "로그인 후 인증할 수 있어요." : "Log in to verify your mission.");
                    return;
                  }
                  setShowComposer((prev) => !prev);
                }}
                className="inline-flex rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:brightness-105"
              >
                {isKo ? "인증하기" : "Verify mission"}
              </button>
            </section>

            {showComposer && (
              <form onSubmit={(e) => void handleSubmit(e)} className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6`}>
                <h2 className="text-base font-extrabold text-primary">
                  {isKo ? "미션 인증 올리기" : "Post your verification"}
                </h2>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder={isKo ? "오늘의 미션 인증 메모 (선택)" : "Optional note about your mission"}
                  className="pastel-input w-full resize-none px-4 py-3 text-sm"
                />
                <div className="space-y-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => void onFileChange(e)}
                    className="block w-full text-sm text-plum/70"
                  />
                  {preview && (
                    <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/70">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="" className="max-h-64 w-full object-cover" />
                    </div>
                  )}
                </div>
                {submitError && <p className="text-sm font-semibold text-channel-cat">{submitError}</p>}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-channel-community px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60"
                  >
                    {submitting ? (isKo ? "등록 중…" : "Posting…") : isKo ? "인증글 등록" : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="rounded-full border border-white/40 bg-white/80 px-5 py-3 text-sm font-extrabold text-plum/70"
                  >
                    {isKo ? "취소" : "Cancel"}
                  </button>
                </div>
              </form>
            )}

            <section className="space-y-4">
              <h2 className="text-lg font-extrabold text-primary">
                {isKo ? "인증 피드" : "Verification feed"}
              </h2>
              {posts.length === 0 ? (
                <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-8 text-center text-sm text-plum/70`}>
                  {isKo ? "아직 인증글이 없어요. 첫 번째로 참여해 보세요!" : "No verifications yet. Be the first!"}
                </div>
              ) : (
                <ul className="space-y-4">
                  {posts.map((post) => (
                    <li key={post.id} className={`${COMMUNITY_SOLID_CARD_CLASS} overflow-hidden`}>
                      <div className="flex items-center gap-3 border-b border-white/35 px-5 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-channel-community/15 text-lg">
                          {post.profiles?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={supabaseImageTransformUrl(post.profiles.avatar_url, { width: 80, height: 80 })}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            "🐾"
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-primary">
                            {post.profiles?.display_name ?? (isKo ? "집사" : "Pet parent")}
                          </p>
                          {post.pets?.name && (
                            <p className="text-xs text-plum/60">
                              {post.pets.name}
                              {post.pets.species ? ` · ${speciesLabel(post.pets.species, isKo)}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                      {post.image_url && (
                        <div className="bg-sand/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={supabaseImageTransformUrl(post.image_url, { width: 960, height: 960 })}
                            alt=""
                            className="max-h-[28rem] w-full object-cover"
                          />
                        </div>
                      )}
                      {post.content && (
                        <div className="px-5 py-4">
                          <p className={COMMUNITY_DETAIL_BODY_CLASS}>{post.content}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </PageContainer>
      <MobileBottomNav active="challenge" />
    </NightPageShell>
  );
}
