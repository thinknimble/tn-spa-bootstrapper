---
id: test-multi-project-concurrent
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Testing: Multiple Projects Concurrently

## What Must Be True

Multiple generated projects can run simultaneously in Traefik mode without conflicts.

## Test Prerequisites

- Proxy network exists: `docker network create proxy`
- Traefik container running

## Test Procedure

1. **Generate two projects:**
   ```bash
   cookiecutter <bootstrapper-path> -o ~/projects/project1
   cookiecutter <bootstrapper-path> -o ~/projects/project2
   ```

2. **Configure project1:**
   ```bash
   cd ~/projects/project1
   cp .env.example .env
   # Edit .env:
   PROJECT=project1
   COMPOSE_FILE=docker-compose.yaml:docker-compose.traefik.yml
   docker-compose up -d
   ```

3. **Configure project2:**
   ```bash
   cd ~/projects/project2
   cp .env.example .env
   # Edit .env:
   PROJECT=project2
   COMPOSE_FILE=docker-compose.yaml:docker-compose.traefik.yml
   docker-compose up -d
   ```

4. **Verify both running:**
   ```bash
   docker ps | grep -E "(project1|project2)"
   # Should show containers for both projects
   ```

5. **Access both projects:**
   - Project1 frontend: `http://project1.localhost`
   - Project1 backend: `http://api.project1.localhost`
   - Project2 frontend: `http://project2.localhost`
   - Project2 backend: `http://api.project2.localhost`
   - All four URLs should respond successfully

6. **Verify isolation:**
   - Each project has its own database instance
   - No cross-project data leakage
   - Container names clearly differentiate projects

7. **Clean up:**
   ```bash
   cd ~/projects/project1 && docker-compose down
   cd ~/projects/project2 && docker-compose down
   ```

## Success Criteria

- ✅ Both projects start without errors
- ✅ No port conflicts during startup
- ✅ All services for both projects are accessible via unique hostnames
- ✅ Container names include project identifier (`project1-server`, `project2-server`)
- ✅ Traefik routes to correct project based on hostname
- ✅ Projects are fully isolated (separate databases, separate containers)
