---
id: twisted-template-locked
parent: twisted-template-floor
created: 2026-10-31T00:00:00Z
priority: 1
status: done
branch: fix/twisted-26.10.0
---

# The Template Locks Patched Twisted

## What Must Be True

The template Python manifest sets a Twisted floor of 26.10.0, and its lock resolves that version or later without unrelated package updates.

## Success Criteria

- The manifest keeps Twisted in `constraint-dependencies` because Daphne requires it through `twisted[tls]`.
- The template lock resolves Twisted 26.10.0 or later. Other packages move only if that version requires them.
- A rendered React project passes `uv lock --check` and the Python checks that the repository CI runs.
- The stale generated example stays unchanged.
