export async function uploadPetFortunePhotoClient(
  accessToken: string,
  petId: string,
  file: File,
  photoConsentSecondaryUse: boolean
): Promise<{ photoUrl: string; photoConsentSecondaryUse: boolean }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("petId", petId);
  formData.append("photoConsentSecondaryUse", photoConsentSecondaryUse ? "true" : "false");

  const res = await fetch("/api/pets/photo", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const data = (await res.json()) as {
    photoUrl?: string;
    photoConsentSecondaryUse?: boolean;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed.");
  }

  if (!data.photoUrl) {
    throw new Error("Upload failed.");
  }

  return {
    photoUrl: data.photoUrl,
    photoConsentSecondaryUse: Boolean(data.photoConsentSecondaryUse),
  };
}
