---
id: actions-update-deployment-status
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: not_started
branch: feature/aws-fargate
---

# GitHub Actions: Deployment Status Updates the Original Deployment, Not a New One

## What Must Be True

`app-deploy.yml` deployment status step updates the status of the existing GitHub deployment (created earlier in the workflow) rather than creating a new deployment record. The GitHub Deployments API shows a single deployment with correct status transitions.

## Context

`app-deploy.yml` lines 138-155 create a NEW GitHub deployment via `POST /repos/{owner}/{repo}/deployments` instead of updating the status of the original deployment via `POST /repos/{owner}/{repo}/deployments/{id}/statuses`. This results in duplicate deployment records in GitHub and the original deployment never receiving a final status.

## Success Criteria

- The deployment status step uses the Deployments Statuses API (`POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses`)
- The deployment ID from the initial deployment creation step is passed to the status update step
- A single deployment record exists per workflow run in GitHub's Deployments view
- The deployment status correctly reflects `success`, `failure`, or `error` based on the workflow outcome
