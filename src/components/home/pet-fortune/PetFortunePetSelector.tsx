"use client";

import { petAvatarImageProps } from "@/lib/pets/pet-avatar";

/** Minimal pet chip — fortune meta or profile list rows. */
export type PetSelectorChip = {
  id: string;
  name: string;
  icon?: string;
  profileImageUrl?: string | null;
  photoUrl?: string | null;
  profile_image_url?: string | null;
  photo_url?: string | null;
};

type Props = {
  pets: PetSelectorChip[];
  selectedPetId?: string | null;
  onSelectPet: (petId: string) => void;
};

function chipClass(active: boolean) {
  return active
    ? "pet-fortune-pet-chip pet-fortune-pet-chip--active"
    : "pet-fortune-pet-chip pet-fortune-pet-chip--idle";
}

export function PetFortunePetSelector({ pets, selectedPetId, onSelectPet }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {pets.map((pet) => {
        const active = Boolean(selectedPetId && pet.id === selectedPetId);
        const avatar = petAvatarImageProps(pet, 56);
        return (
          <button
            key={pet.id}
            type="button"
            onClick={() => onSelectPet(pet.id)}
            className={chipClass(active)}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar.src}
                alt={avatar.alt}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40"
              />
            ) : (
              <span className="text-xl leading-none">{pet.icon ?? "🐾"}</span>
            )}
            <span className="pet-fortune-pet-chip-label">{pet.name}</span>
          </button>
        );
      })}
    </div>
  );
}
