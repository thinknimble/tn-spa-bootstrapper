---
id: post-gen-removes-actions-for-heroku
parent: heroku-template-rendering
created: 2026-07-21T20:00:00Z
priority: 1
status: done
depends-on: actions-raw-escape-github-expressions
branch: feature/aws-fargate
---

# Post-Gen Hook Removes AWS Actions for Heroku Deployments

## What Must Be True

When `deployment_option` is `Heroku`, the post-gen hook removes the `.github/actions/` directory (containing `generate-terraform-vars`, `setup-aws`, `setup-environment`, `setup-terraform`). Heroku-generated projects contain no AWS/Terraform action files.

## Success Criteria

- `remove_terraform_files()` in `hooks/post_gen_project.py` deletes `.github/actions/` directory
- A project generated with `deployment_option=Heroku` has no `.github/actions/` directory
- A project generated with `deployment_option=Terraform (AWS)` still has all four action directories intact
