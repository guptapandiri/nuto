#!/usr/bin/env bash
set -euo pipefail

# Deploy the API to Cloud Run. Netlify hosts the Vite storefront separately.
# The database URL stays in Secret Manager and is never copied into an image
# or command log.
PROJECT_ID="${PROJECT_ID:-nuto-cashews}"
REGION="${REGION:-asia-south1}"
SERVICE="${SERVICE:-nuto-storefront}"
SECRET_NAME="${SECRET_NAME:-nuto-database-url}"
FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-}"

if ! gcloud secrets describe "$SECRET_NAME" --project "$PROJECT_ID" >/dev/null 2>&1; then
  echo "Missing Secret Manager secret: $SECRET_NAME" >&2
  echo "Create it with the DATABASE_URL value before deploying." >&2
  exit 1
fi

gcloud run deploy "$SERVICE" \
  --quiet \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --source . \
  --allow-unauthenticated \
  --set-secrets "DATABASE_URL=${SECRET_NAME}:latest" \
  --set-env-vars "NODE_ENV=production,API_ONLY=true${FRONTEND_ORIGIN:+,ALLOWED_ORIGINS=$FRONTEND_ORIGIN}" \
  --port 8080 \
  --min 0 \
  --max 10

URL="$(gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')"

echo "API deployed: $URL"
echo "Health check: $URL/api/health"
echo "Set Netlify VITE_API_URL to: $URL"
if [[ -z "$FRONTEND_ORIGIN" ]]; then
  echo "Then set Cloud Run ALLOWED_ORIGINS to your Netlify origin before testing the frontend." >&2
fi
