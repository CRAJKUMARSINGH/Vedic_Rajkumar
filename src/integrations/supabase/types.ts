export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      // ── transit_readings ─────────────────────────────────────────────────
      transit_readings: {
        Row: {
          birth_date: string
          birth_location: string
          birth_time: string
          created_at: string
          id: string
          moon_rashi_index: number
          overall_score: number
          owner_id: string | null
          results: Json
          transit_date: string
        }
        Insert: {
          birth_date: string
          birth_location: string
          birth_time: string
          created_at?: string
          id?: string
          moon_rashi_index: number
          overall_score: number
          owner_id?: string | null
          results: Json
          transit_date: string
        }
        Update: {
          birth_date?: string
          birth_location?: string
          birth_time?: string
          created_at?: string
          id?: string
          moon_rashi_index?: number
          overall_score?: number
          owner_id?: string | null
          results?: Json
          transit_date?: string
        }
        Relationships: []
      }

      // ── prashna_sessions ─────────────────────────────────────────────────
      prashna_sessions: {
        Row: {
          id: number
          question: string
          question_time: string
          direction: string | null
          prashna_lagna: string
          prashna_lagna_hindi: string | null
          category: string
          category_hindi: string | null
          brief_summary_en: string
          brief_summary_hi: string
          core_method_en: string | null
          core_method_hi: string | null
          answer_en: string
          answer_hi: string
          remedies_en: string | null
          remedies_hi: string | null
          classical_source: string | null
          confidence_percent: number
          birth_name: string | null
          owner_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          question: string
          question_time?: string
          direction?: string | null
          prashna_lagna: string
          prashna_lagna_hindi?: string | null
          category: string
          category_hindi?: string | null
          brief_summary_en: string
          brief_summary_hi: string
          core_method_en?: string | null
          core_method_hi?: string | null
          answer_en: string
          answer_hi: string
          remedies_en?: string | null
          remedies_hi?: string | null
          classical_source?: string | null
          confidence_percent?: number
          birth_name?: string | null
          owner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          question?: string
          question_time?: string
          direction?: string | null
          prashna_lagna?: string
          prashna_lagna_hindi?: string | null
          category?: string
          category_hindi?: string | null
          brief_summary_en?: string
          brief_summary_hi?: string
          core_method_en?: string | null
          core_method_hi?: string | null
          answer_en?: string
          answer_hi?: string
          remedies_en?: string | null
          remedies_hi?: string | null
          classical_source?: string | null
          confidence_percent?: number
          birth_name?: string | null
          owner_id?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ── horoscope_analyses ───────────────────────────────────────────────
      horoscope_analyses: {
        Row: {
          id: number
          question: string
          name: string | null
          date_of_birth: string | null
          time_of_birth: string | null
          place_of_birth: string | null
          latitude: string | null
          longitude: string | null
          moon_sign: string | null
          ascendant: string | null
          additional_details: string | null
          chart_summary: string
          analysis_en: string
          analysis_hi: string
          key_yogas: Json
          remedies_en: string | null
          remedies_hi: string | null
          classical_sources: Json
          owner_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          question: string
          name?: string | null
          date_of_birth?: string | null
          time_of_birth?: string | null
          place_of_birth?: string | null
          latitude?: string | null
          longitude?: string | null
          moon_sign?: string | null
          ascendant?: string | null
          additional_details?: string | null
          chart_summary: string
          analysis_en: string
          analysis_hi: string
          key_yogas?: Json
          remedies_en?: string | null
          remedies_hi?: string | null
          classical_sources?: Json
          owner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          question?: string
          name?: string | null
          date_of_birth?: string | null
          time_of_birth?: string | null
          place_of_birth?: string | null
          latitude?: string | null
          longitude?: string | null
          moon_sign?: string | null
          ascendant?: string | null
          additional_details?: string | null
          chart_summary?: string
          analysis_en?: string
          analysis_hi?: string
          key_yogas?: Json
          remedies_en?: string | null
          remedies_hi?: string | null
          classical_sources?: Json
          owner_id?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ── knowledge_entries ────────────────────────────────────────────────
      knowledge_entries: {
        Row: {
          id: number
          title: string
          content: string
          category: string
          source_type: string
          source_url: string | null
          author_name: string | null
          tags: Json
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          category?: string
          source_type?: string
          source_url?: string | null
          author_name?: string | null
          tags?: Json
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          category?: string
          source_type?: string
          source_url?: string | null
          author_name?: string | null
          tags?: Json
          created_at?: string
        }
        Relationships: []
      }

      // ── saved_readings (Week 3) ──────────────────────────────────────────
      saved_readings: {
        Row: {
          id: string
          user_id: string
          title: string | null
          birth_date: string
          birth_time: string | null
          birth_location: string | null
          chart_type: string
          notes: string | null
          results: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          birth_date: string
          birth_time?: string | null
          birth_location?: string | null
          chart_type?: string
          notes?: string | null
          results?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          birth_date?: string
          birth_time?: string | null
          birth_location?: string | null
          chart_type?: string
          notes?: string | null
          results?: Json | null
          created_at?: string
        }
        Relationships: []
      }

      // ── user_profiles (Week 3) ───────────────────────────────────────────
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          preferred_language: string
          default_birth_date: string | null
          default_birth_time: string | null
          default_birth_place: string | null
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          preferred_language?: string
          default_birth_date?: string | null
          default_birth_time?: string | null
          default_birth_place?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          preferred_language?: string
          default_birth_date?: string | null
          default_birth_time?: string | null
          default_birth_place?: string | null
          updated_at?: string
        }
        Relationships: []
      }

      // ── rate_limit_log (Week 3) ──────────────────────────────────────────
      rate_limit_log: {
        Row: {
          id: number
          user_id: string
          endpoint: string
          requested_at: string
        }
        Insert: {
          id?: number
          user_id: string
          endpoint: string
          requested_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          endpoint?: string
          requested_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
