---
id: oidc-role-per-project-per-env
parent: oidc-per-project-isolation
created: 2026-07-21T22:00:00Z
priority: 2
status: not_started
branch: feature/aws-fargate
---

# OIDC Role Is Per-Project-Per-Environment

## What Must Be True

`aws-setup-oidc` accepts a `service` parameter and creates a role named `github-actions-<service>-<environment>` (e.g., `github-actions-my-project-development`). Each project gets its own role. The `environments.json` template and post-gen instructions reference project-specific role ARNs.

## Context

Currently the role is named `github-actions-<environment>` with no project scoping. All projects in an account share the same role and the same broad `Resource: "*"` policies.

## Success Criteria

- `aws-setup-oidc` requires a `service` parameter (no default)
- Role name follows pattern `github-actions-<service>-<environment>`
- `environments.json` template shows role ARN with service name in the path (e.g., `github-actions-my-project-development`)
- Post-gen instructions pass `<service>` to `aws-setup-oidc`
- Existing roles without service prefix continue to work (backwards-compatible)
