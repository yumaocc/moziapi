#!/usr/bin/env bash

set -Eeuo pipefail

UPSTREAM_URL="https://github.com/Wei-Shaw/sub2api.git"
UPSTREAM_REMOTE="upstream"
ORIGIN_REMOTE="origin"
TARGET_BRANCH="main"
PUSH_AFTER_MERGE=1

usage() {
  cat <<'EOF'
Usage: ./sync-upstream.sh [--no-push]

Synchronize the local main branch with Wei-Shaw/sub2api while preserving
the fork's commits. The script requires a clean worktree, creates a local
backup branch, fetches both remotes, merges upstream/main, and pushes main
to origin unless --no-push is supplied.
EOF
}

while (($# > 0)); do
  case "$1" in
    --no-push)
      PUSH_AFTER_MERGE=0
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  printf 'Refusing to sync: the worktree has uncommitted changes.\n' >&2
  printf 'Commit or stash them, then run this script again.\n' >&2
  exit 1
fi

if git remote get-url "$UPSTREAM_REMOTE" >/dev/null 2>&1; then
  configured_url="$(git remote get-url "$UPSTREAM_REMOTE")"
  if [[ "$configured_url" != "$UPSTREAM_URL" ]]; then
    printf 'Remote %s points to %s, expected %s.\n' \
      "$UPSTREAM_REMOTE" "$configured_url" "$UPSTREAM_URL" >&2
    exit 1
  fi
else
  git remote add "$UPSTREAM_REMOTE" "$UPSTREAM_URL"
fi

if ! git remote get-url "$ORIGIN_REMOTE" >/dev/null 2>&1; then
  printf 'Remote %s is missing; cannot update the fork.\n' "$ORIGIN_REMOTE" >&2
  exit 1
fi

git fetch --prune "$ORIGIN_REMOTE"
git fetch --prune "$UPSTREAM_REMOTE"
git switch "$TARGET_BRANCH"

backup_branch="backup/pre-upstream-sync-$(date -u +%Y%m%dT%H%M%SZ)"
git branch "$backup_branch"
printf 'Created safety branch: %s\n' "$backup_branch"

if ! git merge --no-edit "$UPSTREAM_REMOTE/$TARGET_BRANCH"; then
  printf '\nMerge stopped because of conflicts. Resolve them, then run:\n' >&2
  printf '  git add <resolved-files>\n  git commit\n' >&2
  printf 'Safety branch: %s\n' "$backup_branch" >&2
  exit 1
fi

if ((PUSH_AFTER_MERGE)); then
  git push "$ORIGIN_REMOTE" "$TARGET_BRANCH"
else
  printf 'Push skipped. When ready, run: git push %s %s\n' \
    "$ORIGIN_REMOTE" "$TARGET_BRANCH"
fi

printf 'Synchronized %s with %s/%s successfully.\n' \
  "$TARGET_BRANCH" "$UPSTREAM_REMOTE" "$TARGET_BRANCH"
