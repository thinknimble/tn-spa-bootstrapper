---
id: tf-variables-destroy-defaults
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: done
depends-on: tf-locals-direct-references
branch: feature/aws-fargate
---

# Terraform: Every Variable Has a Default Sufficient for `terraform destroy`

## What Must Be True

Every variable in `variables.tf` has a `default` value that allows `terraform destroy` to run without a `terraform.tfvars` file. This is the lynchpin of the teardown simplification -- teardown jobs no longer need to generate tfvars.

## Success Criteria

- Every `variable` block in `variables.tf` has a `default` attribute
- `terraform destroy` succeeds when run with no `-var` flags and no `terraform.tfvars` file present, against an environment that was previously deployed
- Default values are sensible placeholders (e.g., empty strings, `false` for booleans) that do not cause Terraform to attempt creating new resources during destroy
- The `terraform plan -destroy` output shows only resource deletions, no creates or modifies, when using defaults
- Variables that are only meaningful during deploy (e.g., `docker_image_tag`, `domain_name`) default to empty string or a safe placeholder
