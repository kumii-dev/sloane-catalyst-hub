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
      credit_assessments: {
        Row: {
          assessed_at: string | null
          assessment_data: Json | null
          compliance_score: number | null
          consent_timestamp: string | null
          consent_to_share: boolean | null
          created_at: string
          expires_at: string | null
          financial_health_score: number | null
          governance_score: number | null
          growth_readiness_score: number | null
          id: string
          improvement_areas: string[] | null
          market_access_score: number | null
          overall_score: number | null
          recommendations: string[] | null
          skills_score: number | null
          startup_id: string
          status: Database["public"]["Enums"]["assessment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          assessed_at?: string | null
          assessment_data?: Json | null
          compliance_score?: number | null
          consent_timestamp?: string | null
          consent_to_share?: boolean | null
          created_at?: string
          expires_at?: string | null
          financial_health_score?: number | null
          governance_score?: number | null
          growth_readiness_score?: number | null
          id?: string
          improvement_areas?: string[] | null
          market_access_score?: number | null
          overall_score?: number | null
          recommendations?: string[] | null
          skills_score?: number | null
          startup_id: string
          status?: Database["public"]["Enums"]["assessment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          assessed_at?: string | null
          assessment_data?: Json | null
          compliance_score?: number | null
          consent_timestamp?: string | null
          consent_to_share?: boolean | null
          created_at?: string
          expires_at?: string | null
          financial_health_score?: number | null
          governance_score?: number | null
          growth_readiness_score?: number | null
          id?: string
          improvement_areas?: string[] | null
          market_access_score?: number | null
          overall_score?: number | null
          recommendations?: string[] | null
          skills_score?: number | null
          startup_id?: string
          status?: Database["public"]["Enums"]["assessment_status"]
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
      funders: {
        Row: {
          created_at: string
          description: string | null
          focus_areas: string[] | null
          id: string
          is_verified: boolean | null
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
          sloane_credits_balance: number | null
          total_funded_amount: number | null
          total_funded_companies: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          is_verified?: boolean | null
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
          sloane_credits_balance?: number | null
          total_funded_amount?: number | null
          total_funded_companies?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          id?: string
          is_verified?: boolean | null
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
          sloane_credits_balance?: number | null
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
          session_status: Database["public"]["Enums"]["session_status"]
          session_type: Database["public"]["Enums"]["session_type"]
          title: string
          updated_at: string
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
          session_status?: Database["public"]["Enums"]["session_status"]
          session_type: Database["public"]["Enums"]["session_type"]
          title: string
          updated_at?: string
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
          session_status?: Database["public"]["Enums"]["session_status"]
          session_type?: Database["public"]["Enums"]["session_type"]
          title?: string
          updated_at?: string
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
          company: string | null
          created_at: string
          experience_years: number | null
          expertise_areas: string[] | null
          hourly_rate: number | null
          id: string
          is_premium: boolean
          rating: number | null
          status: Database["public"]["Enums"]["mentor_status"]
          title: string
          total_sessions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          experience_years?: number | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_premium?: boolean
          rating?: number | null
          status?: Database["public"]["Enums"]["mentor_status"]
          title: string
          total_sessions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          experience_years?: number | null
          expertise_areas?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_premium?: boolean
          rating?: number | null
          status?: Database["public"]["Enums"]["mentor_status"]
          title?: string
          total_sessions?: number | null
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
          last_name: string | null
          profile_picture_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_picture_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_picture_url?: string | null
          updated_at?: string
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
      service_providers: {
        Row: {
          company_name: string
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          is_cohort_partner: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          phone: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_cohort_partner?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_cohort_partner?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          phone?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
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
      startup_profiles: {
        Row: {
          annual_revenue: number | null
          company_name: string
          consent_data_sharing: boolean | null
          created_at: string
          credit_score: number | null
          description: string | null
          founded_year: number | null
          funding_needed: number | null
          id: string
          industry: Database["public"]["Enums"]["industry_type"]
          location: string | null
          logo_url: string | null
          stage: Database["public"]["Enums"]["company_stage"]
          team_size: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          annual_revenue?: number | null
          company_name: string
          consent_data_sharing?: boolean | null
          created_at?: string
          credit_score?: number | null
          description?: string | null
          founded_year?: number | null
          funding_needed?: number | null
          id?: string
          industry: Database["public"]["Enums"]["industry_type"]
          location?: string | null
          logo_url?: string | null
          stage: Database["public"]["Enums"]["company_stage"]
          team_size?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          annual_revenue?: number | null
          company_name?: string
          consent_data_sharing?: boolean | null
          created_at?: string
          credit_score?: number | null
          description?: string | null
          founded_year?: number | null
          funding_needed?: number | null
          id?: string
          industry?: Database["public"]["Enums"]["industry_type"]
          location?: string | null
          logo_url?: string | null
          stage?: Database["public"]["Enums"]["company_stage"]
          team_size?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
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
      access_level: "public" | "registered" | "cohort_only" | "premium"
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
      mentor_status: "available" | "busy" | "unavailable"
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
      session_status: "pending" | "confirmed" | "completed" | "cancelled"
      session_type: "free" | "premium"
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
      mentor_status: ["available", "busy", "unavailable"],
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
      session_status: ["pending", "confirmed", "completed", "cancelled"],
      session_type: ["free", "premium"],
    },
  },
} as const
