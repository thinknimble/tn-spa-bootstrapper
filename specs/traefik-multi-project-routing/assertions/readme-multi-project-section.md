---
id: readme-multi-project-section
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Documentation: Multi-Project Development Section

## What Must Be True

The generated `{{cookiecutter.project_slug}}/README.md` includes a "Multi-Project Development" section explaining both operational modes.

## Required Content

### Section: Multi-Project Development

1. **Standalone Mode (Default)**
   - No configuration needed
   - `docker-compose up` works out of the box
   - Access via localhost:8080 (frontend), localhost:8000 (backend)
   - Port mappings defined in `docker-compose.override.yml`

2. **Traefik Mode (Multiple Projects Simultaneously)**
   - Prerequisites:
     - Create shared network: `docker network create proxy`
     - Traefik container running (link to setup docs)
   - Configuration:
     - Set `PROJECT=yourproject` in `.env`
     - Uncomment `COMPOSE_FILE=docker-compose.yaml:docker-compose.traefik.yml` in `.env`
   - Access via `yourproject.localhost` (frontend), `api.yourproject.localhost` (backend)
   - No host port conflicts — run as many projects as needed

3. **Switching Modes**
   - Edit `.env` to comment/uncomment `COMPOSE_FILE`
   - Restart containers: `docker-compose down && docker-compose up`

## Success Criteria

- ✅ Both modes explained clearly
- ✅ Prerequisites listed for Traefik mode
- ✅ Step-by-step instructions for enabling Traefik mode
- ✅ Example PROJECT values shown
- ✅ Links to Traefik setup documentation
- ✅ Explains when to use each mode
