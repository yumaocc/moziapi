#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

SSH_TARGET="${SSH_TARGET:-root@67.230.163.225}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/opt/sub2api}"
COMPOSE_SERVICE="${COMPOSE_SERVICE:-sub2api}"
RELEASE_ID="${RELEASE_ID:-$(date +%Y%m%d-%H%M%S)}"
IMAGE_NAME="${IMAGE_NAME:-sub2api-local:${RELEASE_ID}}"
PLATFORM="${PLATFORM:-linux/amd64}"
HEALTH_ATTEMPTS="${HEALTH_ATTEMPTS:-60}"
HEALTH_INTERVAL_SECONDS="${HEALTH_INTERVAL_SECONDS:-2}"

ARCHIVE="$(mktemp "${TMPDIR:-/tmp}/sub2api-image.XXXXXX.tar.gz")"
CONTROL_DIR="$(mktemp -d "${TMPDIR:-/tmp}/sub2api-ssh.XXXXXX")"
CONTROL_PATH="${CONTROL_DIR}/control"
REMOTE_ARCHIVE="/tmp/sub2api-image-${RELEASE_ID}.tar.gz"

SSH_OPTIONS=(
  -o ControlMaster=auto
  -o ControlPersist=600
  -o "ControlPath=${CONTROL_PATH}"
  -o StrictHostKeyChecking=accept-new
)

log() {
  printf '[deploy] %s\n' "$*"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    printf '[deploy] required command not found: %s\n' "$1" >&2
    exit 1
  }
}

local_sha256() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    sha256sum "$1" | awk '{print $1}'
  fi
}

cleanup() {
  rm -f "${ARCHIVE}"
  ssh "${SSH_OPTIONS[@]}" -O exit "${SSH_TARGET}" >/dev/null 2>&1 || true
  rm -rf "${CONTROL_DIR}"
}
trap cleanup EXIT

for command_name in docker ssh scp gzip awk; do
  require_command "${command_name}"
done

[[ -f "${REPO_ROOT}/Dockerfile" ]] || {
  printf '[deploy] Dockerfile not found: %s\n' "${REPO_ROOT}/Dockerfile" >&2
  exit 1
}

log "connecting to ${SSH_TARGET} (password/key is requested once)"
ssh "${SSH_OPTIONS[@]}" "${SSH_TARGET}" \
  "test -f '${REMOTE_APP_DIR}/docker-compose.yml' && docker info >/dev/null && df -Pk '${REMOTE_APP_DIR}'"

log "building ${IMAGE_NAME} for ${PLATFORM}"
docker build --platform "${PLATFORM}" -t "${IMAGE_NAME}" "${REPO_ROOT}"

image_arch="$(docker image inspect "${IMAGE_NAME}" --format '{{.Architecture}}')"
if [[ "${PLATFORM}" == "linux/amd64" && "${image_arch}" != "amd64" ]]; then
  printf '[deploy] unexpected image architecture: %s\n' "${image_arch}" >&2
  exit 1
fi

log "exporting and compressing image"
docker save "${IMAGE_NAME}" | gzip -1 >"${ARCHIVE}"
archive_sha256="$(local_sha256 "${ARCHIVE}")"
archive_size="$(wc -c <"${ARCHIVE}" | tr -d ' ')"
log "archive size=${archive_size} sha256=${archive_sha256}"

remote_sha256="$(ssh "${SSH_OPTIONS[@]}" "${SSH_TARGET}" "if test -f '${REMOTE_ARCHIVE}.part'; then sha256sum '${REMOTE_ARCHIVE}.part' | cut -d ' ' -f 1; fi")"
if [[ "${remote_sha256}" == "${archive_sha256}" ]]; then
  log "reusing verified remote image archive"
else
  log "uploading image archive"
  scp "${SSH_OPTIONS[@]}" "${ARCHIVE}" "${SSH_TARGET}:${REMOTE_ARCHIVE}.part"
  remote_sha256="$(ssh "${SSH_OPTIONS[@]}" "${SSH_TARGET}" "sha256sum '${REMOTE_ARCHIVE}.part' | cut -d ' ' -f 1")"
fi

if [[ "${remote_sha256}" != "${archive_sha256}" ]]; then
  ssh "${SSH_OPTIONS[@]}" "${SSH_TARGET}" "rm -f '${REMOTE_ARCHIVE}.part'" || true
  printf '[deploy] upload checksum mismatch: local=%s remote=%s\n' "${archive_sha256}" "${remote_sha256}" >&2
  exit 1
fi

log "loading image and updating ${COMPOSE_SERVICE}"
ssh "${SSH_OPTIONS[@]}" "${SSH_TARGET}" bash -s -- \
  "${IMAGE_NAME}" "${REMOTE_APP_DIR}" "${COMPOSE_SERVICE}" \
  "${REMOTE_ARCHIVE}.part" "${RELEASE_ID}" "${HEALTH_ATTEMPTS}" \
  "${HEALTH_INTERVAL_SECONDS}" <<'REMOTE_SCRIPT'
set -Eeuo pipefail

image_name="$1"
app_dir="$2"
service_name="$3"
archive="$4"
release_id="$5"
health_attempts="$6"
health_interval="$7"
compose_file="${app_dir}/docker-compose.yml"
compose_backup="${compose_file}.bak-${release_id}"
old_image="$(docker inspect "${service_name}" --format '{{.Config.Image}}')"

if docker compose version >/dev/null 2>&1; then
  compose=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  compose=(docker-compose)
else
  echo "Docker Compose is not installed" >&2
  exit 1
fi

rollback_needed=0
rollback() {
  status=$?
  rm -f "${archive}"
  if [ "${status}" -ne 0 ] && [ "${rollback_needed}" -eq 1 ]; then
    echo "Deployment failed; restoring ${old_image}" >&2
    cp -f "${compose_backup}" "${compose_file}"
    (cd "${app_dir}" && "${compose[@]}" up -d --no-deps "${service_name}") || true
  fi
  exit "${status}"
}
trap rollback EXIT

gzip -dc "${archive}" | docker load
docker image inspect "${image_name}" >/dev/null

cp -a "${compose_file}" "${compose_backup}"
rollback_needed=1

escaped_image="$(printf '%s' "${image_name}" | sed 's/[&|]/\\&/g')"
sed -i -E "0,/^[[:space:]]*image:/s|^([[:space:]]*image:).*|\\1 ${escaped_image}|" "${compose_file}"
grep -qF "image: ${image_name}" "${compose_file}"

cd "${app_dir}"
"${compose[@]}" config >/dev/null
"${compose[@]}" up -d --no-deps "${service_name}"

container_id="$("${compose[@]}" ps -q "${service_name}")"
test -n "${container_id}"

attempt=1
while [ "${attempt}" -le "${health_attempts}" ]; do
  health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{if .State.Running}}healthy{{else}}stopped{{end}}{{end}}' "${container_id}")"
  if [ "${health}" = healthy ]; then
    rollback_needed=0
    rm -f "${archive}"
    trap - EXIT
    echo "Deployment successful: old=${old_image} new=${image_name} backup=${compose_backup}"
    "${compose[@]}" ps
    exit 0
  fi
  if [ "${health}" = unhealthy ] || [ "${health}" = stopped ]; then
    docker logs --tail 120 "${container_id}" >&2 || true
    exit 1
  fi
  sleep "${health_interval}"
  attempt=$((attempt + 1))
done

echo "Timed out waiting for container health check" >&2
docker logs --tail 120 "${container_id}" >&2 || true
exit 1
REMOTE_SCRIPT

log "deployment completed: ${IMAGE_NAME}"
