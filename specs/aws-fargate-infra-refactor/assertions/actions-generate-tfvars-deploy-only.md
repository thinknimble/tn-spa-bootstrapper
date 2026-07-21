---
id: actions-generate-tfvars-deploy-only
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: not_started
depends-on: actions-teardown-no-tfvars
branch: feature/aws-fargate
---

# GitHub Actions: generate-terraform-vars Action Is Deploy-Only

## What Must Be True

The `generate-terraform-vars` composite action generates tfvars only for deploy operations. The `mode` input and all cleanup/teardown branching logic are removed. The duplicate `get-env-config.sh` call is eliminated.

## Success Criteria

- The `mode` input is removed from `.github/actions/generate-terraform-vars/action.yml`
- No `if: inputs.mode == "cleanup"` or `if: inputs.mode == "teardown"` conditional steps exist
- No duplicate `get-env-config.sh` invocations remain (domain configuration is passed as action inputs or derived once)
- The action is focused solely on generating tfvars for deployment
- Action file is under ~130 lines (down from ~229 lines)
- Only deploy jobs reference this action; teardown jobs do not
