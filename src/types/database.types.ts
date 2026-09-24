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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_key: string
          id: string
          key: string
          metric: string | null
          threshold: number | null
          tier: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon_key: string
          id?: string
          key: string
          metric?: string | null
          threshold?: number | null
          tier?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_key?: string
          id?: string
          key?: string
          metric?: string | null
          threshold?: number | null
          tier?: string | null
          title?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          authors: string[] | null
          cover_url: string | null
          created_at: string
          description: string | null
          genres: string[] | null
          id: string
          isbn13: string | null
          page_count: number | null
          published_year: number | null
          publisher: string | null
          source: string | null
          title: string
        }
        Insert: {
          authors?: string[] | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genres?: string[] | null
          id?: string
          isbn13?: string | null
          page_count?: number | null
          published_year?: number | null
          publisher?: string | null
          source?: string | null
          title: string
        }
        Update: {
          authors?: string[] | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          genres?: string[] | null
          id?: string
          isbn13?: string | null
          page_count?: number | null
          published_year?: number | null
          publisher?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          added_at: string
          book_id: string
          current_page: number | null
          finished_at: string | null
          id: string
          rating: number | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          added_at?: string
          book_id: string
          current_page?: number | null
          finished_at?: string | null
          id?: string
          rating?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          added_at?: string
          book_id?: string
          current_page?: number | null
          finished_at?: string | null
          id?: string
          rating?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          theme: string
          total_pages_read: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          theme?: string
          total_pages_read?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          theme?: string
          total_pages_read?: number
        }
        Relationships: []
      }
      reading_goals: {
        Row: {
          confirmed_at: string
          created_at: string
          id: string
          is_locked: boolean
          period: string
          period_end: string
          period_start: string
          role: string
          status: string
          target: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          period: string
          period_end: string
          period_start: string
          role: string
          status?: string
          target: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmed_at?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          period?: string
          period_end?: string
          period_start?: string
          role?: string
          status?: string
          target?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_log: {
        Row: {
          log_date: string
          pages_read: number
          user_id: string
        }
        Insert: {
          log_date?: string
          pages_read?: number
          user_id: string
        }
        Update: {
          log_date?: string
          pages_read?: number
          user_id?: string
        }
        Relationships: []
      }
      shelf_items: {
        Row: {
          added_at: string
          library_item_id: string
          shelf_id: string
        }
        Insert: {
          added_at?: string
          library_item_id: string
          shelf_id: string
        }
        Update: {
          added_at?: string
          library_item_id?: string
          shelf_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shelf_items_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shelf_items_shelf_id_fkey"
            columns: ["shelf_id"]
            isOneToOne: false
            referencedRelation: "shelves"
            referencedColumns: ["id"]
          },
        ]
      }
      shelves: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          is_featured: boolean
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          is_featured?: boolean
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          is_featured?: boolean
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_reading_log: { Args: never; Returns: undefined }
      increment_total_pages_read: {
        Args: { p_delta: number; p_user_id: string }
        Returns: undefined
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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


// Alias comodi per usare i tipi Row/Insert/Update nei file api
export type BookRow = Database["public"]["Tables"]["books"]["Row"]
export type BookInsert = Database["public"]["Tables"]["books"]["Insert"]
export type LibraryItemRow = Database["public"]["Tables"]["library_items"]["Row"]
export type LibraryItemUpdate = Database["public"]["Tables"]["library_items"]["Update"]
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
export type ShelfRow = Database["public"]["Tables"]["shelves"]["Row"]
export type ReadingLogRow = Database["public"]["Tables"]["reading_log"]["Row"]
export type ReadingGoalRow = Database["public"]["Tables"]["reading_goals"]["Row"]
export type BadgeRow = Database["public"]["Tables"]["badges"]["Row"]
export type UserBadgeRow = Database["public"]["Tables"]["user_badges"]["Row"]
