import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen night-sky-page px-4 py-10">
      <article className="pastel-card mx-auto max-w-2xl space-y-4 p-6 text-sm leading-relaxed text-plum/80">
        <Link href="/" className="text-sm text-plum/60 underline hover:text-plum">
          ← 홈
        </Link>
        <h1 className="text-xl font-semibold text-plum">이용약관 (MVP)</h1>
        <p>
          K-Saju Pet은 한국 전통 역학을 바탕으로 한 반려동물 성향·운세 콘텐츠를 제공합니다.
          결과는 수의·의료·전문 조언이 아닙니다.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>기본 K-Saju는 무료이며, 심층 리포트는 PayPal 결제 예정입니다.</li>
          <li>커뮤니티 기능 이용 시 유해·불법 콘텐츠 업로드를 금합니다.</li>
          <li>신고 검토 후 가이드라인 위반 콘텐츠를 제한할 수 있습니다.</li>
        </ul>
        <p className="text-xs text-plum/50">최종 수정: 2026년 5월 · 법률 검토 전 초안</p>
      </article>
    </div>
  );
}
