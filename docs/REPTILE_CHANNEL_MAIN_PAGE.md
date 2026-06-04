# 렙타일 채널 메인페이지 디자인 리뉴얼 가이드

## 목적

렙타일 채널은 기존 강아지/고양이 채널과 달리 파충류만 다루는 페이지가 아니라, **파충류 + 앵무새(조류) + 다른동물**을 함께 담는 확장 채널이다.

새 디자인의 목표는 다음과 같다.

- 첫 화면에서 "렙타일(다른동물)" 채널의 정체성을 명확히 보여준다.
- 파충류, 앵무새, 소동물 보호자가 자기 동물 카테고리를 빠르게 찾을 수 있게 한다.
- 환경, 온습도, 식단, 건강 신호처럼 렙타일/특수동물에게 중요한 케어 정보를 전면에 둔다.
- 커뮤니티와 Pet Show 업로드로 자연스럽게 이어지게 한다.
- 모바일에서는 하단 탭에 렙타일 전용 탭을 추가하지 않고, 홈/커뮤니티 흐름 안에서 접근하게 한다.

## 현재 구현 구조

현재 렙타일 메인페이지는 아래 파일에서 렌더링된다.

- 페이지 엔트리: `src/app/[locale]/reptile/page.tsx`
- 공통 채널 레이아웃: `src/components/layout/ChannelShell.tsx`
- 채널 콘텐츠 UI: `src/components/channel/ChannelContentHub.tsx`
- 채널 정적 콘텐츠: `src/lib/channel/content.ts`
- DB 콘텐츠 로딩: `src/lib/content/channel-feed.ts`
- DB 시드: `supabase/migrations/011_reptile_channel_seed.sql`

현재 구조는 강아지/고양이 채널과 같은 컴포넌트를 공유한다. 새 디자인을 크게 바꾸려면 렙타일 전용 컴포넌트를 새로 만들거나, `ChannelContentHub` 안에서 `content.channel === "reptile"` 조건을 더 강하게 분리하면 된다.

추천 방향은 **렙타일 전용 컴포넌트 생성**이다.

예상 파일:

- `src/components/channel/ReptileChannelHome.tsx`
- `src/app/[locale]/reptile/page.tsx`에서 `ChannelContentHub` 대신 사용

## 페이지 톤앤매너

### 키워드

- 생태계
- 온도와 습도
- 조용한 전문성
- 이국적인 느낌
- 초보 보호자도 이해 가능한 안내
- 커뮤니티 친화적

### 피해야 할 느낌

- 파충류만 너무 강하게 보여서 앵무새/토끼/햄스터 사용자가 소외되는 느낌
- 병원/진단처럼 무겁고 딱딱한 느낌
- 너무 어둡거나 무서운 분위기
- 강아지/고양이 채널의 단순 복사처럼 보이는 구성

## 추천 비주얼 방향

### 컬러

기존 `channel-community` 계열을 사용하되, 렙타일 전용 느낌을 주기 위해 아래 보조 색감을 섞는다.

- 메인: 에메랄드/그린 계열
- 보조: 샌드, 라임, 소프트 옐로우
- 포인트: 테라리움 조명 느낌의 웜 라이트
- 배경: 연한 크림 + 그린 글로우

예시 Tailwind 느낌:

- `bg-emerald-500`
- `bg-lime-100`
- `bg-yellow-100`
- `bg-sand`
- `text-channel-community`
- `border-channel-community/25`

### 이미지/그래픽

히어로는 한 종류의 동물만 크게 보여주기보다, "다양한 특수동물 케어 허브"처럼 느껴져야 한다.

추천 소재:

- 도마뱀 또는 거북이
- 앵무새
- 토끼/햄스터 같은 소동물
- 테라리움, 조명, 온습도계, 식물, 은신처

이미지가 부족하면 일러스트 카드 방식으로 시작해도 된다.

## 추천 페이지 구성

### 1. Hero

목적: 렙타일 채널의 정체성을 3초 안에 전달한다.

권장 카피:

- 제목: `렙타일(다른동물) 케어 허브`
- 보조문구: `파충류, 앵무새(조류), 토끼·햄스터까지. 온도·습도·식단·건강 신호를 한 곳에서 확인하세요.`
- 배지: `REPTILE & OTHER PETS`

권장 CTA:

- `종류별 가이드 보기`
- `커뮤니티에서 질문하기`
- `우리아이 사진 올리기`

히어로 안에 작은 상태 카드 3개를 배치하면 좋다.

- `온도`
- `습도`
- `식단`

예시 정보:

- `온도 구배 체크`
- `습도와 탈피 관리`
- `종별 급여 루틴`

### 2. Species Gateway

목적: 사용자가 자기 반려동물 카테고리로 바로 들어가게 한다.

카드 3개:

- `파충류`
  - 도마뱀, 거북이, 뱀 등
  - 핵심: UVB, 온도 구배, 탈피, 은신처
- `앵무새(조류)`
  - 앵무새, 새류
  - 핵심: 스트레스 신호, 놀이, 깃털, 소음/수면
