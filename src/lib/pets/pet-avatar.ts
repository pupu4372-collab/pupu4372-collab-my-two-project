import { supabaseImageTransformUrl } from "@/lib/images/supabase-transform";

type AvatarSource = {
  photoUrl?: string | null;
  photo_url?: string | null;
  profileImageUrl?: string | null;
  profile_image_url?: string | null;
};

export function resolvePetAvatarUrl(pet: AvatarSource): string | null {
  return pet.photoUrl ?? pet.photo_url ?? pet.profileImageUrl ?? pet.profile_image_url ?? null;
}

export function petAvatarImageProps(
  pet: AvatarSource,
  size: number
): { src: string; alt: string } | null {
  const raw = resolvePetAvatarUrl(pet);
  if (!raw) return null;
  return {
    src: supabaseImageTransformUrl(raw, { width: size, height: size }),
    alt: "",
  };
}
