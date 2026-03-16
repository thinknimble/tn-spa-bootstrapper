---
id: env-compose-file-variable
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Environment: COMPOSE_FILE Variable

## What Must Be True

The `{{cookiecutter.project_slug}}/.env.example` file includes a commented-out `COMPOSE_FILE` variable that enables Traefik mode.

## Required Content

```
# Uncomment to enable Traefik routing (disables docker-compose.override.yml)
# COMPOSE_FILE=docker-compose.yaml:docker-compose.traefik.yml
```

## Behavior

When **commented out** (default):
- Docker Compose loads `docker-compose.yaml` + `docker-compose.override.yml`
- Port mappings are active (standalone mode)
- Access via localhost:8080, localhost:8000, etc.

When **uncommented**:
- Docker Compose loads `docker-compose.yaml` + `docker-compose.traefik.yml`
- `docker-compose.override.yml` is skipped
- No host ports mapped
- Access via `{project}.localhost`, `api.{project}.localhost`

## Mode Switching

Developers toggle modes by:
1. Editing `.env` to uncomment/comment the line
2. Running `docker-compose down && docker-compose up`

## Success Criteria

- ✅ Variable exists in `.env.example` as a comment
- ✅ Comment explains the purpose clearly
- ✅ Value is correct: `docker-compose.yaml:docker-compose.traefik.yml`
- ✅ Uncommenting switches to Traefik mode (verified by no host ports in `docker-compose ps`)
- ✅ Commenting restores standalone mode (verified by host ports returning)
