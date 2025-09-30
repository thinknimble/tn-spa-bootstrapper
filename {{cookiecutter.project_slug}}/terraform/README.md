# Terraform AWS Infrastructure

Production-ready AWS infrastructure for Django applications using ECS Fargate, with automated multi-account deployments, S3 secrets management, and comprehensive CI/CD integration.

## 🚀 Quick Start

**Minimal setup for deployment:**

1. **Configure environments**:
   ```bash
   # Update AWS account IDs in .github/environments.json
   # See Multi-Account Setup section below
   ```

2. **Set up secrets**:
   ```bash
   # First, create the S3 secrets bucket
   .github/scripts/setup-secrets-bucket.sh development
   
   # Check if secrets already exist, otherwise create template
   if .github/scripts/secrets-sync.sh pull development 2>/dev/null; then
     echo "Using existing secrets from S3"
   else
     echo "Creating new secrets template"
     .github/scripts/secrets-sync.sh template development
     # Edit secrets-development.json with your values
     .github/scripts/secrets-sync.sh push development
   fi
   ```

3. **Configure GitHub variables**:
   ```bash
   # Repository Variables (in GitHub Settings → Actions)
   SERVICE_NAME="{{cookiecutter.project_slug}}"
   ECR_REPOSITORY_NAME="{{cookiecutter.project_slug}}-app"
   AWS_ACCOUNT_ID="123456789012"
   
   # Environment-specific Role ARNs
   DEV_AWS_ROLE_ARN="arn:aws:iam::123456789012:role/github-actions-dev"
   STAGING_AWS_ROLE_ARN="arn:aws:iam::234567890123:role/github-actions-staging"
   PROD_AWS_ROLE_ARN="arn:aws:iam::345678901234:role/github-actions-prod"
   ```

4. **Deploy**:
   ```bash
   # Local deployment
   cd terraform
   terraform init
   terraform plan
   terraform apply
   
   # Or push to GitHub for automated deployment
   git push origin feature-branch  # Creates PR environment
   ```

## 📋 Prerequisites

- **AWS CLI** and **Terraform** installed
- **AWS credentials** configured: `aws configure`
- **GitHub repository** with Actions enabled
- **Session Manager plugin** for container access (optional)

**⚠️ Security Warning**: Never commit `terraform.tfvars` or any files containing secrets to git!

## 📝 Naming Requirements

**Important**: AWS resource naming has strict constraints. The following variables must follow specific naming conventions:

### Required Format
- **service**: Lowercase alphanumeric characters and hyphens only (no underscores)
- **environment**: Lowercase alphanumeric characters and hyphens only (no underscores)  
- **worker names**: Lowercase alphanumeric characters and hyphens only (no underscores)

### Examples
```bash
# ✅ Good
service = "my-app"
environment = "development"

# ❌ Bad - will cause terraform validation errors
service = "My_App"        # Contains uppercase and underscores
environment = "dev_env"   # Contains underscores
```

### Why This Matters
AWS services have different naming constraints:
- **ALB names**: Max 32 chars, alphanumeric and hyphens only
- **ElastiCache clusters**: Max 50 chars, lowercase alphanumeric and hyphens only
- **Secrets Manager**: No specific length limit, but consistent naming is important

Terraform will validate these requirements and provide clear error messages if invalid names are used.

## 🏗️ Architecture Overview

### Core Infrastructure
- **ECS Fargate**: Serverless containers with auto-scaling
- **Application Load Balancer**: HTTPS termination and routing
- **RDS PostgreSQL**: Managed database with automated backups
- **ElastiCache Redis**: Session storage and caching
- **CloudWatch**: Centralized logging and monitoring
- **Route53**: DNS management with automatic subdomain creation

### Security & Access
- **AWS Secrets Manager**: Secure secret storage and rotation
- **S3 Secrets Workflow**: Centralized secrets management with validation
- **OIDC Authentication**: Secure GitHub Actions integration
- **Multi-Account Isolation**: Complete resource separation by environment
- **VPC Security Groups**: Network-level access controls

