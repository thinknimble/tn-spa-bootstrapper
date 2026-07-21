---
id: actions-deploy-excludes-closed-prs
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: not_started
branch: feature/aws-fargate
---

# GitHub Actions: Deploy Job Does Not Run on PR Closed Events

## What Must Be True

`app-deploy.yml` deploy job condition explicitly excludes `pull_request.closed` events. A PR being closed or merged triggers only the cleanup/teardown path, never a deploy.

## Context

`app-deploy.yml` lines 29-30 define a deploy job condition that does not exclude PR closed events. When a PR is closed, both the deploy job and the cleanup job can trigger, racing against each other. The deploy may attempt to create or update infrastructure that the cleanup job is simultaneously tearing down.

## Success Criteria

- The deploy job condition includes a check like `github.event.pull_request.merged != true` and `github.event.action != 'closed'` (or equivalent)
- Closing a PR triggers only the cleanup/teardown job, not the deploy job
- Merging a PR triggers only the appropriate post-merge flow, not the PR deploy job
- The deploy job still triggers correctly on PR open, synchronize, and reopened events
