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
  ('말티즈','Maltese','dog','small','12–15년','애착이 깊고 예민한 편.','눈물·슬개골·치아 관리.','low','high',true,'수(水) — 차분한 휴식','maltese','소형견 대표. 실내 생활에 적합.','짧은 산책·눈 주변·치아 루틴을 꾸준히.',array['소형견','초보']),
  ('푸들','Poodle','dog','small','12–15년','똑똑하고 활동적.','귀·피부 알레르기 점검.','medium','high',true,'목(木) — 탐색·놀이','poodle','지능형 견종. 정신 자극이 필수.','노즈워크·퍼즐 장난감을 병행하세요.',array['소형견','훈련']),
  ('포메라니안','Pomeranian','dog','small','12–16년','호기심 많고 경계심 있음.','슬개골·호흡기·치아.','low','high',true,'화(火) — 짧은 놀이','pomeranian','작은 체구지만 에너지 풍부.','과도한 점프는 관절에 부담.',array['소형견']),
  ('치와와','Chihuahua','dog','small','14–18년','대담하고 주인에게 집중.','저체온·치아·슬개골.','low','low',true,'화(火) — 따뜻한 보온','chihuahua','초소형. 추위에 약함.','겨울 외출 시 보온 필수.',array['소형견']),
  ('요크셔 테리어','Yorkshire Terrier','dog','small','13–16년','당당하고 활발.','치아·기관지·털 관리.','low','high',false,'금(金) — 정돈·루틴','yorkshire-terrier','장모 소형견.','매일 빗질과 치아 케어.',array['소형견','그루밍']),
  ('비숑 프리제','Bichon Frise','dog','small','12–15년','밝고 사교적.','피부·눈·귀 염증.','medium','high',true,'토(土) — 규칙적 루틴','bichon-frise','알레르기 비교적 적은 편.','정기 미용과 귀 청소.',array['소형견','초보']),
  ('시츄','Shih Tzu','dog','small','10–16년','온순하고 가족 친화.','눈·호흡·척추.','low','high',true,'토(土) — 안정','shih-tzu','실내견에 적합.','짧은 산책과 눈 주변 관리.',array['소형견']),
  ('닥스훈트','Dachshund','dog','small','12–16년','호기심·사냥 본능.','디스크(허리) 보호.','medium','low',false,'토(土) — 바닥 생활','dachshund','계단·점프 제한 중요.','소파 오르내림 최소화.',array['소형견','허리']),
  ('프렌치 불독','French Bulldog','dog','small','10–12년','차분하고 애교 많음.','호흡·더위·피부 주름.','low','low',true,'토(土) — 서늘한 휴식','french-bulldog','브라키세팔릭 주의.','여름 산책은 이른 아침·저녁.',array['소형견','단두']),
  ('웰시 코기','Welsh Corgi','dog','medium','12–15년','영리하고 활동적.','허리·비만.','medium','medium',true,'목(木) — 지능 놀이','welsh-corgi','목양견 출신.','체중 관리와 허리 보호.',array['중형견']),
  ('시바 이누','Shiba Inu','dog','medium','12–15년','독립적·깔끔함.','알레르기·탈모 시즌.','medium','medium',false,'금(金) — 자립 공간','shiba-inu','고집 있을 수 있어 훈련 일관성 필요.','긍정 강화 훈련 추천.',array['중형견','훈련']),
  ('비글','Beagle','dog','medium','12–15년','친화적·냄새 추적.','비만·귀 감염.','high','low',true,'목(木) — 노즈워크','beagle','식탐·도망 주의.','리드줄 필수, 간식량 조절.',array['중형견']),
  ('보더 콜리','Border Collie','dog','medium','12–15년','매우 영리·일하기 좋아함.','관절·눈 질환.','high','medium',false,'목(木) — 업무·훈련','border-collie','운동·두뇌 자극 부족 시 문제행동.','아질리티·트릭 훈련 병행.',array['중형견','운동']),
  ('시베리안 허스키','Siberian Husky','dog','large','12–14년','활발·무리 본능.','더위·탈모·눈.','high','high',false,'수(水)·목(木) — 장거리 활동','siberian-husky','더운 날씨에 취약.','충분한 운동과 그늘.',array['대형견']),
  ('골든 리트리버','Golden Retriever','dog','large','10–12년','온순·가족견.','관절·암·비만.','high','medium',true,'토(土) — 가족 교감','golden-retriever','초보에게 인기.','매일 산책·수영도 좋음.',array['대형견','초보']),
  ('래브라도 리트리버','Labrador Retriever','dog','large','10–12년','친근·식욕 왕성.','비만·관절·귀.','high','low',true,'수(水) — 수영·놀이','labrador-retriever','가장 흔한 가족견.','사료량·간식 엄격 관리.',array['대형견','초보']),
  ('저먼 셰퍼드','German Shepherd','dog','large','9–13년','충성·경계·학습 빠름.','엉덩이·소화.','high','medium',false,'금(金) — 임무·훈련','german-shepherd','사회화·훈련 필수.','초기 사회화에 시간 투자.',array['대형견','훈련']),
  ('믹스견(소형)','Small Mixed Breed','dog','small','12–16년','개체마다 다양.','유기견은 건강검진 먼저.','medium','medium',true,'개별 성향 확인','mixed-dog-small','품종보다 개별 성향 중시.','입양 후 2–4주 루틴 관찰.',array['믹스견','입양']),
  ('믹스견(중대형)','Medium-Large Mixed Breed','dog','large','10–14년','다양.','관절·체중.','medium','medium',true,'개별 성향 확인','mixed-dog-large','크기에 맞는 운동량.','산책·놀이 강도를 체형에 맞게.',array['믹스견']),
  ('코리안 숏헤어','Korean Shorthair','cat','medium','15–20년','독립·적응력 좋음.','비만·방광염.','low','low',true,'토(土) — 안정','korean-shorthair','우리나라 대표 묘종.','습식·캣타워·창가 자리.',array['단모','초보']),
  ('페르시안','Persian','cat','medium','12–17년','차분·조용.','털뭉침·눈물·호흡.','low','high',false,'금(金) — 청결','persian','장모 관리 부담 큼.','매일 빗질.',array['장모']),
  ('브리티시 숏헤어','British Shorthair','cat','medium','12–17년','느긋·독립.','비만·심장.','low','low',true,'토(土) — 규칙','british-shorthair','둥근 체형.','급식량 조절.',array['단모','초보']),
  ('스코티시 폴드','Scottish Fold','cat','medium','11–14년','온순·앉기 좋아함.','연골·관절 이슈.','low','medium',false,'토(土) — 낮은 가구','scottish-fold','관절 건강 모니터링.','높이 점프 줄이기.',array['단모']),
  ('러시안 블루','Russian Blue','cat','medium','15–20년','수줍·가족에게 애정.','비만·스트레스.','low','low',true,'수(水) — 조용한 공간','russian-blue','낯선 이에게 경계.','은신처·천천히 적응.',array['단모']),
  ('메인쿤','Maine Coon','cat','large','12–15년','온화·대형.','심장·관절.','medium','high',true,'목(木) — 높이·탐색','maine-coon','대형묘.','넓은 화장실·캣타워.',array['장모','대형묘']),
  ('랙돌','Ragdoll','cat','large','12–17년','안기 좋아함·온순.','비만·방광.','low','medium',true,'수(水) — 부드러운 환경','ragdoll','안아 들 때 몸 맡김.','무리한 안기는 피하기.',array['장모']),
  ('벵갈','Bengal','cat','medium','12–16년','활동적·호기심.','에너지 발산.','high','low',false,'화(火) — 사냥 놀이','bengal','야생형 외모.','캣휠·인터랙티브 장난감.',array['활동적']),
  ('샴','Siamese','cat','medium','15–20년','수다·애착.','치아·호흡·비만.','medium','low',true,'화(火) — 교감','siamese','외로움에 민감.','함께 시간·놀이.',array['단모','교감']),
  ('믹스묘','Mixed Breed Cat','cat','medium','15–18년','개체마다 다양.','정기 검진.','medium','medium',true,'개별 성향','mixed-cat','품종보다 개성.','입양 후 환경 적응 관찰.',array['믹스','입양']),
  ('토끼','Rabbit','other','small','8–12년','조용·스트레스 예민.','소화·이갈·발톱.','medium','low',false,'토(土) — 넓은 케이지','rabbit','건초·넓은 공간 필수.','잡아 들기보다 바닥 교감.',array['소동물','초보주의']),
  ('햄스터','Hamster','other','small','2–3년','야행·단독 사육.','습도·탈출·치아.','medium','low',true,'수(水) — 은신·휠','hamster','짝지어 키우면 싸움.','밤 활동·쳇바퀴 제공.',array['소동물'])
) as v(breed_name, breed_name_en, animal_type, size_category, lifespan, personality, health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency, seo_slug, summary, body, tags)
on conflict (seo_slug) do nothing;
