export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      research_sessions: {
        Row: {
          id: string;
          user_id: string;
          input: Json;
          product_analyst_result: Json | null;
          competitor_result: Json | null;
          hn_threads_result: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          input: Json;
          product_analyst_result?: Json | null;
          competitor_result?: Json | null;
          hn_threads_result?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          input?: Json;
          product_analyst_result?: Json | null;
          competitor_result?: Json | null;
          hn_threads_result?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
