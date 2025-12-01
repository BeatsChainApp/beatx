#!/bin/bash

# Supabase Migration Deployment Script
# Run this in your Supabase SQL editor

echo "🗄️  Deploying BeatsChain Database Schema to Supabase..."

# Copy migration content to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    cat migrations/combined_migrations.sql | pbcopy
    echo "✅ Migration SQL copied to clipboard"
    echo "📋 Paste this in your Supabase SQL editor: https://supabase.com/dashboard/project/zgdxpsenxjwyiwbbealf/sql"
fi

# Instructions
echo ""
echo "🔧 MANUAL STEPS REQUIRED:"
echo "========================"
echo "1. Go to: https://supabase.com/dashboard/project/zgdxpsenxjwyiwbbealf/sql"
echo "2. Paste the migration SQL (copied to clipboard)"
echo "3. Click 'Run' to execute the migrations"
echo "4. Verify tables are created in the Table Editor"
echo ""
echo "📋 Migration SQL:"
echo "=================="
cat migrations/combined_migrations.sql
