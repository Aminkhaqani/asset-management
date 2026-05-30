#!/bin/bash
set -e

echo "🔧 Generating Prisma Client..."
npx prisma generate

# Only push DB schema if DATABASE_URL is set (Vercel provides it during build)
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Pushing database schema..."
  npx prisma db push --accept-data-loss 2>&1 || echo "⚠️ DB push failed, continuing build..."
else
  echo "⚠️ DATABASE_URL not set, skipping DB push"
fi

echo "🏗️ Building Next.js..."
npx next build
