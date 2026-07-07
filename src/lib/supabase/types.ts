/** DB types for Supabase client (sync with supabase/migrations). */

export type PetSpecies = "dog" | "cat" | "reptile" | "other";
export type PetShowSpecies = PetSpecies;
export type AppChannel = "home" | "dog" | "cat" | "reptile" | "community" | "pet_saju";
export type PostType = "photo_show" | "qa" | "free" | "saju_review";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "rejected";
export type SupportInquiryStatus = "pending" | "reviewing" | "resolved" | "closed";
export type SajuType =
  | "basic"
  | "zodiac"
  | "compatibility"
  | "character_card"
  | "premium";
export type AnalysisMode = "three_pillars" | "four_pillars";
export type RankingPeriod = "realtime" | "week" | "month";
export type FiveElement = "mok" | "hwa" | "to" | "geum" | "su";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  country_code: string | null;
  show_country: boolean;
  provider: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  gender: string | null;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_timezone: string;
  profile_image_url: string | null;
  personality_tags: string[];
  created_at: string;
  updated_at: string;
}

export type PetInsert = Pick<
  Pet,
  "owner_id" | "name" | "species" | "birth_date" | "birth_time_unknown" | "birth_timezone"
> & {
  birth_time?: string | null;
  breed?: string | null;
  gender?: string | null;
  profile_image_url?: string | null;
  personality_tags?: string[];
};

export type PetCareCategory =
  | "feeding"
  | "grooming"
  | "vet_visit"
  | "vaccination"
  | "exercise"
  | "medication"
  | "other";

