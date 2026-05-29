"use client";

import { PetShowComposer } from "@/components/community/PetShowComposer";
import { useRouter } from "@/i18n/navigation";

export function PetShowUploadClient() {
  const router = useRouter();

  return (
    <PetShowComposer
      onPosted={() => {
        router.push("/community/pet-show/snapzone");
        router.refresh();
      }}
    />
  );
}