### CI/CD Integration
- **Automated PR Environments**: Every PR gets its own staging environment
- **Multi-Region Support**: Deploy to any AWS region per environment
- **Zero-Downtime Deployments**: Blue-green deployment strategy
- **Automatic Cleanup**: PR environments destroyed when PRs are closed

## 🔐 S3 Secrets Management

This infrastructure uses an S3-based secrets management system that provides visibility, validation, and multi-account support.

### Benefits over GitHub Secrets
- ✅ **Visibility**: View and validate secrets before deployment
- ✅ **Versioning**: S3 object versioning for secret history
- ✅ **Validation**: JSON schema validation and safety checks
- ✅ **Multi-account**: Environment-specific S3 buckets
- ✅ **Encryption**: Server-side encryption with AES-256

### Secrets Workflow

**Create secrets template:**
```bash
.github/scripts/secrets-sync.sh template development
```

**Edit secrets file:**
```json
{
  "service": "{{cookiecutter.project_slug}}",
  "environment": "development",
  "secrets": {
    "django_secret_key": "your-50-character-secret-key",
    "db_password": "secure-database-password",
    "django_superuser_password": "admin-password",
    "rollbar_access_token": "optional-rollbar-token",
    "aws_access_key_id": "optional-aws-key",
    "aws_secret_access_key": "optional-aws-secret",
    "playwright_test_user_pass": "test-password"
  }
}
```

**Upload to S3:**
```bash
.github/scripts/secrets-sync.sh push development
```

**Download from S3:**
```bash
.github/scripts/secrets-sync.sh pull development
```

**Validate secrets:**
```bash
.github/scripts/secrets-sync.sh validate secrets-development.json
```

### Secrets Management Commands

| Command | Purpose |
|---------|---------|
| `template [env]` | Create secrets template for environment |
| `pull [env]` | Download secrets from S3 |
| `push [env]` | Upload secrets to S3 |
| `validate [file]` | Validate secrets file format |
| `list [env]` | List available secrets in S3 |

## 🏢 Multi-Account Deployment

Deploy to separate AWS accounts for maximum security isolation between environments.

### Account Structure

| Environment | AWS Account | Purpose |
|-------------|-------------|---------|
| **Development** | Dev Account | Feature development, PR environments |
| **Staging** | Staging Account | Pre-production testing |
| **Production** | Prod Account | Live customer environment |

### Configuration

**1. Update `.github/environments.json`:**
```json
{
  "service": "{{cookiecutter.project_slug}}",
  "environments": {
    "production": {
      "account": "prod",
      "account_id": "345678901234",
      "region": "us-east-1",
      "role_arn_var": "PROD_AWS_ROLE_ARN",
      "secrets_bucket": "{{cookiecutter.project_slug}}-terraform-secrets",
      "description": "Production environment"
    },
    "staging": {
      "account": "staging",
      "account_id": "234567890123",
      "region": "us-east-1",
      "role_arn_var": "STAGING_AWS_ROLE_ARN",
      "secrets_bucket": "{{cookiecutter.project_slug}}-terraform-secrets",
      "description": "Staging environment"
    },
    "development": {
      "account": "dev",
      "account_id": "123456789012",
      "region": "us-east-1",
      "role_arn_var": "DEV_AWS_ROLE_ARN",
      "secrets_bucket": "{{cookiecutter.project_slug}}-terraform-secrets",
      "description": "Development environment"
    }
  },
  "patterns": {
    "pr-*": {
      "account": "dev",
      "account_id": "123456789012",
      "region": "us-east-1",
      "role_arn_var": "DEV_AWS_ROLE_ARN",
      "secrets_bucket": "{{cookiecutter.project_slug}}-terraform-secrets",
      "description": "Pull request environments"
    }
  },
  "defaults": {
    "account": "dev",
    "account_id": "123456789012",
    "region": "us-east-1",
    "role_arn_var": "DEV_AWS_ROLE_ARN",
    "secrets_bucket": "{{cookiecutter.project_slug}}-terraform-secrets",
    "description": "Default fallback configuration"
  }
}
```

**2. Set up OIDC roles for each account:**
```bash
# Run this script for each AWS account
terraform/scripts/setup-github-oidc-role.sh
```

