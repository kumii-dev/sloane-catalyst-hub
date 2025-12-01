#!/bin/bash

echo "Checking for missing migrations..."
echo ""

# Get list of all migration files
echo "Total migration files in repository:"
ls -1 supabase/migrations/*.sql | wc -l

echo ""
echo "Migrations applied in database: 71"
echo ""
echo "Missing migrations (need to check which ones):"
echo ""

# Extract just the version numbers from filenames
for file in supabase/migrations/*.sql; do
    basename "$file" | cut -d'_' -f1
done | sort > /tmp/all_migrations.txt

echo "Run this SQL query in Supabase Dashboard to see which migrations are applied:"
echo ""
echo "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;"
echo ""
echo "Then compare with the file listing above to find missing ones."
