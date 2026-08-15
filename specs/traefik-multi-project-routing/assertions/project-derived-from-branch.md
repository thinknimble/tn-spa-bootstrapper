---
id: project-derived-from-branch
parent: traefik-multi-project-routing
created: 2026-03-19T00:00:00Z
priority: 1
status: done
---

# PROJECT Derived from Git Branch at Runtime

## What Must Be True

The justfile includes a `_project` helper that derives `PROJECT` from the current git branch name at runtime. `just up` and `just down` use this value rather than reading `PROJECT` from `.env`.

## Branch-to-PROJECT Mapping

| Branch | PROJECT |
|--------|---------|
| `main` | `<slug>-main` |
| `feature/my-thing` | `<slug>-my-thing` |
| `fix/auth_bug` | `<slug>-auth-bug` |

Rules: strip a leading branch-type prefix (`word/` or `word_`), lowercase, slashes/underscores → hyphens, strip non-`[a-z0-9-]` chars, prefix with project slug.

This branch→name rule is the single source of truth for both `_project` (operates on the current branch) and `just worktree` (operates on its `<branch>` argument — see `worktree-command`). A worktree's directory name therefore equals its container `PROJECT` namespace.

## Implementation

The rule lives in one recipe, `_project-for`, which takes the branch as an
argument. `_project` calls it with HEAD. `just worktree` calls it with its
`<branch>` argument, because HEAD inside a worktree moves whenever someone
checks out another branch.

```just
[private]
_project:
    #!/usr/bin/env bash
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    just _project-for "$branch"

[private]
_project-for branch:
    #!/usr/bin/env bash
    branch="{{ branch }}"
    if [ "$branch" = "main" ]; then
      echo "{{cookiecutter.project_slug}}-main"
    else
      stripped=$(echo "$branch" | sed 's|^[a-zA-Z][a-zA-Z0-9]*[/_]||')
      echo "{{cookiecutter.project_slug}}-$(echo "$stripped" | tr '[:upper:]' '[:lower:]' | tr '/_' '-' | sed 's/[^a-z0-9-]//g')"
    fi
```

## Success Criteria

- ✅ `_project` and `_project-for` recipes exist and are private
- ✅ `_project` derives its answer through `_project-for`, so the rule has one home
- ✅ `just up` passes `PROJECT=$(just _project)` inline to `docker compose`
- ✅ `just down` uses the same runtime PROJECT so teardown matches startup
- ✅ Two worktrees on different branches get different PROJECT values
- ✅ `PROJECT` in `.env` is not required for `just up` to work
