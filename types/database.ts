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
      levels: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          sort_order: number;
          lesson_count: number;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          sort_order: number;
          lesson_count?: number;
        };
        Update: {
          code?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          lesson_count?: number;
        };
        Relationships: EmptyRel;
      };
      lessons: {
        Row: {
          id: string;
          level_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          level_id: string;
          title: string;
          description?: string | null;
          sort_order: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          level_id?: string;
          title?: string;
          description?: string | null;
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
          audio_url: string | null;
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
          audio_url?: string | null;
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
          audio_url?: string | null;
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
          last_practiced_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phrase_id: string;
          status?: string;
          practice_count?: number;
          last_practiced_at?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: string;
          practice_count?: number;
          last_practiced_at?: string | null;
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
