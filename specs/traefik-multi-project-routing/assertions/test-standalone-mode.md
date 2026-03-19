---
id: test-standalone-mode
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: not_started
---

# Testing: Standalone Mode

## What Must Be True

Standalone mode (default configuration) works without any Traefik setup.

## Test Procedure

1. **Generate fresh project:**
   ```bash
   cookiecutter <bootstrapper-path>
   cd <generated-project>
   ```

2. **Use default .env (no Traefik infrastructure):**
   ```bash
   cp .env.example .env
   # Ensure the `proxy` Docker network does NOT exist on this machine
   ```

3. **Start services:**
   ```bash
   just up
   ```

4. **Verify port mappings:**
   ```bash
   docker compose ps
   # Should show ports: 8080, 8000, 5432, 6379
   ```

5. **Access services:**
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:8000`
   - Both should respond successfully

6. **Clean up:**
   ```bash
   just down
   ```

## Success Criteria

- ✅ Fresh generation works without manual configuration
- ✅ `just up` succeeds with no Traefik infrastructure present
- ✅ All four services start successfully
- ✅ Port mappings are visible in `docker compose ps`
- ✅ Services accessible via localhost:PORT
- ✅ No Traefik infrastructure required
