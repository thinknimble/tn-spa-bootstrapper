---
id: tf-debug-description-accurate
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: draft
branch: feature/aws-fargate
---

# Terraform: debug Variable Description Matches This Project

## What Must Be True

The `description` field of the `debug` variable in `variables.tf` accurately describes its purpose in this project (controlling Django debug mode), not a copy-pasted description from another project.

## Context

`variables.tf` line 63 describes `debug` as related to a "billflow service backend," which is a different project. This is a copy-paste artifact that confuses anyone reading the Terraform configuration.

## Success Criteria

- The `debug` variable description references Django or this project's backend, not "billflow" or any other project name
- The description accurately conveys what the variable controls (e.g., "Enable Django DEBUG mode for the application")
