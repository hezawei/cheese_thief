#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# ── Check prerequisites ──
if ! command -v docker &>/dev/null; then
  echo "❌ Docker not found. Please install Docker first."
  exit 1
fi

if ! docker compose version &>/dev/null && ! docker-compose version &>/dev/null; then
  echo "❌ Docker Compose not found. Please install Docker Compose."
  exit 1
fi

# Use 'docker compose' (v2) or fall back to 'docker-compose' (v1)
COMPOSE="docker compose"
if ! docker compose version &>/dev/null; then
  COMPOSE="docker-compose"
fi

# ── Check env file ──
if [ ! -f .env.production ]; then
  echo "❌ .env.production not found. Copy and edit the template:"
  echo "   cp .env.production.example .env.production"
  exit 1
fi

echo "🔨 Building images..."
$COMPOSE build

echo "🚀 Starting services..."
$COMPOSE up -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "   Game URL:   http://<your-server-ip>:${WEB_PORT:-9527}"
echo "   Health:     http://<your-server-ip>:${WEB_PORT:-9527}/health"
echo ""
echo "   Logs:       cd deploy && $COMPOSE logs -f"
echo "   Stop:       cd deploy && $COMPOSE down"
echo "   Rebuild:    cd deploy && $COMPOSE up -d --build"
