"use client";

import { useState } from "react";
import { PetShowComposer } from "./PetShowComposer";
import { PetShowFeed } from "./PetShowFeed";
import { PetShowRanking } from "./PetShowRanking";
import type { PetShowRankingRow } from "@/lib/supabase/types";

interface PetShowClientProps {
  weekRows: PetShowRankingRow[];
  weekSource: "supabase" | "mock";
  realtimeRows: PetShowRankingRow[];
  realtimeSource: "supabase" | "mock";
}

export function PetShowClient({
  weekRows,
  weekSource,
  realtimeRows,
  realtimeSource,
}: PetShowClientProps) {
  const [feedKey, setFeedKey] = useState(0);

  return (
    <>
      <PetShowComposer onPosted={() => setFeedKey((k) => k + 1)} />
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <PetShowRanking rows={weekRows} period="week" source={weekSource} />
        <PetShowRanking rows={realtimeRows} period="realtime" source={realtimeSource} />
      </div>
      <div className="mt-12 border-t border-channel-community/20 pt-10">
        <PetShowFeed refreshKey={feedKey} />
      </div>
    </>
  );
}
