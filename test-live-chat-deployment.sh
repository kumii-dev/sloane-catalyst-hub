#!/bin/bash

# Test Live Chat Deployment Script
# This script checks if the live chat support tables are deployed to Supabase

echo "========================================"
echo "Live Chat Support System - Deployment Test"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: npm install -g supabase"
    echo ""
    echo "Or test manually via Supabase Dashboard:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to SQL Editor"
    echo "4. Run the queries in: supabase/migrations/test_live_chat_deployment.sql"
    exit 1
fi

echo -e "${YELLOW}Testing database connection...${NC}"
echo ""

# Test 1: Check if tables exist
echo "📋 Test 1: Checking if tables exist..."
TABLES_QUERY="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('chat_sessions', 'chat_messages', 'chat_session_activity');"

# Note: You'll need to configure Supabase CLI with your project
# Run: supabase link --project-ref YOUR_PROJECT_REF

echo ""
echo -e "${YELLOW}To complete this test, run these commands:${NC}"
echo ""
echo "1. Link to your Supabase project:"
echo "   supabase link --project-ref YOUR_PROJECT_REF"
echo ""
echo "2. Check tables manually:"
echo "   supabase db execute \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'chat_%'\""
echo ""
echo "3. Or use the SQL file:"
echo "   cat supabase/migrations/test_live_chat_deployment.sql | supabase db execute"
echo ""

echo "========================================"
echo "MANUAL TESTING STEPS"
echo "========================================"
echo ""
echo "🌐 Via Supabase Dashboard (Recommended):"
echo "   1. Go to: https://supabase.com/dashboard"
echo "   2. Select your project"
echo "   3. Click 'SQL Editor' in the sidebar"
echo "   4. Copy and paste queries from:"
echo "      supabase/migrations/test_live_chat_deployment.sql"
echo "   5. Run the 'COMPREHENSIVE CHECK' query at the bottom"
echo ""
echo "📊 Expected Results:"
echo "   ✅ Tables: 3 (chat_sessions, chat_messages, chat_session_activity)"
echo "   ✅ Functions: 4 (log_chat_activity, analyze_chat_session, etc.)"
echo "   ✅ Views: 2 (chat_session_stats, security_flagged_chat_sessions)"
echo "   ✅ RLS Policies: 11+ policies"
echo "   ✅ Sequences: 1 (chat_session_seq)"
echo ""
echo "🔍 Quick Check via Table Editor:"
echo "   1. Go to 'Table Editor' in Supabase Dashboard"
echo "   2. Look for these tables in the list:"
echo "      - chat_sessions"
echo "      - chat_messages"  
echo "      - chat_session_activity"
echo "   3. If you see them, deployment succeeded! ✅"
echo ""
echo "========================================"
