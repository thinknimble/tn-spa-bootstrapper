---
id: actions-dispatch-action-input
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 1
status: draft
branch: feature/aws-fargate
---

# GitHub Actions: workflow_dispatch Has Explicit Action Input With Production Protection

## What Must Be True

`app-deploy.yml` `workflow_dispatch` defines an `action` input (e.g., `deploy` or `teardown`) so that deploy and teardown jobs have mutually exclusive conditions. Production teardown requires GitHub environment protection approval. Manual dispatch never runs deploy and teardown simultaneously.

## Context

The current `workflow_dispatch` only defines an `environment` input with no `action` input. The teardown job condition (`environment != ''`) is always true for any manual dispatch since the `environment` input is always provided. This means deploy and teardown jobs run simultaneously on every manual trigger. Additionally, there is no environment protection gate, so anyone with dispatch access can run `terraform destroy -auto-approve` against production without approval.

## Success Criteria

- `workflow_dispatch` defines an `action` input with allowed values (e.g., `deploy`, `teardown`) or equivalent mechanism to distinguish intent
- The deploy job only runs when the action is `deploy` (or equivalent)
- The teardown job only runs when the action is `teardown` (or equivalent)
- Deploy and teardown jobs never run simultaneously from the same workflow dispatch
- Production teardown uses a GitHub Actions `environment` with required reviewers configured (environment protection rules)
- Staging and production teardown conditions are distinct from PR environment teardown conditions
