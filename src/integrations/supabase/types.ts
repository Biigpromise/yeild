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
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_to: string | null
          message: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_to?: string | null
          message: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_to?: string | null
          message?: string
          type?: string
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
      bird_levels: {
        Row: {
          animation_type: string | null
          benefits: string[] | null
          color: string
          created_at: string | null
          description: string
          emoji: string
          glow_effect: boolean | null
          icon: string
          id: number
          min_points: number | null
          min_referrals: number
          name: string
          updated_at: string | null
        }
        Insert: {
          animation_type?: string | null
          benefits?: string[] | null
          color: string
          created_at?: string | null
          description: string
          emoji: string
          glow_effect?: boolean | null
          icon: string
          id?: number
          min_points?: number | null
          min_referrals: number
          name: string
          updated_at?: string | null
        }
        Update: {
          animation_type?: string | null
          benefits?: string[] | null
          color?: string
          created_at?: string | null
          description?: string
          emoji?: string
          glow_effect?: boolean | null
          icon?: string
          id?: number
          min_points?: number | null
          min_referrals?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_applications: {
        Row: {
          budget: string
          company_name: string
          company_size: string
          created_at: string
          email_confirmed: boolean | null
          email_confirmed_at: string | null
          goals: string
          id: string
          industry: string
          status: string
          task_types: Json
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          budget: string
          company_name: string
          company_size: string
          created_at?: string
          email_confirmed?: boolean | null
          email_confirmed_at?: string | null
          goals: string
          id?: string
          industry: string
          status?: string
          task_types: Json
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          budget?: string
          company_name?: string
          company_size?: string
          created_at?: string
          email_confirmed?: boolean | null
          email_confirmed_at?: string | null
          goals?: string
          id?: string
          industry?: string
          status?: string
          task_types?: Json
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      brand_campaigns: {
        Row: {
          admin_approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          auto_convert_enabled: boolean | null
          brand_id: string
          budget: number
          campaign_brief: string | null
          collaboration_settings: Json | null
          converted_to_tasks: boolean | null
          created_at: string | null
          deliverable_specifications: Json | null
          description: string | null
          end_date: string | null
          funded_amount: number | null
          hashtags: string[] | null
          id: string
          logo_url: string | null
          media_assets: Json | null
          payment_status: string | null
          payment_transaction_id: string | null
          rejection_reason: string | null
          requirements: Json | null
          social_links: Json | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          target_demographics: Json | null
          tasks_generated_at: string | null
          tasks_generated_by: string | null
          template_id: string | null
          title: string
          tracking_parameters: Json | null
          updated_at: string | null
          wallet_transaction_id: string | null
        }
        Insert: {
          admin_approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_convert_enabled?: boolean | null
          brand_id: string
          budget: number
          campaign_brief?: string | null
          collaboration_settings?: Json | null
          converted_to_tasks?: boolean | null
          created_at?: string | null
          deliverable_specifications?: Json | null
          description?: string | null
          end_date?: string | null
          funded_amount?: number | null
          hashtags?: string[] | null
          id?: string
          logo_url?: string | null
          media_assets?: Json | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          rejection_reason?: string | null
          requirements?: Json | null
          social_links?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          target_demographics?: Json | null
          tasks_generated_at?: string | null
          tasks_generated_by?: string | null
          template_id?: string | null
          title: string
          tracking_parameters?: Json | null
          updated_at?: string | null
          wallet_transaction_id?: string | null
        }
        Update: {
          admin_approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_convert_enabled?: boolean | null
          brand_id?: string
          budget?: number
          campaign_brief?: string | null
          collaboration_settings?: Json | null
          converted_to_tasks?: boolean | null
          created_at?: string | null
          deliverable_specifications?: Json | null
          description?: string | null
          end_date?: string | null
          funded_amount?: number | null
          hashtags?: string[] | null
          id?: string
          logo_url?: string | null
          media_assets?: Json | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          rejection_reason?: string | null
          requirements?: Json | null
          social_links?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          target_demographics?: Json | null
          tasks_generated_at?: string | null
          tasks_generated_by?: string | null
          template_id?: string | null
          title?: string
          tracking_parameters?: Json | null
          updated_at?: string | null
          wallet_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_campaigns_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_campaigns_wallet_transaction_id_fkey"
            columns: ["wallet_transaction_id"]
            isOneToOne: false
            referencedRelation: "brand_wallet_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_brand_campaigns_brand_profiles"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      brand_notifications: {
        Row: {
          brand_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_payment_methods: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          metadata: Json | null
          payment_type: string
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          metadata?: Json | null
          payment_type?: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          metadata?: Json | null
          payment_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          company_name: string
          created_at: string
          currency_preference: string | null
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          currency_preference?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          currency_preference?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      brand_task_announcements: {
        Row: {
          announcement_type: string | null
          brand_id: string
          created_at: string | null
          description: string
          estimated_budget: number | null
          estimated_launch_date: string | null
          id: string
          interest_count: number | null
          is_active: boolean | null
          requirements: Json | null
          status: string | null
          target_audience: Json | null
          task_category: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          brand_id: string
          created_at?: string | null
          description: string
          estimated_budget?: number | null
          estimated_launch_date?: string | null
          id?: string
          interest_count?: number | null
          is_active?: boolean | null
          requirements?: Json | null
          status?: string | null
          target_audience?: Json | null
          task_category?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          brand_id?: string
          created_at?: string | null
          description?: string
          estimated_budget?: number | null
          estimated_launch_date?: string | null
          id?: string
          interest_count?: number | null
          is_active?: boolean | null
          requirements?: Json | null
          status?: string | null
          target_audience?: Json | null
          task_category?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          brand_id: string
          campaign_id: string | null
          created_at: string
          description: string
          id: string
          payment_transaction_id: string | null
          reference_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          brand_id: string
          campaign_id?: string | null
          created_at?: string
          description: string
          id?: string
          payment_transaction_id?: string | null
          reference_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          brand_id?: string
          campaign_id?: string | null
          created_at?: string
          description?: string
          id?: string
          payment_transaction_id?: string | null
          reference_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_wallet_transactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_wallet_transactions_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "brand_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_wallets: {
        Row: {
          balance: number
          brand_id: string
          created_at: string
          id: string
          total_deposited: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          balance?: number
          brand_id: string
          created_at?: string
          id?: string
          total_deposited?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          brand_id?: string
          created_at?: string
          id?: string
          total_deposited?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      campaign_analytics: {
        Row: {
          campaign_id: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          campaign_id: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          campaign_id?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_approval_requests: {
        Row: {
          brand_id: string | null
          campaign_id: string | null
          created_at: string
          id: string
          payment_amount: number | null
          payment_transaction_id: string | null
          request_status: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          payment_amount?: number | null
          payment_transaction_id?: string | null
          request_status?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          campaign_id?: string | null
          created_at?: string
          id?: string
          payment_amount?: number | null
          payment_transaction_id?: string | null
          request_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_approval_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_approval_requests_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_task_conversions: {
        Row: {
          adjustment_reason: string | null
          allocated_points: number
          campaign_id: string
          converted_by: string | null
          created_at: string
          id: string
          original_budget: number
          point_adjustment: number | null
          task_id: string
          updated_at: string
        }
        Insert: {
          adjustment_reason?: string | null
          allocated_points: number
          campaign_id: string
          converted_by?: string | null
          created_at?: string
          id?: string
          original_budget: number
          point_adjustment?: number | null
          task_id: string
          updated_at?: string
        }
        Update: {
          adjustment_reason?: string | null
          allocated_points?: number
          campaign_id?: string
          converted_by?: string | null
          created_at?: string
          id?: string
          original_budget?: number
          point_adjustment?: number | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_task_conversions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_task_conversions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          brand_id: string
          created_at: string | null
          description: string | null
          id: string
          is_shared: boolean | null
          name: string
          template_data: Json
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name: string
          template_data: Json
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_shared?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          brand_id: string
          budget: number
          created_at: string
          description: string | null
          end_date: string | null
          funded_amount: number | null
          id: string
          requirements: Json | null
          start_date: string | null
          status: string
          target_audience: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          funded_amount?: number | null
          id?: string
          requirements?: Json | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget?: number
          created_at?: string
          description?: string | null
          end_date?: string | null
          funded_amount?: number | null
          id?: string
          requirements?: Json | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          chat_id: string
          id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_group_chat: boolean | null
          last_message: string | null
          last_message_at: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group_chat?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_group_chat?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          name?: string | null
          updated_at?: string | null
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
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_financial_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          bank_code: string
          bank_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type?: string
          bank_code: string
          bank_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          bank_code?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_revenue: {
        Row: {
          created_at: string | null
          id: string
          net_revenue: number | null
          payment_count: number | null
          revenue_date: string
          total_fees: number | null
          total_payments: number | null
          total_withdrawals: number | null
          updated_at: string | null
          withdrawal_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          net_revenue?: number | null
          payment_count?: number | null
          revenue_date: string
          total_fees?: number | null
          total_payments?: number | null
          total_withdrawals?: number | null
          updated_at?: string | null
          withdrawal_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          net_revenue?: number | null
          payment_count?: number | null
          revenue_date?: string
          total_fees?: number | null
          total_payments?: number | null
          total_withdrawals?: number | null
          updated_at?: string | null
          withdrawal_count?: number | null
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
      currency_rates: {
        Row: {
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string | null
        }
        Insert: {
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string | null
        }
        Update: {
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_chat_participants: {
        Row: {
          chat_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "direct_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_chats: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_group_chat: boolean
          last_message_at: string | null
          last_message_id: string | null
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_group_chat?: boolean
          last_message_at?: string | null
          last_message_id?: string | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_group_chat?: boolean
          last_message_at?: string | null
          last_message_id?: string | null
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      direct_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string
          id: string
          is_edited: boolean
          media_url: string | null
          message_type: string
          reply_to_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string
          id?: string
          is_edited?: boolean
          media_url?: string | null
          message_type?: string
          reply_to_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_edited?: boolean
          media_url?: string | null
          message_type?: string
          reply_to_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "direct_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      duplicate_image_flags: {
        Row: {
          admin_notes: string | null
          duplicate_hash_id: string
          flagged_at: string | null
          id: string
          original_hash_id: string
          reviewed: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          duplicate_hash_id: string
          flagged_at?: string | null
          id?: string
          original_hash_id: string
          reviewed?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          duplicate_hash_id?: string
          flagged_at?: string | null
          id?: string
          original_hash_id?: string
          reviewed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "duplicate_image_flags_duplicate_hash_id_fkey"
            columns: ["duplicate_hash_id"]
            isOneToOne: false
            referencedRelation: "image_hashes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duplicate_image_flags_original_hash_id_fkey"
            columns: ["original_hash_id"]
            isOneToOne: false
            referencedRelation: "image_hashes"
            referencedColumns: ["id"]
          },
        ]
      }
      email_delivery_logs: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivery_time_seconds: number | null
          email: string
          email_type: string
          error_message: string | null
          failed_at: string | null
          id: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivery_time_seconds?: number | null
          email: string
          email_type: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivery_time_seconds?: number | null
          email?: string
          email_type?: string
          error_message?: string | null
          failed_at?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_verification_codes: {
        Row: {
          attempt_count: number | null
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          updated_at: string
          used_at: string | null
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          token: string
          updated_at?: string
          used_at?: string | null
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string
          used_at?: string | null
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      fraud_flags: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          evidence: Json | null
          flag_reason: string
          flag_type: string
          id: string
          related_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          evidence?: Json | null
          flag_reason: string
          flag_type: string
          id?: string
          related_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          evidence?: Json | null
          flag_reason?: string
          flag_type?: string
          id?: string
          related_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fund_transfers: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          error_message: string | null
          fee: number | null
          flutterwave_id: string | null
          flutterwave_response: Json | null
          id: string
          net_amount: number
          recipient_account: string
          recipient_bank: string
          retry_count: number | null
          settlement_date: string | null
          source_id: string | null
          source_type: string
          status: string | null
          transfer_date: string | null
          transfer_reference: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          fee?: number | null
          flutterwave_id?: string | null
          flutterwave_response?: Json | null
          id?: string
          net_amount: number
          recipient_account: string
          recipient_bank: string
          retry_count?: number | null
          settlement_date?: string | null
          source_id?: string | null
          source_type: string
          status?: string | null
          transfer_date?: string | null
          transfer_reference: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          fee?: number | null
          flutterwave_id?: string | null
          flutterwave_response?: Json | null
          id?: string
          net_amount?: number
          recipient_account?: string
          recipient_bank?: string
          retry_count?: number | null
          settlement_date?: string | null
          source_id?: string | null
          source_type?: string
          status?: string | null
          transfer_date?: string | null
          transfer_reference?: string
          updated_at?: string | null
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
      global_image_usage: {
        Row: {
          file_url: string
          hash_value: string
          id: string
          submission_id: string | null
          task_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          file_url: string
          hash_value: string
          id?: string
          submission_id?: string | null
          task_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          file_url?: string
          hash_value?: string
          id?: string
          submission_id?: string | null
          task_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      image_hashes: {
        Row: {
          created_at: string | null
          file_url: string
          hash_value: string
          id: string
          submission_id: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          hash_value: string
          id?: string
          submission_id?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          hash_value?: string
          id?: string
          submission_id?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_hashes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_hashes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_analytics_daily: {
        Row: {
          clicks: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          listing_id: string | null
          unique_clickers: number | null
          unique_viewers: number | null
          views: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          listing_id?: string | null
          unique_clickers?: number | null
          unique_viewers?: number | null
          views?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          listing_id?: string | null
          unique_clickers?: number | null
          unique_viewers?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_analytics_daily_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_bookmarks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_interactions: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          listing_id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          listing_id: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_interactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listing_notifications: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          notification_type: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          notification_type: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          notification_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listing_notifications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          brand_id: string
          category: string
          clicks_count: number | null
          created_at: string | null
          days_paid: number
          description: string
          end_date: string
          external_link: string | null
          featured_position: number | null
          featured_until: string | null
          id: string
          image_url: string | null
          image_urls: Json | null
          is_featured: boolean | null
          listing_tier: string | null
          price_per_day: number | null
          start_date: string | null
          status: string | null
          title: string
          total_paid: number
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          brand_id: string
          category: string
          clicks_count?: number | null
          created_at?: string | null
          days_paid: number
          description: string
          end_date: string
          external_link?: string | null
          featured_position?: number | null
          featured_until?: string | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          is_featured?: boolean | null
          listing_tier?: string | null
          price_per_day?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          total_paid: number
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          brand_id?: string
          category?: string
          clicks_count?: number | null
          created_at?: string | null
          days_paid?: number
          description?: string
          end_date?: string
          external_link?: string | null
          featured_position?: number | null
          featured_until?: string | null
          id?: string
          image_url?: string | null
          image_urls?: Json | null
          is_featured?: boolean | null
          listing_tier?: string | null
          price_per_day?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          total_paid?: number
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      message_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          message_id: string
          parent_comment_id: string | null
          reply_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_id: string
          parent_comment_id?: string | null
          reply_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_id?: string
          parent_comment_id?: string | null
          reply_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_comments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "message_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_edit_history: {
        Row: {
          edited_at: string
          edited_by: string
          id: string
          message_id: string
          previous_content: string
        }
        Insert: {
          edited_at?: string
          edited_by: string
          id?: string
          message_id: string
          previous_content: string
        }
        Update: {
          edited_at?: string
          edited_by?: string
          id?: string
          message_id?: string
          previous_content?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_edit_history_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_likes: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_likes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_mentions: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          mentioned_by_user_id: string
          mentioned_user_id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          mentioned_by_user_id: string
          mentioned_user_id: string
          message_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          mentioned_by_user_id?: string
          mentioned_user_id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_mentions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          parent_message_id: string
          reply_message_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_message_id: string
          reply_message_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_message_id?: string
          reply_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_reply_message_id_fkey"
            columns: ["reply_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_views: {
        Row: {
          id: string
          message_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_views_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string
          deleted_at: string | null
          edit_count: number | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          last_edited_at: string | null
          media_url: string | null
          message_context: string | null
          message_type: string | null
          parent_message_id: string | null
          reply_count: number | null
          user_id: string
          views_count: number | null
          voice_duration: number | null
          voice_transcript: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          edit_count?: number | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          last_edited_at?: string | null
          media_url?: string | null
          message_context?: string | null
          message_type?: string | null
          parent_message_id?: string | null
          reply_count?: number | null
          user_id: string
          views_count?: number | null
          voice_duration?: number | null
          voice_transcript?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          edit_count?: number | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          last_edited_at?: string | null
          media_url?: string | null
          message_context?: string | null
          message_type?: string | null
          parent_message_id?: string | null
          reply_count?: number | null
          user_id?: string
          views_count?: number | null
          voice_duration?: number | null
          voice_transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          announcement_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          reset_code: string | null
          token: string
          updated_at: string | null
          used_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          reset_code?: string | null
          token: string
          updated_at?: string | null
          used_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          reset_code?: string | null
          token?: string
          updated_at?: string | null
          used_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      payment_method_configs: {
        Row: {
          configuration_details: Json | null
          created_at: string | null
          enabled: boolean
          id: string
          max_amount: number
          method_key: string
          min_amount: number
          name: string
          processing_fee_percent: number
          processing_time_estimate: string | null
          updated_at: string | null
        }
        Insert: {
          configuration_details?: Json | null
          created_at?: string | null
          enabled?: boolean
          id?: string
          max_amount?: number
          method_key: string
          min_amount?: number
          name: string
          processing_fee_percent?: number
          processing_time_estimate?: string | null
          updated_at?: string | null
        }
        Update: {
          configuration_details?: Json | null
          created_at?: string | null
          enabled?: boolean
          id?: string
          max_amount?: number
          method_key?: string
          min_amount?: number
          name?: string
          processing_fee_percent?: number
          processing_time_estimate?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          amount_settled: number | null
          campaign_id: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          flutterwave_id: string | null
          id: string
          payment_method: string | null
          payment_type: string
          processor_response: Json | null
          status: string
          task_id: string | null
          transaction_ref: string
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          amount_settled?: number | null
          campaign_id?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          flutterwave_id?: string | null
          id?: string
          payment_method?: string | null
          payment_type: string
          processor_response?: Json | null
          status?: string
          task_id?: string | null
          transaction_ref: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          amount_settled?: number | null
          campaign_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          flutterwave_id?: string | null
          id?: string
          payment_method?: string | null
          payment_type?: string
          processor_response?: Json | null
          status?: string
          task_id?: string | null
          transaction_ref?: string
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      payout_transactions: {
        Row: {
          account_bank: string
          account_number: string
          amount: number
          beneficiary_name: string
          created_at: string
          currency: string
          fee: number | null
          flutterwave_id: string | null
          id: string
          narration: string | null
          reference: string
          response_data: Json | null
          status: string
          task_id: string | null
          updated_at: string
          user_id: string | null
          withdrawal_id: string | null
        }
        Insert: {
          account_bank: string
          account_number: string
          amount: number
          beneficiary_name: string
          created_at?: string
          currency?: string
          fee?: number | null
          flutterwave_id?: string | null
          id?: string
          narration?: string | null
          reference: string
          response_data?: Json | null
          status?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string | null
          withdrawal_id?: string | null
        }
        Update: {
          account_bank?: string
          account_number?: string
          amount?: number
          beneficiary_name?: string
          created_at?: string
          currency?: string
          fee?: number | null
          flutterwave_id?: string | null
          id?: string
          narration?: string | null
          reference?: string
          response_data?: Json | null
          status?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string | null
          withdrawal_id?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          user_id?: string
        }
        Relationships: []
      }
      platform_revenue: {
        Row: {
          amount: number
          brand_id: string | null
          created_at: string | null
          id: string
          listing_id: string | null
          source: string
          transaction_date: string | null
        }
        Insert: {
          amount: number
          brand_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          source: string
          transaction_date?: string | null
        }
        Update: {
          amount?: number
          brand_id?: string | null
          created_at?: string | null
          id?: string
          listing_id?: string | null
          source?: string
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_revenue_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
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
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string
          reply_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id: string
          reply_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string
          reply_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          emoji: string | null
          id: string
          post_id: string
          reaction_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          post_id: string
          reaction_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string | null
          id?: string
          post_id?: string
          reaction_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_views: {
        Row: {
          id: string
          post_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number
          media_url: string | null
          reply_count: number
          updated_at: string | null
          user_id: string
          view_count: number
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          media_url?: string | null
          reply_count?: number
          updated_at?: string | null
          user_id: string
          view_count?: number
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          media_url?: string | null
          reply_count?: number
          updated_at?: string | null
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_models: {
        Row: {
          action_type: string
          created_at: string
          currency: string
          id: string
          is_active: boolean
          max_cpa: number
          min_cpa: number
          region: string | null
          updated_at: string
        }
        Insert: {
          action_type?: string
          created_at?: string
          currency: string
          id?: string
          is_active?: boolean
          max_cpa: number
          min_cpa: number
          region?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          max_cpa?: number
          min_cpa?: number
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_referrals_count: number | null
          average_session_duration: number | null
          bio: string | null
          can_post_in_chat: boolean | null
          created_at: string | null
          email: string | null
          followers_count: number
          following_count: number
          id: string
          is_anonymous: boolean
          last_active_at: string | null
          last_login_at: string | null
          level: number | null
          login_count: number | null
          name: string | null
          points: number | null
          profile_picture_url: string | null
          referral_code: string | null
          social_media_links: string[] | null
          task_completion_rate: number | null
          tasks_completed: number | null
          total_referrals_count: number | null
          total_session_time: number | null
          updated_at: string | null
        }
        Insert: {
          active_referrals_count?: number | null
          average_session_duration?: number | null
          bio?: string | null
          can_post_in_chat?: boolean | null
          created_at?: string | null
          email?: string | null
          followers_count?: number
          following_count?: number
          id: string
          is_anonymous?: boolean
          last_active_at?: string | null
          last_login_at?: string | null
          level?: number | null
          login_count?: number | null
          name?: string | null
          points?: number | null
          profile_picture_url?: string | null
          referral_code?: string | null
          social_media_links?: string[] | null
          task_completion_rate?: number | null
          tasks_completed?: number | null
          total_referrals_count?: number | null
          total_session_time?: number | null
          updated_at?: string | null
        }
        Update: {
          active_referrals_count?: number | null
          average_session_duration?: number | null
          bio?: string | null
          can_post_in_chat?: boolean | null
          created_at?: string | null
          email?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          is_anonymous?: boolean
          last_active_at?: string | null
          last_login_at?: string | null
          level?: number | null
          login_count?: number | null
          name?: string | null
          points?: number | null
          profile_picture_url?: string | null
          referral_code?: string | null
          social_media_links?: string[] | null
          task_completion_rate?: number | null
          tasks_completed?: number | null
          total_referrals_count?: number | null
          total_session_time?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_levels: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          required_referrals: number
          rewards_description: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          required_referrals: number
          rewards_description?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          required_referrals?: number
          rewards_description?: string | null
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
      saved_bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at: string | null
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          id: string
          scheduled_for: string
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          scheduled_for: string
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          scheduled_for?: string
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          event_details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          severity: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          event_details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          event_details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settlement_schedules: {
        Row: {
          created_at: string | null
          day_of_month: number | null
          day_of_week: number | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run: string | null
          minimum_amount: number | null
          next_run: string | null
          schedule_name: string
          time_of_day: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          minimum_amount?: number | null
          next_run?: string | null
          schedule_name: string
          time_of_day?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          minimum_amount?: number | null
          next_run?: string | null
          schedule_name?: string
          time_of_day?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string
          user_id: string
          view_count: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url: string
          user_id: string
          view_count?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_analytics: {
        Row: {
          active_tasks: number | null
          approval_rate: number | null
          avg_completion_time: number | null
          completed_tasks: number | null
          created_at: string
          date: string
          id: string
          pending_submissions: number | null
          total_tasks: number | null
        }
        Insert: {
          active_tasks?: number | null
          approval_rate?: number | null
          avg_completion_time?: number | null
          completed_tasks?: number | null
          created_at?: string
          date: string
          id?: string
          pending_submissions?: number | null
          total_tasks?: number | null
        }
        Update: {
          active_tasks?: number | null
          approval_rate?: number | null
          avg_completion_time?: number | null
          completed_tasks?: number | null
          created_at?: string
          date?: string
          id?: string
          pending_submissions?: number | null
          total_tasks?: number | null
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
      task_source_analytics: {
        Row: {
          active_tasks: number | null
          avg_completion_rate: number | null
          completed_tasks: number | null
          created_at: string
          date: string
          id: string
          task_source: string
          total_budget: number | null
          total_points_awarded: number | null
          total_tasks: number | null
          updated_at: string
        }
        Insert: {
          active_tasks?: number | null
          avg_completion_rate?: number | null
          completed_tasks?: number | null
          created_at?: string
          date?: string
          id?: string
          task_source: string
          total_budget?: number | null
          total_points_awarded?: number | null
          total_tasks?: number | null
          updated_at?: string
        }
        Update: {
          active_tasks?: number | null
          avg_completion_rate?: number | null
          completed_tasks?: number | null
          created_at?: string
          date?: string
          id?: string
          task_source?: string
          total_budget?: number | null
          total_points_awarded?: number | null
          total_tasks?: number | null
          updated_at?: string
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
          evidence_files: Json | null
          id: string
          point_breakdown: Json | null
          point_explanation: string | null
          rejection_reason: string | null
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
          evidence_files?: Json | null
          id?: string
          point_breakdown?: Json | null
          point_explanation?: string | null
          rejection_reason?: string | null
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
          evidence_files?: Json | null
          id?: string
          point_breakdown?: Json | null
          point_explanation?: string | null
          rejection_reason?: string | null
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
            foreignKeyName: "fk_task_submissions_task_id"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_task_submissions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          approved_by_admin: string | null
          brand_logo_url: string | null
          brand_name: string | null
          brand_user_id: string | null
          budget_allocated: number | null
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          expires_at: string | null
          funded_by: string | null
          id: string
          original_budget: number | null
          point_adjustment_reason: string | null
          points: number
          social_media_links: Json | null
          source_campaign_id: string | null
          status: string | null
          task_source: string | null
          task_type: string | null
          title: string
        }
        Insert: {
          approved_by_admin?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_user_id?: string | null
          budget_allocated?: number | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          expires_at?: string | null
          funded_by?: string | null
          id?: string
          original_budget?: number | null
          point_adjustment_reason?: string | null
          points?: number
          social_media_links?: Json | null
          source_campaign_id?: string | null
          status?: string | null
          task_source?: string | null
          task_type?: string | null
          title: string
        }
        Update: {
          approved_by_admin?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_user_id?: string | null
          budget_allocated?: number | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          expires_at?: string | null
          funded_by?: string | null
          id?: string
          original_budget?: number | null
          point_adjustment_reason?: string | null
          points?: number
          social_media_links?: Json | null
          source_campaign_id?: string | null
          status?: string | null
          task_source?: string | null
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
          {
            foreignKeyName: "tasks_source_campaign_id_fkey"
            columns: ["source_campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          chat_id: string
          expires_at: string
          id: string
          is_typing: boolean
          last_typed_at: string
          user_id: string
        }
        Insert: {
          chat_id?: string
          expires_at?: string
          id?: string
          is_typing?: boolean
          last_typed_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          expires_at?: string
          id?: string
          is_typing?: boolean
          last_typed_at?: string
          user_id?: string
        }
        Relationships: []
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
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          id: string
          message: string
          rating: number | null
          responded_at: string | null
          responded_by: string | null
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          rating?: number | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payment_methods: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at: string | null
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          method_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          method_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          method_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          custom_status: string | null
          id: string
          is_online: boolean
          last_seen_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          custom_status?: string | null
          id?: string
          is_online?: boolean
          last_seen_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          custom_status?: string | null
          id?: string
          is_online?: boolean
          last_seen_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          activated_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          points_awarded: number | null
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          points_awarded?: number | null
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          points_awarded?: number | null
          referral_code?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      user_signup_data: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown
          location_city: string | null
          location_country: string | null
          signup_timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          location_city?: string | null
          location_country?: string | null
          signup_timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          location_city?: string | null
          location_country?: string | null
          signup_timestamp?: string | null
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
      user_task_interests: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          interest_level: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          interest_level?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          interest_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_interests_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "brand_task_announcements"
            referencedColumns: ["id"]
          },
        ]
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
      user_tours: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          tour_completed: boolean | null
          tour_step: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          tour_completed?: boolean | null
          tour_step?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          tour_completed?: boolean | null
          tour_step?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          payment_method_id: string | null
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
          payment_method_id?: string | null
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
          payment_method_id?: string | null
          payout_details?: Json
          payout_method?: string
          processed_at?: string | null
          recipient_address?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "user_payment_methods"
            referencedColumns: ["id"]
          },
        ]
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
      auto_convert_campaign_to_tasks: {
        Args: { p_admin_id: string; p_campaign_id: string; p_task_data?: Json }
        Returns: {
          message: string
          success: boolean
          task_id: string
        }[]
      }
      auto_expire_marketplace_listings: { Args: never; Returns: undefined }
      award_referral_commission: {
        Args: { downline_user_id: string; points_earned: number }
        Returns: undefined
      }
      calculate_referral_points: {
        Args: { referrer_id: string }
        Returns: number
      }
      calculate_task_completion_rate: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_and_activate_referral: {
        Args: { user_id: string }
        Returns: undefined
      }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_chat_posting_eligibility: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      check_user_role_secure: {
        Args: { check_user_id: string; required_role: string }
        Returns: boolean
      }
      cleanup_expired_reset_tokens: { Args: never; Returns: undefined }
      cleanup_expired_verification_codes: { Args: never; Returns: undefined }
      create_missing_profile_for_user: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      credit_user_account: {
        Args: { amount: number; reference: string; user_id: string }
        Returns: undefined
      }
      generate_referral_code: { Args: never; Returns: string }
      generate_reset_code: { Args: never; Returns: string }
      generate_verification_code: { Args: never; Returns: string }
      get_admin_dashboard_stats: {
        Args: never
        Returns: {
          active_campaigns: number
          pending_applications: number
          pending_submissions: number
          total_applications: number
          total_campaigns: number
          total_task_submissions: number
        }[]
      }
      get_admin_task_submissions: {
        Args: { limit_count?: number }
        Returns: {
          evidence: string
          evidence_file_url: string
          evidence_files: Json
          id: string
          rejection_reason: string
          reviewed_at: string
          reviewer_id: string
          social_media_handle: string
          status: string
          submitted_at: string
          task_description: string
          task_id: string
          task_title: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_current_user_profile: {
        Args: never
        Returns: {
          email: string
          id: string
          level: number
          name: string
          points: number
          tasks_completed: number
        }[]
      }
      get_leaderboard_data: {
        Args: never
        Returns: {
          id: string
          level: number
          name: string
          points: number
          profile_picture_url: string
          tasks_completed: number
        }[]
      }
      get_next_bird_level: {
        Args: { user_id_param: string }
        Returns: {
          color: string
          description: string
          emoji: string
          icon: string
          id: number
          min_points: number
          min_referrals: number
          name: string
          points_needed: number
          referrals_needed: number
        }[]
      }
      get_performance_metrics: {
        Args: never
        Returns: {
          metric_name: string
          metric_value: number
          recorded_at: string
        }[]
      }
      get_unread_message_count: {
        Args: { chat_id_param: string; user_id_param: string }
        Returns: number
      }
      get_user_bird_level: {
        Args: { user_id_param: string }
        Returns: {
          animation_type: string
          benefits: string[]
          color: string
          description: string
          emoji: string
          glow_effect: boolean
          icon: string
          id: number
          min_points: number
          min_referrals: number
          name: string
        }[]
      }
      get_user_role_for_policy: { Args: { user_id: string }; Returns: string }
      get_user_role_safe: { Args: { user_id_param: string }; Returns: string }
      handle_referral_signup: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: undefined
      }
      handle_referral_signup_improved: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: undefined
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_message_view: {
        Args: { message_id_param: string; user_id_param: string }
        Returns: undefined
      }
      increment_post_view:
        | { Args: { post_id_to_inc: string }; Returns: undefined }
        | {
            Args: { post_id_to_inc: string; user_id_param: string }
            Returns: undefined
          }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_admin_safe: { Args: { user_id_param: string }; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_chat_participant: {
        Args: { chat_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_current_user_admin_secure: { Args: never; Returns: boolean }
      log_security_event: {
        Args: {
          event_details?: Json
          event_type: string
          user_id_param: string
        }
        Returns: undefined
      }
      log_security_event_enhanced: {
        Args: {
          event_details?: Json
          event_type: string
          severity_param?: string
          user_id_param: string
        }
        Returns: undefined
      }
      process_referral_signup_complete: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: Json
      }
      process_wallet_transaction: {
        Args: {
          p_amount: number
          p_brand_id: string
          p_campaign_id?: string
          p_description: string
          p_payment_transaction_id?: string
          p_reference_id?: string
          p_transaction_type: string
        }
        Returns: string
      }
      redeem_reward: {
        Args: { p_reward_id: string; p_user_id: string }
        Returns: string
      }
      refresh_referral_counts: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
      sanitize_input: { Args: { input_text: string }; Returns: string }
      update_daily_task_analytics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      update_task_source_analytics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      update_user_streak: {
        Args: {
          p_activity_date?: string
          p_streak_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      user_has_brand_role: { Args: never; Returns: boolean }
      verify_admin_access_secure: {
        Args: { user_email: string }
        Returns: boolean
      }
      verify_single_admin_access: {
        Args: { user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "brand"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "brand"],
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
