export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type EmptyRel = [];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          has_paid_access: boolean;
          stripe_customer_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          has_paid_access?: boolean;
          stripe_customer_id?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          has_paid_access?: boolean;
          stripe_customer_id?: string | null;
        };
        Relationships: EmptyRel;
      };
      languages: {
        Row: { id: string; code: string; name: string; created_at: string };
        Insert: { id?: string; code: string; name: string; created_at?: string };
        Update: { code?: string; name?: string; created_at?: string };
        Relationships: EmptyRel;
      };
      courses: {
        Row: {
          id: string;
          language_id: string;
          slug: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          language_id: string;
          slug: string;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          language_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: EmptyRel;
      };
      levels: {
        Row: {
          id: string;
          course_id: string;
          code: string;
          title: string;
          path_label: string | null;
          description: string | null;
          sort_order: number;
          lesson_count: number;
        };
        Insert: {
          id?: string;
          course_id: string;
          code: string;
          title: string;
          path_label?: string | null;
          description?: string | null;
          sort_order: number;
          lesson_count?: number;
        };
        Update: {
          course_id?: string;
          code?: string;
          title?: string;
          path_label?: string | null;
          description?: string | null;
          sort_order?: number;
          lesson_count?: number;
        };
        Relationships: EmptyRel;
      };
      modules: {
        Row: {
          id: string;
          level_id: string;
          slug: string;
          title: string;
          description: string | null;
          sort_order: number;
          coming_soon: boolean;
        };
        Insert: {
          id?: string;
          level_id: string;
          slug: string;
          title: string;
          description?: string | null;
          sort_order: number;
          coming_soon?: boolean;
        };
        Update: {
          level_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          coming_soon?: boolean;
        };
        Relationships: EmptyRel;
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          slug: string;
          title: string;
          description: string | null;
          learn_excerpt: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          slug: string;
          title: string;
          description?: string | null;
          learn_excerpt?: string | null;
          sort_order: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          module_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          learn_excerpt?: string | null;
          sort_order?: number;
          is_published?: boolean;
        };
        Relationships: EmptyRel;
      };
      phrases: {
        Row: {
          id: string;
          lesson_id: string;
          phrase: string;
          translation: string;
          phonetic: string;
          syllable_breakdown: string | null;
          pronunciation_notes: string | null;
          common_mistakes: string | null;
          tags: string[] | null;
          audio_url: string | null;
          audio_slow_url: string | null;
          audio_natural_url: string | null;
          audio_context_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          phrase: string;
          translation: string;
          phonetic: string;
          syllable_breakdown?: string | null;
          pronunciation_notes?: string | null;
          common_mistakes?: string | null;
          tags?: string[] | null;
          audio_url?: string | null;
          audio_slow_url?: string | null;
          audio_natural_url?: string | null;
          audio_context_url?: string | null;
          sort_order: number;
          created_at?: string;
        };
        Update: {
          lesson_id?: string;
          phrase?: string;
          translation?: string;
          phonetic?: string;
          syllable_breakdown?: string | null;
          pronunciation_notes?: string | null;
          common_mistakes?: string | null;
          tags?: string[] | null;
          audio_url?: string | null;
          audio_slow_url?: string | null;
          audio_natural_url?: string | null;
          audio_context_url?: string | null;
          sort_order?: number;
        };
        Relationships: EmptyRel;
      };
      activities: {
        Row: {
          id: string;
          lesson_id: string;
          activity_type: string;
          title: string;
          skill: string;
          config: Json;
          sort_order: number;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          activity_type: string;
          title: string;
          skill?: string;
          config?: Json;
          sort_order: number;
        };
        Update: {
          lesson_id?: string;
          activity_type?: string;
          title?: string;
          skill?: string;
          config?: Json;
          sort_order?: number;
        };
        Relationships: EmptyRel;
      };
      sound_lessons: {
        Row: {
          id: string;
          course_id: string;
          slug: string;
          title: string;
          summary: string | null;
          body: Json;
          sort_order: number;
        };
        Insert: {
          id?: string;
          course_id: string;
          slug: string;
          title: string;
          summary?: string | null;
          body?: Json;
          sort_order: number;
        };
        Update: {
          course_id?: string;
          slug?: string;
          title?: string;
          summary?: string | null;
          body?: Json;
          sort_order?: number;
        };
        Relationships: EmptyRel;
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: string;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          status?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: string;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: EmptyRel;
      };
      user_phrase_progress: {
        Row: {
          id: string;
          user_id: string;
          phrase_id: string;
          status: string;
          practice_count: number;
          is_saved: boolean;
          speaking_confidence: number | null;
          last_practiced_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phrase_id: string;
          status?: string;
          practice_count?: number;
          is_saved?: boolean;
          speaking_confidence?: number | null;
          last_practiced_at?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: string;
          practice_count?: number;
          is_saved?: boolean;
          speaking_confidence?: number | null;
          last_practiced_at?: string | null;
          updated_at?: string;
        };
        Relationships: EmptyRel;
      };
      user_activity_attempts: {
        Row: {
          id: string;
          user_id: string;
          activity_id: string;
          correct: boolean;
          response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_id: string;
          correct: boolean;
          response?: Json | null;
          created_at?: string;
        };
        Update: {
          activity_id?: string;
          correct?: boolean;
          response?: Json | null;
          created_at?: string;
        };
        Relationships: EmptyRel;
      };
      user_skill_progress: {
        Row: {
          id: string;
          user_id: string;
          skill: string;
          activities_completed: number;
          activities_available: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill: string;
          activities_completed?: number;
          activities_available?: number;
          updated_at?: string;
        };
        Update: {
          skill?: string;
          activities_completed?: number;
          activities_available?: number;
          updated_at?: string;
        };
        Relationships: EmptyRel;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_checkout_session_id: string | null;
          amount_total: number | null;
          currency: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_checkout_session_id?: string | null;
          amount_total?: number | null;
          currency?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_checkout_session_id?: string | null;
          amount_total?: number | null;
          currency?: string | null;
          status?: string | null;
        };
        Relationships: EmptyRel;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