**3. Configure GitHub repository variables:**
```bash
# Repository Variables
SERVICE_NAME="{{cookiecutter.project_slug}}"
ECR_REPOSITORY_NAME="{{cookiecutter.project_slug}}-app"
AWS_ACCOUNT_ID="123456789012"  # Primary account ID

# Environment-specific Role ARNs
DEV_AWS_ROLE_ARN="arn:aws:iam::123456789012:role/github-actions-development"
STAGING_AWS_ROLE_ARN="arn:aws:iam::234567890123:role/github-actions-staging"
PROD_AWS_ROLE_ARN="arn:aws:iam::345678901234:role/github-actions-production"
```

### Deployment Workflows

| Trigger | Environment | Account | Region | Outcome |
|---------|-------------|---------|--------|---------|
| **PR opened** | `pr-123` | Dev | us-east-1 | `https://{{cookiecutter.project_slug}}-pr-123.your-domain.com` |
| **Push to main** | `staging` | Staging | us-east-1 | `https://{{cookiecutter.project_slug}}-staging.your-domain.com` |
| **Manual deploy** | `production` | Prod | us-east-1 | `https://{{cookiecutter.project_slug}}-production.your-domain.com` |

## 🎯 Application Configuration

Centralized Django application settings are managed through `.github/app-config.json`:

```json
{
  "service": "{{cookiecutter.project_slug}}",
  "environments": {
    "production": {
      "django": {
        "debug": false,
        "enable_emails": true,
        "staff_email": "admin@{{cookiecutter.project_slug}}.com"
      },
      "aws": {
        "use_aws_storage": true,
        "aws_s3_region_name": "us-east-1"
      },
      "features": {
        "enable_https": true
      }
    },
    "development": {
      "django": {
        "debug": true,
        "enable_emails": false
      },
      "aws": {
        "use_aws_storage": false
      },
      "features": {
        "enable_https": false
      }
    }
  }
}
```

## 🔧 Environment Variables Management

### Adding New Variables

Use the provided script for automatic setup:

```bash
# Interactive mode (recommended)
terraform/scripts/add_env_var.sh

# Non-interactive examples
terraform/scripts/add_env_var.sh -s --name myApiKey --description 'API key for service' --example 'your-key-here'
terraform/scripts/add_env_var.sh -n --name enableFeature --description 'Enable new feature' --example 'true' --default 'false'
```

### Variable Types

**Sensitive Variables (stored in S3 + AWS Secrets Manager):**
- API keys, passwords, tokens
- Stored securely with encryption
- Injected into containers at runtime

**Non-Sensitive Variables (environment variables):**
- Feature flags, URLs, configuration
- Passed directly to containers
- Stored in terraform.tfvars and app-config.json

### Manual Variable Addition

**1. Add to `variables.tf`:**
```hcl
variable "my_api_key" {
  type        = string
  description = "API key for external service"
  sensitive   = true
}
```

**2. Add to `terraform.tfvars.example`:**
```hcl
my_api_key = "your-api-key-here"
```

**3. For sensitive variables, add to `secrets.tf`:**
```hcl
resource "aws_secretsmanager_secret" "my_api_key" {
  name = "${var.service}-${var.environment}-my_api_key"
}

resource "aws_secretsmanager_secret_version" "my_api_key" {
  secret_id     = aws_secretsmanager_secret.my_api_key.id
  secret_string = var.my_api_key
}
```

**4. Add to container configuration in `app.tf`:**
```hcl
# For sensitive variables (secrets array):
{
  name      = "MY_API_KEY",
  valueFrom = aws_secretsmanager_secret_version.my_api_key.arn
}

# For non-sensitive variables (environment array):
{
  name  = "MY_FEATURE_FLAG",
  value = var.my_feature_flag
}
```

## 🔄 Local Development

### Initial Setup

```bash
# 1. Copy configuration template
cp terraform.tfvars.example terraform.tfvars

# 2. Edit terraform.tfvars with your values
vim terraform.tfvars

# 3. Initialize and deploy
terraform init
terraform plan
terraform apply
```

### Configuration Options

