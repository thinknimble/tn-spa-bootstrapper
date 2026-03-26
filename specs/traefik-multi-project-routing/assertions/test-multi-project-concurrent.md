---
id: test-multi-project-concurrent
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: not_started
depends-on: auto-detect-traefik
branch: main
---

# Testing: Multiple Projects Concurrently

## What Must Be True

Multiple generated projects (or worktrees) can run simultaneously in Traefik mode without conflicts.

## Test Prerequisites

- Traefik provisioned: `just setup-traefik`

## Option A: Two separate generated projects

1. **Generate two projects:**
   ```bash
   cookiecutter <bootstrapper-path>  # project slug: alpha
   cookiecutter <bootstrapper-path>  # project slug: beta
   ```

2. **Start both (on main branch, each gets its own PROJECT):**
   ```bash
   cd ~/projects/alpha && just up   # PROJECT=alpha-main
   cd ~/projects/beta  && just up   # PROJECT=beta-main
   ```

3. **Verify both running:**
   ```bash
   docker ps | grep -E "(alpha|beta)"
   # Should show containers for both projects
   ```

4. **Access both projects:**
   - `http://alpha-main.localhost` — Alpha frontend
   - `http://api.alpha-main.localhost` — Alpha API
   - `http://beta-main.localhost` — Beta frontend
   - `http://api.beta-main.localhost` — Beta API

5. **Clean up:**
   ```bash
   cd ~/projects/alpha && just down
   cd ~/projects/beta  && just down
   ```

## Option B: Worktrees within one project

1. **Create a worktree:**
   ```bash
   just worktree add feature/experiment
   ```

2. **Start both stacks:**
   ```bash
   just up                                         # PROJECT=<slug>-main
   (cd ../<slug>-experiment && just up)            # PROJECT=<slug>-experiment
   ```

3. **Verify both accessible at unique hostnames with no port conflicts.**

4. **Clean up:**
   ```bash
   just worktree remove feature/experiment
   just down
   ```

## Success Criteria

- ✅ Both stacks start without errors
- ✅ No port conflicts during startup
- ✅ All services accessible via unique hostnames
- ✅ Container names clearly differentiate projects (include PROJECT prefix)
- ✅ Traefik routes to correct project based on hostname
- ✅ Projects are fully isolated (separate databases, separate containers)
