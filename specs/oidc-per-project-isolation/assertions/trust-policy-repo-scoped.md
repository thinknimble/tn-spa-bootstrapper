---
id: trust-policy-repo-scoped
parent: oidc-per-project-isolation
created: 2026-07-21T22:00:00Z
priority: 2
status: not_started
branch: feature/aws-fargate
---

# Trust Policy Is Scoped to Specific GitHub Repo

## What Must Be True

The OIDC role's trust policy allows assumption only from the specific GitHub repository, not the entire GitHub organization.

## Context

Currently the trust policy condition is `repo:<github_org>/*` which allows any repo in the org to assume the role. For multi-customer isolation, the trust should be `repo:<github_org>/<repo_name>:*` so only that project's repo can assume its role.

## Success Criteria

- `aws-setup-oidc` accepts a `repo` parameter (or derives it from `service`)
- Trust policy condition uses `repo:<github_org>/<repo_name>:*` instead of `repo:<github_org>/*`
- Multiple repos in the same org get separate roles with separate trust policies
- Post-gen instructions include the repo name parameter
