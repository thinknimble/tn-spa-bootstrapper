---
id: test-traefik-mode
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: not_started
---

# Testing: Traefik Mode (Auto-Detected)

## What Must Be True

When the `proxy` Docker network exists, `just up` automatically routes through Traefik without any manual configuration.

## Test Prerequisites

- Traefik provisioned: `just setup-traefik` (creates `proxy` network + starts Traefik container)

## Test Procedure

1. **Generate fresh project:**
   ```bash
   cookiecutter <bootstrapper-path>
   cd <generated-project>
   ```

2. **Ensure Traefik is running:**
   ```bash
   just setup-traefik
   docker network ls | grep proxy   # should exist
   docker ps | grep traefik         # should be running
   ```

3. **Start services (Traefik overlay auto-applied):**
   ```bash
   just up
   # Output should include "PROJECT=<slug>-main"
   ```

4. **Verify NO host ports for app services:**
   ```bash
   docker compose ps
   # client and server should show no host port bindings
   ```

5. **Access via hostnames:**
   - Frontend: `http://<slug>-main.localhost`
   - Backend API: `http://api.<slug>-main.localhost`
   - Both should respond successfully

6. **Verify network attachment:**
   ```bash
   docker inspect <PROJECT>-server | grep -A5 Networks
   # Should show both "default" and "proxy" networks
   ```

7. **Clean up:**
   ```bash
   just down
   ```

## Success Criteria

- ✅ No `.env` changes required — Traefik mode activates automatically
- ✅ No host ports exposed for client/server (verified by `docker compose ps`)
- ✅ Services attached to both `default` and `proxy` networks
- ✅ Frontend accessible at `{PROJECT}.localhost`
- ✅ Backend accessible at `api.{PROJECT}.localhost`
- ✅ Internal services (postgres, redis) remain reachable by server
- ✅ Vite HMR works in the browser (no WebSocket errors)
