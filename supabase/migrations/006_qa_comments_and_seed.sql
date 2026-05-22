-- Q&A detail support: comment counters and starter board data.
-- Topics are based on common dog/cat care FAQ categories: walking, anxiety,
-- litter, feeding, grooming, introductions, and everyday behavior.

create or replace function public.handle_post_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set comment_count = comment_count + 1
  where id = new.post_id;
  return new;
end;
$$;

create or replace function public.handle_post_comment_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set comment_count = greatest(comment_count - 1, 0)
  where id = old.post_id;
  return old;
end;
$$;

drop trigger if exists trg_post_comment_insert on public.post_comments;
create trigger trg_post_comment_insert
after insert on public.post_comments
for each row execute function public.handle_post_comment_insert();

drop trigger if exists trg_post_comment_delete on public.post_comments;
create trigger trg_post_comment_delete
after delete on public.post_comments
for each row execute function public.handle_post_comment_delete();

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo-qa@cosmic-paws.local',
  crypt('cosmic-paws-demo', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Cosmic Paws Q&A"}'::jsonb,
  now(),
  now()
) on conflict (id) do nothing;

insert into public.profiles (id, display_name, avatar_url, locale, timezone, provider, role)
values (
  '00000000-0000-0000-0000-000000000101',
  'Cosmic Paws 운영진',
  null,
  'ko',
  'Asia/Seoul',
  'seed',
  'admin'
)
on conflict (id) do update
set display_name = excluded.display_name,
    provider = excluded.provider,
    role = excluded.role,
    updated_at = now();

