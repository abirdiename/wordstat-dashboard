#!/usr/bin/env bash
# First-run deploy script for Yandex Cloud VM (Ubuntu 22.04).
# Run ON the VM as root (or via sudo).
set -euo pipefail

DOMAIN="b2b-ws-trends.ru"
DOMAIN_WWW="www.${DOMAIN}"
EMAIL="${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL env var required for Lets Encrypt}"
APP_DIR="/opt/wordstat-dashboard"

echo "==> 1/7 install docker + compose plugin"
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

echo "==> 2/7 clone or update repo"
if [[ ! -d "${APP_DIR}/.git" ]]; then
  git clone https://github.com/abirdiename/wordstat-dashboard.git "${APP_DIR}"
else
  git -C "${APP_DIR}" pull --ff-only
fi
cd "${APP_DIR}"

echo "==> 3/7 check .env"
if [[ ! -f .env ]]; then
  echo "ERROR: ${APP_DIR}/.env not found. Create it from .env.example with YANDEX_API_KEY and YANDEX_FOLDER_ID."
  exit 1
fi

echo "==> 4/7 bootstrap nginx (HTTP-only) for ACME challenge"
# Enable bootstrap (HTTP-only) config, disable the HTTPS one
mv -f nginx/conf.d/app.conf nginx/conf.d/app.conf.disabled 2>/dev/null || true

docker compose up -d app nginx
sleep 5

echo "==> 5/7 obtain Let's Encrypt cert (staging? set STAGING=1)"
STAGING_FLAG=""
[[ "${STAGING:-0}" == "1" ]] && STAGING_FLAG="--staging"

docker compose run --rm --entrypoint "" certbot \
  certbot certonly --webroot -w /var/www/certbot \
  ${STAGING_FLAG} \
  --email "${EMAIL}" \
  --agree-tos --no-eff-email \
  -d "${DOMAIN}" -d "${DOMAIN_WWW}"

echo "==> 6/7 switch nginx to HTTPS config"
mv -f nginx/conf.d/app.bootstrap.conf nginx/conf.d/app.bootstrap.conf.disabled
mv -f nginx/conf.d/app.conf.disabled nginx/conf.d/app.conf

docker compose restart nginx

echo "==> 7/7 start certbot auto-renew loop"
docker compose up -d certbot

echo
echo "[OK] Done. Open https://${DOMAIN}"
echo "  Logs:    docker compose logs -f app"
echo "  Restart: docker compose restart app"
