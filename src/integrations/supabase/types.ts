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
      admin_action_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          description: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          credential_url: string | null
          display_order: number | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuer: string
          name: string
          portfolio_id: string
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          display_order?: number | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer: string
          name: string
          portfolio_id: string
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          display_order?: number | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string
          name?: string
          portfolio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          portfolio_id: string
          read: boolean
          sender_email: string
          sender_name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          portfolio_id: string
          read?: boolean
          sender_email: string
          sender_name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          portfolio_id?: string
          read?: boolean
          sender_email?: string
          sender_name?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          discount_applied: number
          id: string
          payment_id: string | null
          used_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          coupon_id: string
          discount_applied: number
          id?: string
          payment_id?: string | null
          used_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          coupon_id?: string
          discount_applied?: number
          id?: string
          payment_id?: string | null
          used_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          expires_at: string | null
          id: string
          max_uses: number | null
          per_user_limit: number
          status: Database["public"]["Enums"]["coupon_status"]
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          per_user_limit?: number
          status?: Database["public"]["Enums"]["coupon_status"]
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          per_user_limit?: number
          status?: Database["public"]["Enums"]["coupon_status"]
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      custom_sections: {
        Row: {
          content: string | null
          created_at: string
          display_order: number | null
          id: string
          portfolio_id: string
          title: string
          updated_at: string | null
          visibility: boolean
        }
        Insert: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          portfolio_id: string
          title: string
          updated_at?: string | null
          visibility?: boolean
        }
        Update: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          portfolio_id?: string
          title?: string
          updated_at?: string | null
          visibility?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "custom_sections_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          achievements: string[] | null
          company: string
          created_at: string
          description: string | null
          display_order: number | null
          employment_type: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          portfolio_id: string
          position: string
          published: boolean | null
          responsibilities: string[] | null
          role_summary: string | null
          start_date: string
          technologies_used: string[] | null
          updated_at: string | null
        }
        Insert: {
          achievements?: string[] | null
          company: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          portfolio_id: string
          position: string
          published?: boolean | null
          responsibilities?: string[] | null
          role_summary?: string | null
          start_date: string
          technologies_used?: string[] | null
          updated_at?: string | null
        }
        Update: {
          achievements?: string[] | null
          company?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          portfolio_id?: string
          position?: string
          published?: boolean | null
          responsibilities?: string[] | null
          role_summary?: string | null
          start_date?: string
          technologies_used?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          type: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          type: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          type?: string
          used_at?: string | null
        }
        Relationships: []
      }
      otp_rate_limits: {
        Row: {
          created_at: string
          email: string
          id: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          status: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_features: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          feature_key: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_key: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          feature_key?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_themes: {
        Row: {
          access_level: string
          created_at: string
          enabled: boolean
          id: string
          name: string
          theme_id: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          theme_id: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          theme_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_sections: {
        Row: {
          about_order: number | null
          certifications_order: number | null
          contact_order: number | null
          custom_sections_order: number | null
          experience_order: number | null
          hero_order: number | null
          id: string
          portfolio_id: string
          projects_order: number | null
          show_certifications: boolean | null
          show_contact: boolean | null
          show_experience: boolean | null
          show_projects: boolean | null
          show_skills: boolean | null
          skills_order: number | null
        }
        Insert: {
          about_order?: number | null
          certifications_order?: number | null
          contact_order?: number | null
          custom_sections_order?: number | null
          experience_order?: number | null
          hero_order?: number | null
          id?: string
          portfolio_id: string
          projects_order?: number | null
          show_certifications?: boolean | null
          show_contact?: boolean | null
          show_experience?: boolean | null
          show_projects?: boolean | null
          show_skills?: boolean | null
          skills_order?: number | null
        }
        Update: {
          about_order?: number | null
          certifications_order?: number | null
          contact_order?: number | null
          custom_sections_order?: number | null
          experience_order?: number | null
          hero_order?: number | null
          id?: string
          portfolio_id?: string
          projects_order?: number | null
          show_certifications?: boolean | null
          show_contact?: boolean | null
          show_experience?: boolean | null
          show_projects?: boolean | null
          show_skills?: boolean | null
          skills_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_sections_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: true
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_versions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          portfolio_id: string
          snapshot_data: Json
          workspace_id: string
        }
        Insert: {
          action_type?: string
          created_at?: string
          id?: string
          portfolio_id: string
          snapshot_data: Json
          workspace_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          portfolio_id?: string
          snapshot_data?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_versions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_versions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          avatar_url: string | null
          background_style: string
          behance_url: string | null
          bio: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          custom_social_label: string | null
          custom_social_url: string | null
          dribbble_url: string | null
          github_url: string | null
          hero_image_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          location: string | null
          medium_url: string | null
          og_image: string | null
          published: boolean
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          slug: string
          tagline: string | null
          theme: string
          title: string
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          workspace_id: string
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          background_style?: string
          behance_url?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_social_label?: string | null
          custom_social_url?: string | null
          dribbble_url?: string | null
          github_url?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          medium_url?: string | null
          og_image?: string | null
          published?: boolean
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug: string
          tagline?: string | null
          theme?: string
          title?: string
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          workspace_id: string
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          background_style?: string
          behance_url?: string | null
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          custom_social_label?: string | null
          custom_social_url?: string | null
          dribbble_url?: string | null
          github_url?: string | null
          hero_image_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          medium_url?: string | null
          og_image?: string | null
          published?: boolean
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          slug?: string
          tagline?: string | null
          theme?: string
          title?: string
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          workspace_id?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          email_verified: boolean | null
          full_name: string | null
          id: string
          last_device_os: string | null
          last_ip_address: string | null
          last_login_at: string | null
          last_user_agent: string | null
          status: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          last_device_os?: string | null
          last_ip_address?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          status?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          last_device_os?: string | null
          last_ip_address?: string | null
          last_login_at?: string | null
          last_user_agent?: string | null
          status?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          case_study_url: string | null
          category: string | null
          created_at: string
          demo_video_url: string | null
          description: string | null
          display_order: number | null
          end_date: string | null
          featured: boolean | null
          full_description: string | null
          gallery_images: string[] | null
          github_url: string | null
          id: string
          image_url: string | null
          key_achievements: string[] | null
          metrics: string | null
          portfolio_id: string
          problem_statement: string | null
          project_type: string | null
          project_url: string | null
          published: boolean | null
          role: string | null
          short_description: string | null
          solution_summary: string | null
          start_date: string | null
          status: string | null
          team_size: string | null
          technologies: string[] | null
          title: string
          tools_used: string[] | null
          updated_at: string | null
        }
        Insert: {
          case_study_url?: string | null
          category?: string | null
          created_at?: string
          demo_video_url?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          featured?: boolean | null
          full_description?: string | null
          gallery_images?: string[] | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          key_achievements?: string[] | null
          metrics?: string | null
          portfolio_id: string
          problem_statement?: string | null
          project_type?: string | null
          project_url?: string | null
          published?: boolean | null
          role?: string | null
          short_description?: string | null
          solution_summary?: string | null
          start_date?: string | null
          status?: string | null
          team_size?: string | null
          technologies?: string[] | null
          title: string
          tools_used?: string[] | null
          updated_at?: string | null
        }
        Update: {
          case_study_url?: string | null
          category?: string | null
          created_at?: string
          demo_video_url?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          featured?: boolean | null
          full_description?: string | null
          gallery_images?: string[] | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          key_achievements?: string[] | null
          metrics?: string | null
          portfolio_id?: string
          problem_statement?: string | null
          project_type?: string | null
          project_url?: string | null
          published?: boolean | null
          role?: string | null
          short_description?: string | null
          solution_summary?: string | null
          start_date?: string | null
          status?: string | null
          team_size?: string | null
          technologies?: string[] | null
          title?: string
          tools_used?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      showcase_portfolios: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_order: number | null
          experiences: Json | null
          id: string
          is_featured: boolean | null
          location: string | null
          preview_image_url: string | null
          projects: Json | null
          role_label: string | null
          skills: Json | null
          slug: string
          tagline: string | null
          theme: string
          title: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_order?: number | null
          experiences?: Json | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          preview_image_url?: string | null
          projects?: Json | null
          role_label?: string | null
          skills?: Json | null
          slug: string
          tagline?: string | null
          theme?: string
          title: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_order?: number | null
          experiences?: Json | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          preview_image_url?: string | null
          projects?: Json | null
          role_label?: string | null
          skills?: Json | null
          slug?: string
          tagline?: string | null
          theme?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          display_order: number | null
          id: string
          name: string
          portfolio_id: string
          proficiency: number | null
          published: boolean | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          portfolio_id: string
          proficiency?: number | null
          published?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          portfolio_id?: string
          proficiency?: number | null
          published?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string
          status: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string
          status?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          name: string
          onboarding_completed: boolean
          owner_id: string
          plan: Database["public"]["Enums"]["plan_type"]
          razorpay_customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          trial_end: string | null
          trial_start: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          name: string
          onboarding_completed?: boolean
          owner_id: string
          plan?: Database["public"]["Enums"]["plan_type"]
          razorpay_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean
          owner_id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          razorpay_customer_id?: string | null
          subscription_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: { Args: never; Returns: undefined }
      cleanup_otp_rate_limits: { Args: never; Returns: undefined }
      get_user_workspace_ids: { Args: { _user_id: string }; Returns: string[] }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      use_coupon: {
        Args: {
          p_coupon_id: string
          p_discount_applied: number
          p_payment_id: string
          p_user_id: string
          p_workspace_id: string
        }
        Returns: boolean
      }
      validate_coupon: {
        Args: {
          p_code: string
          p_plan_price: number
          p_user_id: string
          p_workspace_id: string
        }
        Returns: {
          coupon_id: string
          discount_amount: number
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          error_message: string
          final_amount: number
          valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "member"
      coupon_discount_type: "percentage" | "flat"
      coupon_status: "active" | "disabled" | "expired"
      plan_type: "free" | "starter" | "pro" | "enterprise"
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
      app_role: ["owner", "admin", "member"],
      coupon_discount_type: ["percentage", "flat"],
      coupon_status: ["active", "disabled", "expired"],
      plan_type: ["free", "starter", "pro", "enterprise"],
    },
  },
} as const
