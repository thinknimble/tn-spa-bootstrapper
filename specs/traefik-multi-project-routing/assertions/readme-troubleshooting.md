---
id: readme-troubleshooting
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 2
status: not_started
---

# Documentation: Troubleshooting Section

## What Must Be True

The README includes a troubleshooting section addressing common Traefik mode issues.

## Common Issues to Cover

### 1. "Cannot reach {project}.localhost"

**Symptom:** Browser shows connection refused or DNS error

**Solutions:**
- Verify `proxy` network exists: `docker network ls | grep proxy`
- If missing: `docker network create proxy`
- Verify Traefik container is running: `docker ps | grep traefik`
- Check service is attached to proxy network: `docker inspect {project}-server | grep -A5 Networks`
- Verify Traefik labels are correct: `docker inspect {project}-server | grep traefik`

### 2. "Port already in use"

**Symptom:** `docker-compose up` fails with "port is already allocated"

**Solutions:**
- Switch to Traefik mode (no host ports)
- Stop conflicting containers: `docker ps` and `docker stop <container>`
- Check for other services using standard ports: `lsof -i :8080`, `lsof -i :8000`

### 3. "How do I verify Traefik is routing correctly?"

**Methods:**
- Access Traefik dashboard (if enabled): `http://localhost:8080` (or configured port)
- Check Traefik logs: `docker logs <traefik-container>`
- Inspect service discovery: Dashboard shows registered routers/services
- Test routing: `curl -H "Host: project.localhost" http://localhost/`

## Success Criteria

- ✅ Covers the three most common issues
- ✅ Provides actionable diagnostic commands
- ✅ Explains both symptoms and solutions
- ✅ Links to Traefik official troubleshooting docs
