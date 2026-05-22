-- Sample published editorial content for dog / cat channels
insert into public.contents (
  channel, title, summary, body, tags, language, is_featured, is_published, published_at
)
select
  'dog',
  '비 오는 날 산책 체크리스트',
  '젖은 발·귀 관리와 실내 대체 놀이까지, 장마철 댕댕이 산책 가이드.',
  '비 오는 날에는 발가락 사이를 꼼꼼히 말려주고, 귀 안쪽 습기도 확인해 주세요. 실외 산책이 어렵다면 집 안 노즈워크 매트로 냄새 탐험 시간을 대신해 주는 것도 좋아요.',
  array['산책', '장마', '케어'],
  'ko',
  true,
  true,
  now()
where not exists (
  select 1 from public.contents where channel = 'dog' and title = '비 오는 날 산책 체크리스트'
);

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'dog', '퍼피의 첫 산책, 이렇게 시작해요', '하네스 적응부터 짧은 코스까지, 무리 없는 첫 산책 루틴.', '첫 산책은 5분도 충분해요. 하네스를 먼저 집 안에서 긍정적으로 연결한 뒤, 익숙한 골목 한 바퀴만 돌아오세요.', array['퍼피', '산책'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'dog' and title = '퍼피의 첫 산책, 이렇게 시작해요');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'dog', '간식은 칭찬 도구, 밥은 루틴', '급여량·간식 비율을 지키는 실전 식단 팁.', '간식은 훈련 직후 짧게 주는 것이 가장 좋아요. 하루 총 열량의 10% 안쪽을 지키면 체중 관리에 도움이 됩니다.', array['식단', '간식'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'dog' and title = '간식은 칭찬 도구, 밥은 루틴');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'dog', '혼자 있을 때 불안, 환경부터 바꿔요', '분리불안 예방을 위한 출근 전·후 루틴.', '출근 10분 전Play는 피하고, 돌아오면 조용히 인사한 뒤 2분 뒤에 산책을 시작하면 기대치를 낮출 수 있어요.', array['분리불안', '훈련'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'dog' and title = '혼자 있을 때 불안, 환경부터 바꿔요');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select
  'cat',
  '새벽 우다다, 낮에 사냥 놀이',
  '밤 에너지를 낮에 풀어주는 사냥 놀이 시퀀스.',
  '낚싯대 놀이는 숨기기-추격-잡기 순서로 10분만 해도 효과가 있어요. 끝에 소량의 급여로 사냥을 완성해 주세요.',
  array['우다다', '놀이'],
  'ko',
  true,
  true,
  now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '새벽 우다다, 낮에 사냥 놀이');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'cat', '화장실 밖 실수, 체크 순서', '모래·위치·청결·건강을 순서대로 점검.', '갑작스러운 실수는 스트레스나 요로 문제 신호일 수 있어요. 화장실 개수와 청결도를 먼저 확인하세요.', array['화장실'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '화장실 밖 실수, 체크 순서');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'cat', '물그릇 위치만 바꿔도 음수량 UP', '습식·그릇 재질·위치 실험 가이드.', '밥그릇 옆이 아닌 다른 공간에 물그릇을 두면 마시는 양이 늘어나는 경우가 많아요.', array['음수', '식단'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '물그릇 위치만 바꿔도 음수량 UP');

insert into public.contents (channel, title, summary, body, tags, language, is_featured, is_published, published_at)
select 'cat', '만져도 되는 시간 만들기', '스킨십 경계를 존중하는 접근법.', '먼저 코를 맡게 하고, 턱 아래 짧게 스킨십한 뒤, 스스로 물러나면 바로 멈춰 주세요.', array['행동', '심리'], 'ko', false, true, now()
where not exists (select 1 from public.contents where channel = 'cat' and title = '만져도 되는 시간 만들기');
