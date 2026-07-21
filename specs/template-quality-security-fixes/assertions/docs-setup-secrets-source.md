---
id: docs-setup-secrets-source
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: done
branch: feature/aws-fargate
---

# Docs: SETUP.md Does Not Reference GitHub Repository Secrets That the Workflow Never Reads

## What Must Be True

`SETUP.md` does not instruct users to create GitHub repository secrets (`DJANGO_SECRET_KEY`, `DB_PASSWORD`, etc.) that the workflow never reads. The documented secret management approach matches the actual workflow (secrets come from S3).

## Context

`SETUP.md` lines 19-29 tell users to create GitHub repository secrets (`DJANGO_SECRET_KEY`, `DB_PASSWORD`, `DJANGO_SUPERUSER_PASSWORD`, etc.) that the workflow never reads -- secrets are actually sourced from an S3 bucket via `secrets-sync.sh`. Users who follow these setup instructions create unused secrets and may not set up the actual S3-based secrets, leaving deployments without credentials.

## Success Criteria

- `SETUP.md` does not instruct users to create `DJANGO_SECRET_KEY`, `DB_PASSWORD`, or `DJANGO_SUPERUSER_PASSWORD` as GitHub repository secrets
- `SETUP.md` documents the actual secret management approach (S3 bucket with `secrets.json`)
- Users following SETUP.md end-to-end have a working secrets configuration