**Minimal configuration:**
```hcl
# terraform.tfvars
service = "{{cookiecutter.project_slug}}"
environment = "development"

# Database & Security
secret_key = "your-django-secret-key-50-chars"
db_pass = "secure-database-password"
django_superuser_password = "admin-password"

# Domain & SSL (optional)
company_domain = "your-company.com"
default_certificate_arn = "arn:aws:acm:us-east-1:123:certificate/your-wildcard-cert"
```

**Review app setup:**
```hcl
# Automatic subdomain: myapp-development.company.com
service = "myapp"
environment = "development"
company_domain = "company.com"
default_certificate_arn = "arn:aws:acm:us-east-1:123:certificate/wildcard-cert"
route53_zone_id = "Z123456789ABC"  # Optional: for automatic DNS
```

**Custom domain setup:**
```hcl
# Customer's own domain: app.customer.com
service = "customer-app"
environment = "production"
current_domain = "app.customer.com"
custom_certificate_arn = "arn:aws:acm:us-east-1:123:certificate/customer-cert"
use_custom_subdomain = false
```

## 📊 Monitoring & Debugging

### Application Logs

**Interactive log streaming:**
```bash
cd terraform/scripts
./stream-logs.sh

# CLI mode examples
./stream-logs.sh -s {{cookiecutter.project_slug}} -e development -t a -f "ERROR" -d 1h
./stream-logs.sh -s {{cookiecutter.project_slug}} -e production -t w -d 30m
```

**Manual log commands:**
```bash
# Follow logs in real-time
aws logs tail "/ecs/{{cookiecutter.project_slug}}/development" --follow

# Filter by pattern
aws logs filter-log-events \
  --log-group-name "/ecs/{{cookiecutter.project_slug}}/development" \
  --filter-pattern "ERROR" \
  --start-time $(date -d "1 hour ago" +%s)000
```

### Container Access

**Interactive container access:**
```bash
cd terraform/scripts
./ecs-exec.sh

# CLI mode examples
./ecs-exec.sh -s {{cookiecutter.project_slug}} -e development -c bash
./ecs-exec.sh -s {{cookiecutter.project_slug}} -e production -c "python manage.py shell"
```

**Manual ECS exec:**
```bash
# Get running task ID
aws ecs list-tasks --cluster cluster-{{cookiecutter.project_slug}}-development

# Connect to container
aws ecs execute-command \
  --cluster cluster-{{cookiecutter.project_slug}}-development \
  --task TASK_ID \
  --container app-{{cookiecutter.project_slug}}-development \
  --interactive \
  --command "/bin/bash"
```

### Service Status

```bash
# Check service health
aws ecs describe-services \
  --cluster "cluster-{{cookiecutter.project_slug}}-development" \
  --services "service-app-{{cookiecutter.project_slug}}-development"

# Check task details
aws ecs describe-tasks \
  --cluster "cluster-{{cookiecutter.project_slug}}-development" \
  --tasks "TASK_ID"
```

## ⚙️ Worker Management

### Background Workers

The infrastructure includes modular worker support for background tasks:

```hcl
# Add to workers.tf
module "data_processor" {
  source = "./modules/worker"

  name        = "data-processor"
  service     = var.service
  environment = var.environment
  
  command       = ["python", "manage.py", "process_data"]
  desired_count = 2
  cpu           = 512
  memory        = 1024

  # Inherits environment variables and secrets
  environment_variables = concat(local.common_environment, [
    {
      name  = "WORKER_TYPE"
      value = "data_processing"
    }
  ])
  secrets = local.common_secrets
}
```

### Scheduled Tasks

EventBridge-triggered scheduled tasks for cron-like functionality:

```hcl
# Scheduled task configuration
resource "aws_cloudwatch_event_rule" "daily_cleanup" {
  name                = "daily-cleanup-${var.service}-${var.environment}"
  description         = "Run daily cleanup tasks"
  schedule_expression = "cron(0 2 * * ? *)"  # 2 AM UTC daily
}

resource "aws_cloudwatch_event_target" "daily_cleanup" {
  rule      = aws_cloudwatch_event_rule.daily_cleanup.name
  target_id = "DailyCleanupTarget"
  arn       = aws_ecs_cluster.main.arn
  role_arn  = aws_iam_role.eventbridge_ecs_role.arn

  ecs_target {
    task_definition_arn = module.cleanup_worker.task_definition_arn
    launch_type         = "FARGATE"
    # ... network configuration
  }
}
```

