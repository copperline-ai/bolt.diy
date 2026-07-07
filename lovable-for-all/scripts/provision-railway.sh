#!/bin/bash
set -euo pipefail

# Provision Railway infrastructure for Lovable for All
# Requires: railway CLI authenticated (`railway login`)

PROJECT_NAME="hatchery-studio"

# Create project and link directory
cd "$(dirname "$0")/../apps/api"
railway init --name "$PROJECT_NAME"

# Provision PostgreSQL and Redis
railway add --database postgres
railway add --database redis

# Set required environment variables
railway variables set \
  BETTER_AUTH_SECRET="$(openssl rand -base64 32)" \
  ENCRYPTION_KEY="$(openssl rand -base64 32)" \
  GITHUB_CLIENT_ID="YOUR_GITHUB_CLIENT_ID" \
  GITHUB_CLIENT_SECRET="YOUR_GITHUB_CLIENT_SECRET" \
  GITHUB_APP_ID="YOUR_GITHUB_APP_ID" \
  GITHUB_APP_PRIVATE_KEY="YOUR_GITHUB_APP_PRIVATE_KEY" \
  GITHUB_APP_WEBHOOK_SECRET="YOUR_GITHUB_APP_WEBHOOK_SECRET" \
  GITHUB_APP_CLIENT_ID="YOUR_GITHUB_APP_CLIENT_ID" \
  GITHUB_APP_CLIENT_SECRET="YOUR_GITHUB_APP_CLIENT_SECRET" \
  RESEND_API_KEY="YOUR_RESEND_API_KEY" \
  EMAIL_FROM="noreply@hatcheryforall.com" \
  STRIPE_SECRET_KEY="sk_test_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  DAYTONA_API_KEY="YOUR_DAYTONA_API_KEY" \
  DAYTONA_API_URL="https://app.daytona.io/api" \
  VERCEL_AI_GATEWAY_TOKEN="YOUR_VERCEL_AI_GATEWAY_TOKEN" \
  VERCEL_AI_GATEWAY_BASE_URL="https://ai-gateway.vercel.sh/v1" \
  NEXT_PUBLIC_APP_URL="https://your-frontend-url.com" \
  NEXT_PUBLIC_API_URL="https://your-api-url.com"

echo "Railway provisioning complete."
echo "Next steps:"
echo "1. Replace placeholder env vars in Railway dashboard."
echo "2. Add DATABASE_URL and REDIS_URL reference variables from provisioned services."
echo "3. Deploy with: cd apps/api && railway up"
