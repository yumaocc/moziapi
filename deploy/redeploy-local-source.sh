#!/usr/bin/env bash

set -Eeuo pipefail

SOURCE_DIR="${SOURCE_DIR:-/opt/sub2api-src}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/sub2api}"
COMPOSE_FILE="${COMPOSE_FILE:-${DEPLOY_DIR}/docker-compose.yml}"
SERVICE_NAME="${SERVICE_NAME:-sub2api}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8080/health}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-180}"
IMAGE_TAG="${IMAGE_TAG:-sub2api-local:$(date +%Y%m%d-%H%M%S)}"
BACKUP_DIR="${SOURCE_DIR}/.deploy-backups"
BACKUP_FILE="${BACKUP_DIR}/docker-compose.$(date +%Y%m%d-%H%M%S).yml"

log() {
  printf '[deploy] %s\n' "$*"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    printf '[deploy] required command not found: %s\n' "$1" >&2
    exit 1
  }
}

require_command docker
require_command curl

[[ -f "${SOURCE_DIR}/Dockerfile" ]] || {
  printf '[deploy] Dockerfile not found in %s\n' "${SOURCE_DIR}" >&2
  exit 1
}
[[ -f "${COMPOSE_FILE}" ]] || {
  printf '[deploy] Compose file not found: %s\n' "${COMPOSE_FILE}" >&2
  exit 1
}

mkdir -p "${BACKUP_DIR}"
cp -a "${COMPOSE_FILE}" "${BACKUP_FILE}"

OLD_IMAGE="$(docker inspect "${SERVICE_NAME}" --format '{{.Config.Image}}')"
rollback_needed=1

rollback() {
  local exit_code=$?
  if [[ ${rollback_needed} -eq 1 ]]; then
    log "deployment failed; restoring ${OLD_IMAGE}"
    cp -a "${BACKUP_FILE}" "${COMPOSE_FILE}"
    docker compose -f "${COMPOSE_FILE}" up -d --no-deps --force-recreate "${SERVICE_NAME}" || true
  fi
  exit "${exit_code}"
}
trap rollback ERR INT TERM

log "building ${IMAGE_TAG} from ${SOURCE_DIR}"
docker build --pull -t "${IMAGE_TAG}" "${SOURCE_DIR}"

log "updating ${SERVICE_NAME} image in ${COMPOSE_FILE}"
python3 - "${COMPOSE_FILE}" "${SERVICE_NAME}" "${IMAGE_TAG}" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
service = re.escape(sys.argv[2])
image = sys.argv[3]
text = path.read_text()
pattern = rf"(^  {service}:\n(?:(?!^  \S).)*?^    image:)\s*\S+"
updated, count = re.subn(pattern, rf"\1 {image}", text, count=1, flags=re.MULTILINE | re.DOTALL)
if count != 1:
    raise SystemExit(f"could not locate image for service {sys.argv[2]}")
path.write_text(updated)
PY

log "recreating ${SERVICE_NAME}; database and Redis remain running"
docker compose -f "${COMPOSE_FILE}" up -d --no-deps --force-recreate "${SERVICE_NAME}"

deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS))
until curl --fail --silent --show-error --max-time 5 "${HEALTH_URL}" >/dev/null; do
  if (( SECONDS >= deadline )); then
    docker compose -f "${COMPOSE_FILE}" logs --tail=120 "${SERVICE_NAME}" >&2 || true
    false
  fi
  sleep 3
done

rollback_needed=0
trap - ERR INT TERM
log "deployment successful: ${IMAGE_TAG}"
docker compose -f "${COMPOSE_FILE}" ps
