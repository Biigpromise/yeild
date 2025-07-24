export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
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
          brand_id: string | null
          budget: number
          created_at: string | null
          description: string | null
          end_date: string | null
          funded_amount: number | null
          id: string
          logo_url: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          rejection_reason: string | null
          requirements: Json | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          title: string
          updated_at: string | null
          wallet_transaction_id: string | null
        }
        Insert: {
          admin_approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_id?: string | null
          budget: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          funded_amount?: number | null
          id?: string
          logo_url?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          rejection_reason?: string | null
          requirements?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          title: string
          updated_at?: string | null
          wallet_transaction_id?: string | null
        }
        Update: {
          admin_approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          brand_id?: string | null
          budget?: number
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          funded_amount?: number | null
          id?: string
          logo_url?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          rejection_reason?: string | null
          requirements?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          title?: string
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
      message_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          message_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_id?: string
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
            foreignKeyName: "message_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          content: string
          created_at: string
          id: string
          media_url: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_url?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_url?: string | null
          user_id?: string
          views_count?: number | null
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
          brand_logo_url: string | null
          brand_name: string | null
          brand_user_id: string | null
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          expires_at: string | null
          id: string
          points: number
          social_media_links: Json | null
          status: string | null
          task_type: string | null
          title: string
        }
        Insert: {
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_user_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          expires_at?: string | null
          id?: string
          points?: number
          social_media_links?: Json | null
          status?: string | null
          task_type?: string | null
          title: string
        }
        Update: {
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_user_id?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          expires_at?: string | null
          id?: string
          points?: number
          social_media_links?: Json | null
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
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
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
      user_signup_data: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
      credit_user_account: {
        Args: { user_id: string; amount: number; reference: string }
        Returns: undefined
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
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
      get_leaderboard_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          points: number
          level: number
          tasks_completed: number
          profile_picture_url: string
        }[]
      }
      get_next_bird_level: {
        Args: { user_id_param: string }
        Returns: {
          id: number
          name: string
          icon: string
          emoji: string
          min_referrals: number
          min_points: number
          description: string
          color: string
          referrals_needed: number
          points_needed: number
        }[]
      }
      get_user_bird_level: {
        Args: { user_id_param: string }
        Returns: {
          id: number
          name: string
          icon: string
          emoji: string
          min_referrals: number
          min_points: number
          description: string
          color: string
          benefits: string[]
          animation_type: string
          glow_effect: boolean
        }[]
      }
      get_user_role_for_policy: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role_safe: {
        Args: { user_id_param: string }
        Returns: string
      }
      handle_referral_signup: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: undefined
      }
      handle_referral_signup_improved: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: undefined
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      increment_message_view: {
        Args: { message_id_param: string; user_id_param: string }
        Returns: undefined
      }
      increment_post_view: {
        Args:
          | { post_id_to_inc: string }
          | { post_id_to_inc: string; user_id_param: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_safe: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          user_id_param: string
          event_type: string
          event_details?: Json
        }
        Returns: undefined
      }
      process_wallet_transaction: {
        Args: {
          p_brand_id: string
          p_transaction_type: string
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_campaign_id?: string
          p_payment_transaction_id?: string
        }
        Returns: string
      }
      redeem_reward: {
        Args: { p_user_id: string; p_reward_id: string }
        Returns: string
      }
      sanitize_input: {
        Args: { input_text: string }
        Returns: string
      }
      update_daily_task_analytics: {
        Args: { target_date?: string }
        Returns: undefined
      }
      update_user_streak: {
        Args: {
          p_user_id: string
          p_streak_type: string
          p_activity_date?: string
        }
        Returns: undefined
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
