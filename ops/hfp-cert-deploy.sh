#!/bin/sh

set -eu

CONFIG_FILE="${CONFIG_FILE:-/opt/hfp/etc/hfp-runtime.conf}"
if [ -f "$CONFIG_FILE" ]; then
  # shellcheck disable=SC1090
  . "$CONFIG_FILE"
fi

DOMAIN="${DOMAIN:-hfp.kopavogur.is}"
CERT_DIR="${CERT_DIR:-/srv/hfp-certs/live/$DOMAIN}"
CERT_FILE="${CERT_FILE:-$CERT_DIR/fullchain.pem}"
KEY_FILE="${KEY_FILE:-$CERT_DIR/privkey.pem}"
API_CONTAINER="${API_CONTAINER:-${API_CONTAINER_NAME:-hfpapi}}"
CLIENT_CONTAINER="${CLIENT_CONTAINER:-${CLIENT_CONTAINER_NAME:-hfpclient}}"
API_URL="${API_URL:-https://127.0.0.1:4000/}"
CLIENT_URL="${CLIENT_URL:-https://127.0.0.1/}"

require_file() {
  if [ ! -r "$1" ]; then
    echo "Required file is missing or unreadable: $1" >&2
    exit 1
  fi
}

wait_for_https() {
  url="$1"
  expected="$2"
  attempts=0

  while [ "$attempts" -lt 12 ]; do
    if curl -sk --max-time 10 -o /dev/null "$url" >/dev/null 2>&1; then
      served="$(printf '' | openssl s_client -connect "$expected" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -fingerprint -sha256 2>/dev/null || true)"
      if [ -n "$served" ] && [ "$served" = "$TARGET_FINGERPRINT" ]; then
        return 0
      fi
    fi

    attempts=$((attempts + 1))
    sleep 5
  done

  echo "Timed out waiting for $url to serve the renewed certificate" >&2
  exit 1
}

require_file "$CERT_FILE"
require_file "$KEY_FILE"

openssl x509 -in "$CERT_FILE" -noout >/dev/null
TARGET_FINGERPRINT="$(openssl x509 -in "$CERT_FILE" -noout -fingerprint -sha256)"

docker restart "$API_CONTAINER" >/dev/null
wait_for_https "$API_URL" "127.0.0.1:4000"

docker restart "$CLIENT_CONTAINER" >/dev/null
wait_for_https "$CLIENT_URL" "127.0.0.1:443"
