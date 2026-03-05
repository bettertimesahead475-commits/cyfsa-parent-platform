// Auto-generated from Supabase — run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
// This is a minimal placeholder. Replace with generated types after Supabase setup.

export type Database = {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          title: string;
          cas_file_number: string | null;
          court_file_number: string | null;
          assigned_court: string | null;
          next_court_date: string | null;
          status: "active" | "resolved" | "appealing";
        };
        Insert: Omit<Database["public"]["Tables"]["cases"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["cases"]["Insert"]>;
      };
      journal_entries: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          created_at: string;
          date: string;
          time: string | null;
          location: string;
          event_description: string;
          cas_involved: boolean;
          witnesses: string[];
          evidence_attached: string[];
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["journal_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Insert"]>;
      };
      analysis_results: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          created_at: string;
          document_name: string;
          document_type: string;
          flags: unknown;
          summary: string;
          total_flags: number;
          risk_score: number;
          recommended_actions: string[];
          lawyer_summary: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analysis_results"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analysis_results"]["Insert"]>;
      };
      lawyers: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          firm: string | null;
          city: string;
          province: string;
          phone: string;
          email: string;
          website: string | null;
          bio: string;
          specializations: string[];
          years_experience: number;
          languages: string[];
          subscription_tier: "exclusive" | "priority" | "standard";
          verified: boolean;
          accepts_legal_aid: boolean;
          rating: number | null;
          review_count: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["lawyers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lawyers"]["Insert"]>;
      };
      lawyer_leads: {
        Row: {
          id: string;
          created_at: string;
          parent_name: string;
          parent_email: string;
          parent_phone: string;
          city: string;
          case_summary: string;
          intake_package_url: string | null;
          lawyer_id: string | null;
          status: "new" | "contacted" | "retained" | "closed";
        };
        Insert: Omit<Database["public"]["Tables"]["lawyer_leads"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lawyer_leads"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
