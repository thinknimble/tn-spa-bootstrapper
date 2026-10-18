---
id: actions-teardown-no-tfvars
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: done
depends-on: tf-variables-destroy-defaults
branch: feature/aws-fargate
---

# GitHub Actions: Teardown Jobs Do Not Generate terraform.tfvars

## What Must Be True

The `cleanup-pr-environment` and `teardown-environment` jobs in `app-deploy.yml` run `terraform destroy` using only the default values from `variables.tf`. No `generate-terraform-vars` step or tfvars file generation occurs in teardown paths.

## Success Criteria

- Neither `cleanup-pr-environment` nor `teardown-environment` job contains a "Generate Terraform Variables" step
- Neither job references the `generate-terraform-vars` action
- `terraform destroy` runs successfully using only variable defaults
- Teardown job steps are minimal: checkout, setup-environment, setup-aws, setup-terraform, terraform init, terraform destroy
- No `terraform.tfvars` file is created or referenced during teardown
- PR environment cleanup triggers on PR close and destroys all resources without needing the deploy pipeline's tfvars generation
