-- Extend breed guides for reptile, parrot, and small-animal groups

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
  ('레오파드 게코','Leopard Gecko','other','small','10–20년','온순하고 야행성.','칼슘·탈피·온도 구배.','low','low',true,'토(土) — 안정된 은신처','leopard-gecko','초보도 접근하기 쉬운 대표 파충류.','바닥재, 은신처, 핫존·쿨존 온도 차이를 안정적으로 유지하세요.',array['파충류','게코','초보']),
  ('크레스티드 게코','Crested Gecko','other','small','15–20년','차분하지만 점프력이 좋음.','습도·탈수·꼬리 손상.','low','low',true,'목(木) — 수직 공간','crested-gecko','수직 사육장과 습도 관리가 핵심.','높은 사육장, 코르크/식물 은신처, 저녁 분무 루틴을 맞춰주세요.',array['파충류','게코','습도']),
  ('비어디드 드래곤','Bearded Dragon','other','medium','8–12년','사람에게 익숙해지기 쉬움.','UVB·칼슘·소화.','medium','low',false,'화(火) — 햇빛과 열','bearded-dragon','UVB와 바스킹존이 매우 중요한 파충류.','강한 UVB, 충분한 바스킹 온도, 채소와 곤충 급여 균형을 챙기세요.',array['파충류','도마뱀','UVB']),
  ('반수생 거북','Semi-aquatic Turtle','other','medium','20–40년','관찰형 반려동물.','수질·등갑·UVB.','medium','medium',false,'수(水) — 깨끗한 물','semi-aquatic-turtle','수조 여과와 일광욕 공간이 필수.','강한 여과, 건조한 육지, UVB 램프와 수온 관리를 함께 해야 합니다.',array['파충류','거북','수질']),
  ('사랑앵무','Budgerigar','other','small','5–10년','활발하고 사회적.','호흡기·깃털·비만.','medium','medium',true,'목(木) — 소리와 교감','budgerigar','초보에게 인기 있는 소형 앵무새.','넓은 케이지, 매일 비행/놀이 시간, 균형 잡힌 씨드·펠렛 식단이 필요합니다.',array['앵무새','조류','초보']),
  ('왕관앵무','Cockatiel','other','small','10–15년','온순하고 애착이 깊음.','깃털·호흡기·외로움.','medium','medium',true,'화(火) — 노래와 교감','cockatiel','교감과 루틴을 좋아하는 반려조.','갑작스러운 환경 변화보다 일정한 놀이 시간과 조용한 휴식 공간이 좋습니다.',array['앵무새','조류','교감']),
  ('모란앵무','Lovebird','other','small','10–15년','호기심 많고 애착이 강함.','스트레스·물림·비만.','medium','medium',false,'화(火) — 에너지 발산','lovebird','작지만 에너지가 높은 앵무새.','충분한 장난감, 씹을 거리, 사람과의 상호작용을 규칙적으로 제공하세요.',array['앵무새','조류']),
  ('기니피그','Guinea Pig','other','small','5–8년','온순하고 무리 생활 선호.','비타민 C·치아·호흡기.','low','medium',true,'토(土) — 넓은 바닥','guinea-pig','넓은 바닥 공간과 비타민 C가 중요.','건초를 항상 제공하고, 미끄럽지 않은 바닥과 숨을 공간을 충분히 주세요.',array['소형동물류','소동물','초보']),
  ('친칠라','Chinchilla','other','small','10–15년','예민하고 활동적.','더위·치아·모래목욕.','medium','medium',false,'금(金) — 건조하고 시원한 환경','chinchilla','더위에 약하고 건조한 환경을 좋아함.','실내 온도를 낮게 유지하고, 모래목욕과 씹을 나무를 제공하세요.',array['소형동물류','소동물']),
  ('고슴도치','Hedgehog','other','small','4–6년','야행성·독립적.','온도·비만·피부.','medium','low',false,'수(水) — 조용한 밤 루틴','hedgehog','야행성 습성과 보온 관리가 핵심.','낮에는 조용한 은신처, 밤에는 충분한 활동 휠과 안정적인 온도를 제공하세요.',array['소형동물류','소동물','야행성'])
) as v(breed_name, breed_name_en, animal_type, size_category, lifespan, personality, health_notes, exercise_level, grooming_level, beginner_friendly, saju_tendency, seo_slug, summary, body, tags)
on conflict (seo_slug) do nothing;
