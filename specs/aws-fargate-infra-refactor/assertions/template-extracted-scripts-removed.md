---
id: template-extracted-scripts-removed
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 2
status: not_started
depends-on: actions-generate-tfvars-deploy-only
branch: feature/aws-fargate
---

# Template: Extracted Scripts No Longer Exist in the Cookiecutter Template

## What Must Be True

The six scripts that were extracted into `tn-cli` recipes no longer exist in the cookiecutter template. Scripts that contain project-specific logic remain.

## Scripts Removed

| Script Path | Replaced By |
|---|---|
| `terraform/scripts/ecs-exec.sh` | `tn aws-ecs-exec` |
| `terraform/scripts/stream-logs.sh` | `tn aws-stream-logs` |
| `terraform/scripts/setup_backend.sh` | `tn aws-tf-setup-backend` |
| `terraform/scripts/init_backend.sh` | `tn aws-tf-init-backend` |
| `terraform/scripts/setup-github-oidc-role.sh` | `tn aws-setup-oidc` |
| `.github/scripts/setup-secrets-bucket.sh` | `tn aws-setup-secrets` |

## Scripts Retained

| Script Path | Reason |
|---|---|
| `terraform/scripts/add_env_var.sh` | Project-specific env var management |
| `.github/scripts/get-env-config.sh` | Used by deploy workflow, project-specific |
| `.github/scripts/secrets-sync.sh` | Project-specific secrets synchronization |

## Success Criteria

- None of the 6 removed scripts exist in the template
- All 3 retained scripts still exist and function correctly
- No references to removed scripts remain in `Makefile`, `justfile`, `README.md`, or workflow files
- `terraform/scripts/` directory still exists (contains `add_env_var.sh`)
- `.github/scripts/` directory still exists (contains `get-env-config.sh`, `secrets-sync.sh`)

## Cross-Repo Dependency

This assertion depends on `cli-script-recipes` in `tn-cli/specs/aws-terraform-recipes/` being complete -- the replacement recipes must exist before the scripts are removed.
