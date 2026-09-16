---
id: heroku-template-rendering
created: 2026-07-21T20:00:00Z
priority: 1
---

# Heroku Template Rendering

## Problem

Heroku deployments are completely broken on `feature/aws-fargate`. Cookiecutter crashes during rendering because `.github/actions/*.yml` files contain `${{ inputs.X }}` (GitHub Actions syntax) which Jinja2 interprets as undefined template variables. The post-gen hook's `remove_terraform_files()` also doesn't clean up `.github/actions/` for Heroku, so even if rendering succeeded those AWS-specific action files would ship in Heroku projects.

## Root Cause

Two files (`generate-terraform-vars/action.yml`, `setup-aws/action.yml`) use both `{{cookiecutter.*}}` vars and `${{ inputs.* }}` GitHub Actions expressions. Since they contain cookiecutter vars, they can't be added to `_copy_without_render` — the GitHub Actions expressions need to be escaped with `{% raw %}` blocks instead.

## Constraints

- All work targets `feature/aws-fargate` branch
- This is a P1 blocker — Heroku is the default deployment option and it's completely broken
- Fix must not break Terraform (AWS) rendering