### Worker Management

```bash
# Scale workers
# In workers.tf: desired_count = 3

# Temporarily disable workers
# In workers.tf: desired_count = 0

# Monitor workers
aws ecs describe-services \
  --cluster cluster-{{cookiecutter.project_slug}}-development \
  --services service-data-processor-{{cookiecutter.project_slug}}-development
```

## 🔄 Team Collaboration

### Remote State Backend

```bash
# 1. Set up S3 backend (one-time per team)
terraform/scripts/setup_backend.sh

# 2. Configure backend in terraform.tfvars
terraform_state_bucket = "company-terraform-state"
terraform_state_key = "{{cookiecutter.project_slug}}/development/terraform.tfstate"
terraform_state_region = "us-east-1"
terraform_lock_table = "terraform-state-lock"

# 3. Initialize with remote backend
terraform/scripts/init_backend.sh
```

### Environment-Specific Deployments

```bash
# Development environment
terraform/scripts/init_backend.sh -e development

# PR review app
terraform/scripts/init_backend.sh -e pr-123

# Production environment  
terraform/scripts/init_backend.sh -e production
```

## 📚 Additional Resources

### Setup Scripts

| Script | Purpose |
|--------|---------|
| `terraform/scripts/setup_backend.sh` | Create S3 backend for state |
| `terraform/scripts/init_backend.sh` | Initialize Terraform with backend |
| `terraform/scripts/add_env_var.sh` | Add environment variables |
| `terraform/scripts/setup-github-oidc-role.sh` | Create GitHub OIDC roles |
| `.github/scripts/secrets-sync.sh` | Manage S3 secrets |
| `.github/scripts/setup-secrets-bucket.sh` | Create S3 secrets bucket |

### Useful Aliases

Add to your `~/.zshrc`:

```bash
alias tf="terraform"
alias tf-try="terraform init && terraform plan"
alias tf-go="terraform init && terraform apply"
alias tf-destroy="terraform destroy"
```

### External Resources

- [AWS Get Started Tutorials](https://developer.hashicorp.com/terraform/tutorials/aws-get-started)
- [Terraform AWS Modules](https://github.com/terraform-aws-modules)
- [Session Manager Plugin Installation](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)
- [ECS Pull-through Cache IAM Permissions](https://docs.aws.amazon.com/AmazonECR/latest/userguide/pull-through-cache-iam.html)

## 🚨 Security Best Practices

1. **Never commit secrets** - Use S3 secrets workflow
2. **Use separate AWS accounts** - Isolate environments
3. **Enable CloudTrail** - Audit all AWS API calls
4. **Rotate secrets regularly** - Leverage AWS Secrets Manager rotation
5. **Use least privilege IAM** - Minimal required permissions
6. **Enable encryption** - At rest and in transit
7. **Monitor access patterns** - CloudWatch and AWS Config
8. **Keep Terraform state secure** - S3 backend with encryption

## 🔧 Troubleshooting

### Common Issues

**Terraform state conflicts:**
```bash
# Force unlock if needed
terraform force-unlock LOCK_ID
```

**Container deployment failures:**
```bash
# Check task definition
aws ecs describe-task-definition --task-definition task-{{cookiecutter.project_slug}}-development

# Force new deployment
aws ecs update-service \
  --cluster cluster-{{cookiecutter.project_slug}}-development \
  --service service-app-{{cookiecutter.project_slug}}-development \
  --force-new-deployment
```

**DNS resolution issues:**
```bash
# Check Route53 records
aws route53 list-resource-record-sets --hosted-zone-id Z123456789ABC

# Verify SSL certificate
aws acm describe-certificate --certificate-arn arn:aws:acm:...
```

**S3 secrets access issues:**
```bash
# Test S3 access
aws s3 ls s3://{{cookiecutter.project_slug}}-terraform-secrets/

# Check IAM role permissions
aws iam get-role --role-name github-actions-development
```

For additional support, refer to the [GitHub repository issues](https://github.com/your-org/{{cookiecutter.project_slug}}/issues) or contact your infrastructure team.