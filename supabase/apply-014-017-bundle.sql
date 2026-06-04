-- Q&A / Tips: animal_type + major category (Excel content structure)

alter table public.community_posts
  add column if not exists animal_type text,
  add column if not exists category text;

alter table public.community_posts
  drop constraint if exists community_posts_animal_type_check,
  add constraint community_posts_animal_type_check
    check (animal_type is null or animal_type in ('dog', 'cat', 'other'));

create index if not exists community_posts_board_animal_category_idx
  on public.community_posts (post_type, animal_type, category, created_at desc);

-- Backfill animal_type from legacy tags
update public.community_posts
set animal_type = 'dog'
where animal_type is null and 'dog' = any (tags);

update public.community_posts
set animal_type = 'cat'
where animal_type is null and 'cat' = any (tags);

update public.community_posts
set animal_type = 'other'
where animal_type is null and 'other' = any (tags);
-- Breed guide reference hub (SEO / pre-saju onboarding)

create table if not exists public.breed_guides (
  id uuid primary key default gen_random_uuid(),
  breed_name text not null,
  breed_name_en text,
  animal_type text not null check (animal_type in ('dog', 'cat', 'other')),
  size_category text,
  lifespan text,
  personality text,
  health_notes text,
  exercise_level text,
  grooming_level text,
  beginner_friendly boolean not null default true,
  saju_tendency text,
  seo_slug text not null unique,
  thumbnail_url text,
  hero_image_url text,
  summary text,
  body text,
  tags text[] not null default '{}',
  language text not null default 'ko' check (language in ('ko', 'en')),
  is_published boolean not null default false,
  view_count int not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists breed_guides_animal_published_idx
  on public.breed_guides (animal_type, is_published, created_at desc);

create trigger breed_guides_updated_at
before update on public.breed_guides
for each row execute function public.set_updated_at();

alter table public.breed_guides enable row level security;

create policy "breed_guides_public_read" on public.breed_guides
  for select using (is_published = true);

create policy "breed_guides_admin_write" on public.breed_guides
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Seed samples (idempotent by seo_slug)
insert into public.breed_guides (
  breed_name, breed_name_en, animal_type, size_category, lifespan, personality,
  health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency,
  seo_slug, summary, body, tags, language, is_published
)
select
  v.breed_name, v.breed_name_en, v.animal_type, v.size_category, v.lifespan, v.personality,
  v.health_notes, v.exercise_level, v.grooming_level, v.beginner_friendly, v.saju_tendency,
  v.seo_slug, v.summary, v.body, v.tags, 'ko', true
from (values
  (
    '留먰떚利?, 'Maltese', 'dog', 'small', '12??5??,
    '?좎갑??源딄퀬 ?덈????몄씠???덉젙?곸씤 猷⑦떞??醫뗭븘?댁슂.',
    '?덈Ъ ?먭뎅쨌?ш컻怨㉱룹튂??愿由щ? 袁몄????뺤씤?섏꽭??',
    'low', 'high', true, '??麗? 湲곗슫 ??李⑤텇???댁떇 怨듦컙',
    'maltese',
    '?뚰삎寃????寃ъ쥌. ?ㅻ궡 ?앺솢????留욎?留?遺꾨━遺덉븞??二쇱쓽媛 ?꾩슂?댁슂.',
    '留먰떚利덈뒗 ?щ엺怨쇱쓽 援먭컧??以묒떆?⑸땲?? 吏㏃? ?곗콉怨???二쇰? 愿由? 移섏븘 釉뚮윭?깆쓣 猷⑦떞?쇰줈 ?≪븘 二쇱꽭??',
    array['?뚰삎寃?, '珥덈낫']
  ),
  (
    '?몃뱾', 'Poodle', 'dog', 'small', '12??5??,
    '?묐삊?섍퀬 ?쒕룞?곸씠硫??덈젴 諛섏쓳??醫뗭븘??',
    '洹 吏덊솚쨌?쇰? ?뚮젅瑜닿린瑜?二쇨린?곸쑝濡??먭??섏꽭??',
    'medium', 'high', true, '紐??? 湲곗슫 ???먯깋쨌???,
    'poodle',
    '吏?μ씠 ?믪븘 吏猷⑦븿???먮겮硫?臾몄젣 ?됰룞???섏삱 ???덉뼱??',
    '?몃뱾? ?뺤떊???먭레??以묒슂?⑸땲?? ?곗콉 ?몄뿉 ?몄쫰?뚰겕쨌?쇱쫹 ?λ궃媛먯쓣 蹂묓뻾??二쇱꽭??',
    array['?뚰삎寃?, '?덈젴']
  ),
  (
    '肄붾━???륂뿤??, 'Korean Shorthair', 'cat', 'medium', '15??0??,
    '?낅┰?곸씠硫댁꽌??媛議깆뿉寃??좎젙???쒗쁽?섎뒗 ?몄씠?먯슂.',
    '鍮꾨쭔쨌諛⑷킅???덈갑???꾪빐 湲됱떇?됯낵 ?뚯닔?됱쓣 愿由ы븯?몄슂.',
    'low', 'low', true, '???? 湲곗슫 ???덉젙쨌洹쒖튃',
    'korean-shorthair',
    '?곕━?섎씪 ???臾섏쥌. ?곸쓳?μ씠 醫뗭븘 珥덈낫 吏묒궗?먭쾶??臾대궃?댁슂.',
    '罹ｍ??뚯? 李쎄? ?댁떇 怨듦컙??留덈젴?섍퀬, ?듭떇 鍮꾩쑉???섎젮 ?섎텇 ??랬瑜??뺣뒗 寃껋씠 醫뗭뒿?덈떎.',
    array['?⑤え', '珥덈낫']
  ),
  (
    '?섎Ⅴ?쒖븞', 'Persian', 'cat', 'medium', '12??7??,
    '李⑤텇?섍퀬 議곗슜???깊뼢??留롮븘??',
    '?몃춬移㉱룸늿臾셋룻샇?↔린 愿由ш? 以묒슂?⑸땲??',
    'low', 'high', false, '湲??? 湲곗슫 ???뺣룉쨌泥?껐',
    'persian',
    '?λえ醫낆쑝濡?洹몃（諛?遺?댁씠 ???몄엯?덈떎.',
    '留ㅼ씪 鍮쀬쭏怨???二쇰? ??린瑜??듦??뷀븯怨? ?붿슫 ???ㅻ궡 ?⑤룄瑜???떠 二쇱꽭??',
    array['?λえ', '洹몃（諛?]
  )
) as v(
  breed_name, breed_name_en, animal_type, size_category, lifespan, personality,
  health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency,
  seo_slug, summary, body, tags
)
on conflict (seo_slug) do nothing;
-- Seed 30 breed guides (see src/lib/community/breed-guide-seeds.ts)

insert into public.breed_guides (
  breed_name, breed_name_en, animal_type, size_category, lifespan, personality,
  health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency,
  seo_slug, summary, body, tags, language, is_published
)
select
  v.breed_name, v.breed_name_en, v.animal_type, v.size_category, v.lifespan, v.personality,
  v.health_notes, v.exercise_level, v.grooming_level, v.beginner_friendly, v.saju_tendency,
  v.seo_slug, v.summary, v.body, v.tags, 'ko', true
from (values
  ('留먰떚利?,'Maltese','dog','small','12??5??,'?좎갑??源딄퀬 ?덈?????','?덈Ъ쨌?ш컻怨㉱룹튂??愿由?','low','high',true,'??麗? ??李⑤텇???댁떇','maltese','?뚰삎寃???? ?ㅻ궡 ?앺솢???곹빀.','吏㏃? ?곗콉쨌??二쇰?쨌移섏븘 猷⑦떞??袁몄???',array['?뚰삎寃?,'珥덈낫']),
  ('?몃뱾','Poodle','dog','small','12??5??,'?묐삊?섍퀬 ?쒕룞??','洹쨌?쇰? ?뚮젅瑜닿린 ?먭?.','medium','high',true,'紐??? ???먯깋쨌???,'poodle','吏?ν삎 寃ъ쥌. ?뺤떊 ?먭레???꾩닔.','?몄쫰?뚰겕쨌?쇱쫹 ?λ궃媛먯쓣 蹂묓뻾?섏꽭??',array['?뚰삎寃?,'?덈젴']),
  ('?щ찓?쇰땲??,'Pomeranian','dog','small','12??6??,'?멸린??留롪퀬 寃쎄퀎???덉쓬.','?ш컻怨㉱룻샇?↔린쨌移섏븘.','low','high',true,'???? ??吏㏃? ???,'pomeranian','?묒? 泥닿뎄吏留??먮꼫吏 ?띾?.','怨쇰룄???먰봽??愿?덉뿉 遺??',array['?뚰삎寃?]),
  ('移섏??','Chihuahua','dog','small','14??8??,'??댄븯怨?二쇱씤?먭쾶 吏묒쨷.','?泥댁삩쨌移섏븘쨌?ш컻怨?','low','low',true,'???? ???곕쑜??蹂댁삩','chihuahua','珥덉냼?? 異붿쐞???쏀븿.','寃⑥슱 ?몄텧 ??蹂댁삩 ?꾩닔.',array['?뚰삎寃?]),
  ('?뷀겕???뚮━??,'Yorkshire Terrier','dog','small','13??6??,'?밸떦?섍퀬 ?쒕컻.','移섏븘쨌湲곌?吏쨌??愿由?','low','high',false,'湲??? ???뺣룉쨌猷⑦떞','yorkshire-terrier','?λえ ?뚰삎寃?','留ㅼ씪 鍮쀬쭏怨?移섏븘 耳??',array['?뚰삎寃?,'洹몃（諛?]),
  ('鍮꾩닊 ?꾨━??,'Bichon Frise','dog','small','12??5??,'諛앷퀬 ?ш탳??','?쇰?쨌?댟룰? ?쇱쬆.','medium','high',true,'???? ??洹쒖튃??猷⑦떞','bichon-frise','?뚮젅瑜닿린 鍮꾧탳???곸? ??','?뺢린 誘몄슜怨?洹 泥?냼.',array['?뚰삎寃?,'珥덈낫']),
  ('?쒖툌','Shih Tzu','dog','small','10??6??,'?⑥닚?섍퀬 媛議?移쒗솕.','?댟룻샇?≤룹쿃異?','low','high',true,'???? ???덉젙','shih-tzu','?ㅻ궡寃ъ뿉 ?곹빀.','吏㏃? ?곗콉怨???二쇰? 愿由?',array['?뚰삎寃?]),
  ('?μ뒪?덊듃','Dachshund','dog','small','12??6??,'?멸린??룹궗??蹂몃뒫.','?붿뒪???덈━) 蹂댄샇.','medium','low',false,'???? ??諛붾떏 ?앺솢','dachshund','怨꾨떒쨌?먰봽 ?쒗븳 以묒슂.','?뚰뙆 ?ㅻⅤ?대┝ 理쒖냼??',array['?뚰삎寃?,'?덈━']),
  ('?꾨젋移?遺덈룆','French Bulldog','dog','small','10??2??,'李⑤텇?섍퀬 ?좉탳 留롮쓬.','?명씉쨌?붿쐞쨌?쇰? 二쇰쫫.','low','low',true,'???? ???쒕뒛???댁떇','french-bulldog','釉뚮씪?ㅼ꽭?붾┃ 二쇱쓽.','?щ쫫 ?곗콉? ?대Ⅸ ?꾩묠쨌???',array['?뚰삎寃?,'?⑤몢']),
  ('?곗떆 肄붽린','Welsh Corgi','dog','medium','12??5??,'?곷━?섍퀬 ?쒕룞??','?덈━쨌鍮꾨쭔.','medium','medium',true,'紐??? ??吏?????,'welsh-corgi','紐⑹뼇寃?異쒖떊.','泥댁쨷 愿由ъ? ?덈━ 蹂댄샇.',array['以묓삎寃?]),
  ('?쒕컮 ?대늻','Shiba Inu','dog','medium','12??5??,'?낅┰?겶룰퉼?뷀븿.','?뚮젅瑜닿린쨌?덈え ?쒖쫵.','medium','medium',false,'湲??? ???먮┰ 怨듦컙','shiba-inu','怨좎쭛 ?덉쓣 ???덉뼱 ?덈젴 ?쇨????꾩슂.','湲띿젙 媛뺥솕 ?덈젴 異붿쿇.',array['以묓삎寃?,'?덈젴']),
  ('鍮꾧?','Beagle','dog','medium','12??5??,'移쒗솕?겶룸깂??異붿쟻.','鍮꾨쭔쨌洹 媛먯뿼.','high','low',true,'紐??? ???몄쫰?뚰겕','beagle','?앺깘쨌?꾨쭩 二쇱쓽.','由щ뱶以??꾩닔, 媛꾩떇??議곗젅.',array['以묓삎寃?]),
  ('蹂대뜑 肄쒕━','Border Collie','dog','medium','12??5??,'留ㅼ슦 ?곷━쨌?쇳븯湲?醫뗭븘??','愿?댟룸늿 吏덊솚.','high','medium',false,'紐??? ???낅Т쨌?덈젴','border-collie','?대룞쨌?먮뇤 ?먭레 遺議???臾몄젣?됰룞.','?꾩쭏由ы떚쨌?몃┃ ?덈젴 蹂묓뻾.',array['以묓삎寃?,'?대룞']),
  ('?쒕쿋由ъ븞 ?덉뒪??,'Siberian Husky','dog','large','12??4??,'?쒕컻쨌臾대━ 蹂몃뒫.','?붿쐞쨌?덈え쨌??','high','high',false,'??麗?쨌紐??? ???κ굅由??쒕룞','siberian-husky','?붿슫 ?좎뵪??痍⑥빟.','異⑸텇???대룞怨?洹몃뒛.',array['??뺢껄']),
  ('怨⑤뱺 由ы듃由щ쾭','Golden Retriever','dog','large','10??2??,'?⑥닚쨌媛議깃껄.','愿?댟룹븫쨌鍮꾨쭔.','high','medium',true,'???? ??媛議?援먭컧','golden-retriever','珥덈낫?먭쾶 ?멸린.','留ㅼ씪 ?곗콉쨌?섏쁺??醫뗭쓬.',array['??뺢껄','珥덈낫']),
  ('?섎툕?쇰룄 由ы듃由щ쾭','Labrador Retriever','dog','large','10??2??,'移쒓렐쨌?앹슃 ?뺤꽦.','鍮꾨쭔쨌愿?댟룰?.','high','low',true,'??麗? ???섏쁺쨌???,'labrador-retriever','媛???뷀븳 媛議깃껄.','?щ즺?됀룰컙???꾧꺽 愿由?',array['??뺢껄','珥덈낫']),
  ('?癒??고띁??,'German Shepherd','dog','large','9??3??,'異⑹꽦쨌寃쎄퀎쨌?숈뒿 鍮좊쫫.','?됰뜦?는룹냼??','high','medium',false,'湲??? ???꾨Т쨌?덈젴','german-shepherd','?ы쉶?붋룻썕???꾩닔.','珥덇린 ?ы쉶?붿뿉 ?쒓컙 ?ъ옄.',array['??뺢껄','?덈젴']),
  ('誘뱀뒪寃??뚰삎)','Small Mixed Breed','dog','small','12??6??,'媛쒖껜留덈떎 ?ㅼ뼇.','?좉린寃ъ? 嫄닿컯寃吏?癒쇱?.','medium','medium',true,'媛쒕퀎 ?깊뼢 ?뺤씤','mixed-dog-small','?덉쥌蹂대떎 媛쒕퀎 ?깊뼢 以묒떆.','?낆뼇 ??2??二?猷⑦떞 愿李?',array['誘뱀뒪寃?,'?낆뼇']),
  ('誘뱀뒪寃?以묐???','Medium-Large Mixed Breed','dog','large','10??4??,'?ㅼ뼇.','愿?댟룹껜以?','medium','medium',true,'媛쒕퀎 ?깊뼢 ?뺤씤','mixed-dog-large','?ш린??留욌뒗 ?대룞??','?곗콉쨌???媛뺣룄瑜?泥댄삎??留욊쾶.',array['誘뱀뒪寃?]),
  ('肄붾━???륂뿤??,'Korean Shorthair','cat','medium','15??0??,'?낅┰쨌?곸쓳??醫뗭쓬.','鍮꾨쭔쨌諛⑷킅??','low','low',true,'???? ???덉젙','korean-shorthair','?곕━?섎씪 ???臾섏쥌.','?듭떇쨌罹ｍ??뙿룹갹媛 ?먮━.',array['?⑤え','珥덈낫']),
  ('?섎Ⅴ?쒖븞','Persian','cat','medium','12??7??,'李⑤텇쨌議곗슜.','?몃춬移㉱룸늿臾셋룻샇??','low','high',false,'湲??? ??泥?껐','persian','?λえ 愿由?遺????','留ㅼ씪 鍮쀬쭏.',array['?λえ']),
  ('釉뚮━?곗떆 ?륂뿤??,'British Shorthair','cat','medium','12??7??,'?먭툔쨌?낅┰.','鍮꾨쭔쨌?ъ옣.','low','low',true,'???? ??洹쒖튃','british-shorthair','?κ렐 泥댄삎.','湲됱떇??議곗젅.',array['?⑤え','珥덈낫']),
  ('?ㅼ퐫?곗떆 ?대뱶','Scottish Fold','cat','medium','11??4??,'?⑥닚쨌?됯린 醫뗭븘??','?곌낏쨌愿???댁뒋.','low','medium',false,'???? ????? 媛援?,'scottish-fold','愿??嫄닿컯 紐⑤땲?곕쭅.','?믪씠 ?먰봽 以꾩씠湲?',array['?⑤え']),
  ('?ъ떆??釉붾（','Russian Blue','cat','medium','15??0??,'?섏쨳쨌媛議깆뿉寃??좎젙.','鍮꾨쭔쨌?ㅽ듃?덉뒪.','low','low',true,'??麗? ??議곗슜??怨듦컙','russian-blue','??꽑 ?댁뿉寃?寃쎄퀎.','??좎쿂쨌泥쒖쿇???곸쓳.',array['?⑤え']),
  ('硫붿씤荑?,'Maine Coon','cat','large','12??5??,'?⑦솕쨌???','?ъ옣쨌愿??','medium','high',true,'紐??? ???믪씠쨌?먯깋','maine-coon','??뺣쵖.','?볦? ?붿옣?ㅒ룹베???',array['?λえ','??뺣쵖']),
  ('?숇룎','Ragdoll','cat','large','12??7??,'?덇린 醫뗭븘?㉱룹삩??','鍮꾨쭔쨌諛⑷킅.','low','medium',true,'??麗? ??遺?쒕윭???섍꼍','ragdoll','?덉븘 ????紐?留↔?.','臾대━???덇린???쇳븯湲?',array['?λえ']),
  ('踰듦컝','Bengal','cat','medium','12??6??,'?쒕룞?겶룻샇湲곗떖.','?먮꼫吏 諛쒖궛.','high','low',false,'???? ???щ깷 ???,'bengal','?쇱깮???몃え.','罹ｍ쑀쨌?명꽣?숉떚釉??λ궃媛?',array['?쒕룞??]),
  ('??,'Siamese','cat','medium','15??0??,'?섎떎쨌?좎갑.','移섏븘쨌?명씉쨌鍮꾨쭔.','medium','low',true,'???? ??援먭컧','siamese','?몃줈???誘쇨컧.','?④퍡 ?쒓컙쨌???',array['?⑤え','援먭컧']),
  ('誘뱀뒪臾?,'Mixed Breed Cat','cat','medium','15??8??,'媛쒖껜留덈떎 ?ㅼ뼇.','?뺢린 寃吏?','medium','medium',true,'媛쒕퀎 ?깊뼢','mixed-cat','?덉쥌蹂대떎 媛쒖꽦.','?낆뼇 ???섍꼍 ?곸쓳 愿李?',array['誘뱀뒪','?낆뼇']),
  ('?좊겮','Rabbit','other','small','8??2??,'議곗슜쨌?ㅽ듃?덉뒪 ?덈?.','?뚰솕쨌?닿컝쨌諛쒗넲.','medium','low',false,'???? ???볦? 耳?댁?','rabbit','嫄댁큹쨌?볦? 怨듦컙 ?꾩닔.','?≪븘 ?ㅺ린蹂대떎 諛붾떏 援먭컧.',array['?뚮룞臾?,'珥덈낫二쇱쓽']),
  ('?꾩뒪??,'Hamster','other','small','2????,'?쇳뻾쨌?⑤룆 ?ъ쑁.','?듬룄쨌?덉텧쨌移섏븘.','medium','low',true,'??麗? ????졖룻쑀','hamster','吏앹????ㅼ슦硫??몄?.','諛??쒕룞쨌爾뉖컮???쒓났.',array['?뚮룞臾?])
) as v(breed_name, breed_name_en, animal_type, size_category, lifespan, personality, health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency, seo_slug, summary, body, tags)
on conflict (seo_slug) do nothing;
-- Q&A resolution, tips meta, SEO slugs, saves

alter table public.community_posts
  add column if not exists is_answered boolean not null default false,
  add column if not exists adopted_answer_id uuid references public.post_comments (id) on delete set null,
  add column if not exists seo_slug text,
  add column if not exists difficulty text,
  add column if not exists time_required text,
  add column if not exists save_count int not null default 0 check (save_count >= 0),
  add column if not exists share_count int not null default 0 check (share_count >= 0);

alter table public.community_posts
  drop constraint if exists community_posts_difficulty_check,
  add constraint community_posts_difficulty_check
    check (difficulty is null or difficulty in ('easy', 'medium', 'hard'));

create unique index if not exists community_posts_seo_slug_unique_idx
  on public.community_posts (seo_slug)
  where seo_slug is not null;

create index if not exists community_posts_qa_answered_idx
  on public.community_posts (post_type, is_answered, created_at desc)
  where post_type = 'qa';

-- Bookmarks (tips / qa)
create table if not exists public.post_saves (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists post_saves_user_idx on public.post_saves (user_id, created_at desc);

alter table public.post_saves enable row level security;

drop policy if exists "post_saves_own" on public.post_saves;
create policy "post_saves_own" on public.post_saves
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.sync_post_save_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.community_posts
    set save_count = save_count + 1
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.community_posts
    set save_count = greatest(0, save_count - 1)
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists post_saves_count_sync on public.post_saves;
create trigger post_saves_count_sync
after insert or delete on public.post_saves
for each row execute function public.sync_post_save_count();
