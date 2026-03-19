---
id: traefik-file-exists
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
updated: 2026-03-19T00:00:00Z
priority: 1
status: done
---

# Traefik Overlay File: Creation

## What Must Be True

The file `{{cookiecutter.project_slug}}/compose/docker-compose.traefik.yml` exists as a template in the bootstrapper and is created when projects are generated.

## File Location

```
{{cookiecutter.project_slug}}/compose/docker-compose.traefik.yml
```

Note: File moved from root-level `docker-compose.traefik.yml` to `compose/` subdirectory to co-locate with other Dockerfile assets and distinguish it from the auto-loaded `docker-compose.override.yml`.

## Success Criteria

- ✅ File exists in template at `compose/docker-compose.traefik.yml`
- ✅ File is generated when running `cookiecutter` command
- ✅ File is valid YAML
- ✅ File is version-controlled (not in template's `.gitignore`)
