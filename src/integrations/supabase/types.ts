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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      advisor_availability: {
        Row: {
          advisor_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string
        }
        Insert: {
          advisor_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_availability_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_categories: {
        Row: {
          advisor_id: string
          category_id: string
          created_at: string
          id: string
        }
        Insert: {
          advisor_id: string
          category_id: string
          created_at?: string
          id?: string
        }
        Update: {
          advisor_id?: string
          category_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_categories_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_sessions: {
        Row: {
          advisor_id: string
          amount_paid: number | null
          client_user_id: string
          created_at: string
          duration_minutes: number
          id: string
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          session_type: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          advisor_id: string
          amount_paid?: number | null
          client_user_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          session_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          amount_paid?: number | null
          client_user_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          session_type?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_sessions_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "advisors"
            referencedColumns: ["id"]
          },
        ]
      }
      advisors: {
        Row: {
          approved_at: string | null
          bio: string | null
          company: string | null
          created_at: string
          expertise_areas: string[] | null
          hourly_rate: number | null
          id: string
          is_premium: boolean | null
          rating: number | null
          rejected_at: string | null
          rejection_reason: string | null
          search_vector: unknown
          specializations: string[] | null
          status: string | null
          title: string
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          vetting_status: string | null
          years_experience: number | null
        }
        Insert: {
          approved_at?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_premium?: boolean | null
          rating?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          search_vector?: unknown
          specializations?: string[] | null
          status?: string | null
          title: string
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          vetting_status?: string | null
          years_experience?: number | null
        }
        Update: {
          approved_at?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_premium?: boolean | null
          rating?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          search_vector?: unknown
          specializations?: string[] | null
          status?: string | null
          title?: string
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          vetting_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      api_key_usage: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown
          is_suspicious: boolean | null
          key_id: string | null
          method: string
          response_time_ms: number | null
          status_code: number | null
          suspicion_reasons: string[] | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: unknown
          is_suspicious?: boolean | null
          key_id?: string | null
          method: string
          response_time_ms?: number | null
          status_code?: number | null
          suspicion_reasons?: string[] | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown
          is_suspicious?: boolean | null
          key_id?: string | null
          method?: string
          response_time_ms?: number | null
          status_code?: number | null
          suspicion_reasons?: string[] | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_key_usage_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["key_id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string | null
          description: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          key_hash: string
          key_id: string
          last_used_at: string | null
          name: string
          prefix: string
          revoke_reason: string | null
          revoked_at: string | null
          scopes: string[]
          use_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_id: string
          last_used_at?: string | null
          name: string
          prefix: string
          revoke_reason?: string | null
          revoked_at?: string | null
          scopes: string[]
          use_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_id?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          scopes?: string[]
          use_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_context_log: {
        Row: {
          city: string | null
          country_code: string | null
          created_at: string | null
          device_fingerprint: string | null
          id: string
          ip_address: unknown
          is_impossible_travel: boolean | null
          is_new_device: boolean | null
          is_tor: boolean | null
          is_vpn: boolean | null
          isp: string | null
          login_velocity: number | null
          policy_decision: string | null
          policy_reason: string | null
          risk_factors: Json | null
          risk_level: string | null
          risk_score: number | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address: unknown
          is_impossible_travel?: boolean | null
          is_new_device?: boolean | null
          is_tor?: boolean | null
          is_vpn?: boolean | null
          isp?: string | null
          login_velocity?: number | null
          policy_decision?: string | null
          policy_reason?: string | null
          risk_factors?: Json | null
          risk_level?: string | null
          risk_score?: number | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          is_impossible_travel?: boolean | null
          is_new_device?: boolean | null
          is_tor?: boolean | null
          is_vpn?: boolean | null
          isp?: string | null
          login_velocity?: number | null
          policy_decision?: string | null
          policy_reason?: string | null
          risk_factors?: Json | null
          risk_level?: string | null
          risk_score?: number | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_events: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          event_category: string | null
          event_type: string
          geolocation: Json | null
          id: string
          ip_address: unknown
          metadata: Json | null
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_category?: string | null
          event_type: string
          geolocation?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_category?: string | null
          event_type?: string
          geolocation?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_scores: {
        Row: {
          calculated_at: string
          created_at: string
          credit_tier: string
          id: string
          score: number
          top_drivers: Json | null
          trader_id: string
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          credit_tier: string
          id?: string
          score: number
          top_drivers?: Json | null
          trader_id: string
        }
        Update: {
          calculated_at?: string
          created_at?: string
          credit_tier?: string
          id?: string
          score?: number
          top_drivers?: Json | null
          trader_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          ai_flag_reason: string | null
          ai_flagged: boolean | null
          attachments: Json | null
          created_at: string
          edited_at: string | null
          id: string
          ip_address: unknown
          is_edited: boolean | null
          is_internal: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          read_by: string | null
          sender_id: string
          sender_type: string
          sentiment_score: number | null
          session_id: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          ai_flag_reason?: string | null
          ai_flagged?: boolean | null
          attachments?: Json | null
          created_at?: string
          edited_at?: string | null
          id?: string
          ip_address?: unknown
          is_edited?: boolean | null
          is_internal?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          read_by?: string | null
          sender_id: string
          sender_type: string
          sentiment_score?: number | null
          session_id: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          ai_flag_reason?: string | null
          ai_flagged?: boolean | null
          attachments?: Json | null
          created_at?: string
          edited_at?: string | null
          id?: string
          ip_address?: unknown
          is_edited?: boolean | null
          is_internal?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          read_by?: string | null
          sender_id?: string
          sender_type?: string
          sentiment_score?: number | null
          session_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "security_flagged_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_session_activity: {
        Row: {
          activity_type: string
          actor_id: string | null
          actor_type: string
          created_at: string
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          activity_type: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_session_activity_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_session_activity_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "security_flagged_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          ai_detected_issues: Json | null
          ai_recommended_actions: Json | null
          ai_risk_score: number | null
          ai_sentiment: Json | null
          ai_summary: string | null
          analyzed_at: string | null
          analyzed_by: string | null
          archived_at: string | null
          assigned_at: string | null
          assigned_to: string | null
          category: string | null
          created_at: string
          customer_feedback: string | null
          customer_rating: number | null
          id: string
          ip_address: unknown
          is_analyzed: boolean | null
          is_archived: boolean | null
          last_activity_at: string
          linked_incident_id: string | null
          metadata: Json | null
          priority: string
          rated_at: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          security_flag_reason: string | null
          security_flagged: boolean | null
          session_number: string
          status: string
          updated_at: string
          user_agent: string | null
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          ai_detected_issues?: Json | null
          ai_recommended_actions?: Json | null
          ai_risk_score?: number | null
          ai_sentiment?: Json | null
          ai_summary?: string | null
          analyzed_at?: string | null
          analyzed_by?: string | null
          archived_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          customer_feedback?: string | null
          customer_rating?: number | null
          id?: string
          ip_address?: unknown
          is_analyzed?: boolean | null
          is_archived?: boolean | null
          last_activity_at?: string
          linked_incident_id?: string | null
          metadata?: Json | null
          priority?: string
          rated_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          security_flag_reason?: string | null
          security_flagged?: boolean | null
          session_number: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          ai_detected_issues?: Json | null
          ai_recommended_actions?: Json | null
          ai_risk_score?: number | null
          ai_sentiment?: Json | null
          ai_summary?: string | null
          analyzed_at?: string | null
          analyzed_by?: string | null
          archived_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          customer_feedback?: string | null
          customer_rating?: number | null
          id?: string
          ip_address?: unknown
          is_analyzed?: boolean | null
          is_archived?: boolean | null
          last_activity_at?: string
          linked_incident_id?: string | null
          metadata?: Json | null
          priority?: string
          rated_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          security_flag_reason?: string | null
          security_flagged?: boolean | null
          session_number?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      cohort_funded_listings: {
        Row: {
          cohort_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          listing_id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          listing_id: string
        }
        Update: {
          cohort_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_funded_listings_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_funded_listings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_memberships: {
        Row: {
          cohort_id: string
          id: string
          is_active: boolean | null
          joined_at: string | null
          user_id: string
        }
        Insert: {
          cohort_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          user_id: string
        }
        Update: {
          cohort_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_memberships_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string | null
          credits_allocated: number | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          sponsor_logo_url: string | null
          sponsor_name: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_allocated?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sponsor_logo_url?: string | null
          sponsor_name: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_allocated?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sponsor_logo_url?: string | null
          sponsor_name?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_edited: boolean | null
          message_type: string
          metadata: Json | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          message_type?: string
          metadata?: Json | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_edited?: boolean | null
          message_type?: string
          metadata?: Json | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_archived: boolean | null
          is_muted: boolean | null
          is_pinned: boolean | null
          joined_at: string
          last_read_at: string | null
          unread_count: number | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_archived?: boolean | null
          is_muted?: boolean | null
          is_pinned?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          unread_count?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_archived?: boolean | null
          is_muted?: boolean | null
          is_pinned?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          unread_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string
          created_at: string
          id: string
          last_message_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          conversation_type?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      credit_assessments: {
        Row: {
          ai_analysis: Json | null
          assessed_at: string | null
          assessment_data: Json | null
          business_profile_score: number | null
          compliance_score: number | null
          consent_timestamp: string | null
          consent_to_share: boolean | null
          created_at: string
          document_urls: Json | null
          domain_explanations: Json | null
          expires_at: string | null
          financial_health_score: number | null
          funding_eligibility_range: string | null
          governance_score: number | null
          growth_readiness_score: number | null
          id: string
          improvement_areas: string[] | null
          market_access_score: number | null
          operational_capacity_score: number | null
          overall_score: number | null
          recommendations: string[] | null
          repayment_behaviour_score: number | null
          risk_band: string | null
          score_explanation: string | null
          skills_score: number | null
          social_environmental_score: number | null
          startup_id: string
          status: Database["public"]["Enums"]["assessment_status"]
          technology_innovation_score: number | null
          trust_reputation_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          assessed_at?: string | null
          assessment_data?: Json | null
          business_profile_score?: number | null
          compliance_score?: number | null
          consent_timestamp?: string | null
          consent_to_share?: boolean | null
          created_at?: string
          document_urls?: Json | null
          domain_explanations?: Json | null
          expires_at?: string | null
          financial_health_score?: number | null
          funding_eligibility_range?: string | null
          governance_score?: number | null
          growth_readiness_score?: number | null
          id?: string
          improvement_areas?: string[] | null
          market_access_score?: number | null
          operational_capacity_score?: number | null
          overall_score?: number | null
          recommendations?: string[] | null
          repayment_behaviour_score?: number | null
          risk_band?: string | null
          score_explanation?: string | null
          skills_score?: number | null
          social_environmental_score?: number | null
          startup_id: string
          status?: Database["public"]["Enums"]["assessment_status"]
          technology_innovation_score?: number | null
          trust_reputation_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          assessed_at?: string | null
          assessment_data?: Json | null
          business_profile_score?: number | null
          compliance_score?: number | null
          consent_timestamp?: string | null
          consent_to_share?: boolean | null
          created_at?: string
          document_urls?: Json | null
          domain_explanations?: Json | null
          expires_at?: string | null
          financial_health_score?: number | null
          funding_eligibility_range?: string | null
          governance_score?: number | null
          growth_readiness_score?: number | null
          id?: string
          improvement_areas?: string[] | null
          market_access_score?: number | null
          operational_capacity_score?: number | null
          overall_score?: number | null
          recommendations?: string[] | null
          repayment_behaviour_score?: number | null
          risk_band?: string | null
          score_explanation?: string | null
          skills_score?: number | null
          social_environmental_score?: number | null
          startup_id?: string
          status?: Database["public"]["Enums"]["assessment_status"]
          technology_innovation_score?: number | null
          trust_reputation_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_assessments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credits_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2024_q1: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2024_q2: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2024_q3: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2024_q4: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2025_q1: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2025_q2: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2025_q3: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_2025_q4: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_default: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_transactions_old_backup: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits_wallet: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      csrf_tokens: {
        Row: {
          created_at: string | null
          csrf_token: string
          expires_at: string
          id: string
          is_used: boolean | null
          session_id: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          csrf_token: string
          expires_at: string
          id?: string
          is_used?: boolean | null
          session_id: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          csrf_token?: string
          expires_at?: string
          id?: string
          is_used?: boolean | null
          session_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "csrf_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      email_cohort_mappings: {
        Row: {
          cohort_id: string
          created_at: string
          created_by: string
          email: string
          id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          created_by: string
          email: string
          id?: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          created_by?: string
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_cohort_mappings_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          created_at: string
          event_id: string | null
          id: string
          registration_status: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          created_at?: string
          event_id?: string | null
          id?: string
          registration_status?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          created_at?: string
          event_id?: string | null
          id?: string
          registration_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_image_url: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_virtual: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          organizer_email: string | null
          organizer_name: string
          registration_deadline: string | null
          registration_required: boolean | null
          start_date: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_email?: string | null
          organizer_name: string
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_virtual?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          organizer_email?: string | null
          organizer_name?: string
          registration_deadline?: string | null
          registration_required?: boolean | null
          start_date?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      file_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          file_id: string
          id: string
          permission: string | null
          shared_by: string
          shared_with: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          file_id: string
          id?: string
          permission?: string | null
          shared_by: string
          shared_with: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          file_id?: string
          id?: string
          permission?: string | null
          shared_by?: string
          shared_with?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_shares_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: Database["public"]["Enums"]["file_category"] | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          folder: string | null
          id: string
          is_shared: boolean | null
          mime_type: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["file_category"] | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size: number
          folder?: string | null
          id?: string
          is_shared?: boolean | null
          mime_type: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["file_category"] | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          folder?: string | null
          id?: string
          is_shared?: boolean | null
          mime_type?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      funders: {
        Row: {
          created_at: string
          decision_timeline: string | null
          description: string | null
          focus_areas: string[] | null
          funding_model: string | null
          geographic_preferences: string[] | null
          id: string
          investment_criteria: string | null
          is_verified: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          max_funding_amount: number | null
          min_funding_amount: number | null
          organization_name: string
          organization_type: string | null
          preferred_industries:
            | Database["public"]["Enums"]["industry_type"][]
            | null
          preferred_stages:
            | Database["public"]["Enums"]["company_stage"][]
            | null
          sector_preferences: string[] | null
          sloane_credits_balance: number | null
          stage_preferences: string[] | null
          success_stories: string[] | null
          total_funded_amount: number | null
          total_funded_companies: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          decision_timeline?: string | null
          description?: string | null
          focus_areas?: string[] | null
          funding_model?: string | null
          geographic_preferences?: string[] | null
          id?: string
          investment_criteria?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          max_funding_amount?: number | null
          min_funding_amount?: number | null
          organization_name: string
          organization_type?: string | null
          preferred_industries?:
            | Database["public"]["Enums"]["industry_type"][]
            | null
          preferred_stages?:
            | Database["public"]["Enums"]["company_stage"][]
            | null
          sector_preferences?: string[] | null
          sloane_credits_balance?: number | null
          stage_preferences?: string[] | null
          success_stories?: string[] | null
          total_funded_amount?: number | null
          total_funded_companies?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          decision_timeline?: string | null
          description?: string | null
          focus_areas?: string[] | null
          funding_model?: string | null
          geographic_preferences?: string[] | null
          id?: string
          investment_criteria?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          max_funding_amount?: number | null
          min_funding_amount?: number | null
          organization_name?: string
          organization_type?: string | null
          preferred_industries?:
            | Database["public"]["Enums"]["industry_type"][]
            | null
          preferred_stages?:
            | Database["public"]["Enums"]["company_stage"][]
            | null
          sector_preferences?: string[] | null
          sloane_credits_balance?: number | null
          stage_preferences?: string[] | null
          success_stories?: string[] | null
          total_funded_amount?: number | null
          total_funded_companies?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      funding_applications: {
        Row: {
          applicant_id: string
          application_data: Json | null
          created_at: string
          funder_notes: string | null
          id: string
          opportunity_id: string
          requested_amount: number | null
          reviewed_at: string | null
          startup_id: string
          status: Database["public"]["Enums"]["application_status"] | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          application_data?: Json | null
          created_at?: string
          funder_notes?: string | null
          id?: string
          opportunity_id: string
          requested_amount?: number | null
          reviewed_at?: string | null
          startup_id: string
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          application_data?: Json | null
          created_at?: string
          funder_notes?: string | null
          id?: string
          opportunity_id?: string
          requested_amount?: number | null
          reviewed_at?: string | null
          startup_id?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "funding_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_applications_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_matches: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean | null
          is_viewed: boolean | null
          match_reasons: string[] | null
          match_score: number
          opportunity_id: string
          startup_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          match_reasons?: string[] | null
          match_score: number
          opportunity_id: string
          startup_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          match_reasons?: string[] | null
          match_score?: number
          opportunity_id?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_matches_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "funding_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_matches_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_opportunities: {
        Row: {
          amount_max: number | null
          amount_min: number | null
          application_deadline: string | null
          application_process: string | null
          approved_applications: number | null
          created_at: string
          description: string
          funder_id: string
          funding_type: Database["public"]["Enums"]["funding_type"]
          geographic_restrictions: string[] | null
          id: string
          industry_focus: Database["public"]["Enums"]["industry_type"][] | null
          min_credit_score: number | null
          requirements: string
          search_vector: unknown
          sloane_credits_allocation: number | null
          stage_requirements:
            | Database["public"]["Enums"]["company_stage"][]
            | null
          status: Database["public"]["Enums"]["funding_status"] | null
          tags: string[] | null
          title: string
          total_applications: number | null
          updated_at: string
        }
        Insert: {
          amount_max?: number | null
          amount_min?: number | null
          application_deadline?: string | null
          application_process?: string | null
          approved_applications?: number | null
          created_at?: string
          description: string
          funder_id: string
          funding_type: Database["public"]["Enums"]["funding_type"]
          geographic_restrictions?: string[] | null
          id?: string
          industry_focus?: Database["public"]["Enums"]["industry_type"][] | null
          min_credit_score?: number | null
          requirements: string
          search_vector?: unknown
          sloane_credits_allocation?: number | null
          stage_requirements?:
            | Database["public"]["Enums"]["company_stage"][]
            | null
          status?: Database["public"]["Enums"]["funding_status"] | null
          tags?: string[] | null
          title: string
          total_applications?: number | null
          updated_at?: string
        }
        Update: {
          amount_max?: number | null
          amount_min?: number | null
          application_deadline?: string | null
          application_process?: string | null
          approved_applications?: number | null
          created_at?: string
          description?: string
          funder_id?: string
          funding_type?: Database["public"]["Enums"]["funding_type"]
          geographic_restrictions?: string[] | null
          id?: string
          industry_focus?: Database["public"]["Enums"]["industry_type"][] | null
          min_credit_score?: number | null
          requirements?: string
          search_vector?: unknown
          sloane_credits_allocation?: number | null
          stage_requirements?:
            | Database["public"]["Enums"]["company_stage"][]
            | null
          status?: Database["public"]["Enums"]["funding_status"] | null
          tags?: string[] | null
          title?: string
          total_applications?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_opportunities_funder_id_fkey"
            columns: ["funder_id"]
            isOneToOne: false
            referencedRelation: "funders"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "listing_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          listing_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          listing_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          listing_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachments: Json | null
          available_slots: Json | null
          base_price: number | null
          capacity: number | null
          category_id: string | null
          cohort_visibility: string[] | null
          created_at: string | null
          credits_price: number | null
          delivery_mode: Database["public"]["Enums"]["delivery_mode"]
          description: string
          gallery_images: string[] | null
          id: string
          is_featured: boolean | null
          is_subscription: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          provider_id: string
          published_at: string | null
          rating: number | null
          search_vector: unknown
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["listing_status"] | null
          subscription_duration_days: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_reviews: number | null
          total_subscriptions: number | null
          updated_at: string | null
          visible_to_all: boolean | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          available_slots?: Json | null
          base_price?: number | null
          capacity?: number | null
          category_id?: string | null
          cohort_visibility?: string[] | null
          created_at?: string | null
          credits_price?: number | null
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          description: string
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_subscription?: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          provider_id: string
          published_at?: string | null
          rating?: number | null
          search_vector?: unknown
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          subscription_duration_days?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_reviews?: number | null
          total_subscriptions?: number | null
          updated_at?: string | null
          visible_to_all?: boolean | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json | null
          available_slots?: Json | null
          base_price?: number | null
          capacity?: number | null
          category_id?: string | null
          cohort_visibility?: string[] | null
          created_at?: string | null
          credits_price?: number | null
          delivery_mode?: Database["public"]["Enums"]["delivery_mode"]
          description?: string
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          is_subscription?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          provider_id?: string
          published_at?: string | null
          rating?: number | null
          search_vector?: unknown
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"] | null
          subscription_duration_days?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_reviews?: number | null
          total_subscriptions?: number | null
          updated_at?: string | null
          visible_to_all?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "listing_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      match_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          match_type: string
          notification_sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          match_type: string
          notification_sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          match_type?: string
          notification_sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          mentor_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          mentor_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          mentor_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_categories: {
        Row: {
          category_id: string
          mentor_id: string
        }
        Insert: {
          category_id: string
          mentor_id: string
        }
        Update: {
          category_id?: string
          mentor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mentoring_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_categories_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_date_overrides: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          is_available: boolean | null
          mentor_id: string
          start_time: string | null
        }
        Insert: {
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          mentor_id: string
          start_time?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          mentor_id?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_date_overrides_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_matches: {
        Row: {
          created_at: string
          id: string
          is_dismissed: boolean | null
          is_viewed: boolean | null
          match_reasons: string[] | null
          match_score: number
          mentee_user_id: string
          mentor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          match_reasons?: string[] | null
          match_score: number
          mentee_user_id: string
          mentor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          match_reasons?: string[] | null
          match_score?: number
          mentee_user_id?: string
          mentor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_matches_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      mentoring_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          meeting_link: string | null
          mentee_id: string
          mentor_id: string
          notes: string | null
          price: number | null
          scheduled_at: string | null
          session_completed_at: string | null
          session_started_at: string | null
          session_status: Database["public"]["Enums"]["session_status"]
          session_type: Database["public"]["Enums"]["session_type"]
          title: string
          updated_at: string
          video_room_name: string | null
          video_room_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          mentee_id: string
          mentor_id: string
          notes?: string | null
          price?: number | null
          scheduled_at?: string | null
          session_completed_at?: string | null
          session_started_at?: string | null
          session_status?: Database["public"]["Enums"]["session_status"]
          session_type: Database["public"]["Enums"]["session_type"]
          title: string
          updated_at?: string
          video_room_name?: string | null
          video_room_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          mentee_id?: string
          mentor_id?: string
          notes?: string | null
          price?: number | null
          scheduled_at?: string | null
          session_completed_at?: string | null
          session_started_at?: string | null
          session_status?: Database["public"]["Enums"]["session_status"]
          session_type?: Database["public"]["Enums"]["session_type"]
          title?: string
          updated_at?: string
          video_room_name?: string | null
          video_room_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          certifications: string[] | null
          company: string | null
          created_at: string
          experience_years: number | null
          expertise_areas: string[] | null
          hourly_rate: number | null
          id: string
          is_premium: boolean
          languages: string[] | null
          linkedin_url: string | null
          max_mentees: number | null
          mentoring_style: string | null
          platform_fee_percentage: number | null
          rating: number | null
          search_vector: unknown
          session_fee: number | null
          specializations: string[] | null
          status: Database["public"]["Enums"]["mentor_status"]
          success_stories: string[] | null
          title: string
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?: string[] | null
          company?: string | null
          created_at?: string
          experience_years?: number | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_premium?: boolean
          languages?: string[] | null
          linkedin_url?: string | null
          max_mentees?: number | null
          mentoring_style?: string | null
          platform_fee_percentage?: number | null
          rating?: number | null
          search_vector?: unknown
          session_fee?: number | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["mentor_status"]
          success_stories?: string[] | null
          title: string
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?: string[] | null
          company?: string | null
          created_at?: string
          experience_years?: number | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_premium?: boolean
          languages?: string[] | null
          linkedin_url?: string | null
          max_mentees?: number | null
          mentoring_style?: string | null
          platform_fee_percentage?: number | null
          rating?: number | null
          search_vector?: unknown
          session_fee?: number | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["mentor_status"]
          success_stories?: string[] | null
          title?: string
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2024_q1: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2024_q2: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2024_q3: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2024_q4: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2025_q1: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2025_q2: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2025_q3: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_2025_q4: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_default: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages_old_backup: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      model_states: {
        Row: {
          created_at: string
          id: string
          model_data: Json
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_data?: Json
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model_data?: Json
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      platform_documents: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          document_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          tags: string[] | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          document_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          industry_sectors: string[] | null
          interests: string[] | null
          is_active: boolean | null
          kyc_tier: Database["public"]["Enums"]["kyc_tier_type"] | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          onboarding_step: number | null
          organization: string | null
          persona_completed: boolean | null
          persona_type: Database["public"]["Enums"]["persona_type"] | null
          phone: string | null
          profile_completion_percentage: number | null
          profile_picture_url: string | null
          province: string | null
          search_vector: unknown
          skills: string[] | null
          twitter_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          industry_sectors?: string[] | null
          interests?: string[] | null
          is_active?: boolean | null
          kyc_tier?: Database["public"]["Enums"]["kyc_tier_type"] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_step?: number | null
          organization?: string | null
          persona_completed?: boolean | null
          persona_type?: Database["public"]["Enums"]["persona_type"] | null
          phone?: string | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          province?: string | null
          search_vector?: unknown
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          industry_sectors?: string[] | null
          interests?: string[] | null
          is_active?: boolean | null
          kyc_tier?: Database["public"]["Enums"]["kyc_tier_type"] | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          onboarding_step?: number | null
          organization?: string | null
          persona_completed?: boolean | null
          persona_type?: Database["public"]["Enums"]["persona_type"] | null
          phone?: string | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          province?: string | null
          search_vector?: unknown
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progressive_profile_data: {
        Row: {
          completed_at: string | null
          created_at: string | null
          field_name: string
          field_value: Json | null
          id: string
          persona_type: Database["public"]["Enums"]["persona_type"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          field_name: string
          field_value?: Json | null
          id?: string
          persona_type: Database["public"]["Enums"]["persona_type"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          field_name?: string
          field_value?: Json | null
          id?: string
          persona_type?: Database["public"]["Enums"]["persona_type"]
          user_id?: string
        }
        Relationships: []
      }
      resource_bookmarks: {
        Row: {
          created_at: string
          id: string
          resource_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookmarks_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resource_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          resource_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          resource_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          resource_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_progress_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_ratings: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          rating: number
          resource_id: string | null
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating: number
          resource_id?: string | null
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          rating?: number
          resource_id?: string | null
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_ratings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"] | null
          author_bio: string | null
          author_name: string | null
          category_id: string | null
          cohort_benefits: string | null
          content: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          download_count: number | null
          duration_minutes: number | null
          external_url: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          learning_outcomes: string[] | null
          prerequisites: string[] | null
          rating: number | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          search_vector: unknown
          slug: string
          sponsor_logo_url: string | null
          sponsor_name: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_ratings: number | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          author_bio?: string | null
          author_name?: string | null
          category_id?: string | null
          cohort_benefits?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          download_count?: number | null
          duration_minutes?: number | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          learning_outcomes?: string[] | null
          prerequisites?: string[] | null
          rating?: number | null
          resource_type: Database["public"]["Enums"]["resource_type"]
          search_vector?: unknown
          slug: string
          sponsor_logo_url?: string | null
          sponsor_name?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_ratings?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          author_bio?: string | null
          author_name?: string | null
          category_id?: string | null
          cohort_benefits?: string | null
          content?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          download_count?: number | null
          duration_minutes?: number | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          learning_outcomes?: string[] | null
          prerequisites?: string[] | null
          rating?: number | null
          resource_type?: Database["public"]["Enums"]["resource_type"]
          search_vector?: unknown
          slug?: string
          sponsor_logo_url?: string | null
          sponsor_name?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_ratings?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "resource_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number
          points: number
          trader_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points?: number
          trader_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number
          points?: number
          trader_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          funder_id: string
          id: string
          name: string
          search_criteria: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          funder_id: string
          id?: string
          name: string
          search_criteria: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          funder_id?: string
          id?: string
          name?: string
          search_criteria?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_funder_id_fkey"
            columns: ["funder_id"]
            isOneToOne: false
            referencedRelation: "funders"
            referencedColumns: ["id"]
          },
        ]
      }
      score_sharing: {
        Row: {
          access_level: string
          assessment_id: string
          created_at: string
          expires_at: string | null
          funder_id: string | null
          id: string
          shared_at: string
          viewed_at: string | null
        }
        Insert: {
          access_level?: string
          assessment_id: string
          created_at?: string
          expires_at?: string | null
          funder_id?: string | null
          id?: string
          shared_at?: string
          viewed_at?: string | null
        }
        Update: {
          access_level?: string
          assessment_id?: string
          created_at?: string
          expires_at?: string | null
          funder_id?: string | null
          id?: string
          shared_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_sharing_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "credit_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_sharing_funder_id_fkey"
            columns: ["funder_id"]
            isOneToOne: false
            referencedRelation: "funders"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_criteria: {
        Row: {
          category: Database["public"]["Enums"]["scoring_category"]
          created_at: string
          criteria_name: string
          description: string | null
          id: string
          is_active: boolean
          max_points: number
          updated_at: string
          weight: number
        }
        Insert: {
          category: Database["public"]["Enums"]["scoring_category"]
          created_at?: string
          criteria_name: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_points?: number
          updated_at?: string
          weight?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["scoring_category"]
          created_at?: string
          criteria_name?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_points?: number
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      security_events: {
        Row: {
          description: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          description?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          description?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_matches: {
        Row: {
          buyer_user_id: string
          created_at: string
          id: string
          is_dismissed: boolean | null
          is_viewed: boolean | null
          match_reasons: string[] | null
          match_score: number
          service_id: string
          updated_at: string
        }
        Insert: {
          buyer_user_id: string
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          match_reasons?: string[] | null
          match_score: number
          service_id: string
          updated_at?: string
        }
        Update: {
          buyer_user_id?: string
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_viewed?: boolean | null
          match_reasons?: string[] | null
          match_score?: number
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_matches_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          approved_at: string | null
          business_registration_number: string | null
          case_studies_url: string | null
          company_name: string
          company_size: string | null
          contact_email: string | null
          contact_person: string | null
          created_at: string
          description: string | null
          id: string
          implementation_timeline: string | null
          is_cohort_partner: boolean | null
          is_verified: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          phone: string | null
          pricing_models: string[] | null
          proof_document_url: string | null
          rating: number | null
          rejected_at: string | null
          reviewed_by: string | null
          service_categories: string[] | null
          submitted_at: string | null
          support_offered: string[] | null
          target_industries: string[] | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          vetting_notes: string | null
          vetting_status: string | null
          website: string | null
        }
        Insert: {
          approved_at?: string | null
          business_registration_number?: string | null
          case_studies_url?: string | null
          company_name: string
          company_size?: string | null
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          id?: string
          implementation_timeline?: string | null
          is_cohort_partner?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          phone?: string | null
          pricing_models?: string[] | null
          proof_document_url?: string | null
          rating?: number | null
          rejected_at?: string | null
          reviewed_by?: string | null
          service_categories?: string[] | null
          submitted_at?: string | null
          support_offered?: string[] | null
          target_industries?: string[] | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          vetting_notes?: string | null
          vetting_status?: string | null
          website?: string | null
        }
        Update: {
          approved_at?: string | null
          business_registration_number?: string | null
          case_studies_url?: string | null
          company_name?: string
          company_size?: string | null
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          description?: string | null
          id?: string
          implementation_timeline?: string | null
          is_cohort_partner?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          phone?: string | null
          pricing_models?: string[] | null
          proof_document_url?: string | null
          rating?: number | null
          rejected_at?: string | null
          reviewed_by?: string | null
          service_categories?: string[] | null
          submitted_at?: string | null
          support_offered?: string[] | null
          target_industries?: string[] | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          vetting_notes?: string | null
          vetting_status?: string | null
          website?: string | null
        }
        Relationships: []
      }
      service_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_verified_purchase: boolean | null
          rating: number
          service_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          service_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          service_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_subscriptions: {
        Row: {
          created_at: string
          credits_used: number | null
          expires_at: string | null
          id: string
          service_id: string
          started_at: string
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number | null
          expires_at?: string | null
          id?: string
          service_id: string
          started_at?: string
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number | null
          expires_at?: string | null
          id?: string
          service_id?: string
          started_at?: string
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          banner_image_url: string | null
          base_price: number | null
          category_id: string
          cohort_benefits: string | null
          created_at: string
          credits_price: number | null
          demo_url: string | null
          description: string
          documentation_url: string | null
          gallery_images: string[] | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          key_features: string[] | null
          name: string
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          provider_id: string
          rating: number | null
          search_vector: unknown
          service_type: Database["public"]["Enums"]["service_type"]
          short_description: string | null
          target_industries: string[] | null
          terms_url: string | null
          total_reviews: number | null
          total_subscribers: number | null
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          base_price?: number | null
          category_id: string
          cohort_benefits?: string | null
          created_at?: string
          credits_price?: number | null
          demo_url?: string | null
          description: string
          documentation_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          key_features?: string[] | null
          name: string
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          provider_id: string
          rating?: number | null
          search_vector?: unknown
          service_type: Database["public"]["Enums"]["service_type"]
          short_description?: string | null
          target_industries?: string[] | null
          terms_url?: string | null
          total_reviews?: number | null
          total_subscribers?: number | null
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          base_price?: number | null
          category_id?: string
          cohort_benefits?: string | null
          created_at?: string
          credits_price?: number | null
          demo_url?: string | null
          description?: string
          documentation_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          key_features?: string[] | null
          name?: string
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          provider_id?: string
          rating?: number | null
          search_vector?: unknown
          service_type?: Database["public"]["Enums"]["service_type"]
          short_description?: string | null
          target_industries?: string[] | null
          terms_url?: string | null
          total_reviews?: number | null
          total_subscribers?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      session_reviews: {
        Row: {
          created_at: string
          id: string
          rating: number
          review_text: string | null
          reviewee_id: string
          reviewer_id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          reviewee_id: string
          reviewer_id: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewee_id?: string
          reviewer_id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_profiles: {
        Row: {
          annual_revenue: number | null
          business_age: string | null
          business_model: string | null
          business_registration_number: string | null
          challenges: string[] | null
          company_name: string
          competitive_advantage: string | null
          consent_data_sharing: boolean | null
          created_at: string
          credit_score: number | null
          description: string | null
          employee_count_range: string | null
          founded_year: number | null
          funding_amount_needed: string | null
          funding_history: string | null
          funding_needed: number | null
          funding_needs: string | null
          growth_stage: string | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          key_products_services: string[] | null
          location: string | null
          logo_url: string | null
          market_access_needs: string[] | null
          revenue_range: string | null
          search_vector: unknown
          stage: Database["public"]["Enums"]["company_stage"]
          support_needed: string[] | null
          target_market: string | null
          team_size: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          annual_revenue?: number | null
          business_age?: string | null
          business_model?: string | null
          business_registration_number?: string | null
          challenges?: string[] | null
          company_name: string
          competitive_advantage?: string | null
          consent_data_sharing?: boolean | null
          created_at?: string
          credit_score?: number | null
          description?: string | null
          employee_count_range?: string | null
          founded_year?: number | null
          funding_amount_needed?: string | null
          funding_history?: string | null
          funding_needed?: number | null
          funding_needs?: string | null
          growth_stage?: string | null
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          key_products_services?: string[] | null
          location?: string | null
          logo_url?: string | null
          market_access_needs?: string[] | null
          revenue_range?: string | null
          search_vector?: unknown
          stage: Database["public"]["Enums"]["company_stage"]
          support_needed?: string[] | null
          target_market?: string | null
          team_size?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          annual_revenue?: number | null
          business_age?: string | null
          business_model?: string | null
          business_registration_number?: string | null
          challenges?: string[] | null
          company_name?: string
          competitive_advantage?: string | null
          consent_data_sharing?: boolean | null
          created_at?: string
          credit_score?: number | null
          description?: string | null
          employee_count_range?: string | null
          founded_year?: number | null
          funding_amount_needed?: string | null
          funding_history?: string | null
          funding_needed?: number | null
          funding_needs?: string | null
          growth_stage?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          key_products_services?: string[] | null
          location?: string | null
          logo_url?: string | null
          market_access_needs?: string[] | null
          revenue_range?: string | null
          search_vector?: unknown
          stage?: Database["public"]["Enums"]["company_stage"]
          support_needed?: string[] | null
          target_market?: string | null
          team_size?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      status_notifications_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          edited_at: string | null
          id: string
          ip_address: unknown
          is_edited: boolean | null
          is_internal: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          read_by: string | null
          sender_id: string
          sender_type: string
          ticket_id: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          edited_at?: string | null
          id?: string
          ip_address?: unknown
          is_edited?: boolean | null
          is_internal?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          read_by?: string | null
          sender_id: string
          sender_type: string
          ticket_id: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          edited_at?: string | null
          id?: string
          ip_address?: unknown
          is_edited?: boolean | null
          is_internal?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          read_by?: string | null
          sender_id?: string
          sender_type?: string
          ticket_id?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_activity: {
        Row: {
          activity_type: string
          actor_id: string | null
          actor_type: string
          created_at: string
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          ticket_id: string
          user_agent: string | null
        }
        Insert: {
          activity_type: string
          actor_id?: string | null
          actor_type: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
          user_agent?: string | null
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_activity_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          archived_at: string | null
          assigned_at: string | null
          assigned_to: string | null
          category: string
          created_at: string
          customer_feedback: string | null
          customer_rating: number | null
          id: string
          ip_address: unknown
          is_archived: boolean | null
          last_activity_at: string
          metadata: Json | null
          priority: string
          rated_at: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_agent: string | null
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          archived_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          category: string
          created_at?: string
          customer_feedback?: string | null
          customer_rating?: number | null
          id?: string
          ip_address?: unknown
          is_archived?: boolean | null
          last_activity_at?: string
          metadata?: Json | null
          priority?: string
          rated_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_agent?: string | null
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          archived_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          customer_feedback?: string | null
          customer_rating?: number | null
          id?: string
          ip_address?: unknown
          is_archived?: boolean | null
          last_activity_at?: string
          metadata?: Json | null
          priority?: string
          rated_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_agent?: string | null
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      token_fingerprints: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          first_used_at: string
          id: string
          ip_address: unknown
          is_revoked: boolean | null
          last_used_at: string | null
          revoke_reason: string | null
          revoked_at: string | null
          token_id: string
          unique_devices: string[] | null
          unique_ips: string[] | null
          use_count: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          first_used_at: string
          id?: string
          ip_address: unknown
          is_revoked?: boolean | null
          last_used_at?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          token_id: string
          unique_devices?: string[] | null
          unique_ips?: string[] | null
          use_count?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          first_used_at?: string
          id?: string
          ip_address?: unknown
          is_revoked?: boolean | null
          last_used_at?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          token_id?: string
          unique_devices?: string[] | null
          unique_ips?: string[] | null
          use_count?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      token_usage_events: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          endpoint: string | null
          id: string
          ip_address: unknown
          is_suspicious: boolean | null
          suspicion_reasons: string[] | null
          suspicion_score: number | null
          token_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          endpoint?: string | null
          id?: string
          ip_address: unknown
          is_suspicious?: boolean | null
          suspicion_reasons?: string[] | null
          suspicion_score?: number | null
          token_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          endpoint?: string | null
          id?: string
          ip_address?: unknown
          is_suspicious?: boolean | null
          suspicion_reasons?: string[] | null
          suspicion_score?: number | null
          token_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2024_q1: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2024_q2: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2024_q3: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2024_q4: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2025_q1: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2025_q2: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2025_q3: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_2025_q4: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_default: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      transactions_old_backup: {
        Row: {
          amount: number
          channel: Database["public"]["Enums"]["channel_type"]
          created_at: string
          description: string | null
          id: string
          provenance: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id: string
          txn_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          channel?: Database["public"]["Enums"]["channel_type"]
          created_at?: string
          description?: string | null
          id?: string
          provenance?: Json | null
          trader_id?: string
          txn_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity_at: string | null
          mfa_verified: boolean | null
          risk_level: string | null
          session_id: string
          terminated_at: string | null
          termination_reason: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          ip_address: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          mfa_verified?: boolean | null
          risk_level?: string | null
          session_id: string
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity_at?: string | null
          mfa_verified?: boolean | null
          risk_level?: string | null
          session_id?: string
          terminated_at?: string | null
          termination_reason?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount_paid: number | null
          auto_renew: boolean | null
          cohort_id: string | null
          created_at: string | null
          credits_used: number | null
          expires_at: string | null
          id: string
          listing_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          paystack_reference: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          auto_renew?: boolean | null
          cohort_id?: string | null
          created_at?: string | null
          credits_used?: number | null
          expires_at?: string | null
          id?: string
          listing_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          paystack_reference?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          auto_renew?: boolean | null
          cohort_id?: string | null
          created_at?: string | null
          credits_used?: number | null
          expires_at?: string | null
          id?: string
          listing_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          paystack_reference?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      chat_session_stats: {
        Row: {
          active_sessions: number | null
          analyzed_count: number | null
          avg_rating: number | null
          avg_resolution_time_minutes: number | null
          avg_risk_score: number | null
          closed_sessions: number | null
          resolved_sessions: number | null
          security_flagged_count: number | null
          sessions_last_24h: number | null
          sessions_last_7d: number | null
          waiting_sessions: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          first_name: string | null
          last_name: string | null
          organization: string | null
          persona_type: Database["public"]["Enums"]["persona_type"] | null
          profile_picture_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          organization?: string | null
          persona_type?: Database["public"]["Enums"]["persona_type"] | null
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          last_name?: string | null
          organization?: string | null
          persona_type?: Database["public"]["Enums"]["persona_type"] | null
          profile_picture_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_flagged_chat_sessions: {
        Row: {
          ai_detected_issues: Json | null
          ai_risk_score: number | null
          created_at: string | null
          id: string | null
          last_message_at: string | null
          linked_incident_id: string | null
          message_count: number | null
          resolved_at: string | null
          security_flag_reason: string | null
          session_number: string | null
          user_email: string | null
          user_name: string | null
        }
        Relationships: []
      }
      support_ticket_stats: {
        Row: {
          avg_rating: number | null
          avg_resolution_time_hours: number | null
          closed_tickets: number | null
          high_priority_tickets: number | null
          in_progress_tickets: number | null
          open_tickets: number | null
          resolved_tickets: number | null
          tickets_last_24h: number | null
          tickets_last_7d: number | null
          urgent_tickets: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      analyze_chat_session: {
        Args: {
          p_ai_detected_issues?: Json
          p_ai_recommended_actions?: Json
          p_ai_risk_score?: number
          p_ai_sentiment?: Json
          p_ai_summary: string
          p_analyzer_id: string
          p_session_id: string
        }
        Returns: boolean
      }
      archive_old_tickets: { Args: never; Returns: number }
      assign_ticket: {
        Args: { p_actor_id: string; p_assignee_id: string; p_ticket_id: string }
        Returns: boolean
      }
      calculate_funding_match_score: {
        Args: { funder_id_param: string; startup_id_param: string }
        Returns: number
      }
      calculate_mentor_match_score: {
        Args: { mentee_user_id_param: string; mentor_id_param: string }
        Returns: number
      }
      calculate_service_match_score: {
        Args: { buyer_user_id_param: string; service_id_param: string }
        Returns: number
      }
      cleanup_expired_csrf_tokens: { Args: never; Returns: number }
      cleanup_expired_sessions: { Args: never; Returns: number }
      cleanup_expired_tokens: { Args: never; Returns: number }
      cleanup_old_auth_events: { Args: never; Returns: number }
      create_direct_conversation: {
        Args: { p_title: string; p_user1: string; p_user2: string }
        Returns: string
      }
      create_quarterly_partition: {
        Args: { start_date: string; table_name: string }
        Returns: undefined
      }
      deduct_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      delete_old_archived_tickets: { Args: never; Returns: number }
      flag_chat_security: {
        Args: {
          p_create_incident?: boolean
          p_flag_reason: string
          p_flagged_by: string
          p_session_id: string
        }
        Returns: string
      }
      generate_mentor_matches_for_user: {
        Args: { user_id_param: string }
        Returns: number
      }
      get_active_queries: {
        Args: never
        Returns: {
          duration_seconds: number
          pid: number
          query_text: string
          state: string
          wait_event: string
        }[]
      }
      get_active_sessions: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          device_fingerprint: string
          ip_address: unknown
          last_activity_at: string
          mfa_verified: boolean
          session_id: string
        }[]
      }
      get_database_stats: {
        Args: never
        Returns: {
          category: string
          stat_name: string
          stat_value: string
        }[]
      }
      get_index_usage: {
        Args: never
        Returns: {
          index_name: string
          index_size: string
          scans: number
          schema_name: string
          table_name: string
          tuples_read: number
          usage_status: string
        }[]
      }
      get_other_participant_profiles: {
        Args: { p_conversation_id: string }
        Returns: {
          bio: string
          first_name: string
          last_name: string
          organization: string
          persona_type: Database["public"]["Enums"]["persona_type"]
          profile_picture_url: string
          user_id: string
        }[]
      }
      get_partition_stats: {
        Args: never
        Returns: {
          last_vacuum: string
          partition_name: string
          row_count: number
          status: string
          table_size: string
        }[]
      }
      get_table_bloat: {
        Args: never
        Returns: {
          bloat_pct: number
          bloat_size: string
          recommendation: string
          schema_name: string
          table_name: string
        }[]
      }
      get_table_statistics: {
        Args: never
        Returns: {
          dead_rows: number
          indexes_size: string
          last_analyze: string
          last_vacuum: string
          live_rows: number
          schema_name: string
          table_name: string
          table_size: string
          total_size: string
        }[]
      }
      has_funder_assessment_access: {
        Args: { _assessment_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_advisor: {
        Args: { _advisor_id: string; _user_id: string }
        Returns: boolean
      }
      is_assessment_owner: {
        Args: { _assessment_id: string; _user_id: string }
        Returns: boolean
      }
      is_cohort_member: {
        Args: { _cohort_id: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_funder: {
        Args: { _funder_id: string; _user_id: string }
        Returns: boolean
      }
      is_listing_owner: {
        Args: { _listing_id: string; _user_id: string }
        Returns: boolean
      }
      is_mentor: {
        Args: { _mentor_id: string; _user_id: string }
        Returns: boolean
      }
      is_opportunity_funder: {
        Args: { _opportunity_id: string; _user_id: string }
        Returns: boolean
      }
      is_service_provider: {
        Args: { _provider_id: string; _user_id: string }
        Returns: boolean
      }
      is_startup_owner: {
        Args: { _startup_id: string; _user_id: string }
        Returns: boolean
      }
      log_auth_event: {
        Args: {
          p_event_category: string
          p_event_type: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_severity: string
          p_user_id: string
        }
        Returns: string
      }
      log_chat_activity: {
        Args: {
          p_activity_type: string
          p_actor_id: string
          p_actor_type: string
          p_description?: string
          p_new_value?: string
          p_old_value?: string
          p_session_id: string
        }
        Returns: string
      }
      log_ticket_activity: {
        Args: {
          p_activity_type: string
          p_actor_id: string
          p_actor_type: string
          p_description?: string
          p_new_value?: string
          p_old_value?: string
          p_ticket_id: string
        }
        Returns: string
      }
      recalculate_mentor_rating: {
        Args: { p_mentor_user_id: string }
        Returns: {
          new_rating: number
          total_reviews: number
        }[]
      }
      revoke_token: {
        Args: { p_reason?: string; p_token_id: string }
        Returns: boolean
      }
      search_all: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          description: string
          rank: number
          result_id: string
          result_type: string
          title: string
        }[]
      }
      terminate_session: {
        Args: { p_reason?: string; p_session_id: string }
        Returns: boolean
      }
      update_ticket_status: {
        Args: { p_actor_id: string; p_new_status: string; p_ticket_id: string }
        Returns: boolean
      }
    }
    Enums: {
      access_level: "public" | "registered" | "cohort_only" | "premium"
      app_role:
        | "admin"
        | "startup"
        | "smme"
        | "mentor"
        | "advisor"
        | "funder"
        | "service_provider"
        | "software_provider"
        | "software_provider_pending"
        | "mentorship_admin"
        | "support_agent"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "withdrawn"
      assessment_status: "draft" | "in_progress" | "completed" | "reviewed"
      channel_type: "app" | "ussd" | "sms" | "whatsapp" | "qr" | "cash"
      company_stage:
        | "idea"
        | "pre_seed"
        | "seed"
        | "series_a"
        | "series_b"
        | "growth"
        | "established"
      delivery_mode: "hybrid" | "online" | "in_person"
      file_category:
        | "pitch_deck"
        | "financial_statement"
        | "contract"
        | "legal_document"
        | "business_plan"
        | "report"
        | "presentation"
        | "other"
      funding_status: "draft" | "active" | "closed" | "paused"
      funding_type:
        | "grant"
        | "loan"
        | "vc"
        | "angel"
        | "bank_product"
        | "accelerator"
        | "competition"
      industry_type:
        | "fintech"
        | "healthtech"
        | "edtech"
        | "agritech"
        | "cleantech"
        | "retail"
        | "manufacturing"
        | "services"
        | "other"
      kyc_tier_type: "none" | "lite" | "full"
      listing_status:
        | "draft"
        | "pending_approval"
        | "active"
        | "paused"
        | "rejected"
      listing_type:
        | "software"
        | "ancillary"
        | "mentorship"
        | "funding"
        | "training"
        | "event"
        | "other"
      mentor_status: "available" | "busy" | "unavailable"
      payment_method: "paystack" | "credits" | "sponsored"
      persona_type:
        | "unassigned"
        | "smme_startup"
        | "job_seeker"
        | "funder"
        | "service_provider"
        | "mentor_advisor"
        | "public_private_entity"
      pricing_type:
        | "free"
        | "freemium"
        | "paid"
        | "credits_only"
        | "contact_for_pricing"
      resource_type:
        | "article"
        | "template"
        | "video"
        | "course"
        | "tool"
        | "calculator"
        | "checklist"
        | "case_study"
        | "guide"
        | "webinar"
        | "podcast"
      scoring_category:
        | "financial_health"
        | "governance"
        | "skills"
        | "market_access"
        | "compliance"
        | "growth_readiness"
      service_type: "subscription" | "one_time" | "session_based" | "custom"
      session_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      session_type: "free" | "premium"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      transaction_type:
        | "sale"
        | "expense"
        | "deposit"
        | "withdrawal"
        | "supplier_purchase"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      access_level: ["public", "registered", "cohort_only", "premium"],
      app_role: [
        "admin",
        "startup",
        "smme",
        "mentor",
        "advisor",
        "funder",
        "service_provider",
        "software_provider",
        "software_provider_pending",
        "mentorship_admin",
        "support_agent",
      ],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "withdrawn",
      ],
      assessment_status: ["draft", "in_progress", "completed", "reviewed"],
      channel_type: ["app", "ussd", "sms", "whatsapp", "qr", "cash"],
      company_stage: [
        "idea",
        "pre_seed",
        "seed",
        "series_a",
        "series_b",
        "growth",
        "established",
      ],
      delivery_mode: ["hybrid", "online", "in_person"],
      file_category: [
        "pitch_deck",
        "financial_statement",
        "contract",
        "legal_document",
        "business_plan",
        "report",
        "presentation",
        "other",
      ],
      funding_status: ["draft", "active", "closed", "paused"],
      funding_type: [
        "grant",
        "loan",
        "vc",
        "angel",
        "bank_product",
        "accelerator",
        "competition",
      ],
      industry_type: [
        "fintech",
        "healthtech",
        "edtech",
        "agritech",
        "cleantech",
        "retail",
        "manufacturing",
        "services",
        "other",
      ],
      kyc_tier_type: ["none", "lite", "full"],
      listing_status: [
        "draft",
        "pending_approval",
        "active",
        "paused",
        "rejected",
      ],
      listing_type: [
        "software",
        "ancillary",
        "mentorship",
        "funding",
        "training",
        "event",
        "other",
      ],
      mentor_status: ["available", "busy", "unavailable"],
      payment_method: ["paystack", "credits", "sponsored"],
      persona_type: [
        "unassigned",
        "smme_startup",
        "job_seeker",
        "funder",
        "service_provider",
        "mentor_advisor",
        "public_private_entity",
      ],
      pricing_type: [
        "free",
        "freemium",
        "paid",
        "credits_only",
        "contact_for_pricing",
      ],
      resource_type: [
        "article",
        "template",
        "video",
        "course",
        "tool",
        "calculator",
        "checklist",
        "case_study",
        "guide",
        "webinar",
        "podcast",
      ],
      scoring_category: [
        "financial_health",
        "governance",
        "skills",
        "market_access",
        "compliance",
        "growth_readiness",
      ],
      service_type: ["subscription", "one_time", "session_based", "custom"],
      session_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      session_type: ["free", "premium"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      transaction_type: [
        "sale",
        "expense",
        "deposit",
        "withdrawal",
        "supplier_purchase",
      ],
    },
  },
} as const
