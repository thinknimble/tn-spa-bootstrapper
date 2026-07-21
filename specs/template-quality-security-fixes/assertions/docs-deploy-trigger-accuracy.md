---
id: docs-deploy-trigger-accuracy
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: draft
branch: feature/aws-fargate
---

# Docs: terraform/README.md Deployment Trigger Description Matches Actual Workflow

## What Must Be True

`terraform/README.md` accurately describes how staging deployments are triggered. The documentation matches the actual workflow triggers in `app-deploy.yml`.

## Context

`terraform/README.md` lines 122-139 state that "tagged releases deploy to staging," but no tag-based trigger exists in the workflow. A push to `main` triggers the staging deployment. The docs describe a workflow that does not exist.

## Success Criteria

- `terraform/README.md` does not claim that tagged releases deploy to staging (unless a tag trigger is added to the workflow)
- The documented staging deployment trigger matches the actual trigger in `app-deploy.yml`
- If staging deploys on push to `main`, the docs say so
