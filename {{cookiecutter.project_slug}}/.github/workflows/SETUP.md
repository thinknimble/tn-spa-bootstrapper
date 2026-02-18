# GitHub Actions Setup Guide

This guide helps you configure your GitHub repository with the necessary variables and secrets for automated PR deployments with ECR and Terraform.

## Required GitHub Repository Variables

Go to your repository **Settings > Secrets and variables > Actions > Variables** and add these:

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `AWS_ACCOUNT_ID` | Your AWS Account ID | `123456789012` |
| `SERVICE_NAME` | Your application service name | `myapp` |
| `COMPANY_DOMAIN` | Your company's base domain (optional if not using default) | `mycompany.com` |
| `ECR_REPOSITORY_NAME` | ECR repository name for your app | `myapp-app` |
| `STAFF_EMAIL` | Admin email address | `admin@mycompany.com` |
| `TF_AWS_ROLE_ARN` | IAM role ARN for GitHub Actions OIDC | `arn:aws:iam::123456789012:role/GitHubActionsRole` |

## Required GitHub Repository Secrets

Go to your repository **Settings > Secrets and variables > Actions > Secrets** and add these:

| Secret Name | Description |
|-------------|-------------|
| `DJANGO_SECRET_KEY` | Django secret key (generate a secure random string) |
| `DB_PASSWORD` | Database password for your RDS instance |
| `DJANGO_SUPERUSER_PASSWORD` | Password for Django admin superuser |
| `PLAYWRIGHT_TEST_USER_PASS` | Password for Playwright test user |
| `AWS_ACCESS_KEY_ID` | AWS Access Key ID for S3 storage (if using) |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Access Key for S3 storage (if using) |

## AWS IAM Setup for GitHub Actions

### 1. Create an OIDC Identity Provider


⚠️ You can skip this section and just use the helper script `terraform/scripts/setup-github-oidc-role.sh`

```bash
aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

### 2. Create IAM Role for GitHub Actions

Create a file `github-actions-trust-policy.json`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                },
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
                }
            }
        }
    ]
}
```

Create the role:

```bash
aws iam create-role \
    --role-name GitHubActionsRole \
    --assume-role-policy-document file://github-actions-trust-policy.json
```

### 3. Attach Required Policies

```bash
# ECR permissions
aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

# ECS permissions  
aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess

# Additional permissions for Terraform
aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess

aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess


aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess

aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/IAMFullAccess

aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite

aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

# S3 and DynamoDB permissions for Terraform backend
aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Elastic Load Balancing permissions for ALB/NLB
aws iam attach-role-policy \
    --role-name GitHubActionsRole \
    --policy-arn arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess
```

## How It Works

### PR Workflow
1. **New PR created** → Creates new ECR image tagged with `pr-{number}-{commit-sha}`
2. **New commit to PR** → Builds new image, taint ECS service, redeploys
3. **PR closed** → Destroys all infrastructure for that PR

### Image Tagging Strategy
- **PR builds**: `pr-123-abc1234` (PR number + commit SHA)
- **Main branch**: `main-abc1234` (commit SHA)
- **Latest tags**: `pr-123-latest`, `main-latest`

### Infrastructure Management
- Each PR gets its own Terraform workspace
- Isolated environments with unique subdomains: `myapp-pr-123.mycompany.com`
- Automatic cleanup when PR is closed

## Testing the Setup

1. Create a test PR
2. Check GitHub Actions tab for workflow execution
3. Verify ECR repository has new image
4. Check that PR comment shows deployment URL
5. Visit the URL to confirm deployment

## Troubleshooting

### Common Issues

**Permission Errors**
- Verify IAM role has all required policies attached
- Check that OIDC provider trust policy matches your repository

**Terraform Errors** 
- Ensure all required variables are set in GitHub repository settings
- Check that ECR repository exists or workflow has permission to create it

**Deployment Timeouts**
- Check ECS service logs via AWS Console
- Verify health check endpoint `/health` is working

### Getting Help

Check AWS CloudWatch logs:
```bash
aws logs tail "/ecs/myapp/pr-123" --region us-east-1 --follow
```

Check ECS service status:
```bash
aws ecs describe-services \
    --cluster "cluster-myapp-pr-123" \
    --services "service-app-myapp-pr-123" \
    --region us-east-1
```