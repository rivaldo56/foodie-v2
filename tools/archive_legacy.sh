#!/bin/bash
# archive_legacy.sh - Moves inactive/zombie apps and legacy scripts to /archive/

set -e

ARCHIVE_DIR="archive"
LEGACY_APPS_DIR="$ARCHIVE_DIR/legacy_apps"
LEGACY_SQL_DIR="$ARCHIVE_DIR/legacy_sql"

echo "🚀 Starting legacy archival process..."

# Create directories
mkdir -p "$LEGACY_APPS_DIR"
mkdir -p "$LEGACY_SQL_DIR"

# Zombie Apps
ZOMBIE_APPS=("farmers" "kitchen" "market" "recipes")

for app in "${ZOMBIE_APPS[@]}"; do
    if [ -d "$app" ]; then
        echo "📁 Archiving zombie app: $app"
        mv "$app" "$LEGACY_APPS_DIR/"
    else
        echo "⚠️  App $app not found, skipping."
    fi
done

# Legacy SQL/Scripts
LEGACY_SCRIPTS=("final_alignment.sql" "inspect_db.sql" "direct_schema_update.sql" "supabase_restore.sql")

for script in "${LEGACY_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "📄 Archiving legacy script: $script"
        mv "$script" "$LEGACY_SQL_DIR/"
    else
        echo "⚠️  Script $script not found, skipping."
    fi
done

echo "✅ Archival complete. Files are now in $ARCHIVE_DIR/"
