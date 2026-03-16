---
id: test-standalone-mode
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
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
   ```

2. **Use default .env:**
   ```bash
   cp .env.example .env
   # Do NOT set COMPOSE_FILE variable
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify port mappings:**
   ```bash
   docker-compose ps
   # Should show ports: 8080, 8000, 5432, 6379
   ```

5. **Access services:**
   - Frontend: `http://localhost:8080` (or configured client port)
   - Backend API: `http://localhost:8000` (or configured server port)
   - Both should respond successfully

6. **Clean up:**
   ```bash
   docker-compose down
   ```

## Success Criteria

- ✅ Fresh generation works without manual configuration
- ✅ `docker-compose up` succeeds
- ✅ All four services start successfully
- ✅ Port mappings are visible in `docker-compose ps`
- ✅ Services accessible via localhost:PORT
- ✅ No Traefik infrastructure required
