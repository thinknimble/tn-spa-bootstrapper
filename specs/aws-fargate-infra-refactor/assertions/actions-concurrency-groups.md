---
id: actions-concurrency-groups
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: not_started
branch: feature/aws-fargate
---

# GitHub Actions: Concurrency Groups Prevent Parallel Deploys to Same Environment

## What Must Be True

`app-deploy.yml` uses GitHub Actions concurrency groups to serialize deployments targeting the same environment. Different environments can still deploy in parallel.

## Success Criteria

- A `concurrency` key exists at the job or workflow level in `app-deploy.yml`
- The concurrency group key includes the environment name (e.g., `deploy-{environment}`) so that deploys to `staging` and `production` can run concurrently, but two deploys to `staging` are serialized
- `cancel-in-progress` is `true` for PR/review environments (newer deploy supersedes older)
- `cancel-in-progress` is `false` for production and staging (deploys queue rather than cancel)
- Concurrent pushes to the same PR do not produce orphaned Terraform state locks
