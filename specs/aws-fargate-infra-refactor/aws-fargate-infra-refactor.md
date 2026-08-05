---
id: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
---

# AWS Fargate Infrastructure Refactor

## Problem

The current AWS Fargate Terraform setup has three structural issues:

1. **VPC race condition** -- VPC/IGW/route-table resources are managed inside per-project Terraform state. When multiple projects share a VPC, concurrent `terraform apply` runs collide because each project thinks it owns the VPC lifecycle. The current workaround uses a `data "external"` hack to check if the VPC already exists, then conditionally creates it with `count`, but this is fragile and produces confusing plan output.

2. **Generic scripts trapped in the template** -- Six shell scripts (`ecs-exec.sh`, `stream-logs.sh`, `setup_backend.sh`, `init_backend.sh`, `setup-github-oidc-role.sh`, `setup-secrets-bucket.sh`) contain no project-specific logic but live inside the cookiecutter template wrapped in `{% raw %}` / `{% endraw %}` jinja guards. They are duplicated across every generated project.

3. **Bloated GitHub Actions** -- The `generate-terraform-vars` action has a `mode` input that branches between deploy/cleanup/teardown, generating tfvars files even for `terraform destroy` (which only needs variable defaults). This makes teardown jobs unnecessarily complex and couples them to the full deploy pipeline.

## Solution

**Phase 1 (tn-cli repo):** Extract generic scripts into `tn-cli` recipes. Create a dedicated `aws-setup-vpc` recipe that handles VPC lifecycle outside of Terraform.

**Phase 2 (this repo):** Remove VPC resources from Terraform. Replace with mandatory `data` source lookups that fail fast if the VPC does not exist (prerequisite: run `tn aws-setup-vpc` first).

**Phase 3 (this repo):** Simplify GitHub Actions. Add concurrency groups, remove tfvars generation from teardown jobs, make `generate-terraform-vars` deploy-only, and trim OIDC permissions.

**Phase 4 (this repo):** Remove extracted scripts from the template, update documentation to reference `tn` commands.

## Constraints

- Phase 1 lives in the `tn-cli` repo (spec: `aws-terraform-recipes`)
- Phases 2-4 live in this repo
- Cross-repo dependencies are noted in assertion body text (spekk `depends-on` is repo-local only)
- All work targets `feature/aws-fargate` branch
