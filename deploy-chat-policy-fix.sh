#!/bin/bash

# Quick fix deployment script for chat messages RLS policy
# This script helps deploy the fix for "Failed to send message" error

echo "=================================================="
echo "Chat Messages RLS Policy Fix Deployment"
echo "=================================================="
echo ""
echo "Issue: Support agents cannot send messages to customer sessions"
echo "Fix: Updated RLS policy to allow support agents to message ANY session"
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/migrations/20251204000002_fix_chat_messages_insert_policy.sql" ]; then
    echo "❌ Error: Migration file not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "📋 Deployment Options:"
echo ""
echo "Option 1: Deploy via Supabase Dashboard (RECOMMENDED)"
echo "  1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
echo "  2. Copy contents of: supabase/migrations/20251204000002_fix_chat_messages_insert_policy.sql"
echo "  3. Paste into SQL Editor"
echo "  4. Click 'Run'"
echo ""
echo "Option 2: Deploy via Supabase CLI"
echo "  Run: supabase db push"
echo ""

read -p "Have you deployed the migration? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ Great! Now let's verify the deployment..."
    echo ""
    echo "📋 Verification Steps:"
    echo ""
    echo "1. Run test queries in Supabase SQL Editor:"
    echo "   File: supabase/migrations/test_chat_messages_policy_fix.sql"
    echo ""
    echo "2. Check your user has support_agent role:"
    echo "   Go to: http://localhost:8080/admin/users"
    echo "   Grant 'support_agent' role to your user account"
    echo ""
    echo "3. Test in application:"
    echo "   a. Navigate to: http://localhost:8080/admin/support-console"
    echo "   b. Click on any customer chat session"
    echo "   c. Type a test message"
    echo "   d. Click 'Send'"
    echo "   e. Expected: ✅ Message sent successfully (green toast)"
    echo ""
    echo "=================================================="
    echo "📚 Documentation:"
    echo "   docs/CHAT_MESSAGES_POLICY_FIX.md"
    echo "=================================================="
    echo ""
    echo "✅ Deployment guide completed!"
else
    echo ""
    echo "📝 To deploy the fix:"
    echo ""
    echo "1. Open Supabase Dashboard SQL Editor"
    echo "2. Copy migration file: supabase/migrations/20251204000002_fix_chat_messages_insert_policy.sql"
    echo "3. Paste and run in SQL Editor"
    echo "4. Run this script again to continue"
    echo ""
fi
