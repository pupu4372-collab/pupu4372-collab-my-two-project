"use client";

import { COMMUNITY_SOLID_SURFACE_CLASS } from "@/components/community/CommunityDetailSurface";

export function PetPremiumUnlockSkeleton() {
  return (
    <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} space-y-4 p-6 md:p-8`} aria-busy="true">
      <div className="mx-auto h-5 w-40 animate-pulse rounded-full bg-sand/80" />
      <div className="mx-auto h-4 w-56 animate-pulse rounded-full bg-sand/60" />
      <div className="flex justify-center pt-2">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-channel-saju/25 border-t-channel-saju"
          aria-hidden
        />
      </div>
    </div>
  );
}
