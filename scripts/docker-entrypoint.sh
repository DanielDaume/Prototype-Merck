#!/bin/sh
set -e

# Avoid npx writing under a missing /home/nextjs
export HOME="${HOME:-/tmp}"

echo "[ai-agent-central] Waiting for PostgreSQL..."
i=0
until node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.\$connect().then(()=>p.\$disconnect()).catch(e=>{console.error(e);process.exit(1)})" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[ai-agent-central] Database not reachable after 30 attempts."
    exit 1
  fi
  sleep 2
done

echo "[ai-agent-central] Pushing schema and seeding (idempotent wipe+seed)..."
./node_modules/.bin/prisma db push --skip-generate
./node_modules/.bin/tsx prisma/seed.ts

echo "[ai-agent-central] Starting application..."
exec npm start
