---
id: env-project-variable
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: done
---

# Environment: PROJECT Variable

## What Must Be True

The `{{cookiecutter.project_slug}}/.env.example` file includes a `PROJECT` variable with a descriptive placeholder value.

## Required Content

```
PROJECT=myproject
```

Or use a more descriptive placeholder:
```
PROJECT=project-name
```

## Usage

The `PROJECT` variable:
- Namespaces container names: `${PROJECT}-server`, `${PROJECT}-client`
- Creates unique Traefik routes: `${PROJECT}.localhost`, `api.${PROJECT}.localhost`
- Prevents naming collisions when running multiple projects

## Developer Workflow

1. Copy `.env.example` to `.env`
2. Set `PROJECT=actual-project-name` (e.g., `PROJECT=ecommerce`)
3. Containers become `ecommerce-server`, `ecommerce-client`
4. Access via `ecommerce.localhost`, `api.ecommerce.localhost`

## Success Criteria

- ✅ Variable exists in `.env.example`
- ✅ Placeholder value is descriptive (not empty, not just "project")
- ✅ Comment explains the variable's purpose (optional but helpful)
- ✅ Two projects with different PROJECT values can run simultaneously
