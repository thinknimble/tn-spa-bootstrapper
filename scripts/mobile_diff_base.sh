#!/bin/bash
# Prints the git ref to compare against when deciding whether a client
# directory changed in the commit a deployment was made from.
#
# A review app's URL carries `pr-<number>`, and its commit sits ahead of main,
# so main answers "what does this pull request change". A staging deployment's
# commit IS main, which makes that same comparison empty every time; there the
# question is what the merge itself brought in, so the base is the commit
# before it.
#
# Both `get_client_config.sh` and the `configuremobile` job read this, so the
# two stay in step. They disagreed once, and the mobile app was then left out
# of the render while the build was still asked for.

if echo "${ENVIRONMENT_URL:-}" | grep -qE 'pr-[0-9]+'; then
  echo "origin/main"
else
  echo "HEAD~1"
fi
