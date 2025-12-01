#!/bin/bash

# Supabase Database Replication Script
# Usage: ./replicate-supabase.sh NEW_PROJECT_ID NEW_DB_PASSWORD

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
OLD_PROJECT_REF="qypazgkngxhazgkuevwq"
OLD_PROJECT_URL="https://qypazgkngxhazgkuevwq.supabase.co"

# Get arguments
NEW_PROJECT_REF="$1"
NEW_DB_PASSWORD="$2"

if [ -z "$NEW_PROJECT_REF" ] || [ -z "$NEW_DB_PASSWORD" ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: ./replicate-supabase.sh NEW_PROJECT_ID NEW_DB_PASSWORD"
    echo "Example: ./replicate-supabase.sh abcdefgh12345678 'your-db-password'"
    exit 1
fi

NEW_PROJECT_URL="https://$NEW_PROJECT_REF.supabase.co"

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Supabase Replication Tool${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "Old Project: ${YELLOW}$OLD_PROJECT_REF${NC}"
echo -e "New Project: ${YELLOW}$NEW_PROJECT_REF${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

# Check if user is logged in
echo -e "${YELLOW}Step 1: Checking Supabase CLI authentication...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}Please login to Supabase...${NC}"
    supabase login
fi
echo -e "${GREEN}✓ Authenticated${NC}"
echo ""

# Link to new project
echo -e "${YELLOW}Step 2: Linking to new project...${NC}"
if supabase link --project-ref "$NEW_PROJECT_REF" --password "$NEW_DB_PASSWORD"; then
    echo -e "${GREEN}✓ Linked to new project${NC}"
else
    echo -e "${RED}✗ Failed to link to project${NC}"
    exit 1
fi
echo ""

# Push migrations
echo -e "${YELLOW}Step 3: Pushing database migrations...${NC}"
echo "This will apply all 90 migration files to the new project"
if supabase db push; then
    echo -e "${GREEN}✓ Migrations applied successfully${NC}"
else
    echo -e "${RED}✗ Failed to push migrations${NC}"
    exit 1
fi
echo ""

# Ask if user wants to export data
echo -e "${YELLOW}Step 4: Data Export${NC}"
read -p "Do you want to export data from the old project? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -sp "Enter OLD project database password: " OLD_DB_PASSWORD
    echo ""
    
    echo -e "${YELLOW}Exporting data from old project...${NC}"
    OLD_DB_URL="postgresql://postgres:$OLD_DB_PASSWORD@db.$OLD_PROJECT_REF.supabase.co:5432/postgres"
    
    if supabase db dump --db-url "$OLD_DB_URL" --data-only -f backup_data.sql; then
        echo -e "${GREEN}✓ Data exported to backup_data.sql${NC}"
        
        echo -e "${YELLOW}Importing data to new project...${NC}"
        NEW_DB_URL="postgresql://postgres:$NEW_DB_PASSWORD@db.$NEW_PROJECT_REF.supabase.co:5432/postgres"
        
        if psql "$NEW_DB_URL" < backup_data.sql; then
            echo -e "${GREEN}✓ Data imported successfully${NC}"
        else
            echo -e "${RED}✗ Failed to import data${NC}"
            echo "The backup file is saved as backup_data.sql"
        fi
    else
        echo -e "${RED}✗ Failed to export data${NC}"
    fi
else
    echo -e "${YELLOW}Skipping data export${NC}"
fi
echo ""

# Ask if user wants to deploy functions
echo -e "${YELLOW}Step 5: Edge Functions${NC}"
read -p "Do you want to deploy Edge Functions to the new project? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deploying Edge Functions...${NC}"
    
    if [ -d "supabase/functions" ]; then
        # Get list of functions
        FUNCTIONS=$(ls -d supabase/functions/*/ 2>/dev/null | xargs -n 1 basename)
        
        if [ ! -z "$FUNCTIONS" ]; then
            for func in $FUNCTIONS; do
                echo -e "${YELLOW}Deploying $func...${NC}"
                if supabase functions deploy "$func" --project-ref "$NEW_PROJECT_REF"; then
                    echo -e "${GREEN}✓ $func deployed${NC}"
                else
                    echo -e "${RED}✗ Failed to deploy $func${NC}"
                fi
            done
        else
            echo -e "${YELLOW}No Edge Functions found${NC}"
        fi
    else
        echo -e "${YELLOW}No supabase/functions directory found${NC}"
    fi
else
    echo -e "${YELLOW}Skipping Edge Functions deployment${NC}"
fi
echo ""

# Generate new .env file
echo -e "${YELLOW}Step 6: Generating new environment configuration...${NC}"
read -p "Enter your new ANON/PUBLIC key: " NEW_ANON_KEY

cat > .env.new << EOF
# New Supabase Project Configuration
# Generated on $(date)

VITE_SUPABASE_PROJECT_ID="$NEW_PROJECT_REF"
VITE_SUPABASE_PUBLISHABLE_KEY="$NEW_ANON_KEY"
VITE_SUPABASE_URL="$NEW_PROJECT_URL"
OPENAI_API_KEY=\$OPENAI_API_KEY
EOF

echo -e "${GREEN}✓ New configuration saved to .env.new${NC}"
echo ""

# Update config.toml
echo -e "${YELLOW}Step 7: Updating supabase/config.toml...${NC}"
if [ -f "supabase/config.toml" ]; then
    cp supabase/config.toml supabase/config.toml.backup
    sed -i.bak "s/project_id = \"$OLD_PROJECT_REF\"/project_id = \"$NEW_PROJECT_REF\"/" supabase/config.toml
    rm supabase/config.toml.bak
    echo -e "${GREEN}✓ config.toml updated (backup saved as config.toml.backup)${NC}"
else
    echo -e "${YELLOW}No config.toml found${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Replication Complete!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the new .env.new file and replace .env when ready"
echo "2. Copy Storage buckets manually from Dashboard"
echo "3. Update Authentication settings in Dashboard:"
echo "   - Email templates"
echo "   - Auth providers (Google, GitHub, etc.)"
echo "   - URL configuration"
echo "4. Test your application with the new configuration"
echo "5. Update production environment variables"
echo ""
echo -e "${YELLOW}Important Files:${NC}"
echo "- New configuration: .env.new"
echo "- Old configuration backup: .env.backup"
echo "- Data backup: backup_data.sql (if exported)"
echo "- Config backup: supabase/config.toml.backup"
echo ""
echo -e "${YELLOW}Manual Steps Required:${NC}"
echo "✗ Storage buckets (copy from Dashboard)"
echo "✗ Authentication providers (configure in Dashboard)"
echo "✗ Email templates (copy from Dashboard)"
echo "✗ Custom domains (configure in Dashboard)"
echo ""
echo -e "${GREEN}Project URLs:${NC}"
echo "Old: $OLD_PROJECT_URL"
echo "New: $NEW_PROJECT_URL"
echo ""
