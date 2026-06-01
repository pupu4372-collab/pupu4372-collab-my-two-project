"use client";

import { GlassCard } from "@/components/layout/StitchLayout";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { CommunityPost } from "@/lib/supabase/types";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

interface PetRow {
  readings?: Array<{ id: string }>;
}

export function ProfileActivitySummary() {
  const locale = useLocale();
  const isKo = locale === "ko";
  const { ready, accessToken, configured, isAnonymous } = useSupabaseSession();
  const [sajuCount, setSajuCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured || !ready || !accessToken || isAnonymous) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const [petsRes, postsRes] = await Promise.all([
          fetch("/api/profile/pets", { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch("/api/profile/pet-show-posts", { headers: { Authorization: `Bearer ${accessToken}` } }),
        ]);
        const petsData = await petsRes.json();
        const postsData = await postsRes.json();

        if (petsRes.ok) {
          const pets = (petsData.pets ?? []) as PetRow[];
          setSajuCount(pets.reduce((sum, pet) => sum + (pet.readings?.length ?? 0), 0));
        }

        if (postsRes.ok) {
          const posts = (postsData.posts ?? []) as CommunityPost[];
          setPostCount(posts.length);
          setLikeCount(posts.reduce((sum, post) => sum + (post.like_count ?? 0), 0));
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [configured, ready, accessToken, isAnonymous]);

  if (!configured || isAnonymous) return null;

  const items = [
    {
      icon: "✨",
      value: loading ? "…" : String(sajuCount),
      label: isKo ? "사주 리포트" : "Saju reports",
    },
    {
      icon: "💬",
      value: loading ? "…" : String(postCount),
      label: isKo ? "Pet Show 글" : "Pet Show posts",
    },
    {
      icon: "❤️",
      value: loading ? "…" : String(likeCount),
      label: isKo ? "받은 좋아요" : "Likes received",
    },
  ];

  return (
    <section className="space-y-4">
      <h3 className="px-2 text-xl font-bold text-primary">{isKo ? "나의 활동" : "My activity"}</h3>
      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <GlassCard key={item.label} className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-lg">{item.icon}</div>
            <span className="text-xl font-bold text-primary">{item.value}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-plum/55">{item.label}</span>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
