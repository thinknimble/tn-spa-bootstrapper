---
id: traefik-file-exists
parent: traefik-multi-project-routing
created: 2026-03-13T12:00:00Z
priority: 1
status: not_started
---

# Traefik File: Creation

## What Must Be True

The file `{{cookiecutter.project_slug}}/docker-compose.traefik.yml` exists as a template in the bootstrapper and is created when projects are generated.

## File Location

```
{{cookiecutter.project_slug}}/docker-compose.traefik.yml
```

## Cookiecutter Integration

The file must be:
1. Present in the cookiecutter template directory
2. Included in file generation
3. Created with proper YAML syntax
4. Version-controlled

## Success Criteria

- ✅ File exists in template
- ✅ File is generated when running `cookiecutter` command
- ✅ File is valid YAML
- ✅ File is version-controlled (not in template's `.gitignore`)
