---
id: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 1
---

# Template Quality and Security Fixes

## Problem

A code review of the AWS Fargate template uncovered 22 validated issues across security, correctness, configuration, GitHub Actions, and documentation. These are distinct from the VPC/Actions infrastructure refactoring in `aws-fargate-infra-refactor` -- they are bugs and security vulnerabilities in the current template that must be fixed before merge.

## Categories

1. **Critical Security (priority 1):** Secret masking in GitHub Actions outputs, null secret fallback, plaintext Playwright password in ECS task definitions, and workflow dispatch allowing unprotected production teardown.

2. **Correctness (priority 2):** Terraform plan exit code handling, production server using `runserver` instead of gunicorn, and silent failure on missing environment config.

3. **Config/Terraform (priority 3):** Wrong static file path in entrypoint, hardcoded region, CIDR collision for PR environments, string-typed booleans, debug defaulting to True, and copy-paste description.

4. **GitHub Actions (priority 3):** Deploy on PR close race, deployment status API misuse, and dead Rollbar resource.

5. **Documentation (priority 3):** Stale or incorrect docs for deployment triggers, repository secrets, role ARN references, variable names, tfvars example, and CIDR wrapping claims.

## Constraints

- All work targets `feature/aws-fargate` branch
- Security fixes (priority 1) must be completed before merge review
- Correctness fixes (priority 2) should follow security
- Config, actions, and docs fixes (priority 3) can be parallelized
