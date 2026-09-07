---
id: tf-no-vpc-resources
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: done
branch: feature/aws-fargate
---

# Terraform: No VPC/IGW/Route-Table Resource Blocks Exist in main.tf

## What Must Be True

`main.tf` contains no resource blocks that create, modify, or conditionally manage VPC infrastructure. The VPC lifecycle is fully external to per-project Terraform state.

## Success Criteria

- No `resource "aws_vpc"` blocks exist in any `.tf` file under `terraform/`
- No `resource "aws_internet_gateway"` blocks exist
- No `resource "aws_route_table"` blocks exist
- No `resource "aws_route"` blocks for internet gateway routes exist
- No `data "external" "check_shared_vpc"` block exists (the shell-based VPC existence check hack)
- No `count`-based conditional VPC creation logic remains
- `terraform state list` for a fresh deployment shows zero VPC/IGW/RT resources

## Cross-Repo Dependency

This assertion assumes the `cli-vpc-recipe` assertion in `tn-cli/specs/aws-terraform-recipes/` is complete -- the VPC must already exist (created via `tn aws-setup-vpc`) before Terraform runs.
