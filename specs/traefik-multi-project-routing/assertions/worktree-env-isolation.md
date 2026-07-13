---
id: worktree-env-isolation
parent: traefik-multi-project-routing
created: 2026-07-13T00:00:00Z
priority: 1
status: done
branch: fix/issues-495-496-497-499
depends-on: worktree-command
---

# Worktree `.env` Isolation

## What Must Be True

A fresh git worktree does **not** inherit the parent's `.env` — worktrees only
carry tracked files, and `.env` is untracked. With no `.env`, `just setup-dev`
and `just up` in the new worktree fail: Docker Compose has no database
credentials or app config to interpolate. So `just worktree add <branch>` must
seed the new worktree with its **own** `.env`, copied from the parent
worktree's `.env` (falling back to `.env.example` when the parent has none).

**Container and database isolation between worktrees does not come from that
`.env`.** It is already delivered by mechanisms established in
`project-derived-from-branch` and `worktree-command`:

- Each worktree lives in its own directory (`../<slug>-<name>/`), so Docker
  Compose uses a distinct project name and gives each worktree its **own** named
  postgres data volume — the data is physically separate.
- `just up` names every container `${PROJECT}-*` from the branch-derived
  `PROJECT`, so two worktrees never share a postgres (or any) container.

Because the two stacks run **separate postgres containers backed by separate
volumes**, they stay isolated even when their `.env` files carry identical
`DB_NAME` and `PROJECT`. Patching those two values for isolation is therefore
unnecessary — a builder may normalize them in the seeded `.env` for cosmetic
consistency, but isolation must not depend on it, and this assertion does not
require it.

The one value that genuinely must be worktree-specific is the e2e target:

- **`PLAYWRIGHT_TEST_BASE_URL`** — must point at the worktree's **own** hostname
  (`http://${PROJECT}.localhost` behind Traefik), so the worktree's Playwright
  suite exercises its own stack rather than another worktree's or a stale
  default (`http://localhost:8080`).

The worktree hostname is derived from the **same branch→name rule** used by
`worktree-command` and `project-derived-from-branch` (strip the leading
branch-type prefix, lowercase, normalize separators). The exact
string-construction is a builder detail; what must hold is that the seeded
value is unique per worktree and consistent with that rule.

## Illustrative Values

For project slug `myapp` and `<branch>` argument `feature/auth_bug`
(directory `../myapp-auth-bug/`):

| `.env` key                 | Seeded value                                                            |
|----------------------------|------------------------------------------------------------------------|
| `PLAYWRIGHT_TEST_BASE_URL` | the worktree's own project hostname (`http://myapp-auth-bug.localhost`) |

## Success Criteria

- ✅ After `just worktree add <branch>`, the new worktree contains its own `.env`
- ✅ `.env` is seeded from the parent `.env`, or from `.env.example` when no parent `.env` exists
- ✅ `PLAYWRIGHT_TEST_BASE_URL` in the seeded `.env` targets the worktree's own hostname, not a shared/default one
- ✅ Two worktrees on different branches run their stacks concurrently with no container-name collisions
- ✅ The two worktrees use separate postgres containers backed by separate data volumes — migrate/seed in one does not touch the other, even when `DB_NAME` matches
- ✅ Each worktree's Playwright suite targets its own stack
