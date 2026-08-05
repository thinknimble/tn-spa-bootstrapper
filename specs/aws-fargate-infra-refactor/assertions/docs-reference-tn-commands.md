---
id: docs-reference-tn-commands
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 2
status: done
depends-on: template-extracted-scripts-removed
branch: feature/aws-fargate
---

# Documentation: References `tn` Commands for One-Time Setup

## What Must Be True

Terraform documentation in the template references `tn` CLI commands for one-time infrastructure setup instead of local scripts. Developers follow a clear sequence: install `tn-cli`, run setup recipes, then deploy.

## Success Criteria

- `terraform/README.md` references `tn aws-setup-vpc` for VPC creation as a prerequisite
- `terraform/README.md` references `tn aws-tf-setup-backend` and `tn aws-tf-init-backend` for Terraform backend setup
- `terraform/README.md` references `tn aws-setup-oidc` for GitHub OIDC role provisioning
- `terraform/README.md` references `tn aws-setup-secrets` for secrets bucket creation
- No references to removed scripts (`ecs-exec.sh`, `stream-logs.sh`, `setup_backend.sh`, `init_backend.sh`, `setup-github-oidc-role.sh`, `setup-secrets-bucket.sh`) remain in any documentation
- Documentation includes a prerequisite section stating that `tn-cli` must be installed (with link to https://github.com/thinknimble/tn-cli)
- The setup sequence is clearly ordered: (1) install tn-cli, (2) setup VPC, (3) setup backend, (4) setup OIDC, (5) setup secrets, (6) deploy
