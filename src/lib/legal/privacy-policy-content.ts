import { LEGAL_ENTITY } from "./company";
import type { PrivacyPolicyContent } from "./privacy-policy-types";

const KO: PrivacyPolicyContent = {
  title: `${LEGAL_ENTITY.nameKo} 개인정보 처리방침`,
  preamble: [
    `${LEGAL_ENTITY.nameKo}(${LEGAL_ENTITY.serviceKo}, 이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하며, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다.`,
    "이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 관련 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.",
    `본 방침은 ${LEGAL_ENTITY.website} 및 회사가 제공하는 K-Saju Pet 모바일 앱(웹뷰) 서비스에 적용됩니다.`,
  ],
  tocTitle: "목차",
  effectiveLabel: `시행일: ${LEGAL_ENTITY.effectiveDateKo}`,
  sections: [
    {
      id: "purpose",
      title: "1. 개인정보의 처리 목적",
      blocks: [
        {
          type: "p",
          text: "회사는 다음 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 아래 목적 이외의 용도로 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.",
        },
        {
          type: "ul",
          items: [
            "회원 가입·로그인·본인 확인, 계정 관리, 부정 이용 방지",
            "반려동물 K-사주(만세력) 분석, 결과 저장·조회, 집사(회원)와 펫 궁합·운세 제공",
            "본인 프리미엄 사주 리포트 생성·보관·열람, 결제 확인, 리포트 링크 이메일 발송(선택 입력 시)",
            "반려동물 프로필·사진 관리, 우리아이 자랑(Pet Show), 커뮤니티 게시판(Q&A·꿀팁·자유·품종별 경험담 등) 운영",
            "고객 문의·민원 처리, 공지·서비스 안내",
            "서비스 품질·안정성 확보를 위한 API 요청 제한(비로그인 기본 사주), 오류 대응",
            "생성형 AI API를 통한 사주 해설·프리미엄 리포트 문장 생성(엔터테인먼트 목적, 의료·법률·재무 자문 아님)",
          ],
        },
      ],
    },
    {
      id: "items",
      title: "2. 처리하는 개인정보의 항목",
      blocks: [
        {
          type: "p",
          text: "회사는 서비스 제공에 필요한 최소한의 개인정보만을 수집합니다. 항목은 수집 경로별로 구분합니다.",
        },
        {
          type: "table",
          headers: ["구분", "수집 항목", "수집 방법"],
          rows: [
            [
              "회원가입·로그인(필수)",
              "이메일, 비밀번호(암호화 저장), 닉네임(표시명), 서비스 언어·시간대 설정",
              "회원이 직접 입력",
            ],
            [
              "소셜 로그인(선택)",
              "이메일, 소셜 프로필 식별자·표시명(제공 범위는 Google·Kakao 정책에 따름)",
              "Google·Kakao 로그인 선택 시",
            ],
            [
              "반려동물 사주(필수·동의)",
              "펫 이름, 종(강아지·고양이·기타), 성별(선택), 생년월일·출생시각(또는 미상), 출생 지역 시간대(IANA), 양·음력 구분, 개인정보 수집·이용 동의 여부",
              "회원이 직접 입력",
            ],
            [
              "펫 프로필·Pet Show(선택)",
              "펫 사진, 게시글·댓글·좋아요, 챌린지 참여 정보",
              "회원이 업로드·작성",
            ],
            [
              "집사(본인) 사주·궁합(선택)",
              "집사 생년월일·출생시각·시간대, 성별(선택)",
              "회원이 직접 입력",
            ],
            [
              "본인 프리미엄 리포트(필수·동의)",
              "이름, 생년월일·출생시각·시간대, 성별(선택), 이메일(선택·리포트 발송용), 결제·주문 식별자",
              "회원이 직접 입력·결제 시 생성",
            ],
            [
              "고객 문의(선택)",
              "이름·닉네임, 이메일, 문의 유형·제목·내용",
              "고객지원(/support) 문의 양식",
            ],
            [
              "자동 생성",
              "접속 IP(비로그인 기본 사주 API 요청 제한용), 인증 세션 토큰, 서비스 이용 기록(게시·결제·사주 저장 등)",
              "서비스 이용 과정에서 자동 생성",
            ],
          ],
        },
        {
          type: "note",
          text: "회사는 주민등록번호, 여권번호 등 고유식별정보와 건강·정치적 견해 등 민감정보를 별도로 수집하지 않습니다. 프리미엄 리포트·사주 입력란에 민감정보를 기재하지 마세요.",
        },
      ],
    },
    {
      id: "children",
      title: "3. 14세 미만 아동의 개인정보 처리",
      blocks: [
        {
          type: "p",
          text: "회사는 만 14세 미만 아동의 개인정보를 법정대리인의 동의 없이 수집하지 않습니다. 만 14세 미만 아동이 회원가입·서비스 이용을 하려면 법정대리인의 동의가 필요합니다.",
        },
        {
          type: "p",
          text: "동의 없이 만 14세 미만 아동의 개인정보가 수집된 사실을 인지한 경우 지체 없이 해당 정보를 삭제합니다. 법정대리인은 아동의 개인정보에 관하여 열람·정정·삭제·처리정지를 요청할 수 있습니다.",
        },
      ],
    },
    {
      id: "retention",
      title: "4. 개인정보의 처리 및 보유 기간",
      blocks: [
        {
          type: "p",
          text: "회사는 법령에 따른 보유·이용 기간 또는 정보주체로부터 동의받은 기간 내에서 개인정보를 처리·보유합니다.",
        },
        {
          type: "table",
          headers: ["구분", "보유 기간", "근거"],
          rows: [
            ["회원 계정·프로필·펫·사주 결과", "회원 탈퇴 시까지", "회원 관리·서비스 제공"],
            [
              "탈퇴 계정 이메일의 일방향 해시값(원문 이메일 미보관)",
              "탈퇴일로부터 30일(경과 시 삭제)",
              "탈퇴 후 단기 재가입을 통한 부정 이용 방지",
            ],
            ["커뮤니티 게시글·Pet Show", "게시물 삭제 또는 회원 탈퇴 시까지", "커뮤니티 운영"],
            ["본인 프리미엄 리포트(웹 보관)", "결제일로부터 30일", "보안·열람 편의(이후 자동 만료)"],
            ["LLM 생성 결과 캐시(서버 설정 시)", "최대 90일", "동일 입력 재생성 비용 절감"],
            ["고객 문의", "처리 완료 후 3년", "민원 처리·분쟁 대응"],
            ["결제·계약 관련 기록", "5년", "전자상거래 등에서의 소비자보호에 관한 법률"],
            ["소비자 불만·분쟁 처리 기록", "3년", "전자상거래 등에서의 소비자보호에 관한 법률"],
            ["표시·광고에 관한 기록", "6개월", "전자상거래 등에서의 소비자보호에 관한 법률"],
            ["웹사이트 방문 기록(접속 IP 등)", "3개월", "통신비밀보호법(제한적 보관)"],
          ],
        },
      ],
    },
    {
      id: "destruction",
      title: "5. 개인정보의 파기 절차 및 방법",
      blocks: [
        {
          type: "p",
          text: "회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다. 다만, 관계 법령에 따라 보존하여야 하는 경우 해당 기간 동안 별도 분리 보관 후 파기합니다.",
        },
        {
          type: "ul",
          items: [
            "파기 절차: 파기 사유 발생 → 개인정보 보호책임자 승인 → 전자적 파일 영구 삭제 또는 출력물 분쇄·소각",
            "전자적 파일: 복구·재생이 불가능한 방법으로 영구 삭제",
            "회원 탈퇴: 프로필 화면의 회원 탈퇴 기능 또는 고객지원 요청 시 계정 및 연계 데이터 삭제(관리자 계정 제외, 법령상 보존 데이터 제외)",
          ],
        },
      ],
    },
    {
      id: "third-party",
      title: "6. 개인정보의 제3자 제공",
      blocks: [
        {
          type: "p",
          text: "회사는 정보주체의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 정보주체의 동의가 있거나 법령에 특별한 규정이 있는 경우에만 제공합니다.",
        },
        {
          type: "p",
          text: "현재 회사는 마케팅·광고 목적으로 개인정보를 제3자에게 제공하거나 판매하지 않습니다.",
        },
      ],
    },
    {
      id: "additional-use",
      title: "7. 추가적인 이용·제공 판단 기준",
      blocks: [
        {
          type: "p",
          text: "회사는 「개인정보 보호법」 제15조제3항 및 제17조제4항에 따라, 동의 없이 추가적인 이용·제공을 하지 않습니다. 향후 해당 조항에 따른 이용·제공이 필요한 경우, 당초 수집 목적과 관련성, 수집 정황·처리 관행, 정보주체 이익 침해 여부, 안전조치 등을 고려하고 필요 시 동의를 받겠습니다.",
        },
      ],
    },
    {
      id: "entrustment",
      title: "8. 개인정보 처리업무의 위탁",
      blocks: [
        {
          type: "p",
          text: "회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있으며, 위탁계약 시 개인정보가 안전하게 관리될 수 있도록 관련 법령에 따른 필요 사항을 규정하고 있습니다.",
        },
        {
          type: "table",
          headers: ["수탁자", "위탁 업무", "보유·이용 기간"],
          rows: [
            ["Supabase, Inc.", "회원 인증, 데이터베이스·파일 스토리지 운영", "위탁 계약 종료 시까지"],
            ["Vercel Inc.", "웹 애플리케이션 호스팅·CDN", "위탁 계약 종료 시까지"],
            ["Google LLC (Generative Language API)", "펫·본인 사주 해설 및 프리미엄 리포트 문장 생성", "API 요청 처리 완료 시(모델 학습·재학습 미활용)"],
            ["Anthropic PBC / OpenAI, LLC (서버 설정 시)", "프리미엄 리포트 문장 생성(대체 LLM)", "API 요청 처리 완료 시"],
            ["Upstash", "비로그인 기본 사주 API 요청 제한(접속 IP 식별)", "제한 목적 달성 후 자동 만료"],
            ["Resend, Inc. (서버 설정 시)", "프리미엄 리포트 링크 이메일 발송", "발송 완료 후 수탁자 정책에 따름"],
            ["PayPal Holdings, Inc. / PortOne(포트원)", "유료 리포트 결제 처리", "결제 관련 법령 보존 기간"],
            ["Google LLC / Kakao Corp.", "소셜 로그인 인증(회원 선택 시)", "인증 완료 시까지"],
          ],
        },
      ],
    },
    {
      id: "overseas",
      title: "9. 개인정보의 국외 이전",
      blocks: [
        {
          type: "p",
          text: "회사는 클라우드·AI·결제·이메일 서비스 이용 과정에서 개인정보가 국외로 이전될 수 있습니다. 이전은 서비스 이용 시점에 네트워크를 통해 이루어집니다.",
        },
        {
          type: "table",
          headers: [
            "이전받는 자",
            "이전 국가",
            "이전 항목",
            "이전 목적",
            "보유·이용 기간",
            "거부 방법 및 불이익",
          ],
          rows: [
            [
              "Supabase, Inc.",
              "미국 등",
              "회원·펫·사주·커뮤니티·결제 연동 데이터",
              "데이터 저장·인증",
              "회원 탈퇴 또는 위탁 종료 시까지",
              "거부 시 회원가입·데이터 저장 기능 이용 불가",
            ],
            [
              "Vercel Inc.",
              "미국 등",
              "접속·요청 메타데이터",
              "웹 서비스 제공",
              "요청 처리 완료 시",
              "거부 시 웹 서비스 이용 불가",
            ],
            [
              "Google LLC (Gemini API)",
              "미국",
              "펫·본인 이름, 생년월일시, 사주 계산 결과(프롬프트 구성용)",
              "AI 해설·리포트 문장 생성",
              "API 응답 생성 완료 시(학습 미활용)",
              "거부 시 AI 해설·프리미엄 LLM 문장 미제공",
            ],
            [
              "Resend / PayPal / PortOne 등",
              "미국 등",
              "이메일 주소, 결제 식별·거래 정보",
              "이메일 발송·결제",
              "위탁·법령 보존 기간",
              "거부 시 해당 유료·이메일 기능 이용 불가",
            ],
          ],
        },
      ],
    },
    {
      id: "security",
      title: "10. 개인정보의 안전성 확보조치",
      blocks: [
        {
          type: "p",
          text: "회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.",
        },
        {
          type: "ul",
          items: [
            "관리적 조치: 내부 관리계획 수립, 개인정보 취급자 최소화, 정기적 보안 점검",
            "기술적 조치: 비밀번호 암호화·접근 통제, HTTPS 전송, Supabase 행 수준 보안(RLS), API 인증(Bearer 토큰)",
            "물리적 조치: 클라우드 데이터센터에 대한 수탁자의 물리적 보안 조치 활용",
            "접속 기록 보관 및 위변조 방지, 악성코드 방지, API 요청 제한",
          ],
        },
      ],
    },
    {
      id: "sensitive-public",
      title: "11. 민감정보의 공개 가능성 및 비공개 선택",
      blocks: [
        {
          type: "p",
          text: "회사는 민감정보를 별도로 수집하지 않습니다. 다만, 커뮤니티·우리아이 자랑 등 회원이 직접 게시한 사진·글은 다른 이용자에게 공개될 수 있으므로, 개인을 식별할 수 있는 정보·민감한 내용을 게시하지 않도록 주의해 주세요.",
        },
        {
          type: "ul",
          items: [
            "공개 범위 조절: 공개 게시판·Pet Show에 업로드하지 않거나, 본인 게시물을 삭제·수정",
            "프로필·펫 사진: 프로필·커뮤니티 설정에서 업로드 여부를 스스로 선택",
          ],
        },
      ],
    },
    {
      id: "pseudonym",
      title: "12. 가명정보 처리",
      blocks: [
        {
          type: "p",
          text: "회사는 현재 가명정보를 처리하지 않습니다.",
        },
      ],
    },
    {
      id: "cookies",
      title: "13. 개인정보 자동 수집 장치의 설치·운영 및 거부",
      blocks: [
        {
          type: "p",
          text: "회사는 로그인 유지와 서비스 제공을 위해 인증 세션(쿠키·로컬 스토리지 등)을 사용합니다. 맞춤형 광고·행태 분석 목적의 쿠키는 운영하지 않습니다.",
        },
        {
          type: "ul",
          items: [
            "사용 목적: 로그인 상태 유지, 보안, 언어·세션 설정",
            "거부 방법: 브라우저에서 쿠키 저장을 거부하거나 시크릿 모드를 사용할 수 있습니다. 다만, 쿠키 거부 시 로그인·일부 기능 이용이 제한될 수 있습니다.",
            "Chrome: 설정 → 개인정보 및 보안 → 서드파티 쿠키 / 인터넷 사용기록 삭제",
            "Edge: 설정 → 개인 정보, 검색 및 서비스 → 쿠키 및 사이트 데이터",
            "모바일: 브라우저 시크릿(비밀) 탭 또는 기기 설정에서 쿠키 차단",
          ],
        },
      ],
    },
    {
      id: "behavioral",
      title: "14. 행태정보의 수집·이용 및 거부",
      blocks: [
        {
          type: "p",
          text: "회사는 온라인 맞춤형 광고 등을 위한 행태정보를 수집·이용하지 않으며, 제3자에게 행태정보 수집을 허용하지 않습니다.",
        },
      ],
    },
    {
      id: "rights",
      title: "15. 정보주체와 법정대리인의 권리·의무 및 행사방법",
      blocks: [
        {
          type: "p",
          text: "정보주체는 회사에 대해 언제든지 다음 권리를 행사할 수 있습니다.",
        },
        {
          type: "ul",
          items: [
            "개인정보 열람·정정·삭제·처리정지 요구",
            "동의 철회(수집·이용 동의를 한 항목)",
            "회원 탈퇴(프로필 화면 또는 고객지원 요청)",
          ],
        },
        {
          type: "p",
          text: "권리 행사는 고객지원(/support) 1:1 문의, 전화, 서면 등으로 할 수 있으며, 회사는 지체 없이 조치하겠습니다. 대리인이 요청하는 경우 위임장 등 법령이 정한 확인 절차를 요청할 수 있습니다.",
        },
      ],
    },
    {
      id: "automated",
      title: "16. 자동화된 결정에 관한 사항",
      blocks: [
        {
          type: "p",
          text: "회사의 사주·운세·궁합·프리미엄 리포트는 만세력 계산 알고리즘과(선택) 생성형 AI를 활용한 엔터테인먼트 콘텐츠입니다. 이는 의료·법률·재무 등 정보주체의 권리·의무에 중대한 영향을 미치는 자동화된 결정이 아니며, 정보주체는 결과에 대해 동의를 철회하거나 삭제를 요청할 수 있습니다.",
        },
      ],
    },
    {
      id: "officer",
      title: "17. 개인정보 보호책임자 및 고충처리 부서",
      blocks: [
        {
          type: "table",
          headers: ["구분", "내용"],
          rows: [
            ["개인정보 보호책임자", `대표 ${LEGAL_ENTITY.representative}`],
            ["소속", LEGAL_ENTITY.nameKo],
            ["연락처", `전화 ${LEGAL_ENTITY.phone}`],
            ["이메일", LEGAL_ENTITY.email],
            ["문의", `${LEGAL_ENTITY.website}/support (1:1 문의)`],
          ],
        },
        {
          type: "p",
          text: "개인정보 관련 문의·불만·피해 구제는 위 연락처로 접수해 주시면 신속히 답변드리겠습니다.",
        },
      ],
    },
    {
      id: "domestic-agent",
      title: "18. 국내대리인 지정",
      blocks: [
        {
          type: "p",
          text: "회사는 국내 사업자로서 국내대리인을 별도 지정하지 않습니다.",
        },
      ],
    },
    {
      id: "remedy",
      title: "19. 정보주체의 권익침해에 대한 구제방법",
      blocks: [
        {
          type: "p",
          text: "개인정보 침해로 인한 구제를 받기 위하여 다음 기관에 분쟁해결이나 상담을 신청할 수 있습니다.",
        },
        {
          type: "ul",
          items: [
            "개인정보보호위원회 개인정보 포털(privacy.go.kr) / 국번 없이 182",
            "개인정보 침해신고센터(privacy.kisa.or.kr) / 국번 없이 118",
            "대검찰청 사이버수사과(spo.go.kr) / 국번 없이 1301",
            "경찰청 사이버수사국(ecrm.police.go.kr) / 국번 없이 182",
          ],
        },
      ],
    },
    {
      id: "cctv",
      title: "20. 고정형 영상정보처리기기 운영·관리",
      blocks: [
        {
          type: "p",
          text: "회사는 고정형 영상정보처리기기(CCTV)를 운영하지 않습니다.",
        },
      ],
    },
    {
      id: "mobile-video",
      title: "21. 이동형 영상정보처리기기 운영·관리",
      blocks: [
        {
          type: "p",
          text: "회사는 이동형 영상정보처리기기(바디캠 등)를 운영하지 않습니다.",
        },
      ],
    },
    {
      id: "ai",
      title: "22. 생성형 인공지능(AI) 서비스 관련 사항",
      blocks: [
        {
          type: "p",
          text: "회사는 K-Saju Pet 서비스 일부에서 생성형 AI API를 연동합니다. 의도된 용도는 반려동물·본인 사주 해설 및 프리미엄 리포트 문장 생성(엔터테인먼트)이며, 의료 진단·법률 자문·투자 권유가 아닙니다.",
        },
        {
          type: "ul",
          items: [
            "입력·생성 정보: 펫·본인 이름, 생년월일시, 사주 계산 결과, 리포트 유형·언어 등 서비스에 필요한 최소 정보",
            "보관: 생성된 리포트는 회원 계정·리포트 보관함에 저장되며, 웹 열람은 결제일로부터 30일(프리미엄)",
            "학습 활용: 회사는 이용자 데이터를 AI 모델 재학습·Fine-tuning에 사용하지 않습니다. 외부 API 제공자에 대한 학습 정책은 해당 수탁자 약관을 따릅니다.",
            "주의: 입력란에 주민등록번호·건강정보 등 민감·고유식별정보를 입력하지 마세요.",
            "거부·삭제: AI 해설이 포함된 결과 저장을 원하지 않으면 사주 분석·리포트 생성을 이용하지 않거나, 저장 후 삭제·회원 탈퇴를 요청할 수 있습니다.",
          ],
        },
      ],
    },
    {
      id: "changes",
      title: "23. 개인정보 처리방침의 변경",
      blocks: [
        {
          type: "p",
          text: `본 개인정보 처리방침은 ${LEGAL_ENTITY.effectiveDateKo}부터 적용됩니다. 내용 추가·삭제·수정이 있을 경우 시행 7일 전부터 ${LEGAL_ENTITY.website} 공지사항 또는 본 페이지를 통해 안내합니다. 다만, 정보주체 권리에 중요한 변경은 30일 전에 공지합니다.`,
        },
        {
          type: "p",
          text: "변경 이력은 아래와 같습니다.",
        },
        {
          type: "ul",
          items: [`${LEGAL_ENTITY.effectiveDateKo}: 2026 개인정보보호위원회 「개인정보 처리방침 작성지침」에 따라 전면 개정`],
        },
      ],
    },
  ],
};

