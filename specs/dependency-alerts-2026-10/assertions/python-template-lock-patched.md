---
id: python-template-lock-patched
parent: dependency-alerts-2026-10
created: 2026-10-26T00:00:00Z
priority: 1
status: done
---

# Template uv.lock Has the Patched OpenTelemetry and FastMCP

## What Must Be True

The template `uv.lock` resolves `opentelemetry-api` 1.45.1 or later and `fastmcp-slim` 3.4.10 or later. The template `pyproject.toml` keeps these versions as floors in `[tool.uv] constraint-dependencies`, the same method as the other transitive fixes.

## Success Criteria

- `opentelemetry-api` >= 1.45.1 and `fastmcp-slim` >= 3.4.10 in `{{cookiecutter.project_slug}}/uv.lock`.
- Only these packages, and the packages that must move with them, change in the lock.
- In a rendered project (`cookiecutter/react_template.yaml`): `uv lock --check` passes, and the server test suite passes with the CI flags.
