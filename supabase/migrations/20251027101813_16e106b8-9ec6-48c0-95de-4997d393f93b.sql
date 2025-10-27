-- Comprehensive Indexing Strategy for Performance Optimization (Revised)
-- Only creating indexes for verified existing columns

-- =====================================================
-- MATCHING SYSTEM INDEXES
-- =====================================================

-- Mentor Matches: Optimize user match queries
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentee_user_id 
  ON mentor_matches(mentee_user_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentor_id 
  ON mentor_matches(mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_matches_composite 
  ON mentor_matches(mentee_user_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_matches_created 
  ON mentor_matches(created_at DESC);

-- Service Matches: Optimize service discovery
CREATE INDEX IF NOT EXISTS idx_service_matches_buyer_user_id 
  ON service_matches(buyer_user_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_service_matches_service_id 
  ON service_matches(service_id);

CREATE INDEX IF NOT EXISTS idx_service_matches_composite 
  ON service_matches(buyer_user_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_service_matches_created 
  ON service_matches(created_at DESC);

-- Funding Matches: Optimize funding opportunities
CREATE INDEX IF NOT EXISTS idx_funding_matches_startup_id 
  ON funding_matches(startup_id) 
  WHERE NOT is_dismissed;

CREATE INDEX IF NOT EXISTS idx_funding_matches_opportunity_id 
  ON funding_matches(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_funding_matches_composite 
  ON funding_matches(startup_id, is_viewed, is_dismissed, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_funding_matches_created 
  ON funding_matches(created_at DESC);

-- =====================================================
-- MESSAGING & COMMUNICATIONS INDEXES
-- =====================================================

-- Messages: Optimize inbox queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id_read 
  ON messages(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_entity 
  ON messages(related_entity_type, related_entity_id) 
  WHERE related_entity_id IS NOT NULL;

-- Conversation Participants: Optimize user conversations
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
  ON conversation_participants(user_id, is_archived, is_pinned, last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation 
  ON conversation_participants(conversation_id, user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_unread 
  ON conversation_participants(user_id, unread_count) 
  WHERE unread_count > 0;

-- =====================================================
-- MENTORSHIP SYSTEM INDEXES
-- =====================================================

-- Mentor Availability: Optimize availability queries
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor 
  ON mentor_availability(mentor_id, day_of_week, is_active);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_active 
  ON mentor_availability(is_active) 
  WHERE is_active = true;

-- Mentor Date Overrides: Optimize date lookups
CREATE INDEX IF NOT EXISTS idx_mentor_date_overrides_mentor 
  ON mentor_date_overrides(mentor_id, date);

-- Mentors: Optimize mentor discovery
CREATE INDEX IF NOT EXISTS idx_mentors_user_id 
  ON mentors(user_id);

CREATE INDEX IF NOT EXISTS idx_mentors_status 
  ON mentors(status, rating DESC);

-- =====================================================
-- CREDIT & FINANCIAL INDEXES
-- =====================================================

-- Credit Assessments: Optimize assessment queries
CREATE INDEX IF NOT EXISTS idx_credit_assessments_user 
  ON credit_assessments(user_id, status, assessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_assessments_startup 
  ON credit_assessments(startup_id, status);

CREATE INDEX IF NOT EXISTS idx_credit_assessments_shared 
  ON credit_assessments(consent_to_share, overall_score DESC) 
  WHERE consent_to_share = true AND status = 'completed';

-- Transactions: Optimize transaction history
CREATE INDEX IF NOT EXISTS idx_transactions_trader 
  ON transactions(trader_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_type 
  ON transactions(trader_id, txn_type, created_at DESC);

-- Credits Transactions: Optimize credits history
CREATE INDEX IF NOT EXISTS idx_credits_transactions_user 
  ON credits_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credits_transactions_type 
  ON credits_transactions(user_id, transaction_type, created_at DESC);

-- Business Scores: Optimize score lookups
CREATE INDEX IF NOT EXISTS idx_business_scores_trader 
  ON business_scores(trader_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_business_scores_tier 
  ON business_scores(credit_tier, score DESC);

-- Credits Wallet: Optimize wallet lookups
CREATE INDEX IF NOT EXISTS idx_credits_wallet_user 
  ON credits_wallet(user_id);

-- =====================================================
-- MARKETPLACE INDEXES
-- =====================================================

-- Services: Optimize service discovery
CREATE INDEX IF NOT EXISTS idx_services_provider 
  ON services(provider_id, is_active);

CREATE INDEX IF NOT EXISTS idx_services_category 
  ON services(category_id, is_active, is_featured DESC, rating DESC);

CREATE INDEX IF NOT EXISTS idx_services_active 
  ON services(is_active, rating DESC, total_reviews DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_featured 
  ON services(is_featured, created_at DESC) 
  WHERE is_featured = true;

-- User Subscriptions: Optimize subscription queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user 
  ON user_subscriptions(user_id, status, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_listing 
  ON user_subscriptions(listing_id, status);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active 
  ON user_subscriptions(user_id, expires_at) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_cohort 
  ON user_subscriptions(cohort_id) 
  WHERE cohort_id IS NOT NULL;

-- Service Categories: Optimize category lookups
CREATE INDEX IF NOT EXISTS idx_service_categories_parent 
  ON service_categories(parent_id, sort_order) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_categories_active 
  ON service_categories(is_active, sort_order) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_service_categories_slug 
  ON service_categories(slug) 
  WHERE is_active = true;

-- Listing Categories: Optimize category lookups
CREATE INDEX IF NOT EXISTS idx_listing_categories_parent 
  ON listing_categories(parent_id, sort_order) 
  WHERE parent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_categories_active 
  ON listing_categories(is_active, sort_order) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_listing_categories_slug 
  ON listing_categories(slug) 
  WHERE is_active = true;

-- =====================================================
-- FUNDING SYSTEM INDEXES
-- =====================================================

-- Funding Applications: Optimize application queries
CREATE INDEX IF NOT EXISTS idx_funding_applications_applicant 
  ON funding_applications(applicant_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_funding_applications_opportunity 
  ON funding_applications(opportunity_id, status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_funding_applications_startup 
  ON funding_applications(startup_id, status);

-- =====================================================
-- USER & PROFILE INDEXES
-- =====================================================

-- Profiles: Optimize profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_persona 
  ON profiles(persona_type) 
  WHERE persona_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- User Roles: Optimize role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user 
  ON user_roles(user_id, role);

CREATE INDEX IF NOT EXISTS idx_user_roles_role 
  ON user_roles(role);

-- Startup Profiles: Optimize startup queries
CREATE INDEX IF NOT EXISTS idx_startup_profiles_user 
  ON startup_profiles(user_id);

-- Funders: Optimize funder queries
CREATE INDEX IF NOT EXISTS idx_funders_user 
  ON funders(user_id);

CREATE INDEX IF NOT EXISTS idx_funders_verified 
  ON funders(is_verified) 
  WHERE is_verified = true;

-- Service Providers: Optimize provider queries
CREATE INDEX IF NOT EXISTS idx_service_providers_user 
  ON service_providers(user_id);

CREATE INDEX IF NOT EXISTS idx_service_providers_vetting 
  ON service_providers(vetting_status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_providers_verified 
  ON service_providers(is_verified) 
  WHERE is_verified = true;

-- File Shares: Optimize shared file queries
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with 
  ON file_shares(shared_with, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_file_shares_file 
  ON file_shares(file_id);

CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by 
  ON file_shares(shared_by);

-- Score Sharing: Optimize score access
CREATE INDEX IF NOT EXISTS idx_score_sharing_assessment 
  ON score_sharing(assessment_id);

CREATE INDEX IF NOT EXISTS idx_score_sharing_funder 
  ON score_sharing(funder_id, shared_at DESC);

-- =====================================================
-- NOTIFICATIONS & ACTIVITY INDEXES
-- =====================================================

-- Match Notifications: Optimize notification queries
CREATE INDEX IF NOT EXISTS idx_match_notifications_user 
  ON match_notifications(user_id, is_read, notification_sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_notifications_match 
  ON match_notifications(match_type, match_id);

-- =====================================================
-- COHORT SYSTEM INDEXES
-- =====================================================

-- Cohort Memberships: Optimize cohort queries
CREATE INDEX IF NOT EXISTS idx_cohort_memberships_user 
  ON cohort_memberships(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_cohort_memberships_cohort 
  ON cohort_memberships(cohort_id, is_active, joined_at DESC);

-- Cohort Funded Listings: Optimize cohort benefits
CREATE INDEX IF NOT EXISTS idx_cohort_funded_listings_cohort 
  ON cohort_funded_listings(cohort_id, is_active);

CREATE INDEX IF NOT EXISTS idx_cohort_funded_listings_listing 
  ON cohort_funded_listings(listing_id, is_active);

-- =====================================================
-- RESOURCES INDEXES
-- =====================================================

-- Resources: Optimize content discovery
CREATE INDEX IF NOT EXISTS idx_resources_category 
  ON resources(category_id, is_active, is_featured DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_access_level 
  ON resources(access_level, is_active, view_count DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_resources_type 
  ON resources(resource_type, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resources_featured 
  ON resources(is_featured, created_at DESC) 
  WHERE is_featured = true;

-- Resource Ratings: Optimize rating queries
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource 
  ON resource_ratings(resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_ratings_user 
  ON resource_ratings(user_id);

-- Resource Bookmarks: Optimize bookmark queries
CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_user 
  ON resource_bookmarks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_bookmarks_resource 
  ON resource_bookmarks(resource_id);

-- =====================================================
-- REVIEWS & RATINGS INDEXES
-- =====================================================

-- Listing Reviews: Optimize review queries
CREATE INDEX IF NOT EXISTS idx_listing_reviews_listing 
  ON listing_reviews(listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_reviews_user 
  ON listing_reviews(user_id);

-- =====================================================
-- MODEL STATES INDEXES (Financial Models)
-- =====================================================

-- Model States: Optimize model queries
CREATE INDEX IF NOT EXISTS idx_model_states_user 
  ON model_states(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_states_name 
  ON model_states(user_id, name);

-- =====================================================
-- REWARDS SYSTEM INDEXES
-- =====================================================

-- Rewards: Optimize rewards queries
CREATE INDEX IF NOT EXISTS idx_rewards_trader 
  ON rewards(trader_id);

CREATE INDEX IF NOT EXISTS idx_rewards_points 
  ON rewards(points DESC) 
  WHERE points > 0;

-- =====================================================
-- ANALYZE FOR PERFORMANCE
-- =====================================================

ANALYZE;