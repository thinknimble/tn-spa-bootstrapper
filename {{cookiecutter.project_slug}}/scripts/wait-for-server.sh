#!/usr/bin/env bash
# Wait for a stack's server container to accept connections on port 8000.
#
# Usage: wait-for-server.sh <container> [timeout-seconds]
set -uo pipefail

container="${1:?usage: wait-for-server.sh <container> [timeout-seconds]}"
timeout="${2:-120}"

# Git Bash rewrites the "-w /tmp" argument into a Windows path before Docker
# sees it; off Windows this is a no-op. "-w /tmp" itself avoids the bind
# mount namespace issue from Docker Desktop 29.x + git worktrees.
export MSYS_NO_PATHCONV=1

probe() {
  docker exec -w /tmp "$container" "$@" 2>&1
}

# Establish that the probe can run at all before attributing its failures to the
# server: a broken "docker exec -w" fails identically on every iteration.
exec_err=""
exec_ok=""
for _ in $(seq 1 3); do
  if exec_err=$(probe true); then
    exec_ok=1
    break
  fi
  sleep 1
done

if [ -z "$exec_ok" ]; then
  case "$exec_err" in
    *"is not running"*|*"No such container"*)
      {
        echo "Error: container '${container}' is not available, so the server is not up."
        echo "Docker reported: ${exec_err}"
        echo "Start the stack with 'just up', then re-run."
      } >&2
      ;;
    *)
      {
        echo "Error: 'docker exec -w /tmp' cannot run against container '${container}', so readiness cannot be determined."
        echo "Docker reported: ${exec_err}"
        echo "This is the probe failing, not the server — the server may well be up."
      } >&2
      ;;
  esac
  exit 1
fi

probe_err=""
for _ in $(seq 1 "$timeout"); do
  if probe_err=$(probe python -c \
    "import socket; s=socket.create_connection(('localhost',8000),1); s.close()"); then
    echo "Server is ready."
    exit 0
  fi
  sleep 1
done

{
  echo "Error: server did not become reachable on port 8000 within ${timeout}s"
  echo "Last probe error: ${probe_err}"
} >&2
exit 1
