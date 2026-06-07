const DOG_IMAGE_BASE = "/stitch/global-design-system/dog";
const CAT_IMAGE_BASE = "/stitch/global-design-system/cat";
const OTHER_IMAGE_BASE = "/stitch/reptile-renewal";

const LOCAL_BREED_GUIDE_IMAGES: Record<string, string> = {
  "golden-retriever": `${DOG_IMAGE_BASE}/dog-02.jpg`,
  pomeranian: `${DOG_IMAGE_BASE}/dog-03.jpg`,
  poodle: `${DOG_IMAGE_BASE}/dog-04.jpg`,
  maltese: `${DOG_IMAGE_BASE}/dog-05.jpg`,
  "bichon-frise": `${DOG_IMAGE_BASE}/dog-06.jpg`,
  "shiba-inu": `${DOG_IMAGE_BASE}/dog-07.jpg`,
  "welsh-corgi": `${DOG_IMAGE_BASE}/dog-08.jpg`,

  persian: `${CAT_IMAGE_BASE}/cat-03.jpg`,
  "korean-shorthair": `${CAT_IMAGE_BASE}/cat-05.jpg`,
  "scottish-fold": `${CAT_IMAGE_BASE}/cat-08.jpg`,
  siamese: `${CAT_IMAGE_BASE}/cat-09.jpg`,
  bengal: `${CAT_IMAGE_BASE}/cat-10.jpg`,
  "russian-blue": `${CAT_IMAGE_BASE}/cat-12.jpg`,

  "crested-gecko": `${OTHER_IMAGE_BASE}/hero-crested-gecko.jpg`,
  rabbit: `${OTHER_IMAGE_BASE}/community-rabbit.jpg`,
};

export function getLocalBreedGuideImage(seoSlug: string) {
  return LOCAL_BREED_GUIDE_IMAGES[seoSlug] ?? null;
}
