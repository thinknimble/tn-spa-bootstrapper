---
id: test-traefik-mode
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Testing: Traefik Mode

## What Must Be True

Traefik mode enables hostname-based routing without host port exposure.

## Test Prerequisites

- Proxy network exists: `docker network create proxy`
- Traefik container running and attached to `proxy` network

## Test Procedure

1. **Generate fresh project:**
   ```bash
   cookiecutter <bootstrapper-path>
   cd <generated-project>
   ```

2. **Configure for Traefik mode:**
   ```bash
   cp .env.example .env
   # Edit .env:
   PROJECT=testproject
   COMPOSE_FILE=docker-compose.yaml:docker-compose.traefik.yml
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify NO host ports:**
   ```bash
   docker-compose ps
   # Ports column should be empty or show only container ports
   ```

5. **Access via hostnames:**
   - Frontend: `http://testproject.localhost`
   - Backend API: `http://api.testproject.localhost`
   - Both should respond successfully

6. **Verify network attachment:**
   ```bash
   docker inspect testproject-server | grep -A5 Networks
   # Should show both "default" and "proxy"
   ```

7. **Clean up:**
   ```bash
   docker-compose down
   ```

## Success Criteria

- ✅ Services start without errors
- ✅ No host ports exposed (verified by `docker-compose ps`)
- ✅ Services attached to both `default` and `proxy` networks
- ✅ Frontend accessible at `{PROJECT}.localhost`
- ✅ Backend accessible at `api.{PROJECT}.localhost`
- ✅ Internal services (postgres, redis) remain reachable by server
