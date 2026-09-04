---
id: actions-oidc-no-vpc-permissions
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: done
branch: feature/aws-fargate
---

# GitHub Actions: OIDC Role Policy Excludes VPC Creation/Deletion Permissions

## What Must Be True

The GitHub OIDC role IAM policy no longer grants permissions to create or delete VPC-level resources. VPC management is handled by the `tn aws-setup-vpc` recipe running under a user's local AWS credentials, not by CI/CD.

## Success Criteria

- No `ec2:CreateVpc`, `ec2:DeleteVpc` permissions in the OIDC policy document
- No `ec2:CreateInternetGateway`, `ec2:DeleteInternetGateway` permissions
- No `ec2:CreateRouteTable`, `ec2:DeleteRouteTable` permissions
- `ec2:Describe*` permissions remain (Terraform data sources need read access)
- Subnet and security group create/delete permissions remain (these are per-project resources)
- The OIDC setup script (or tn-cli recipe) reflects the trimmed policy

## Cross-Repo Dependency

This assertion aligns with `cli-vpc-recipe` and `cli-script-recipes` in `tn-cli/specs/aws-terraform-recipes/` -- VPC creation moves to local CLI execution, so CI/CD no longer needs VPC write permissions.