- `다른동물`
  - 토끼, 햄스터, 기니피그, 물고기 등
  - 핵심: 공간, 식단, 청결, 활동 리듬

각 카드의 CTA:

- `가이드 보기`
- `경험담 보기`

### 3. Habitat Checklist

목적: 렙타일 채널만의 전문성을 보여준다.

체크리스트 예시:

- `온도 구배가 있는가?`
- `습도 범위가 종에 맞는가?`
- `은신처가 충분한가?`
- `UVB/조명 교체 주기를 알고 있는가?`
- `배변, 식욕, 활동량 변화를 기록하는가?`

UI 방향:

- 2열 카드
- 온습도계 느낌의 작은 그래픽
- 초보자도 바로 이해 가능한 짧은 문장

### 4. Featured Guides

목적: DB 콘텐츠 또는 정적 콘텐츠를 카드로 보여준다.

현재 DB 시드에 들어간 콘텐츠 예시:

- `사육장 온도·습도, 이렇게 잡으면 안정적이에요`
- `도마뱀·거북이, UVB와 온도 구배 체크리스트`
- `앵무새(조류) 스트레스 신호와 놀이 루틴`
- `토끼·햄스터, 공간과 식단부터 챙기기`

카드 구성:

- 카테고리 배지
- 제목
- 요약
- 태그
- `자세히 보기`

### 5. Community Bridge

목적: 콘텐츠 소비 후 커뮤니티 활동으로 이어지게 한다.

추천 섹션:

- 제목: `비슷한 보호자들과 경험을 나눠보세요`
- CTA:
  - `질문 올리기`
  - `품종별 경험담 보기`
  - `우리아이 자랑 올리기`

카드 예시:

- `초보 사육 질문`
- `종별 경험담`
- `사진 자랑`

### 6. Pet Show Preview

목적: 사진 업로드와 커뮤니티 체류 시간을 늘린다.

표시 항목:

- 최근 렙타일/다른동물 사진
- 좋아요/댓글 수
- 국가 표시가 있는 경우 국가 뱃지

주의:

- 현재 Pet Show 분류는 `dog`, `cat`, `other`이며, 렙타일은 `other` 흐름에 포함된다.
- 향후 필요하면 `PetShowSpecies`에 `reptile`을 별도 분리할 수 있다.

## 데이터 연결 기준

### 채널 콘텐츠

`fetchChannelEditorial("reptile", locale)`가 Supabase 콘텐츠를 가져온다.

DB 콘텐츠가 없으면 `getChannelContent("reptile", locale)`의 정적 콘텐츠를 사용한다.

### 국가 표시

새로 추가된 국가 표시 기능과 연결할 경우:

- 프로필 국가: `profiles.country_code`
- 공개 여부: `profiles.show_country`
- 게시글/사진 국가: `community_posts.country_code`

렙타일 채널의 Pet Show 또는 커뮤니티 카드에서 국가를 표시할 때는 `community_posts.country_code`를 기준으로 표시한다.

## 구현 제안

### 추천 컴포넌트 구조

```tsx
// src/app/[locale]/reptile/page.tsx
<ChannelShell theme="reptile" ...>
  <ReptileChannelHome
    content={getChannelContent("reptile", locale)}
    featured={editorial.featured}
    articles={editorial.articles}
    source={editorial.source}
  />
</ChannelShell>
```

```tsx
// src/components/channel/ReptileChannelHome.tsx
export function ReptileChannelHome(props) {
  return (
    <div className="space-y-12">
      <ReptileHero />
      <SpeciesGateway />
      <HabitatChecklist />
      <FeaturedGuides />
      <CommunityBridge />
    </div>
  );
}
```

### 유지할 것

- `/reptile` URL
- `ChannelShell theme="reptile"`
- 데스크톱 우측 링크: 강아지, 고양이, 커뮤니티
- 모바일 하단 탭에는 렙타일 전용 탭을 추가하지 않음
- DB 콘텐츠 fallback 구조

### 바꿔도 되는 것

- 히어로 이미지
- 카드 레이아웃
- 섹션 순서
- 렙타일 전용 CTA
- 렙타일 전용 일러스트/아이콘
- `ChannelContentHub`를 쓰지 않고 전용 컴포넌트 사용

## 모바일 기준

모바일에서는 다음 순서를 추천한다.

1. Hero
2. Species Gateway
3. Habitat Checklist
4. Featured Guides
5. Community Bridge

모바일 카드 폭:

- Hero CTA는 2개까지만 우선 노출
- Species 카드는 세로 스택
- Featured Guides는 가로 스크롤 또는 1열 카드

## 완료 기준

디자인 리뉴얼이 완료됐다고 볼 수 있는 기준:

- `/ko/reptile`, `/en/reptile` 모두 정상 표시
- 첫 화면에서 파충류/앵무새/다른동물 채널임이 명확함
- 주요 CTA가 커뮤니티와 Pet Show로 연결됨
- Supabase 콘텐츠가 있을 때와 없을 때 모두 깨지지 않음
- 모바일에서 가로 넘침이 없음
- 기존 강아지/고양이 채널에 영향 없음
