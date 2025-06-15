export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          badge_color: string | null
          badge_icon: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          points_reward: number
          requirement_type: string | null
          requirement_value: number | null
          title: string
        }
        Insert: {
          achievement_type?: string
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points_reward?: number
          requirement_type?: string | null
          requirement_value?: number | null
          title: string
        }
        Update: {
          achievement_type?: string
          badge_color?: string | null
          badge_icon?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          points_reward?: number
          requirement_type?: string | null
          requirement_value?: number | null
          title?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          scheduled_for: string | null
          target_audience: string
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          scheduled_for?: string | null
          target_audience?: string
          title: string
          type?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          scheduled_for?: string | null
          target_audience?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      colors: {
        Row: {
          blue: number | null
          green: number | null
          hex: string
          hue: number | null
          id: number
          light_hsl: number | null
          name: string | null
          red: number | null
          sat_hsl: number | null
          sat_hsv: number | null
          source: Database["public"]["Enums"]["color_source"] | null
          val_hsv: number | null
        }
        Insert: {
          blue?: number | null
          green?: number | null
          hex: string
          hue?: number | null
          id?: number
          light_hsl?: number | null
          name?: string | null
          red?: number | null
          sat_hsl?: number | null
          sat_hsv?: number | null
          source?: Database["public"]["Enums"]["color_source"] | null
          val_hsv?: number | null
        }
        Update: {
          blue?: number | null
          green?: number | null
          hex?: string
          hue?: number | null
          id?: number
          light_hsl?: number | null
          name?: string | null
          red?: number | null
          sat_hsl?: number | null
          sat_hsv?: number | null
          source?: Database["public"]["Enums"]["color_source"] | null
          val_hsv?: number | null
        }
        Relationships: []
      }
      crypto_addresses: {
        Row: {
          created_at: string
          crypto_type: string
          id: string
          is_verified: boolean | null
          network: string | null
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          crypto_type: string
          id?: string
          is_verified?: boolean | null
          network?: string | null
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          crypto_type?: string
          id?: string
          is_verified?: boolean | null
          network?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      gift_cards: {
        Row: {
          created_at: string
          denomination: number
          id: string
          image_url: string | null
          is_active: boolean | null
          points_required: number
          provider: string
          stock_quantity: number | null
          terms_conditions: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          denomination: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          points_required: number
          provider: string
          stock_quantity?: number | null
          terms_conditions?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          denomination?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          points_required?: number
          provider?: string
          stock_quantity?: number | null
          terms_conditions?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          average_session_duration: number | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          last_active_at: string | null
          last_login_at: string | null
          level: number | null
          login_count: number | null
          name: string | null
          points: number | null
          profile_picture_url: string | null
          social_media_links: string[] | null
          task_completion_rate: number | null
          tasks_completed: number | null
          total_session_time: number | null
          updated_at: string | null
        }
        Insert: {
          average_session_duration?: number | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          last_active_at?: string | null
          last_login_at?: string | null
          level?: number | null
          login_count?: number | null
          name?: string | null
          points?: number | null
          profile_picture_url?: string | null
          social_media_links?: string[] | null
          task_completion_rate?: number | null
          tasks_completed?: number | null
          total_session_time?: number | null
          updated_at?: string | null
        }
        Update: {
          average_session_duration?: number | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_active_at?: string | null
          last_login_at?: string | null
          level?: number | null
          login_count?: number | null
          name?: string | null
          points?: number | null
          profile_picture_url?: string | null
          social_media_links?: string[] | null
          task_completion_rate?: number | null
          tasks_completed?: number | null
          total_session_time?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          admin_notes: string | null
          delivered_at: string | null
          id: string
          points_spent: number
          redeemed_at: string
          redemption_code: string | null
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          delivered_at?: string | null
          id?: string
          points_spent: number
          redeemed_at?: string
          redemption_code?: string | null
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          delivered_at?: string | null
          id?: string
          points_spent?: number
          redeemed_at?: string
          redemption_code?: string | null
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          points_required: number
          reward_type: string
          reward_value: string | null
          stock_quantity: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          points_required?: number
          reward_type?: string
          reward_value?: string | null
          stock_quantity?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          points_required?: number
          reward_type?: string
          reward_value?: string | null
          stock_quantity?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          admin_notes: string | null
          calculated_points: number | null
          created_at: string | null
          evidence: string | null
          evidence_file_url: string | null
          id: string
          point_breakdown: Json | null
          point_explanation: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          calculated_points?: number | null
          created_at?: string | null
          evidence?: string | null
          evidence_file_url?: string | null
          id?: string
          point_breakdown?: Json | null
          point_explanation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          calculated_points?: number | null
          created_at?: string | null
          evidence?: string | null
          evidence_file_url?: string | null
          id?: string
          point_breakdown?: Json | null
          point_explanation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          brand_logo_url: string | null
          brand_name: string | null
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          expires_at: string | null
          id: string
          points: number
          status: string | null
          task_type: string | null
          title: string
        }
        Insert: {
          brand_logo_url?: string | null
          brand_name?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          expires_at?: string | null
          id?: string
          points?: number
          status?: string | null
          task_type?: string | null
          title: string
        }
        Update: {
          brand_logo_url?: string | null
          brand_name?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          expires_at?: string | null
          id?: string
          points?: number
          status?: string | null
          task_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "task_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean
          location_city: string | null
          location_country: string | null
          operating_system: string | null
          session_end: string | null
          session_start: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          location_city?: string | null
          location_country?: string | null
          operating_system?: string | null
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          location_city?: string | null
          location_country?: string | null
          operating_system?: string | null
          session_end?: string | null
          session_start?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_start_date: string | null
          streak_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_start_date?: string | null
          streak_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_start_date?: string | null
          streak_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          points_earned: number | null
          started_at: string | null
          status: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          started_at?: string | null
          status?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          points_earned?: number | null
          started_at?: string | null
          status?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          conversion_amount: number | null
          created_at: string
          exchange_rate: number | null
          gift_card_type: string | null
          id: string
          payout_details: Json
          payout_method: string
          processed_at: string | null
          recipient_address: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          conversion_amount?: number | null
          created_at?: string
          exchange_rate?: number | null
          gift_card_type?: string | null
          id?: string
          payout_details: Json
          payout_method: string
          processed_at?: string | null
          recipient_address?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          conversion_amount?: number | null
          created_at?: string
          exchange_rate?: number | null
          gift_card_type?: string | null
          id?: string
          payout_details?: Json
          payout_method?: string
          processed_at?: string | null
          recipient_address?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_settings: {
        Row: {
          created_at: string
          daily_withdrawal_limit: number | null
          enabled: boolean
          id: string
          minimum_withdrawal_points: number
          processing_fee_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_withdrawal_limit?: number | null
          enabled?: boolean
          id?: string
          minimum_withdrawal_points?: number
          processing_fee_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_withdrawal_limit?: number | null
          enabled?: boolean
          id?: string
          minimum_withdrawal_points?: number
          processing_fee_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      yield_wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "yield_wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "yield_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      yield_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_task_completion_rate: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          name: string
          points: number
          level: number
          tasks_completed: number
        }[]
      }
      get_user_role_for_policy: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      redeem_reward: {
        Args: { p_user_id: string; p_reward_id: string }
        Returns: string
      }
      update_user_streak: {
        Args: {
          p_user_id: string
          p_streak_type: string
          p_activity_date?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      color_source:
        | "99COLORS_NET"
        | "ART_PAINTS_YG07S"
        | "BYRNE"
        | "CRAYOLA"
        | "CMYK_COLOR_MODEL"
        | "COLORCODE_IS"
        | "COLORHEXA"
        | "COLORXS"
        | "CORNELL_UNIVERSITY"
        | "COLUMBIA_UNIVERSITY"
        | "DUKE_UNIVERSITY"
        | "ENCYCOLORPEDIA_COM"
        | "ETON_COLLEGE"
        | "FANTETTI_AND_PETRACCHI"
        | "FINDTHEDATA_COM"
        | "FERRARIO_1919"
        | "FEDERAL_STANDARD_595"
        | "FLAG_OF_INDIA"
        | "FLAG_OF_SOUTH_AFRICA"
        | "GLAZEBROOK_AND_BALDRY"
        | "GOOGLE"
        | "HEXCOLOR_CO"
        | "ISCC_NBS"
        | "KELLY_MOORE"
        | "MATTEL"
        | "MAERZ_AND_PAUL"
        | "MILK_PAINT"
        | "MUNSELL_COLOR_WHEEL"
        | "NATURAL_COLOR_SYSTEM"
        | "PANTONE"
        | "PLOCHERE"
        | "POURPRE_COM"
        | "RAL"
        | "RESENE"
        | "RGB_COLOR_MODEL"
        | "THOM_POOLE"
        | "UNIVERSITY_OF_ALABAMA"
        | "UNIVERSITY_OF_CALIFORNIA_DAVIS"
        | "UNIVERSITY_OF_CAMBRIDGE"
        | "UNIVERSITY_OF_NORTH_CAROLINA"
        | "UNIVERSITY_OF_TEXAS_AT_AUSTIN"
        | "X11_WEB"
        | "XONA_COM"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      color_source: [
        "99COLORS_NET",
        "ART_PAINTS_YG07S",
        "BYRNE",
        "CRAYOLA",
        "CMYK_COLOR_MODEL",
        "COLORCODE_IS",
        "COLORHEXA",
        "COLORXS",
        "CORNELL_UNIVERSITY",
        "COLUMBIA_UNIVERSITY",
        "DUKE_UNIVERSITY",
        "ENCYCOLORPEDIA_COM",
        "ETON_COLLEGE",
        "FANTETTI_AND_PETRACCHI",
        "FINDTHEDATA_COM",
        "FERRARIO_1919",
        "FEDERAL_STANDARD_595",
        "FLAG_OF_INDIA",
        "FLAG_OF_SOUTH_AFRICA",
        "GLAZEBROOK_AND_BALDRY",
        "GOOGLE",
        "HEXCOLOR_CO",
        "ISCC_NBS",
        "KELLY_MOORE",
        "MATTEL",
        "MAERZ_AND_PAUL",
        "MILK_PAINT",
        "MUNSELL_COLOR_WHEEL",
        "NATURAL_COLOR_SYSTEM",
        "PANTONE",
        "PLOCHERE",
        "POURPRE_COM",
        "RAL",
        "RESENE",
        "RGB_COLOR_MODEL",
        "THOM_POOLE",
        "UNIVERSITY_OF_ALABAMA",
        "UNIVERSITY_OF_CALIFORNIA_DAVIS",
        "UNIVERSITY_OF_CAMBRIDGE",
        "UNIVERSITY_OF_NORTH_CAROLINA",
        "UNIVERSITY_OF_TEXAS_AT_AUSTIN",
        "X11_WEB",
        "XONA_COM",
      ],
    },
  },
} as const
