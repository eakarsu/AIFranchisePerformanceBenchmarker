#!/usr/bin/env bash
set -euo pipefail
root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$root_dir"
[[ -f .env ]] || { echo "Missing .env; copy .env.example and configure it." >&2; exit 1; }
set -a
. ./.env
set +a
[[ -d server/node_modules && -d client/node_modules ]] || { echo "Dependencies missing; run scripts/bootstrap.sh." >&2; exit 1; }
for port in "${BACKEND_PORT:-3001}" "${FRONTEND_PORT:-3000}"; do
  ! lsof -tiTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 || { echo "Port $port is already in use; refusing to terminate its owner." >&2; exit 1; }
done
if [[ "${MIGRATE_ON_START:-false}" == "true" ]]; then
  (cd server && node scripts/runtime-init.js)
fi
pids=()
cleanup() { for pid in "${pids[@]:-}"; do kill "$pid" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM
npm --prefix server start & pids+=("$!")
npm --prefix client run dev -- --host "${HOST:-127.0.0.1}" --port "${FRONTEND_PORT:-3000}" & pids+=("$!")
wait
