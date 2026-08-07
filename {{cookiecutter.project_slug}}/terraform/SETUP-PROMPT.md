# AWS Infrastructure Setup — LLM Prompt

Copy everything below the line and paste it into your LLM (Claude, ChatGPT, etc.) to get guided through the setup.

---

You are helping me set up AWS infrastructure for a Django + React application deployed on ECS Fargate. Walk me through each step interactively — ask me for values I need to provide, run commands when I confirm, and track which steps are done.

## Project Context

- **Project name (service)**: Use kebab-case (e.g., `my-project`). This is the `SERVICE_NAME` used everywhere.
- **Deployment**: Terraform on AWS ECS Fargate with GitHub Actions CI/CD
- **Environments**: development, staging, production (plus ephemeral PR environments)
- **Secrets**: Managed via S3 buckets, not GitHub Secrets
- **Auth**: GitHub Actions authenticates to AWS via OIDC (no static credentials)
- **VPC strategy**: Dev/PR environments share a VPC (`shared-dev-vpc`); staging and production get dedicated VPCs in separate AWS accounts

## Prerequisites

Before starting, confirm I have:
- AWS CLI installed and configured (`aws configure`)
- Terraform installed
- `tn-cli` installed (`pip install tn-cli`) — provides the `tn` commands below
- A GitHub repository with Actions enabled

## Setup Steps (follow in order)

### Step 1. Create shared VPC (once per AWS account)
```bash
tn aws-setup-vpc
```
Creates `shared-dev-vpc` for development and PR environments. Production/staging accounts need their own VPCs.

### Step 2. Create Terraform state backend (once per project)
```bash
tn aws-tf-setup-backend
```
Creates an S3 bucket (`{account-id}-{service}-terraform-state`) and DynamoDB lock table for Terraform state.

### Step 3. Initialize Terraform backend (once per environment)
Connects Terraform to the S3 state bucket from step 2.
```bash
tn aws-tf-init-backend -e development -s <service>
tn aws-tf-init-backend -e staging    -s <service>
tn aws-tf-init-backend -e production -s <service>
```

### Step 4. Create OIDC roles (once per environment/account)
Creates per-project-per-environment IAM roles named `github-actions-<service>-<environment>`. Idempotent — re-running updates trust policy and attached policies without error.

**Save the `role_arn` output** — you need it for `environments.json` in step 6.

```bash
# Run in each environment's AWS account (dev, staging, prod)
tn aws-setup-oidc secrets_bucket='<service>-terraform-secrets'
```

### Step 5. Create secrets bucket (once per environment)
Must run after OIDC (step 4) because the bucket policy references the OIDC role ARN.

```bash
tn aws-setup-secrets development
tn aws-setup-secrets staging
tn aws-setup-secrets production
```

### Step 6. Update `.github/environments.json`
Set `account_id`, `role_arn` (from step 4), `secrets_bucket`, and `region` for each environment. Each environment is a flat key-value object:
```json
{
  "production": {
    "account": "dev",
    "account_id": "<AWS_ACCOUNT_ID>",
    "region": "us-east-1",
    "role_arn": "arn:aws:iam::<AWS_ACCOUNT_ID>:role/github-actions-<service>-production",
    "secrets_bucket": "<service>-terraform-secrets",
    "base_domain": "<your-domain.com>",
    "use_custom_domain": true,
    "custom_domain": "<production-domain.com>",
    "route53_zone_id": "<ZONE_ID>",
    "certificate_arn": "<CERT_ARN>"
  },
  "staging": { "..." : "same structure" },
  "dev": { "..." : "same structure" },
  "pr": { "..." : "same structure, used for all pr-N environments" }
}
```

### Step 7. Set GitHub repository variables
Go to **Settings > Secrets and variables > Actions > Variables** and add:
- `SERVICE_NAME` — your kebab-case project name
- `ECR_REPOSITORY_NAME` — typically `<service>-app`
- `AWS_ACCOUNT_ID` — your AWS account ID

Role ARNs go in `environments.json`, NOT as GitHub variables.

### Step 8. Edit secrets files
The files `secrets-development.json`, `secrets-staging.json`, and `secrets-production.json` were created in step 5. Replace all `CHANGE-ME` values with real credentials.

Required secrets:
- `django_secret_key` — 50+ character random string
- `db_password` — secure database password
- `django_superuser_password` — admin password
- `rollbar_access_token` — (optional) error tracking
- `playwright_test_user_pass` — password for E2E test user

### Step 9. Push secrets to S3
```bash
.github/scripts/secrets-sync.sh push development
.github/scripts/secrets-sync.sh push staging
.github/scripts/secrets-sync.sh push production
```

## After Setup

Once all steps are complete:
- **PRs** auto-deploy to `<service>-pr-<number>.<base_domain>`
- **Push to main** deploys to staging
- **Manual dispatch** deploys to production
- PR environments are automatically destroyed when the PR is closed

## Reference Docs
- `.github/workflows/SETUP.md` — GitHub Actions setup details
- `terraform/README.md` — full Terraform documentation
- `tn --help` — list all available tn-cli commands
