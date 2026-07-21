---
id: tf-mandatory-vpc-data-sources
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: not_started
depends-on: tf-no-vpc-resources
branch: feature/aws-fargate
---

# Terraform: Mandatory Data Source Lookups for VPC, IGW, and Route Table

## What Must Be True

`main.tf` uses unconditional (no `count`) `data` source blocks to look up the shared VPC, internet gateway, and route table by tag filters. If the VPC does not exist, `terraform plan` fails immediately with a clear error rather than silently proceeding.

## Success Criteria

- `data "aws_vpc" "shared"` exists without `count` or `for_each`
- `data "aws_internet_gateway" "shared"` exists without `count` or `for_each`
- `data "aws_route_table" "shared"` exists without `count` or `for_each`
- Filter tags match the naming convention from the `cli-vpc-recipe` (e.g., Name = `{vpc_name}-{environment}`)
- `terraform plan` fails with a clear, actionable error message when the VPC does not exist (fail-fast behavior)
- No `try()`, `length()`, or conditional fallback logic wraps the data source lookups

## Cross-Repo Dependency

The tag filter values must match the tags created by `tn aws-setup-vpc` (defined in `tn-cli/specs/aws-terraform-recipes/assertions/cli-vpc-recipe.md`). Any change to the tag naming convention must be coordinated across both repos.
