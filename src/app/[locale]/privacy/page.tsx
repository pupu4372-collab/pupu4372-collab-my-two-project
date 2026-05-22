import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dream-sky px-4 py-10">
      <article className="pastel-card mx-auto max-w-2xl space-y-4 p-6 text-sm leading-relaxed text-plum/80">
        <Link href="/" className="text-sm text-plum/60 underline hover:text-plum">
          ← 홈
        </Link>
        <h1 className="text-xl font-semibold text-plum">개인정보처리방침 (MVP)</h1>
        <p>
          K-Saju Pet은 K-Saju 분석을 위해 반려동물 이름, 종류, 생년월일시, 타임존만 수집합니다.
          데이터는 전 세계 일관 계산을 위해 UTC로 정규화됩니다.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>개인정보를 판매하지 않습니다.</li>
          <li>기본 사주는 서버에서 처리하며, MVP 단계 광고는 없습니다.</li>
          <li>데이터 삭제는 지원 채널로 요청할 수 있습니다 (준비 중).</li>
          <li>Pet Show·Q&A 오픈 시 신고(Report) 기능으로 부적절 콘텐츠를 검토합니다.</li>
        </ul>
        <p className="text-xs text-plum/50">최종 수정: 2026년 5월 · 법률 검토 전 초안</p>
      </article>
    </div>
  );
}
