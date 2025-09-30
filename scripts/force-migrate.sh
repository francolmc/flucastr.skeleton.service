#!/bin/bash
# Force migration script for production deployment
# This script will reset the database and migrate

echo "🔧 Force resetting database and applying migrations..."

# Drop all tables and reset
pnpm prisma db push --force-reset --accept-data-loss

# Verify the migration
if [ $? -eq 0 ]; then
    echo "✅ Database migration successful"
    echo "🚀 Starting application..."
    pnpm start:prod
else
    echo "❌ Database migration failed"
    exit 1
fi