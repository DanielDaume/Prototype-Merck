#!/bin/sh
set -e

mkdir -p /app/data

if [ ! -f /app/data/.seeded ]; then
  echo "[ai-agent-central] Initializing SQLite from baked seed database..."
  cp /app/prisma/seed.db /app/data/dev.db
  touch /app/data/.seeded
  echo "[ai-agent-central] Database ready."
else
  echo "[ai-agent-central] Existing database found — skipping seed copy."
fi

exec npm start
