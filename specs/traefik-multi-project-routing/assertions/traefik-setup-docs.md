---
id: traefik-setup-docs
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Traefik Setup Documentation

## What Must Be True

Documentation exists explaining how to set up the shared Traefik infrastructure that all projects depend on when using Traefik mode.

## Location

Either in the generated project's README.md or in a dedicated docs/ folder.

## Required Content

1. **Create the proxy network:**
   ```bash
   docker network create proxy
   ```

2. **Traefik container setup** — One of:
   - Standalone Traefik container (docker run or docker-compose in a shared location)
   - Link to official Traefik quick-start documentation
   
3. **Traefik configuration** for `*.localhost` routing:
   - Enable Docker provider
   - Configure entrypoints (web on port 80, websecure on port 443)
   - Example traefik.yml or command-line flags

4. **Verification steps:**
   - How to check if Traefik is running
   - How to access Traefik dashboard (if enabled)

## Success Criteria

- ✅ Developer can follow documentation to set up Traefik from scratch
- ✅ Documentation includes the exact `docker network create proxy` command
- ✅ Links to official Traefik docs for deeper configuration
- ✅ Explains when Traefik setup is needed (only for multi-project mode)
