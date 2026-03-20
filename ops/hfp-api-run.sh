#!/bin/sh

set -eu

CONFIG_FILE="${CONFIG_FILE:-/opt/hfp/etc/hfp-runtime.conf}"
if [ -f "$CONFIG_FILE" ]; then
  # shellcheck disable=SC1090
  . "$CONFIG_FILE"
fi

DOMAIN="${DOMAIN:-hfp.kopavogur.is}"
CERT_DIR="${CERT_DIR:-/srv/hfp-certs/live/$DOMAIN}"
CONTAINER_NAME="${CONTAINER_NAME:-${API_CONTAINER_NAME:-hfpapi}}"
IMAGE="${IMAGE:-${API_IMAGE:-agirmar92/hfpapi:2025-joint-revenue-new-filter-latest-years}}"
CERT_FILE="${CERT_FILE:-$CERT_DIR/fullchain.pem}"
KEY_FILE="${KEY_FILE:-$CERT_DIR/privkey.pem}"

if [ ! -f "$CERT_FILE" ]; then
  echo "Missing certificate file: $CERT_FILE" >&2
  exit 1
fi

if [ ! -f "$KEY_FILE" ]; then
  echo "Missing private key file: $KEY_FILE" >&2
  exit 1
fi

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart always \
  -p 4000:4000 \
  -v "$CERT_FILE:/root/server.crt:ro" \
  -v "$KEY_FILE:/root/server.key:ro" \
  "$IMAGE"
