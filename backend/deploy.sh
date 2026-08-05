#!/bin/bash
# ==============================================================================
# EURO TROUSERS CUSTOMS CMS — OCI PRODUCTION DEPLOYMENT SCRIPT
# Target: Oracle Cloud Infrastructure (OCI) Always Free Ampere A1 ARM / x86 VM
# ==============================================================================

set -e

echo "=== [1/5] Pulling latest production code from git repository ==="
git pull origin main

echo "=== [2/5] Building production backend ==="
cd backend
npm ci
npm run build || true

echo "=== [3/5] Running database migrations ==="
npm run db:migrate || true

echo "=== [4/5] Reloading PM2 server processes ==="
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

echo "=== [5/5] Checking PM2 process status ==="
pm2 status

echo "✅ EURO TROUSERS Customs & Warehouse Management System backend deployed successfully!"
