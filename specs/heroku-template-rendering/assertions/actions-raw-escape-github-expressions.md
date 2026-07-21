---
id: actions-raw-escape-github-expressions
parent: heroku-template-rendering
created: 2026-07-21T20:00:00Z
priority: 1
status: not_started
branch: feature/aws-fargate
---

# GitHub Actions Expressions Are Escaped From Jinja2 Rendering

## What Must Be True

All `${{ }}` GitHub Actions expressions in `.github/actions/**/*.yml` template files are wrapped in `{% raw %}...{% endraw %}` blocks so cookiecutter's Jinja2 engine does not attempt to evaluate them. `{{cookiecutter.*}}` expressions in the same files remain outside raw blocks and render correctly.

## Success Criteria

- Every `${{ inputs.* }}`, `${{ steps.* }}`, `${{ vars.* }}`, `${{ github.* }}` expression in `.github/actions/**/*.yml` is inside a `{% raw %}` block
- `{{cookiecutter.sanitized_tf_service_name}}` and any other cookiecutter variables still render to their actual values
- `cookiecutter --no-input` with `deployment_option=Heroku` completes without rendering errors
- `cookiecutter --no-input` with `deployment_option=Terraform (AWS)` still produces correct action files with GitHub Actions expressions intact
