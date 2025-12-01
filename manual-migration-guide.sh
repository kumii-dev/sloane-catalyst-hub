#!/bin/bash

# Manual Migration Script for Supabase Dashboard
# Since CLI connection is failing, use this to apply migrations manually via SQL Editor

echo "====================================="
echo "Manual Migration Guide for Supabase"
echo "====================================="
echo ""
echo "The Supabase CLI is having connection issues (likely IPv6/network restrictions)."
echo "Follow these steps to apply migrations manually:"
echo ""
echo "1. Open Supabase Dashboard: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj"
echo "2. Go to: SQL Editor (left sidebar)"
echo "3. Click 'New Query'"
echo "4. Copy and paste each migration file content below (in order)"
echo "5. Click 'Run' for each migration"
echo ""
echo "====================================="
echo "Migration Files (in order):"
echo "====================================="
echo ""

# List all pending migrations in order
counter=1
for file in supabase/migrations/202510*.sql supabase/migrations/202511*.sql; do
    if [ -f "$file" ]; then
        echo "$counter. $(basename $file)"
        counter=$((counter + 1))
    fi
done

echo ""
echo "====================================="
echo "Quick Apply Commands:"
echo "====================================="
echo ""
echo "Option A: Copy each file and paste into SQL Editor manually"
echo ""
echo "Option B: Generate a single combined migration file:"
echo ""
echo "Run this command to create a single file with all migrations:"
echo ""
echo "cat supabase/migrations/*.sql > combined_migration.sql"
echo ""
echo "Then copy the contents of combined_migration.sql to SQL Editor"
echo ""
echo "====================================="
echo "Recommended Approach:"
echo "====================================="
echo ""
echo "1. Open the project in Supabase Dashboard"
echo "2. Check if the database is active (green dot)"
echo "3. If paused, click 'Resume' or 'Restore'"
echo "4. Wait 2-3 minutes for it to fully start"
echo "5. Use SQL Editor to apply migrations"
echo ""
echo "Project URL: https://supabase.com/dashboard/project/zdenlybzgnphsrsvtufj/editor"
echo ""

# Try to generate combined migration file
echo "Generating combined migration file..."
cat supabase/migrations/*.sql > combined_migrations.sql 2>/dev/null

if [ -f "combined_migrations.sql" ]; then
    line_count=$(wc -l < combined_migrations.sql)
    echo "✓ Created: combined_migrations.sql ($line_count lines)"
    echo ""
    echo "You can now:"
    echo "1. Open combined_migrations.sql"
    echo "2. Copy all contents (Cmd+A, Cmd+C)"
    echo "3. Paste into Supabase SQL Editor"
    echo "4. Click Run"
else
    echo "✗ Failed to create combined file"
fi

echo ""
echo "====================================="
