import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Pet } from "@/lib/supabase/types";
import sharp from "sharp";

const BUCKET = "pet-photos";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_LONG_EDGE = 1600;
const OUTPUT_QUALITY = 80;

const MIME_TO_EXT: Record<string, "jpg" | "png" | "webp"> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Db = SupabaseClient<Database>;

export function isAllowedPetPhotoMime(mime: string): mime is keyof typeof MIME_TO_EXT {
  return mime in MIME_TO_EXT;
}

export async function processPetPhoto(
  buffer: Buffer,
  mime: string
): Promise<{ buffer: Buffer; contentType: string }> {
  let image = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const longEdge = Math.max(width, height);

  if (longEdge > MAX_LONG_EDGE) {
    image =
      width >= height
        ? image.resize({ width: MAX_LONG_EDGE, withoutEnlargement: true })
        : image.resize({ height: MAX_LONG_EDGE, withoutEnlargement: true });
  }

  if (mime === "image/png") {
    return {
      buffer: await image.png({ compressionLevel: 9 }).toBuffer(),
      contentType: "image/png",
    };
  }
  if (mime === "image/webp") {
    return {
      buffer: await image.webp({ quality: OUTPUT_QUALITY }).toBuffer(),
      contentType: "image/webp",
    };
  }
  return {
    buffer: await image.jpeg({ quality: OUTPUT_QUALITY, mozjpeg: true }).toBuffer(),
    contentType: "image/jpeg",
  };
}

export async function uploadPetFortunePhoto(
  supabase: Db,
  ownerId: string,
  petId: string,
  file: File,
  photoConsentSecondaryUse: boolean
): Promise<string> {
  if (!isAllowedPetPhotoMime(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10MB or smaller.");
  }

  const ext = MIME_TO_EXT[file.type];
  const raw = Buffer.from(await file.arrayBuffer());
  const { buffer, contentType } = await processPetPhoto(raw, file.type);
  const path = `${ownerId}/${petId}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    cacheControl: "31536000",
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const photoUrl = data.publicUrl;
  const uploadedAt = new Date().toISOString();

  const updatePayload: Partial<Pet> = {
    photo_url: photoUrl,
    photo_consent_secondary_use: photoConsentSecondaryUse,
    photo_uploaded_at: uploadedAt,
  };

  const { error: updateError } = await supabase
    .from("pets")
    .update(updatePayload as never)
    .eq("id", petId)
    .eq("owner_id", ownerId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return photoUrl;
}
