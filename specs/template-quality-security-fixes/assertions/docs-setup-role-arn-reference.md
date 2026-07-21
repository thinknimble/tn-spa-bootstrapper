---
id: docs-setup-role-arn-reference
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: not_started
branch: feature/aws-fargate
---

# Docs: SETUP.md References the Correct Role ARN Source

## What Must Be True

`SETUP.md` references `environments.json` (or the actual mechanism) as the source for AWS role ARNs, not the deprecated `TF_AWS_ROLE_ARN` GitHub secret.

## Context

`SETUP.md` line 16 references `TF_AWS_ROLE_ARN` as a GitHub secret, but the workflow actually reads role ARNs from `environments.json`. Users who create a `TF_AWS_ROLE_ARN` secret are following an outdated setup step that has no effect on the workflow.

## Success Criteria

- `SETUP.md` does not reference `TF_AWS_ROLE_ARN` as a required GitHub secret
- `SETUP.md` documents the actual role ARN configuration via `environments.json` (or equivalent)
- The documented approach matches how `setup-environment` and `get-env-config.sh` actually resolve role ARNs
