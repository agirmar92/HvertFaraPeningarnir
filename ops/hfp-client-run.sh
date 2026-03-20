#!/bin/sh

set -eu

CONFIG_FILE="${CONFIG_FILE:-/opt/hfp/etc/hfp-runtime.conf}"
if [ -f "$CONFIG_FILE" ]; then
  # shellcheck disable=SC1090
  . "$CONFIG_FILE"
fi

DOMAIN="${DOMAIN:-hfp.kopavogur.is}"
CERT_DIR="${CERT_DIR:-/srv/hfp-certs/live/$DOMAIN}"
CONTAINER_NAME="${CONTAINER_NAME:-${CLIENT_CONTAINER_NAME:-hfpclient}}"
IMAGE="${IMAGE:-${CLIENT_IMAGE:-agirmar92/hfpclient:hide-millideildir-level}}"
HTTPD_CONF="${HTTPD_CONF:-/opt/hfp/config/client/hfp-httpd.conf}"
CHALLENGE_DIR="${CHALLENGE_DIR:-/srv/hfp-acme}"
CERT_FILE="${CERT_FILE:-$CERT_DIR/fullchain.pem}"
KEY_FILE="${KEY_FILE:-$CERT_DIR/privkey.pem}"
USE_LIVE_CERTS="${USE_LIVE_CERTS:-1}"

if [ ! -f "$HTTPD_CONF" ]; then
  echo "Missing Apache config: $HTTPD_CONF" >&2
  exit 1
fi

if [ ! -d "$CHALLENGE_DIR" ]; then
  echo "Missing ACME root directory: $CHALLENGE_DIR" >&2
  exit 1
fi

if [ "$USE_LIVE_CERTS" = "1" ]; then
  if [ ! -f "$CERT_FILE" ]; then
    echo "Missing certificate file: $CERT_FILE" >&2
    exit 1
  fi

  if [ ! -f "$KEY_FILE" ]; then
    echo "Missing private key file: $KEY_FILE" >&2
    exit 1
  fi
fi

docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

if [ "$USE_LIVE_CERTS" = "1" ]; then
  docker run -d \
    --name "$CONTAINER_NAME" \
    --restart always \
    -p 80:80 \
    -p 443:443 \
    -v "$HTTPD_CONF:/usr/local/apache2/conf/httpd.conf:ro" \
    -v "$CHALLENGE_DIR:/var/www/acme:ro" \
    -v "$CERT_FILE:/usr/local/apache2/conf/server.crt:ro" \
    -v "$KEY_FILE:/usr/local/apache2/conf/server.key:ro" \
    "$IMAGE"
else
  docker run -d \
    --name "$CONTAINER_NAME" \
    --restart always \
    -p 80:80 \
    -p 443:443 \
    -v "$HTTPD_CONF:/usr/local/apache2/conf/httpd.conf:ro" \
    -v "$CHALLENGE_DIR:/var/www/acme:ro" \
    "$IMAGE"
fi
