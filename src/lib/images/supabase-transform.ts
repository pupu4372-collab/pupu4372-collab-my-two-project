interface SupabaseTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
}

const PUBLIC_OBJECT_SEGMENT = "/storage/v1/object/public/";
const PUBLIC_RENDER_SEGMENT = "/storage/v1/render/image/public/";

export function supabaseImageTransformUrl(
  src: string,
  { width, height, quality = 75, resize = "cover" }: SupabaseTransformOptions = {}
) {
  if (!src.includes(PUBLIC_OBJECT_SEGMENT) && !src.includes(PUBLIC_RENDER_SEGMENT)) {
    return src;
  }

  try {
    const url = new URL(src);
    url.pathname = url.pathname.replace(PUBLIC_OBJECT_SEGMENT, PUBLIC_RENDER_SEGMENT);
    url.searchParams.set("format", "webp");
    url.searchParams.set("quality", String(quality));
    url.searchParams.set("resize", resize);
    if (width) url.searchParams.set("width", String(width));
    if (height) url.searchParams.set("height", String(height));
    return url.toString();
  } catch {
    return src;
  }
}
