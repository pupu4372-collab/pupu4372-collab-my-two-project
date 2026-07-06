import { PetShowUploadClient } from "@/components/community/PetShowUploadClient";
import { PetShowShell } from "@/components/community/PetShowShell";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PetShowUploadPage({ params }: PageProps) {
  const { locale } = await params;
  const isKo = locale !== "en";

  return (
    <PetShowShell
      theme="community"
      title={isKo ? "우리아이 자랑 올리기" : "Post to Pet Show"}
      subtitle={isKo ? "사진과 반려동물 분류를 선택해 올려주세요." : "Upload a photo and choose your pet category."}
    >
      <PetShowUploadClient />
    </PetShowShell>
  );
}
