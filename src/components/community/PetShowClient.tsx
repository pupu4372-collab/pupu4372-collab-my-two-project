"use client";

import { useState } from "react";
import { PetShowComposer } from "./PetShowComposer";
import { PetShowFeed } from "./PetShowFeed";
import { PetShowWeeklySpeciesRanking } from "./PetShowRanking";
import type { PetShowRankingRow } from "@/lib/supabase/types";

interface PetShowClientProps {
  dogRows: PetShowRankingRow[];
  catRows: PetShowRankingRow[];
  source: "supabase" | "mock";
}

export function PetShowClient({
  dogRows,
  catRows,
  source,
}: PetShowClientProps) {
  const [feedKey, setFeedKey] = useState(0);

  return (
    <>
      <PetShowComposer onPosted={() => setFeedKey((k) => k + 1)} />
      <div className="mt-10">
        <PetShowWeeklySpeciesRanking dogRows={dogRows} catRows={catRows} source={source} />
      </div>
      <div className="mt-12 border-t border-channel-community/20 pt-10">
        <PetShowFeed refreshKey={feedKey} />
      </div>
    </>
  );
}
