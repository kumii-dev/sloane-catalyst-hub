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
  public: {
    Tables: {
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
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
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
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          industry_sectors: string[] | null
          interests: string[] | null
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
          skills: string[] | null
          twitter_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          industry_sectors?: string[] | null
          interests?: string[] | null
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
          skills?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          industry_sectors?: string[] | null
          interests?: string[] | null
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
      create_direct_conversation: {
        Args: { p_title: string; p_user1: string; p_user2: string }
        Returns: string
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
      generate_mentor_matches_for_user: {
        Args: { user_id_param: string }
        Returns: number
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
      is_assessment_owner: {
        Args: { _assessment_id: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      recalculate_mentor_rating: {
        Args: { p_mentor_user_id: string }
        Returns: {
          new_rating: number
          total_reviews: number
        }[]
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
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "withdrawn"
      assessment_status: "draft" | "in_progress" | "completed" | "reviewed"
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
    },
  },
} as const
