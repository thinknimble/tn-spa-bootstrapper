---
id: server-production-wsgi
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 2
status: not_started
branch: feature/aws-fargate
---

# Server Entrypoint: Production Uses gunicorn/uvicorn, Not runserver

## What Must Be True

`compose/server/tf/start` uses a production-grade WSGI/ASGI server (gunicorn or uvicorn) instead of Django's development `runserver`. The development `runserver` is only used in local development entrypoints, never in the Fargate/production entrypoint.

## Context

`compose/server/tf/start` line 12 uses `python manage.py runserver 0.0.0.0:8000` for all environments including production. Django's runserver is single-threaded, has no connection pooling, serves static files inefficiently, and is explicitly documented as not suitable for production use.

## Success Criteria

- `compose/server/tf/start` (the Fargate/production entrypoint) does not use `python manage.py runserver`
- The production entrypoint uses `gunicorn` or `uvicorn` (or equivalent production WSGI/ASGI server)
- The server binds to `0.0.0.0:8000` (or the appropriate port for ECS)
- Worker count and timeout are configurable or set to reasonable production defaults
- Local development entrypoints (`compose/server/start` or equivalent) may continue using `runserver`
