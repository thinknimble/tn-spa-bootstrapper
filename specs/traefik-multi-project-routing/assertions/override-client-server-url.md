---
id: override-client-server-url
parent: traefik-multi-project-routing
created: 2026-07-13T00:00:00Z
priority: 2
status: done
branch: fix/issues-495-496-497-499
---

# Standalone Client Reaches Server Over the Compose Network

## What Must Be True

In standalone mode (`docker-compose.override.yml`, no Traefik) the client runs in
its own container. `http://localhost:8000` inside that container resolves to the
**client** container, not the server, so dev requests to the backend fail. The
override must point the client's dev backend URL at the server's compose service
DNS name so the client container reaches the server over the default compose
network.

This is a container-networking correctness property (not a version bump): a
regression back to `localhost` silently breaks the client → server call in
standalone Docker dev. It is the standalone-mode counterpart to the Traefik
overlay, which routes the client to the server via the project-scoped hostname.

## Success Criteria

- ✅ `docker-compose.override.yml` sets the client's dev backend URL to the server's compose service name (`http://server:8000`), not `http://localhost:8000`
- ✅ In standalone mode the client container can reach the server over the compose network
