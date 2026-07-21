---
id: actions-plan-exitcode-handling
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 2
status: draft
branch: feature/aws-fargate
---

# GitHub Actions: terraform plan -detailed-exitcode Exit Code 2 Is Handled Correctly

## What Must Be True

`app-deploy.yml` correctly handles `terraform plan -detailed-exitcode` exit code 2 (changes present) so that the subsequent `terraform apply` step runs when there are infrastructure changes to apply. Exit code 1 (error) still causes the job to fail.

## Context

Lines 104-107 of `app-deploy.yml` use `terraform plan -detailed-exitcode`, which returns exit code 2 when changes exist. GitHub Actions treats any non-zero exit code as a step failure. Without `continue-on-error: true` or explicit exit code handling, the plan step fails and the apply step never runs -- meaning no deployment with actual infrastructure changes can ever succeed.

## Success Criteria

- `terraform plan -detailed-exitcode` exit code 2 (changes present) does not cause the workflow to fail
- `terraform plan -detailed-exitcode` exit code 1 (error) still causes the workflow to fail
- The apply step runs when the plan step reports exit code 2
- The apply step is skipped when the plan step reports exit code 0 (no changes)
- The mechanism used (e.g., `continue-on-error` with conditional, or shell exit code capture) is clearly readable
