#!/usr/bin/env bash
# Cancel queued/running EAS builds for a build profile before starting a new one.
# Cancelling a GitHub run does NOT stop the remote EAS build, so superseded builds
# keep running (and billing) unless they are cancelled through EAS.
#
# Usage: eas-cancel-stale-builds.sh <build-profile> [platform]   (run from mobile/)
set -euo pipefail

profile="${1:?build profile required}"
platform="${2:-all}"

for status in new in-queue in-progress; do
  ids=$(eas build:list --build-profile "$profile" --platform "$platform" --status "$status" \
    --limit 50 --json --non-interactive | jq -r '.[].id')
  for id in $ids; do
    echo "Cancelling superseded EAS build $id (profile=$profile, status=$status)"
    eas build:cancel "$id" --non-interactive || echo "::warning::Could not cancel EAS build $id"
  done
done
