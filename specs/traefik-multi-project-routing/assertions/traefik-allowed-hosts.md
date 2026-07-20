---
id: traefik-allowed-hosts
parent: traefik-multi-project-routing
created: 2026-07-13T00:00:00Z
priority: 1
status: done
branch: fix/issues-495-496-497-499
---

# Traefik Overlay Sets `ALLOWED_HOSTS` for Project Hostnames

## What Must Be True

In Traefik mode a project (or worktree) is reached at hostnames derived from its
`PROJECT` — `${PROJECT}.localhost`, `api.${PROJECT}.localhost` — and the client
container reaches the server over the shared proxy network by its project-scoped
container name (`${PROJECT}-server`). Django rejects any request whose `Host`
header is not in `ALLOWED_HOSTS`, so behind Traefik the server would return
`DisallowedHost` for exactly these requests.

The Traefik overlay (`compose/docker-compose.traefik.yml`) therefore sets the
server's `ALLOWED_HOSTS` to the project's own hostnames, keyed on `${PROJECT}`.
Because `PROJECT` is unique per worktree, each isolated stack accepts requests at
**its own** hostnames — the server is reachable behind Traefik and reachable
from its own client container.

## Success Criteria

- ✅ The Traefik overlay sets `ALLOWED_HOSTS` on the `server` service, derived from `${PROJECT}`
- ✅ The list covers the Traefik-routed hostnames (`${PROJECT}.localhost`, `api.${PROJECT}.localhost`) and the project-scoped container name (`${PROJECT}-server`)
- ✅ A worktree's server accepts requests at its own project hostnames behind Traefik (no `DisallowedHost`)
- ✅ Two concurrent worktrees each accept only their own hostnames — the values track each worktree's unique `PROJECT`
