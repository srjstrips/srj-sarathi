#!/bin/bash
# SRJ Sarthi HRMS — VPS deploy script
# Run from repo root: bash scripts/deploy-vps.sh
# Safe to re-run. Does not touch other containers on the server.

set -e

APP_DIR="/opt/srj-sarthi"
REPO="https://github.com/YOUR_ORG/sarthi-webapp.git"  # update before first run

echo "=== [1/4] Clone / pull repo ==="
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "=== [2/4] Build & start all containers ==="
docker compose -f docker-compose.prod.yml -p srj_sarthi up -d --build

echo "=== [3/4] Wait for DB then run migrations ==="
sleep 8
docker exec srj_sarthi_api sh -c "npx prisma contract emit && npx prisma db migrate"

echo "=== [4/4] Status ==="
docker compose -f docker-compose.prod.yml -p srj_sarthi ps

echo ""
echo "✓ SRJ Sarthi API → http://$(hostname -I | awk '{print $1}'):3001"
echo ""
echo "Useful commands:"
echo "  docker logs srj_sarthi_api -f          — live API logs"
echo "  docker compose -f $APP_DIR/docker-compose.prod.yml -p srj_sarthi restart api  — restart API"
echo "  docker compose -f $APP_DIR/docker-compose.prod.yml -p srj_sarthi ps           — container status"
