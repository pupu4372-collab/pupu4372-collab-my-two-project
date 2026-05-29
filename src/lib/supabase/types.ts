/** DB types for Supabase client (sync with supabase/migrations). */

export type PetSpecies = "dog" | "cat";
export type PetShowSpecies = PetSpecies | "other";
export type AppChannel = "home" | "dog" | "cat" | "community" | "pet_saju";
export type PostType = "photo_show" | "qa" | "free" | "saju_review";
export type SajuType =
  | "basic"
  | "zodiac"
  | "compatibility"
  | "character_card"
  | "premium";
export type AnalysisMode = "three_pillars" | "four_pillars";
export type RankingPeriod = "realtime" | "week";
export type FiveElement = "mok" | "hwa" | "to" | "geum" | "su";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  locale: string;
  timezone: string;
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
  language: string;
  like_count: number;
  comment_count: number;
  view_count: number;
  is_hidden: boolean;
  is_pinned: boolean;
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

export interface PetShowRankingRow {
  id: string;
  author_id: string;
  pet_id: string | null;
  pet_species?: PetShowSpecies | null;
  title: string | null;
  image_urls: string[];
  like_count: number;
  comment_count: number;
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

type TableDef<Row, Insert, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile, Partial<Profile>>;
      pets: TableDef<Pet, PetInsert>;
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
      contents: TableDef<
        {
          id: string;
          channel: AppChannel;
          title: string;
          summary: string | null;
          body: string | null;
          tags: string[];
          is_featured: boolean;
          is_published: boolean;
          published_at: string | null;
        },
        Partial<{
          channel: AppChannel;
          title: string;
          summary: string;
          body: string;
          tags: string[];
          is_featured: boolean;
          is_published: boolean;
        }>
      >;
    };
    Views: {
      pet_show_ranking_weekly: { Row: PetShowRankingRow; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
