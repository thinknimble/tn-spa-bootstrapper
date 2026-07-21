---
id: deploy-policy-resource-scoped
parent: oidc-per-project-isolation
created: 2026-07-21T22:00:00Z
priority: 2
status: draft
branch: feature/aws-fargate
---

# Deployment Policy Resources Are Scoped to Project

## What Must Be True

The OIDC role's deployment policy restricts resource access to the project's own resources using the `<service>` naming convention, rather than granting `Resource: "*"` across the account.

## Context

Current policy grants `ecr:*`, `ecs:*`, `rds:*`, `s3:*`, `iam:*`, etc. on `Resource: "*"`. Any project's pipeline can access every other project's ECR repos, ECS services, RDS instances, and S3 buckets in the same account.

## Success Criteria

- ECR access scoped to `arn:aws:ecr:<region>:<account>:repository/<service>-*`
- ECS access scoped to the project's cluster and services (`<service>-*` prefix)
- RDS access scoped to `arn:aws:rds:<region>:<account>:db:<service>-*` and related sub-resources (subnet groups, parameter groups)
- S3 access scoped to project-specific buckets (`<service>-terraform-state`, `<service>-terraform-secrets`) rather than `s3:*` on `*`
- Secrets Manager access scoped to `arn:aws:secretsmanager:<region>:<account>:secret:<service>-*`
- CloudWatch Logs access scoped to `arn:aws:logs:<region>:<account>:log-group:/ecs/<service>-*`
- Shared read-only resources (VPC describe, ACM list, Route53 read) can remain `Resource: "*"` since they are non-destructive
- IAM access scoped to roles/policies with `<service>-*` prefix (not `iam:*` on `*`)
