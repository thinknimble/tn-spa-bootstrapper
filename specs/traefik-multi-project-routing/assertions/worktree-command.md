---
id: worktree-command
parent: traefik-multi-project-routing
created: 2026-03-19T00:00:00Z
priority: 1
status: done
---

# Worktree Command: `just worktree add/remove <branch>`

## What Must Be True

The justfile includes a `worktree` recipe that manages git worktrees with isolated Docker stacks.

## Usage

```bash
just worktree add <branch>     # create worktree + run setup
just worktree remove <branch>  # stop Docker stack + remove worktree
```

## `add` Behavior

1. Creates git worktree at `../<slug>-<branch-slug>/`
2. Creates branch if it doesn't exist; checks out existing branch if it does
3. Runs `just setup-dev` in the new worktree
4. Prints instructions for starting the stack

## `remove` Behavior

1. Runs `just down` in the worktree to stop Docker services
2. Runs `git worktree remove --force` to delete the directory
3. Does NOT delete the branch (prints reminder)

## Success Criteria

- ✅ `just worktree add feature/x` creates worktree at `../<slug>-x/`
- ✅ Creates branch if it doesn't exist
- ✅ Checks out existing branch without error
- ✅ `just worktree remove feature/x` stops services and removes directory
- ✅ Branch remains after remove (user must delete manually)
- ✅ Two worktrees on different branches run concurrently without port conflicts