const EN: PrivacyPolicyContent = {
  title: `${LEGAL_ENTITY.nameEn} Privacy Policy`,
  preamble: [
    `${LEGAL_ENTITY.nameEn} (${LEGAL_ENTITY.serviceEn}, "we", "us", or "the Company") complies with applicable privacy laws and handles personal data lawfully and securely to protect your rights.`,
    "Under Article 30 of the Personal Information Protection Act (PIPA), we publish this Privacy Policy to explain how we process personal data and how you can contact us with privacy-related requests.",
    `This Policy applies to ${LEGAL_ENTITY.website} and the K-Saju Pet mobile app (WebView).`,
  ],
  tocTitle: "Table of contents",
  effectiveLabel: `Effective: ${LEGAL_ENTITY.effectiveDateEn}`,
  sections: [
    {
      id: "purpose",
      title: "1. Purposes of processing",
      blocks: [
        {
          type: "p",
          text: "We process personal data only for the purposes below. If purposes change, we will take required steps such as obtaining separate consent under PIPA Article 18.",
        },
        {
          type: "ul",
          items: [
            "Account registration, login, identity verification, fraud prevention",
            "Pet K-Saju (four pillars) analysis, saved results, you & your pet compatibility and fortune features",
            "Human premium report generation, storage, viewing, payment confirmation, optional email delivery",
            "Pet profiles and photos, Pet Show, community boards (Q&A, tips, free board, breed experiences, etc.)",
            "Customer support and service notices",
            "API rate limiting for guest basic saju and service stability",
            "Generative AI narratives for saju readings and premium reports (entertainment only; not medical, legal, or financial advice)",
          ],
        },
      ],
    },
    {
      id: "items",
      title: "2. Personal data we process",
      blocks: [
        {
          type: "p",
          text: "We collect only the minimum data needed to provide the service.",
        },
        {
          type: "table",
          headers: ["Category", "Items", "How collected"],
          rows: [
            [
              "Account (required)",
              "Email, password (stored hashed), display name, language and timezone preferences",
              "You enter directly",
            ],
            [
              "Social login (optional)",
              "Email, social profile ID and display name (per Google/Kakao policies)",
              "When you choose Google or Kakao login",
            ],
            [
              "Pet saju (required; consent)",
              "Pet name, species, optional gender, birth date/time (or unknown), IANA timezone, calendar type, privacy consent",
              "You enter directly",
            ],
            [
              "Pet profile & Pet Show (optional)",
              "Pet photos, posts, comments, likes, challenge entries",
              "You upload or post",
            ],
            [
              "Pet parent saju & compatibility (optional)",
              "Your birth date/time, timezone, optional gender",
              "You enter directly",
            ],
            [
              "Human premium reports (required; consent)",
              "Name, birth date/time, timezone, optional gender, optional email for delivery, payment/order IDs",
              "You enter or generated at checkout",
            ],
            [
              "Support inquiries (optional)",
              "Name/nickname, email, category, title, message",
              "Support form at /support",
            ],
            [
              "Automatically generated",
              "IP address (guest basic saju rate limit), auth session tokens, usage logs",
              "Generated during service use",
            ],
          ],
        },
        {
          type: "note",
          text: "We do not collect resident registration numbers, passport numbers, or other sensitive categories by design. Do not enter sensitive data in saju or report forms.",
        },
      ],
    },
    {
      id: "children",
      title: "3. Children under 14",
      blocks: [
        {
          type: "p",
          text: "We do not knowingly collect personal data from children under 14 without parental consent. Registration and use by children under 14 require a legal guardian's consent.",
        },
        {
          type: "p",
          text: "If we learn that we collected a child's data without consent, we will delete it promptly. Guardians may request access, correction, deletion, or suspension of processing on behalf of the child.",
        },
      ],
    },
    {
      id: "retention",
      title: "4. Retention periods",
      blocks: [
        {
          type: "p",
          text: "We retain data only as long as required by law or as consented.",
        },
        {
          type: "table",
          headers: ["Category", "Period", "Basis"],
          rows: [
            ["Account, profile, pets, saju results", "Until account deletion", "Service provision"],
            [
              "One-way hash of withdrawn account email (no plaintext email)",
              "30 days from withdrawal, then deleted",
              "Prevent short-term re-registration abuse after withdrawal",
            ],
            ["Community & Pet Show posts", "Until post deletion or account deletion", "Community operation"],
            ["Human premium web reports", "30 days from payment", "Security and viewing convenience"],
            ["LLM result cache (if enabled)", "Up to 90 days", "Cost control for repeat generation"],
            ["Support inquiries", "3 years after resolution", "Dispute handling"],
            ["Payment/contract records", "5 years", "E-Commerce Consumer Protection Act (Korea)"],
            ["Consumer complaint records", "3 years", "E-Commerce Consumer Protection Act (Korea)"],
            ["Advertising records", "6 months", "E-Commerce Consumer Protection Act (Korea)"],
            ["Website access logs (IP, etc.)", "3 months", "Protection of Communications Secrets Act (Korea)"],
          ],
        },
      ],
    },
    {
      id: "destruction",
      title: "5. Destruction procedure and method",
      blocks: [
        {
          type: "p",
          text: "When retention ends or the purpose is achieved, we destroy personal data without delay unless law requires continued storage.",
        },
        {
          type: "ul",
          items: [
            "Procedure: reason occurs → privacy officer approval → permanent deletion or shredding",
            "Electronic files: deleted so they cannot be recovered",
            "Account deletion: via Profile or support request (admin accounts excluded; legally retained data excluded)",
          ],
        },
      ],
    },
    {
      id: "third-party",
      title: "6. Provision to third parties",
      blocks: [
        {
          type: "p",
          text: "We do not provide personal data to third parties except with your consent or as required by law.",
        },
        {
          type: "p",
          text: "We do not sell personal data for marketing or advertising.",
        },
      ],
    },
    {
      id: "additional-use",
      title: "7. Criteria for additional use or provision",
      blocks: [
        {
          type: "p",
          text: "We do not additionally use or provide data without consent under PIPA Articles 15(3) and 17(4). If needed in the future, we will consider relevance, context, impact, and safeguards, and obtain consent when required.",
        },
      ],
    },
    {
      id: "entrustment",
      title: "8. Processing entrustment",
      blocks: [
        {
          type: "p",
          text: "We entrust processing to the vendors below under contracts with required safeguards.",
        },
        {
          type: "table",
          headers: ["Processor", "Tasks entrusted", "Retention"],
          rows: [
            ["Supabase, Inc.", "Auth, database, file storage", "Until contract ends"],
            ["Vercel Inc.", "Web hosting and CDN", "Until contract ends"],
            ["Google LLC (Generative Language API)", "Saju narratives and premium report text", "Until API request completes (no fine-tuning by us)"],
            ["Anthropic PBC / OpenAI, LLC (if configured)", "Premium report text (alternate LLM)", "Until API request completes"],
            ["Upstash", "Guest basic saju rate limiting (IP)", "Until limit window expires"],
            ["Resend, Inc. (if configured)", "Premium report email delivery", "Per processor policy after send"],
            ["PayPal / PortOne", "Paid report checkout", "Per payment law retention"],
            ["Google LLC / Kakao Corp.", "Social login (if you choose)", "Until auth completes"],
          ],
        },
      ],
    },
    {
      id: "overseas",
      title: "9. Cross-border transfer",
      blocks: [
        {
          type: "p",
          text: "Using cloud, AI, payment, and email services may transfer data overseas at the time of use over networks.",
        },
        {
          type: "table",
          headers: [
            "Recipient",
            "Country",
            "Items",
            "Purpose",
            "Retention",
            "How to refuse / impact",
          ],
          rows: [
            [
              "Supabase, Inc.",
              "US, etc.",
              "Account, pet, saju, community, payment-linked data",
              "Storage and auth",
              "Until deletion or contract ends",
              "Refusal prevents account and cloud storage features",
            ],
            [
              "Vercel Inc.",
              "US, etc.",
              "Access/request metadata",
              "Web delivery",
              "Until request completes",
              "Refusal prevents web service use",
            ],
            [
              "Google LLC (Gemini API)",
              "US",
              "Names, birth data, chart results for prompts",
              "AI narratives",
              "Until response completes (no training by us)",
              "Refusal disables AI narratives",
            ],
            [
              "Resend / PayPal / PortOne, etc.",
              "US, etc.",
              "Email, payment identifiers",
              "Email and payments",
              "Per contract and law",
              "Refusal disables those features",
            ],
          ],
        },
      ],
    },
    {
      id: "security",
      title: "10. Security measures",
      blocks: [
        {
          type: "p",
          text: "We apply administrative, technical, and physical safeguards including access control, HTTPS, Supabase RLS, API authentication, rate limiting, and vendor security measures.",
        },
      ],
    },
    {
      id: "sensitive-public",
      title: "11. Sensitive data and public posts",
      blocks: [
        {
          type: "p",
          text: "We do not collect sensitive categories separately. Photos and posts you publish in community or Pet Show may be visible to others—avoid posting identifying or sensitive content.",
        },
        {
          type: "ul",
          items: [
            "Control visibility by not posting publicly or by deleting/editing your posts",
            "Choose whether to upload profile or pet photos",
          ],
        },
      ],
    },
    {
      id: "pseudonym",
      title: "12. Pseudonymized data",
      blocks: [{ type: "p", text: "We do not currently process pseudonymized personal data." }],
    },
    {
      id: "cookies",
      title: "13. Cookies and similar technologies",
      blocks: [
        {
          type: "p",
          text: "We use auth session cookies/local storage for login. We do not use behavioral advertising cookies.",
        },
        {
          type: "ul",
          items: [
            "Purpose: login state, security, locale/session",
            "You may block cookies in browser settings; some features may not work",
            "Chrome / Edge: Privacy settings → cookies / delete browsing data",
            "Mobile: private/incognito tab or device cookie settings",
          ],
        },
      ],
    },
    {
      id: "behavioral",
      title: "14. Behavioral information",
      blocks: [
        {
          type: "p",
          text: "We do not collect behavioral data for targeted ads and do not allow third parties to collect it on our site.",
        },
      ],
    },
    {
      id: "rights",
      title: "15. Your rights and how to exercise them",
      blocks: [
        {
          type: "ul",
          items: [
            "Request access, correction, deletion, or suspension of processing",
            "Withdraw consent where processing is consent-based",
            "Delete your account from Profile or via support",
          ],
        },
        {
          type: "p",
          text: "Contact us at /support or by phone. We may request verification for agent requests.",
        },
      ],
    },
    {
      id: "automated",
      title: "16. Automated decision-making",
      blocks: [
        {
          type: "p",
          text: "Saju, fortune, compatibility, and premium reports are entertainment content produced by algorithms and optional AI. They are not automated decisions with legal or similarly significant effects. You may withdraw consent or request deletion.",
        },
      ],
    },
    {
      id: "officer",
      title: "17. Privacy officer and contact",
      blocks: [
        {
          type: "table",
          headers: ["Role", "Details"],
          rows: [
            ["Privacy officer", `CEO ${LEGAL_ENTITY.representative}`],
            ["Organization", LEGAL_ENTITY.nameEn],
            ["Phone", LEGAL_ENTITY.phone],
            ["Email", LEGAL_ENTITY.email],
            ["Inquiries", `${LEGAL_ENTITY.website}/support`],
          ],
        },
      ],
    },
    {
      id: "domestic-agent",
      title: "18. Domestic representative",
      blocks: [{ type: "p", text: "Not applicable—we are a Korea-based business." }],
    },
    {
      id: "remedy",
      title: "19. Remedies for privacy violations",
      blocks: [
        {
          type: "ul",
          items: [
            "PIPC (privacy.go.kr) / 182",
            "KISA Privacy Reporting Center (privacy.kisa.or.kr) / 118",
            "Supreme Prosecutors' Office Cyber Investigation (spo.go.kr) / 1301",
            "National Police Agency Cyber Bureau (ecrm.police.go.kr) / 182",
          ],
        },
      ],
    },
    {
      id: "cctv",
      title: "20. Fixed video devices (CCTV)",
      blocks: [{ type: "p", text: "We do not operate fixed video devices." }],
    },
    {
      id: "mobile-video",
      title: "21. Mobile video devices",
      blocks: [{ type: "p", text: "We do not operate mobile video devices." }],
    },
    {
      id: "ai",
      title: "22. Generative AI",
      blocks: [
        {
          type: "p",
          text: "We use generative AI APIs for pet/human saju narratives and premium report text (entertainment only).",
        },
        {
          type: "ul",
          items: [
            "Inputs: names, birth data, chart results, report type and language as needed",
            "Storage: reports saved to your account; premium web viewing for 30 days after payment",
            "Training: we do not use your data for model fine-tuning; external API terms apply to processors",
            "Do not enter sensitive or unique ID numbers in forms",
            "You may avoid AI features, delete saved results, or delete your account",
          ],
        },
      ],
    },
    {
      id: "changes",
      title: "23. Changes to this Policy",
      blocks: [
        {
          type: "p",
          text: `Effective ${LEGAL_ENTITY.effectiveDateEn}. Material changes affecting your rights will be announced at least 30 days in advance on this page or site notices; other changes at least 7 days in advance.`,
        },
        {
          type: "ul",
          items: [`${LEGAL_ENTITY.effectiveDateEn}: Full revision per PIPC 2026 Privacy Policy Guidelines`],
        },
      ],
    },
  ],
};

export function getPrivacyPolicyContent(locale: string): PrivacyPolicyContent {
  return locale === "en" ? EN : KO;
}
