---
id: oidc-per-project-isolation
created: 2026-07-21T22:00:00Z
priority: 2
---

# OIDC Per-Project Isolation

## Problem

The current `aws-setup-oidc` command creates one IAM role per environment (`github-actions-development`) shared across all projects in an AWS account. The deployment policy grants `*` access to ECR, ECS, RDS, S3, IAM, and more. This means any project's GitHub Actions pipeline can access every other project's resources in the same account — databases, secrets, container images, ECS services.

This is a security risk for multi-customer scenarios (e.g., a self-service dashboard where each customer gets their own project). Project A's deploy pipeline should not be able to read Project B's database password or push images to Project B's ECR repo.

## Desired State

Each project gets its own OIDC role (`github-actions-<service>-<environment>`) with IAM policies scoped to only that project's resources. The role naming convention and resource scoping ensure blast-radius isolation between projects.

## Scope

This is a cross-repo change:
- **tn-cli** (justfile): `aws-setup-oidc` needs a `service` parameter, role naming changes, policy scoping
- **tn-spa-bootstrapper** (this repo): `environments.json` template, post-gen instructions, and documentation must reflect per-project roles

Assertions here cover the template side. The tn-cli changes are tracked separately.

## Constraints

- Must be backwards-compatible: existing shared roles should still work until migrated
- Resource ARN scoping depends on consistent naming conventions (`<service>-*` prefix)
- Trust policy should be scoped to the specific GitHub repo, not the entire org
