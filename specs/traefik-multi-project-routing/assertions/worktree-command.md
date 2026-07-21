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

## Directory Naming

The worktree directory slug is derived from the `<branch>` argument using the
**exact same rule** as the `_project` helper (see `project-derived-from-branch`):
strip a leading branch-type prefix (`word/` or `word_`), lowercase,
slashes/underscores → hyphens, strip non-`[a-z0-9-]` chars, then prefix with the
project slug. This makes the worktree directory name equal the container
`PROJECT` namespace, so `../<name>/` and its Docker stack share one identifier.

The only difference from `_project` is the input: the rule operates on the
`<branch>` **argument** (the target branch), not the currently-checked-out
branch.

| `<branch>` argument | Directory (and PROJECT) |
|---------------------|-------------------------|
| `main`              | `../<slug>-main/`       |
| `feature/my-thing`  | `../<slug>-my-thing/`   |
| `fix/auth_bug`      | `../<slug>-auth-bug/`   |
| `feature/x`         | `../<slug>-x/`          |

## `add` Behavior

1. Creates git worktree at `../<name>/`, where `<name>` is derived from the
   `<branch>` argument per **Directory Naming** above
2. Creates branch if it doesn't exist; checks out existing branch if it does
3. Runs `just setup-dev` in the new worktree
4. Prints instructions for starting the stack

## `remove` Behavior

1. Runs `just down` in the worktree to stop Docker services
2. Runs `git worktree remove --force` to delete the directory
3. Does NOT delete the branch (prints reminder)

## Success Criteria

- ✅ `just worktree add feature/x` creates worktree at `../<slug>-x/` (leading `feature/` prefix stripped)
- ✅ Directory name equals the container `PROJECT` namespace for the same branch
- ✅ Creates branch if it doesn't exist
- ✅ Checks out existing branch without error
- ✅ `just worktree remove feature/x` stops services and removes directory
- ✅ Branch remains after remove (user must delete manually)
- ✅ Two worktrees on different branches run concurrently without port conflicts
