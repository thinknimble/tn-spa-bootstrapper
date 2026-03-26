---
id: traefik-setup-docs
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-26T00:00:00Z
priority: 1
status: in_progress
locked-by: builder-xps13-17192-1774559058
branch: main
---

# Traefik Setup: `just setup-traefik` Command

## What Must Be True

The justfile includes a `setup-traefik` recipe that idempotently provisions the shared Traefik gateway, including auto-generating `~/traefik/docker-compose.yml` if it doesn't exist.

## Required Behavior

```bash
just setup-traefik
```

1. Creates the `proxy` Docker network if it doesn't exist
2. Auto-generates `~/traefik/docker-compose.yml` if it doesn't exist (from a known-good template)
3. Starts the Traefik container if not already running
4. Is idempotent — safe to run multiple times
5. Prints status messages for each step

## Template to Generate

If `~/traefik/docker-compose.yml` doesn't exist, create it with this exact content:

```yaml
networks:
  proxy:
    external: true

services:
  traefik:
    image: traefik:v3.6
    container_name: traefik
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=proxy"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "9090:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
    networks:
      - proxy
```

### Why these values

| Setting | Value | Reason |
|---------|-------|--------|
| Image | `traefik:v3.6` | v2.x and v3.0–v3.5 use Docker API v1.24 which is rejected by Docker Engine 29+ (minimum v1.44). v3.6+ added automatic API version negotiation. Older versions fail silently. |
| Dashboard port | `9090:8080` | Avoids conflict with `docker-compose.override.yml` which binds the client to port `8080` in standalone mode. |
| Socket mount | No `:ro` | Some Docker Desktop for Mac configurations have issues with read-only socket mounts. Dropping `:ro` improves cross-platform compatibility. |

## Implementation

```just
setup-traefik:
    #!/usr/bin/env bash
    set -e

    TRAEFIK_DIR="$HOME/traefik"

    # 1. Ensure proxy network
    if ! docker network inspect proxy >/dev/null 2>&1; then
      echo "Creating 'proxy' Docker network..."
      docker network create proxy
    else
      echo "'proxy' network already exists, skipping"
    fi

    # 2. Auto-generate ~/traefik/docker-compose.yml if missing
    if [ ! -f "$TRAEFIK_DIR/docker-compose.yml" ]; then
      echo "Creating $TRAEFIK_DIR/docker-compose.yml..."
      mkdir -p "$TRAEFIK_DIR"
      cat > "$TRAEFIK_DIR/docker-compose.yml" << 'YAML'
    networks:
      proxy:
        external: true

    services:
      traefik:
        image: traefik:v3.6
        container_name: traefik
        restart: unless-stopped
        command:
          - "--api.insecure=true"
          - "--providers.docker=true"
          - "--providers.docker.exposedbydefault=false"
          - "--providers.docker.network=proxy"
          - "--entrypoints.web.address=:80"
        ports:
          - "80:80"
          - "9090:8080"
        volumes:
          - "/var/run/docker.sock:/var/run/docker.sock"
        networks:
          - proxy
    YAML
    else
      echo "$TRAEFIK_DIR/docker-compose.yml already exists, skipping"
    fi

    # 3. Start Traefik if not already running
    if docker inspect traefik >/dev/null 2>&1; then
      echo "Traefik container already exists, skipping"
    else
      echo "Starting Traefik gateway..."
      docker compose -f "$TRAEFIK_DIR/docker-compose.yml" up -d
      echo "Traefik running — dashboard at http://localhost:9090"
    fi
```

## Success Criteria

- ✅ `just setup-traefik` creates `proxy` network if missing
- ✅ `just setup-traefik` creates `~/traefik/docker-compose.yml` if missing, using the exact template above
- ✅ `just setup-traefik` does not overwrite an existing `~/traefik/docker-compose.yml`
- ✅ `just setup-traefik` starts Traefik if not running
- ✅ Running it twice does not error (idempotent)
- ✅ After running, `just up` auto-detects Traefik and applies the overlay
- ✅ Traefik dashboard accessible at `http://localhost:9090` after setup
