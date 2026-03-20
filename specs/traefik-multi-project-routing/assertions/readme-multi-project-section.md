---
id: readme-multi-project-section
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: not_started
---

# Documentation: Multi-Project Development Section

## What Must Be True

The generated `{{cookiecutter.project_slug}}/README.md` includes a section explaining both operational modes and the worktree workflow.

## Required Content

### Section: Multi-Project Development

1. **Standalone Mode (Default)**
   - No configuration needed — `just up` works out of the box
   - Access via `localhost:8080` (frontend), `localhost:8000` (backend)
   - Port bindings come from `docker-compose.override.yml`

2. **Traefik Mode (Multiple Projects Simultaneously)**
   - Provision Traefik once: `just setup-traefik`
   - Then `just up` auto-detects Traefik and switches to hostname routing
   - `PROJECT` derived from git branch name automatically
   - Access via `http://${PROJECT}.localhost` / `http://api.${PROJECT}.localhost`
   - No host port conflicts — run as many projects as needed

3. **Worktree Workflow**
   - `just worktree add <branch>` — creates isolated worktree + Docker stack
   - `just worktree remove <branch>` — tears down stack + removes worktree
   - Each worktree gets its own `PROJECT` from branch name

## Success Criteria

- ✅ Both modes explained clearly
- ✅ `just setup-traefik` mentioned as the provisioning step
- ✅ Auto-detection behavior described (no manual file switching)
- ✅ Worktree workflow documented
- ✅ Example PROJECT values shown
