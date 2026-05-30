"use client";

import imageCompression from "browser-image-compression";

const MAX_UPLOAD_MB = 1;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

function webpFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") + ".webp";
}

export async function compressImageForUpload(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_UPLOAD_MB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
    maxIteration: 12,
  });

  if (compressed.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be 1MB or smaller after compression.");
  }

  return new File([compressed], webpFileName(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
