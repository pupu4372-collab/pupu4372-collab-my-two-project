import { Capacitor, registerPlugin } from "@capacitor/core";

type NativeImageSource = "camera" | "photos";

interface NativeCameraPlugin {
  getPhoto(options: {
    quality: number;
    allowEditing: boolean;
    resultType: "dataUrl";
    source: "CAMERA" | "PHOTOS";
  }): Promise<{
    dataUrl?: string;
    format?: string;
  }>;
}

const NativeCamera = registerPlugin<NativeCameraPlugin>("Camera");

export function isNativeImagePickerAvailable() {
  return Capacitor.isNativePlatform();
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

export async function pickNativeImage(source: NativeImageSource) {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Native camera plugin is not available.");
  }

  const photo = await NativeCamera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: "dataUrl",
    source: source === "camera" ? "CAMERA" : "PHOTOS",
  });

  if (!photo.dataUrl) {
    throw new Error("No image was selected.");
  }

  const extension = photo.format || "jpeg";
  return dataUrlToFile(photo.dataUrl, `pet-photo-${Date.now()}.${extension}`);
}