export interface PetCareEvent {
  id: string;
  user_id: string;
  pet_id: string | null;
  event_date: string;
  event_time: string | null;
  category: PetCareCategory;
  title: string;
  description: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PetCareEventInsert = Pick<
  PetCareEvent,
  "user_id" | "category" | "title" | "event_date"
> & {
  pet_id?: string | null;
  event_time?: string | null;
  description?: string | null;
  is_recurring?: boolean;
  recurrence_rule?: string | null;
  reminder_at?: string | null;
};

export const PET_CARE_EVENT_COLUMNS =
  "id, user_id, pet_id, event_date, event_time, category, title, description, is_recurring, recurrence_rule, reminder_at, created_at, updated_at";

export type ChallengeChannel = "dog" | "cat" | "reptile" | "all";

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  channel: ChallengeChannel;
  thumbnail_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengePost {
  id: string;
  challenge_id: string;
  user_id: string;
  pet_id: string | null;
  content: string | null;
  image_url: string | null;
  category: "cute" | "funny";
  created_at: string;
  updated_at: string;
}

export type ChallengePostInsert = Pick<
  ChallengePost,
  "challenge_id" | "user_id"
> & {
  pet_id?: string | null;
  content?: string | null;
  image_url?: string | null;
  category?: "cute" | "funny";
};

export interface ChallengePostWithRelations extends ChallengePost {
  profiles: Pick<Profile, "display_name" | "avatar_url"> | null;
  pets: Pick<Pet, "name" | "species"> | null;
}

export type PetAnimalType = "dog" | "cat" | "reptile" | "other";

export interface CommunityPost {
  id: string;
  author_id: string;
  pet_id: string | null;
  channel: AppChannel;
  post_type: PostType;
  title: string | null;
  content: string | null;
  image_urls: string[];
  tags: string[];
  animal_type: PetAnimalType | null;
  category: string | null;
  language: string;
  country_code: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_hidden: boolean;
  is_pinned: boolean;
  is_answered: boolean;
  adopted_answer_id: string | null;
  seo_slug: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  time_required: string | null;
  save_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export type TipsDifficulty = "easy" | "medium" | "hard";

export interface BreedGuide {
  id: string;
  breed_name: string;
  breed_name_en: string | null;
  animal_type: PetAnimalType;
  size_category: string | null;
  lifespan: string | null;
  personality: string | null;
  health_notes: string | null;
  exercise_level: string | null;
  grooming_level: string | null;
  beginner_friendly: boolean;
  saju_tendency: string | null;
  seo_slug: string;
  thumbnail_url: string | null;
  hero_image_url: string | null;
  summary: string | null;
  body: string | null;
  tags: string[];
  language: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostReport {
  id: string;
  post_id: string | null;
  comment_id: string | null;
  reporter_id: string | null;
  reason: string;
  detail: string | null;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface SupportInquiry {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string;
  category: "guide" | "account" | "payment_report" | "community" | "partnership" | "general";
  title: string;
  message: string;
  status: SupportInquiryStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface PetShowRankingRow {
  id: string;
  author_id: string;
  pet_id: string | null;
  pet_species?: PetShowSpecies | null;
  title: string | null;
  image_urls: string[];
  like_count: number;
  comment_count: number;
  country_code?: string | null;
  created_at: string;
  rank_position?: number;
}

export interface SajuResultRow {
  id: string;
  pet_id: string;
  owner_id: string;
  saju_type: SajuType;
  analysis_mode: AnalysisMode;
  birth_basis: Record<string, unknown>;
  pillars: Record<string, unknown>;
  five_elements: Record<string, unknown>;
  dominant_element: FiveElement | null;
  title: string | null;
  summary: string | null;
  storytelling_payload: Record<string, unknown>;
  is_premium: boolean;
  created_at: string;
}

export type SajuResultInsert = Pick<
  SajuResultRow,
  | "pet_id"
  | "owner_id"
  | "saju_type"
  | "analysis_mode"
  | "birth_basis"
  | "pillars"
  | "five_elements"
  | "dominant_element"
  | "title"
  | "summary"
  | "storytelling_payload"
> & {
  is_premium?: boolean;
};

export type HumanPremiumReportStatus =
  | "draft"
  | "payment_pending"
  | "paid"
  | "generating"
  | "ready"
  | "email_sent"
  | "failed"
  | "email_failed";

export type HumanPremiumCalendarType = "solar" | "lunar";
export type HumanPremiumPaymentProvider = "paypal" | "card_pg" | "demo";
export type HumanPremiumEmailStatus = "pending" | "sent" | "failed";

export interface HumanPremiumReportRow {
  id: string;
  user_id: string | null;
  person_name: string;
  email: string;
  birth_date: string;
  birth_time: string | null;
  birth_time_unknown: boolean;
  birth_timezone: string;
  calendar_type: HumanPremiumCalendarType;
  locale: string;
  privacy_consent: boolean;
  birth_basis: Record<string, unknown>;
  payment_provider: HumanPremiumPaymentProvider | null;
  pg_provider: string | null;
  payment_order_id: string | null;
  checkout_session_id: string | null;
  payment_capture_id: string | null;
  amount_original: number;
  amount_paid: number;
  currency: string;
  status: HumanPremiumReportStatus;
  report_payload: Record<string, unknown> | null;
  failure_stage: string | null;
  failure_message: string | null;
  retry_allowed: boolean;
  web_access_token: string;
  web_access_expires_at: string | null;
  web_access_view_count: number;
  pdf_storage_path: string | null;
  pdf_generated_at: string | null;
  download_token: string | null;
  download_expires_at: string | null;
  email_status: HumanPremiumEmailStatus;
  email_sent_at: string | null;
  email_error: string | null;
  resend_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export type HumanPremiumReportInsert = Pick<
  HumanPremiumReportRow,
  | "person_name"
  | "email"
  | "birth_date"
  | "birth_time_unknown"
  | "birth_timezone"
  | "calendar_type"
  | "locale"
  | "privacy_consent"
> & {
  user_id?: string | null;
  birth_time?: string | null;
  birth_basis?: Record<string, unknown>;
  status?: HumanPremiumReportStatus;
  payment_provider?: HumanPremiumPaymentProvider | null;
  payment_order_id?: string | null;
  checkout_session_id?: string | null;
  amount_original?: number;
  amount_paid?: number;
  currency?: string;
};

type TableDef<Row, Insert, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface SajuLlmCacheRow {
  cache_key: string;
  cache_kind: "interpret_pet" | "interpret_human" | "human_premium_section" | "pet_premium";
  locale: "ko" | "en";
  provider: string;
  model: string;
  payload: Record<string, unknown>;
  created_at: string;
  expires_at: string | null;
}

export interface SajuLlmCacheInsert {
  cache_key: string;
  cache_kind: SajuLlmCacheRow["cache_kind"];
  locale: "ko" | "en";
  provider: string;
  model: string;
  payload: Record<string, unknown>;
  expires_at?: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile, Partial<Profile>>;
      pets: TableDef<Pet, PetInsert>;
      pet_care_events: TableDef<PetCareEvent, PetCareEventInsert>;
      saju_results: TableDef<SajuResultRow, SajuResultInsert>;
      community_posts: TableDef<CommunityPost, Partial<CommunityPost>>;
      post_likes: TableDef<
        { id: string; post_id: string; user_id: string; created_at: string },
        { post_id: string; user_id: string }
      >;
      post_comments: TableDef<
        PostComment,
        {
          post_id: string;
          author_id: string;
          content: string;
          parent_id?: string | null;
        }
      >;
      post_reports: TableDef<
        PostReport,
        {
          post_id?: string | null;
          comment_id?: string | null;
          reporter_id: string;
          reason: string;
          detail?: string | null;
          status?: ReportStatus;
        },
        Partial<PostReport>
      >;
      contents: TableDef<
        {
          id: string;
          category_id: string | null;
          channel: AppChannel;
          title: string;
          summary: string | null;
          body: string | null;
          thumbnail_url: string | null;
          tags: string[];
          language: string;
          is_featured: boolean;
          is_published: boolean;
          published_at: string | null;
        },
        Partial<{
          category_id: string | null;
          channel: AppChannel;
          title: string;
          summary: string;
          body: string;
          thumbnail_url: string | null;
          tags: string[];
          language: string;
          is_featured: boolean;
          is_published: boolean;
        }>
      >;
      content_categories: TableDef<
        {
          id: string;
          channel: AppChannel;
          slug: string;
          name_ko: string;
          name_en: string;
          theme_color: string | null;
          emoji: string | null;
          sort_order: number;
          is_active: boolean;
          is_coming_soon: boolean;
        },
        Partial<{
          channel: AppChannel;
          slug: string;
          name_ko: string;
          name_en: string;
          theme_color: string | null;
          emoji: string | null;
          sort_order: number;
          is_active: boolean;
          is_coming_soon: boolean;
        }>
      >;
      breed_guides: TableDef<BreedGuide, Partial<BreedGuide>>;
      human_premium_reports: TableDef<
        HumanPremiumReportRow,
        HumanPremiumReportInsert,
        Partial<HumanPremiumReportRow>
      >;
      post_saves: TableDef<
        { id: string; post_id: string; user_id: string; created_at: string },
        { post_id: string; user_id: string }
      >;
      saju_llm_cache: TableDef<SajuLlmCacheRow, SajuLlmCacheInsert>;
      challenges: TableDef<Challenge, Partial<Challenge>>;
      challenge_posts: TableDef<ChallengePost, ChallengePostInsert>;
    };
    Views: {
      pet_show_ranking_weekly: { Row: PetShowRankingRow; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
