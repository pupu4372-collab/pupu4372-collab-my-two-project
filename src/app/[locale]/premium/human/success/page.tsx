import { ChannelShell } from "@/components/layout/ChannelShell";
import { Link } from "@/i18n/navigation";

export default function HumanPremiumSuccessPage() {
  return (
    <ChannelShell theme="saju" title="결제 완료" subtitle="리포트 생성 중" hideThemeLabel>
      <div className="pastel-card mx-auto max-w-lg p-8 text-center">
        <p className="text-lg font-semibold text-ink">결제가 접수되었습니다.</p>
        <p className="mt-2 text-sm text-plum/80">
          리포트가 준비되면 이메일로 링크를 보내드립니다.
        </p>
        <Link
          href="/premium/human"
          className="mt-6 inline-block rounded-full bg-channel-saju px-6 py-3 font-bold text-white"
        >
          돌아가기
        </Link>
      </div>
    </ChannelShell>
  );
}
