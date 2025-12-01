#!/bin/bash

# Generate Remaining Migrations Script
# This creates a migration file with only the unapplied migrations

echo "====================================="
echo "Generate Remaining Migrations"
echo "====================================="
echo ""
echo "First, run check_migrations.sql in Supabase SQL Editor to find the last applied migration."
echo ""
read -p "Enter the last applied migration version (e.g., 20251006092014): " LAST_VERSION

if [ -z "$LAST_VERSION" ]; then
    echo "Error: No version provided"
    exit 1
fi

echo ""
echo "Generating migrations starting after: $LAST_VERSION"
echo ""

OUTPUT_FILE="remaining_migrations.sql"

# Clear output file
> "$OUTPUT_FILE"

# Add header
cat >> "$OUTPUT_FILE" << 'EOF'
-- Remaining Migrations to Apply
-- These migrations have not yet been applied to the database
-- Generated: $(date)

EOF

# Find and concatenate migrations after the specified version
count=0
for file in supabase/migrations/*.sql; do
    filename=$(basename "$file")
    version="${filename%%_*}"
    
    # Compare versions (simple string comparison works for timestamp format)
    if [[ "$version" > "$LAST_VERSION" ]]; then
        echo "Including: $filename"
        echo "" >> "$OUTPUT_FILE"
        echo "-- ============================================" >> "$OUTPUT_FILE"
        echo "-- Migration: $filename" >> "$OUTPUT_FILE"
        echo "-- ============================================" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        count=$((count + 1))
    fi
done

echo ""
echo "====================================="
echo "✓ Generated: $OUTPUT_FILE"
echo "✓ Included $count migration files"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Review remaining_migrations.sql"
echo "2. Copy contents to Supabase SQL Editor"
echo "3. Run the migrations"
echo ""

# Also create a list file
echo "$count migrations need to be applied:" > remaining_migrations_list.txt
for file in supabase/migrations/*.sql; do
    filename=$(basename "$file")
    version="${filename%%_*}"
    if [[ "$version" > "$LAST_VERSION" ]]; then
        echo "- $filename" >> remaining_migrations_list.txt
    fi
done

echo "✓ Also created: remaining_migrations_list.txt"