with seed(n, title, content, tags, likes, views) as (
  values
    (1, '강아지가 혼자 있으면 계속 짖어요', '외출하면 10분 안에 짖기 시작하고 문 앞에서 기다립니다. 분리불안인지, 집에서 어떤 순서로 연습하면 좋을까요?', array['dog','separation-anxiety','training'], 32, 410),
    (2, '고양이 화장실은 몇 개가 적당할까요?', '한 마리를 키우는데 화장실 하나로 충분한지 고민입니다. 위치와 모래 종류도 같이 조언 부탁드려요.', array['cat','litter','care'], 28, 356),
    (3, '산책 중 다른 강아지만 보면 흥분해요', '줄을 당기고 낑낑거리다가 짖기도 합니다. 인사시키는 게 맞는지, 거리를 두고 훈련해야 하는지 궁금해요.', array['dog','walk','behavior'], 25, 330),
    (4, '새벽 우다다를 줄이는 방법이 있을까요?', '밤마다 뛰어다니고 장난감을 물고 옵니다. 자기 전 놀이 루틴을 어떻게 잡으면 좋을까요?', array['cat','play','night'], 21, 288),
    (5, '강아지가 사료를 갑자기 안 먹어요', '간식은 먹는데 사료만 남깁니다. 사료를 바로 바꿔도 되는지, 병원에 가야 하는 기준이 궁금해요.', array['dog','food','health'], 19, 275),
    (6, '고양이가 물을 너무 적게 마시는 것 같아요', '정수기를 써도 관심이 적습니다. 습식 비율이나 물그릇 위치를 어떻게 바꾸면 좋을까요?', array['cat','water','food'], 18, 261),
    (7, '배변 실수가 다시 시작됐어요', '배변 훈련이 끝난 줄 알았는데 최근 러그에 실수합니다. 환경 변화가 원인일 수 있을까요?', array['dog','potty','routine'], 16, 240),
    (8, '고양이 스크래처를 안 써요', '소파만 긁고 스크래처는 피합니다. 재질이나 위치를 바꾸면 효과가 있을까요?', array['cat','scratch','home'], 15, 229),
    (9, '입질이 심한 어린 강아지 어떻게 알려줘야 하나요?', '놀 때 손을 물고 흥분하면 더 세게 뭅니다. 혼내지 않고 멈추게 하는 방법이 궁금해요.', array['dog','puppy','bite'], 23, 315),
    (10, '고양이가 갑자기 숨는 시간이 늘었어요', '평소보다 침대 밑에 오래 있고 만지는 걸 피합니다. 스트레스인지 건강 문제인지 구분하고 싶어요.', array['cat','stress','health'], 20, 300),
    (11, '하네스 적응은 얼마나 걸릴까요?', '집에서는 괜찮은데 밖에 나가면 얼어붙습니다. 단계별로 적응시키는 팁이 있을까요?', array['dog','harness','walk'], 13, 190),
    (12, '고양이 합사 첫날에 서로 하악질해요', '문틈 냄새 교환은 했는데 얼굴을 보자마자 하악질합니다. 다시 분리해야 할까요?', array['cat','introductions','behavior'], 24, 340),
    (13, '강아지 귀 청소 주기가 궁금해요', '귀 냄새는 심하지 않은데 갈색 귀지가 조금 보입니다. 집에서 관리해도 되는 범위가 있을까요?', array['dog','grooming','health'], 12, 180),
    (14, '고양이 털토를 자주 해요', '일주일에 한두 번 정도 털을 토합니다. 빗질이나 사료로 줄일 수 있는지 궁금해요.', array['cat','grooming','hairball'], 17, 248),
    (15, '산책 시간이 짧아도 괜찮을까요?', '평일에는 15분씩 두 번이 한계입니다. 노즈워크나 실내 놀이로 보완할 수 있을까요?', array['dog','walk','enrichment'], 14, 210),
    (16, '고양이가 밥을 조금씩 자주 먹고 싶어해요', '정해진 시간 급식으로 바꾸려는데 계속 달라고 울어요. 천천히 바꾸는 방법이 있을까요?', array['cat','food','routine'], 11, 170),
    (17, '강아지가 초인종 소리에 심하게 짖어요', '택배가 오면 멈추지 않고 짖습니다. 소리 둔감화 훈련을 어떻게 시작하면 좋을까요?', array['dog','barking','training'], 22, 305),
    (18, '고양이 모래를 바꾸면 바로 거부할까요?', '먼지가 적은 모래로 바꾸고 싶은데 화장실을 안 쓸까 봐 걱정됩니다. 섞어서 바꾸는 게 좋나요?', array['cat','litter','routine'], 13, 205),
    (19, '강아지가 차만 타면 침을 흘려요', '병원 가는 날마다 차멀미처럼 보여요. 짧은 거리부터 연습하면 도움이 될까요?', array['dog','car','stress'], 10, 165),
    (20, '고양이가 손을 사냥감처럼 물어요', '놀다가 갑자기 손목을 잡고 뒷발차기를 합니다. 손놀이를 끊는 방법이 궁금해요.', array['cat','play','bite'], 18, 260),
    (21, '강아지 발 닦을 때 너무 싫어해요', '산책 후 발을 닦으려면 도망가고 으르렁거립니다. 간식 보상으로 천천히 해도 될까요?', array['dog','grooming','training'], 12, 188),
    (22, '고양이가 창밖 새를 보며 이상한 소리를 내요', '짹짹거리는 듯한 소리를 내는데 스트레스인지 흥분인지 궁금합니다.', array['cat','behavior','play'], 9, 140),
    (23, '강아지 사회화가 늦은 것 같아요', '성견 입양 후 사람과 개를 모두 무서워합니다. 무리하지 않고 적응시키는 기준을 알고 싶어요.', array['dog','socialization','adoption'], 20, 289),
    (24, '고양이 양치 적응은 어떻게 시작하나요?', '칫솔만 보면 고개를 돌립니다. 손가락 거즈부터 시작하는 게 맞을까요?', array['cat','dental','care'], 15, 236),
    (25, '강아지가 자기 방석 대신 바닥에서 자요', '좋은 방석을 사줬는데 시원한 바닥만 찾습니다. 그냥 둬도 괜찮을까요?', array['dog','sleep','home'], 7, 120),
    (26, '고양이가 새 장난감에 금방 질려요', '처음 하루만 좋아하고 관심이 사라집니다. 장난감 로테이션이 효과가 있나요?', array['cat','play','enrichment'], 12, 198),
    (27, '강아지 간식은 하루에 얼마나 줘야 할까요?', '훈련 보상으로 자주 주다 보니 식사량이 줄었습니다. 간식 비율 기준이 궁금해요.', array['dog','food','training'], 16, 255),
    (28, '고양이가 높은 곳에서만 쉬어요', '캣타워 위에서만 자고 아래로 잘 안 내려옵니다. 안정감을 느끼는 행동일까요?', array['cat','home','behavior'], 8, 132),
    (29, '비 오는 날 산책을 싫어해요', '우비를 입히면 멈춰 서고 비 냄새도 싫어하는 듯합니다. 실내 대체 활동 추천 부탁드려요.', array['dog','walk','weather'], 14, 215),
    (30, '고양이 발톱 깎을 때 한 발도 힘들어요', '자는 틈에 하나씩 깎아도 깨면 도망갑니다. 스트레스 적게 관리하는 루틴이 있을까요?', array['cat','grooming','nail'], 19, 278),
    (31, '강아지가 손님에게 뛰어올라요', '반가워서 달려드는데 손님들이 놀랍니다. 앉아서 인사하는 연습을 어떻게 시키나요?', array['dog','manners','training'], 17, 250),
    (32, '고양이가 밥그릇 주변을 긁어요', '먹고 난 뒤 바닥을 덮는 것처럼 긁습니다. 불만 표시인지 본능 행동인지 궁금해요.', array['cat','food','behavior'], 10, 168),
    (33, '강아지가 다른 집 개똥을 먹으려 해요', '산책 중 냄새 맡다가 먹으려 해서 걱정됩니다. 식분증과 훈련 방법을 알고 싶어요.', array['dog','walk','coprophagia'], 18, 290),
    (34, '고양이 이동장 적응이 너무 어려워요', '병원 갈 때만 이동장을 꺼내서 그런지 보자마자 숨습니다. 평소에 어떻게 둬야 할까요?', array['cat','carrier','vet'], 22, 315),
    (35, '강아지 노즈워크를 매일 해도 되나요?', '산책을 못 한 날 노즈워크를 길게 해줍니다. 난이도와 시간을 어떻게 조절하면 좋을까요?', array['dog','enrichment','play'], 13, 202),
    (36, '고양이가 특정 사람만 피합니다', '가족 중 한 명만 보면 멀리 돌아갑니다. 냄새나 목소리 때문일 수 있을까요?', array['cat','stress','family'], 9, 152),
    (37, '강아지가 물그릇을 엎어요', '마시기보다 앞발로 장난치듯 엎습니다. 그릇 높이나 재질을 바꿔야 할까요?', array['dog','water','home'], 8, 138),
    (38, '고양이가 새벽에 밥 달라고 깨워요', '자동급식기를 쓰면 도움이 될까요? 울 때 바로 주면 습관이 될까 봐 걱정됩니다.', array['cat','food','night'], 21, 301),
    (39, '강아지가 미용 후 예민해졌어요', '미용실 다녀온 뒤 만지는 걸 싫어하고 잠을 많이 잡니다. 어느 정도까지 정상 반응일까요?', array['dog','grooming','stress'], 15, 230),
    (40, '고양이 캣닢 반응이 없어요', '다른 고양이들은 좋아한다는데 우리 아이는 무덤덤합니다. 정상인가요?', array['cat','catnip','play'], 6, 110),
    (41, '강아지 예방접종 후 산책은 언제부터 괜찮나요?', '접종 스케줄 중인데 사회화도 중요하다고 해서 고민됩니다. 안전한 범위가 궁금해요.', array['dog','vaccine','walk'], 20, 330),
    (42, '고양이가 화장실 밖에서 소변을 봤어요', '딱 한 번 실수했는데 그냥 지켜봐도 될까요? 병원에 바로 가야 하는 신호가 궁금합니다.', array['cat','litter','health'], 26, 380),
    (43, '강아지가 장난감을 지키며 으르렁거려요', '뺏으려고 하면 으르렁거립니다. 교환 놀이로 연습하면 나아질까요?', array['dog','resource-guarding','training'], 23, 345),
    (44, '고양이가 그루밍을 너무 많이 해요', '배 쪽 털이 조금 얇아진 것 같습니다. 스트레스와 피부 문제 중 무엇을 먼저 봐야 할까요?', array['cat','grooming','health'], 24, 360),
    (45, '강아지 산책 코스를 매일 바꾸는 게 좋나요?', '익숙한 길을 좋아하는지 새로운 길을 좋아하는지 헷갈립니다. 성향별로 다를까요?', array['dog','walk','routine'], 11, 172),
    (46, '고양이에게 두 번째 캣타워가 필요할까요?', '창가 자리를 두고 고양이 둘이 경쟁합니다. 공간을 분리하면 싸움이 줄어들까요?', array['cat','multi-cat','home'], 16, 242),
    (47, '강아지가 보호자 뒤만 따라다녀요', '화장실까지 따라오고 떨어지면 불안해합니다. 독립 시간을 어떻게 연습하면 좋을까요?', array['dog','attachment','training'], 27, 390),
    (48, '고양이가 갑자기 사료를 묻으려 해요', '밥그릇 주변을 긁고 남깁니다. 양이 많거나 맛이 마음에 안 드는 걸까요?', array['cat','food','behavior'], 13, 208),
    (49, '반려동물 사주 결과를 생활 루틴에 적용해도 될까요?', '목 기운이 강한 아이는 탐색 놀이를 늘리는 식으로 참고해도 괜찮을지 궁금합니다.', array['saju','routine','enrichment'], 30, 420),
    (50, '우리 아이 성향 태그는 어떻게 고르면 좋을까요?', '겁쟁이, 에너자이저, 애교쟁이처럼 여러 태그가 맞는 것 같습니다. 프로필에는 몇 개가 적당할까요?', array['profile','saju','community'], 12, 184)
),
upserted as (
  insert into public.community_posts (
    id,
    author_id,
    channel,
    post_type,
    title,
    content,
    image_urls,
    tags,
    language,
    like_count,
    view_count,
    is_pinned,
    created_at,
    updated_at
  )
  select
    ('00000000-0000-0000-0000-' || lpad((600000 + n)::text, 12, '0'))::uuid,
    '00000000-0000-0000-0000-000000000101',
    'community',
    'qa',
    title,
    content,
    '{}',
    tags,
    'ko',
    likes,
    views,
    n <= 3,
    now() - (n || ' hours')::interval,
    now() - (n || ' hours')::interval
  from seed
  on conflict (id) do update
  set title = excluded.title,
      content = excluded.content,
      tags = excluded.tags,
      like_count = excluded.like_count,
      view_count = excluded.view_count,
      is_pinned = excluded.is_pinned,
      updated_at = now()
  returning id, title
)
insert into public.post_comments (id, post_id, author_id, content, created_at, updated_at)
select
  ('00000000-0000-0000-0000-' || lpad((700000 + row_number() over (order by id))::text, 12, '0'))::uuid,
  id,
  '00000000-0000-0000-0000-000000000101',
  case
    when title like '%병원%' or title like '%건강%' or title like '%소변%' or title like '%예방접종%'
      then '증상이 반복되거나 통증, 식욕 저하가 보이면 수의사 상담을 먼저 권장해요. 생활 루틴은 기록해두면 진료 때 도움이 됩니다.'
    when title like '%고양이%'
      then '고양이는 환경 변화에 민감해서 위치, 냄새, 소리부터 하나씩 바꿔보는 방식이 좋아요. 갑작스러운 변화는 피해주세요.'
    when title like '%강아지%'
      then '짧게 성공할 수 있는 상황을 만들고 보상을 바로 주는 방식이 좋아요. 흥분이 높아지기 전 거리를 확보해보세요.'
    else '아이 성향을 관찰하면서 작은 변화부터 적용해보세요. 기록을 남기면 패턴을 찾기 훨씬 쉬워요.'
  end,
  now() - interval '10 minutes',
  now() - interval '10 minutes'
from upserted
on conflict (id) do nothing;

update public.community_posts p
set comment_count = c.count
from (
  select post_id, count(*)::int as count
  from public.post_comments
  where is_hidden = false
  group by post_id
) c
where p.id = c.post_id
  and p.post_type = 'qa';
