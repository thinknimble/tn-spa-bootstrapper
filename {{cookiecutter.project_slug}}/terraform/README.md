## Prerequisites

- Install AWS CLI and Terraform
- Configure AWS credentials: `aws configure`
- **NEVER commit `terraform.tfvars` - it contains sensitive data!**
- For debugging tasks, install the [Session manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)


### Adding this to your existing project 
1. Copy the terraform directory to your project 
2. Add the new docker and start by copying over the docker [setup]("compose/server/tf")
3. Update the settings.py file to include the required settings 

```
import requests
import subprocess
import socket

# Container IP detection for AWS ECS
EC2_PRIVATE_IP = None
METADATA_URI_V4 = os.environ.get('ECS_CONTAINER_METADATA_URI_V4')
METADATA_URI = os.environ.get('ECS_CONTAINER_METADATA_URI', 'http://169.254.170.2/v2/metadata')

print("=== CONTAINER IP DETECTION DEBUG ===")
print(f"ECS_CONTAINER_METADATA_URI_V4: {METADATA_URI_V4}")
print(f"ECS_CONTAINER_METADATA_URI: {METADATA_URI}")

# Method 1: Try ECS Metadata API v4 (newer)
if METADATA_URI_V4:
    try:
        resp = requests.get(f"{METADATA_URI_V4}/task", timeout=5)
        data = resp.json()
        print(f"Metadata v4 response: {data}")
        
        # Look for our container
        for container in data.get('Containers', []):
            if 'server-' in container.get('Name', ''):
                networks = container.get('Networks', [])
                if networks:
                    EC2_PRIVATE_IP = networks[0]['IPv4Addresses'][0]
                    print(f"✅ Found container IP via metadata v4: {EC2_PRIVATE_IP}")
                    break
    except Exception as e:
        print(f"❌ Metadata v4 failed: {e}")

# Method 2: Try ECS Metadata API v2 (fallback)
if not EC2_PRIVATE_IP:
    try:
        resp = requests.get(METADATA_URI, timeout=5)
        data = resp.json()
        print(f"Metadata v2 response: {data}")
        
        container_meta = data['Containers'][0]
        EC2_PRIVATE_IP = container_meta['Networks'][0]['IPv4Addresses'][0]
        print(f"✅ Found container IP via metadata v2: {EC2_PRIVATE_IP}")
    except Exception as e:
        print(f"❌ Metadata v2 failed: {e}")

# Method 3: Try hostname -i command
if not EC2_PRIVATE_IP:
    try:
        result = subprocess.run(['hostname', '-i'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            EC2_PRIVATE_IP = result.stdout.strip().split()[0]
            print(f"✅ Found container IP via hostname: {EC2_PRIVATE_IP}")
    except Exception as e:
        print(f"❌ Hostname method failed: {e}")

# Method 4: Try socket method
if not EC2_PRIVATE_IP:
    try:
        hostname = socket.gethostname()
        EC2_PRIVATE_IP = socket.gethostbyname(hostname)
        print(f"✅ Found container IP via socket: {EC2_PRIVATE_IP}")
    except Exception as e:
        print(f"❌ Socket method failed: {e}")

# Add detected IP to ALLOWED_HOSTS
if EC2_PRIVATE_IP:
    if EC2_PRIVATE_IP not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(EC2_PRIVATE_IP)
        print(f"✅ Added container IP to ALLOWED_HOSTS: {EC2_PRIVATE_IP}")
else:
    print("❌ No container IP detected")

# SECURE FALLBACK: Only add the specific VPC subnets for this deployment
# Get VPC CIDR from environment variable (set by Terraform)
if os.environ.get('ECS_CONTAINER_METADATA_URI_V4') or os.environ.get('ECS_CONTAINER_METADATA_URI'):
    vpc_cidrs = config('VPC_CIDRS', default='10.0.1.0/24,10.0.2.0/24', cast=lambda v: [s.strip() for s in v.split(',')])
    for cidr in vpc_cidrs:
        if cidr and cidr not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(cidr)
            print(f"✅ Added VPC subnet for health checks: {cidr}")
        
print(f"✅ Final ALLOWED_HOSTS: {ALLOWED_HOSTS}")
print("=== END CONTAINER IP DEBUG ===")

# Additional debugging: Check if we're actually in ECS
if METADATA_URI_V4 or os.path.exists('/.dockerenv'):
    print("🐳 Detected containerized environment")
else:
    print("💻 Detected local development environment")

# Used by the corsheaders app/middleware (django-cors-headers) to allow multiple domains to access the backend
# Filter out CIDR ranges and private IPs from CORS origins (they're only for ALLOWED_HOSTS/health checks)
def is_public_domain(host):
    """Check if host is a public domain (not CIDR, not private IP)"""
    if not host or '/' in host:  # Skip CIDR ranges
        return False
    if host.startswith(('10.', '172.', '192.168.')):  # Skip private IPs
        return False
    if host.replace('.', '').isdigit():  # Skip any IP addresses
        return False
    return True

cors_allowed_hosts = [host for host in ALLOWED_HOSTS if is_public_domain(host)]
CORS_ALLOWED_ORIGINS = [f"https://{host}" for host in cors_allowed_hosts]
CSRF_TRUSTED_ORIGINS = [f"http://{host}" for host in cors_allowed_hosts] + [f"https://{host}" for host in cors_allowed_hosts]

print(f"✅ CORS allowed hosts: {cors_allowed_hosts}")
```

## 🚀 Review App System (Like Heroku)

This infrastructure automatically creates review apps with:
- **Auto-generated subdomains**: `myapp-development.mycompany.com`
- **Automatic HTTPS**: Uses your wildcard certificate for instant SSL
- **Zero configuration**: Just set your company domain, certificate ARN, and deploy!

## Configuration Setup

**⚠️ SECURITY WARNING: Never commit sensitive data to git!**

1. Copy the example configuration:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. **Minimal setup** for review apps:
```hcl
# terraform.tfvars - Only these are required for review apps!
service = "myapp"                    # Your app name
environment = "development"          # Environment (development, staging, pr-123, etc.)
company_domain = "mycompany.com"     # Your company domain
default_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/your-wildcard-cert-id"

# Database & Security (generate secure values!)
secret_key = "your-django-secret-key-here"
db_pass = "your-secure-database-password"
django_superuser_password = "your-admin-password"
```

**Result**: Your app will be available at `https://myapp-development.mycompany.com` with automatic HTTPS using your wildcard certificate!

## 🎯 Configuration Options Overview

Your infrastructure supports multiple deployment scenarios. Choose the one that fits your needs:

## 🚀 Scenario 1: Review Apps (Fully Automatic)

**Use Case:** PR deployments, staging environments, development  
**DNS:** Automatic via Route53  
**Certificates:** Uses your wildcard certificate (valid SSL)  
**Management:** Zero configuration after initial setup

```hcl
# terraform.tfvars
service = "myapp"
environment = "pr-123"                    # Changes per deployment
company_domain = "mycompany.com"          # Your domain
default_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/wildcard-cert"
# route53_zone_id = "Z123456789ABC"       # Optional: for automatic DNS records

# Everything else uses defaults
```

**✅ Result:** `https://myapp-pr-123.mycompany.com` (instant deployment with valid SSL)

---

## 🏢 Scenario 2: Production with Default Certificate

**Use Case:** Production deployments using your wildcard certificate  
**DNS:** Automatic via Route53  
**Certificates:** Uses your wildcard certificate (valid SSL)  
**Management:** Terraform handles everything

```hcl
# terraform.tfvars  
service = "myapp"
environment = "production" 
company_domain = "mycompany.com"
default_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/wildcard-cert"
# route53_zone_id = "Z123456789ABC"       # Optional: for automatic DNS records
```

**✅ Result:** `https://myapp-production.mycompany.com` (wildcard SSL certificate)

---

## 👥 Scenario 3: Customer Production (Custom Domain & Certificate)

**Use Case:** Hand off to customers with their own domain/SSL  
**DNS:** Customer manages manually  
**Certificates:** Customer provides their own ACM certificate ARN  
**Management:** Customer controls domain, you manage infrastructure

```hcl
# terraform.tfvars for customer
service = "customer-app" 
environment = "production"
current_domain = "app.customerdomain.com"        # Customer's domain
custom_certificate_arn = "arn:aws:acm:us-east-1:123:certificate/customer-cert"
use_custom_subdomain = false                     # Don't auto-generate
# route53_zone_id = ""                           # Customer handles DNS manually
```

**Customer Action Required:**
```dns
app.customerdomain.com CNAME customer-app-production-xyz.elb.amazonaws.com
```

**✅ Result:** `https://app.customerdomain.com` (customer's domain & SSL)

---

## 💻 Scenario 4: Local Development (ALB DNS)

**Use Case:** Quick testing without custom domains  
**DNS:** Use AWS load balancer DNS directly  
**Certificates:** None (HTTP only)  
**Management:** Minimal configuration

```hcl
# terraform.tfvars
service = "myapp"
environment = "development"
use_custom_subdomain = false                     # Use ALB DNS
enable_https = false                             # HTTP only
```

**✅ Result:** `http://myapp-development-123456.elb.amazonaws.com`

---

## 🔧 Setup Guide


### Deploy Any Scenario
```bash
cd terraform
terraform plan    # Review what will be created
terraform apply   # Deploy infrastructure
terraform output  # See your URLs and status
```

### Get Your Application URL
```bash
terraform output application_url
terraform output dns_status
```

## 🔐 Managing Environment Variables

This section explains how to add new environment variables to your application. Variables can be **sensitive** (stored securely in AWS Secrets Manager) or **non-sensitive** (passed directly to containers).

### 📋 Overview

When adding environment variables, you need to update up to five files:
1. **`variables.tf`** - Define the Terraform variable
2. **`terraform.tfvars.example`** - Document the variable with an example value
3. **`app.tf`** - Add to main container environment
4. **`workers.tf`** - Add to worker environments (optional)
5. **`secrets.tf`** - Add secure storage (for sensitive variables only)

### 🔒 Adding Sensitive Variables

Sensitive variables (passwords, API keys, tokens) are stored in AWS Secrets Manager and injected securely into containers.

**Example: Adding a new API key**

1. **Add to `variables.tf`:**
```hcl
variable "my_api_key" {
  type        = string
  description = "API key for external service integration"
  sensitive   = true  # Mark as sensitive
}
```

2. **Add to `terraform.tfvars.example`:**
```hcl
my_api_key = "your-api-key-here"
```

3. **Add to `secrets.tf`:**
```hcl
resource "aws_secretsmanager_secret" "my_api_key" {
  name = "${var.service}-${var.environment}-my_api_key"
}

resource "aws_secretsmanager_secret_version" "my_api_key" {
  secret_id     = aws_secretsmanager_secret.my_api_key.id
  secret_string = var.my_api_key
}
```

4. **Add to container secrets in `app.tf`:**
```hcl
# In the aws_ecs_task_definition.server resource, add to secrets array:
{
  name      = "MY_API_KEY",
  valueFrom = aws_secretsmanager_secret_version.my_api_key.arn
}
```

### 🌐 Adding Non-Sensitive Variables

Non-sensitive variables (feature flags, URLs, numeric values) are passed directly as environment variables.

**Example: Adding a feature flag**

1. **Add to `variables.tf`:**
```hcl
variable "enable_new_feature" {
  type        = string
  description = "Enable the new feature flag"
  default     = "false"  # Optional: provide default value
}
```

2. **Add to `terraform.tfvars.example`:**
```hcl
enable_new_feature = "true"
```

3. **Add to container environment in `app.tf`:**
```hcl
# In the aws_ecs_task_definition.server resource, add to environment array:
{
  name  = "ENABLE_NEW_FEATURE",
  value = var.enable_new_feature
}
```

### 📝 Variable Naming Conventions

- **Terraform variables**: Use snake_case (e.g., `my_api_key`)
- **Environment variables**: Use UPPER_SNAKE_CASE (e.g., `MY_API_KEY`)
- **Secret names**: Follow pattern `${service}-${environment}-variable_name`

### 🔍 Current Variables Reference

**Sensitive Variables (in Secrets Manager):**
- `secret_key` - Django SECRET_KEY
- `db_name`, `db_user`, `db_pass` - Database credentials
- `django_superuser_password` - Admin user password
- `aws_access_key_id`, `aws_secret_access_key` - AWS credentials
- `playwright_test_user_pass` - Test user password
- `rollbar_access_token` - Error tracking token

**Non-Sensitive Variables:**
- `debug` - Enable Django debug mode
- `current_domain`, `current_port` - Domain configuration
- `allowed_hosts` - Django ALLOWED_HOSTS setting
- `enable_emails` - Email functionality toggle
- `staff_email` - Contact email address
- `use_aws_storage` - S3 storage toggle
- `playwright_test_base_url` - Test environment URL

### ⚠️ Security Best Practices

1. **Always mark sensitive variables** with `sensitive = true` in variables.tf
2. **Never commit `terraform.tfvars`** - it contains real secrets
3. **Use descriptive names** that clearly indicate the variable's purpose
4. **Provide examples** in terraform.tfvars.example with placeholder values
5. **Document the purpose** of each variable in the description field

### 🚀 Deployment After Adding Variables

After adding new variables:

1. Update your local `terraform.tfvars` with actual values
2. Run `terraform plan` to see what will change
3. Run `terraform apply` to deploy the changes
4. Your application will restart with the new environment variables

### 🛠️ Automated Script

Use the provided script to automatically add environment variables:

```bash
# Interactive mode (recommended)
./scripts/add_env_var.sh

# Non-interactive examples
./scripts/add_env_var.sh -s --name myApiKey --description 'API key for service' --example 'your-key-here'
./scripts/add_env_var.sh -n --name enableFeature --description 'Enable new feature' --example 'true' --default 'false'
```

The script automatically handles:
- Converting any case format (camelCase, snake_case, UPPER_SNAKE_CASE) to proper formats
- Adding variables to all required files (variables.tf, terraform.tfvars.example, secrets.tf, app.tf)
- **Worker support**: Prompts to add variables to workers via common environment/secrets
- Validation and error checking
- Optional GitHub repository secrets/variables setup

**Worker Integration:**
- Variables added to workers become available to ALL workers (background, scheduled, etc.)
- Added to `local.common_environment` (non-sensitive) or `local.common_secrets` (sensitive)
- Automatically inherited by all existing and future worker modules

## 🏗️ Team Collaboration with Remote State

For team environments, this infrastructure uses S3 remote state backend to share Terraform state securely across team members.

### 🔧 Initial Setup (One-time per team)

**1. Create S3 backend resources:**
```bash
./scripts/setup_backend.sh
```
This creates:
- S3 bucket for state storage (with versioning & encryption)
- DynamoDB table for state locking
- Proper IAM policies

**2. Configure backend in your `terraform.tfvars`:**
```hcl
terraform_state_bucket = "your-company-terraform-state"
terraform_state_key    = "myapp/development/terraform.tfstate" 
terraform_state_region = "us-east-1"
terraform_lock_table   = "terraform-state-lock"
```

**3. Initialize with remote backend:**
```bash
./scripts/init_backend.sh
```
This script automatically:
- Reads configuration from your `terraform.tfvars`
- Generates appropriate state keys per environment
- Handles PR-based review apps with isolated state
- Supports different AWS profiles

### 👥 Team Member Workflow

**New team member setup:**
```bash
git clone your-repo
cd terraform
cp terraform.tfvars.example terraform.tfvars  # Add your actual values
./scripts/init_backend.sh                     # Initialize with correct backend
terraform plan                                # See current infrastructure state
```

### 🔄 PR Review Apps

**For PR-based deployments:**
```bash
# Development environment
./scripts/init_backend.sh -e development

# PR review app (isolated state)
./scripts/init_backend.sh -e pr-123

# Production environment  
./scripts/init_backend.sh -e production -p prod-profile
```

**CI/CD Integration:**
```bash
# GitHub Actions example
./scripts/init_backend.sh -e pr-${GITHUB_PR_NUMBER} -s myapp
terraform plan
terraform apply
```

### 🔒 What This Provides

- **State Sharing**: All team members see the same infrastructure state
- **Locking**: Prevents concurrent modifications (via DynamoDB)
- **Versioning**: S3 versioning keeps state history
- **Encryption**: State encrypted at rest in S3
- **Backup**: State automatically backed up in S3

### 🧹 Cleanup PR Environments

**When PR is closed:**
```bash
# Destroy infrastructure first
./scripts/init_backend.sh -e pr-123
terraform destroy

# Clean up state file (optional)
aws s3 rm s3://your-terraform-bucket/myapp/pr-123/terraform.tfstate
```

### ⚠️ Important Notes

- **Never commit `terraform.tfstate`** - it's stored in S3, not git
- **Always run `terraform plan`** before `apply` to see changes  
- **State locks automatically** during operations (no manual action needed)
- **Each environment gets isolated state** - PR apps won't affect production
- **Backend resources are shared** across all environments for your team

## Required IAM permissions

- [Pull-through cache rule IAM permissions](https://docs.aws.amazon.com/AmazonECR/latest/userguide/pull-through-cache-iam.html)

## Deploy Your Review App

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

After deployment, Terraform will output:
```bash
application_url = "https://myapp-development.mycompany.com"
certificate_type = "default"
load_balancer_dns = "myapp-dev-123456789.us-east-1.elb.amazonaws.com"
```

## Resources:

- AWS Get Started Tutorials: https://developer.hashicorp.com/terraform/tutorials/aws-get-started
- Reddit Convo: https://www.reddit.com/r/Terraform/comments/hhlj9v/are_there_any_production_grade_terraformaws/
- Official HashiCorp Registry: https://registry.terraform.io/
  - GitHub: Hashicorp's official AWS modules: https://github.com/terraform-aws-modules
- Templates: https://github.com/aminueza/terraform-templates
- A company that can do it for us? https://www.gruntwork.io/

## Recommended Aliases

Add these aliases to your `~/.zshrc` to save some keystrokes at the command line:

```bash
echo 'alias tf="terraform"' >> ~/.zshrc
echo 'alias tf-try="terraform init && terraform plan"' >> ~/.zshrc
echo 'alias tf-go="terraform init && terraform apply"' >> ~/.zshrc
echo 'alias tf-destroy="terraform destroy"' >> ~/.zshrc

# Reload the zshrc
source ~/.zshrc
```



## Build and Deploy Application

### 1. Create ECR Repository (First Time Only)
```bash
export ECR_REPO_NAME=your-app-name
aws ecr create-repository --repository-name $ECR_REPO_NAME --region us-east-1 --profile your-profile
```

### 2. Build and Push Docker Image
```bash
# Login to ECR
export AWS_ACCOUNT_ID="12345678"
aws ecr get-login-password --region us-east-1 --profile your-profile | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com

# Build and push (monolith architecture)
export ECR_REPO_NAME=your-app-name
docker buildx build --no-cache --platform linux/amd64 -f ./compose/server/tf/Dockerfile -t ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/${ECR_REPO_NAME}:latest --push .
```

### 3. Force Service Update (Deploy New Image)
```bash
aws ecs update-service \
  --cluster cluster-${SERVICE}-${ENVIRONMENT} \
  --service service-server-${SERVICE}-${ENVIRONMENT} \
  --force-new-deployment \
  --region us-east-1 --profile your-profile
```

## Monitoring and Debugging

### View Application Logs

**🚀 Interactive Log Streaming (Recommended):**
```bash
# Interactive mode
cd terraform/scripts
./stream-logs.sh

# CLI mode - specify all options upfront
./stream-logs.sh -s myapp -e development -t a -f "ERROR" -d 1h
./stream-logs.sh -s myapp -e production -t w -d 30m
./stream-logs.sh -s myapp -e staging -t "*" -f "user_id=123"
```

**What the script provides:**
- 🎯 **Smart filtering** - Separate server, worker, and other logs
- 🎨 **Color-coded output** - Different colors for different log types
- ⏰ **Time range selection** - Last 5min, 15min, 1hr, 4hr, or custom
- 🔍 **Pattern filtering** - Search for specific terms (ERROR, user_id, etc.)
- 📱 **Real-time streaming** - Continuously updates with new logs
- 📋 **Multi-stream support** - View multiple log streams simultaneously

**Stream options:**
- `a` - All server logs
- `w` - All worker logs  
- `*` - All logs from all containers
- `1-N` - Specific log stream

**Manual log commands:**
```bash
# Follow logs in real-time
aws logs tail "/ecs/your-app-name/development" --region us-east-1 --profile your-profile --follow

# Get recent log streams
aws logs describe-log-streams --log-group-name "/ecs/your-app-name/development" --region us-east-1 --profile your-profile --order-by LastEventTime --descending

# Filter logs by pattern
aws logs filter-log-events --log-group-name "/ecs/your-app-name/development" --filter-pattern "ERROR" --start-time $(date -d "1 hour ago" +%s)000
```

### Debug ECS Tasks
```bash
# Check service status
aws ecs describe-services --cluster "cluster-your-app-development" --services "service-server-your-app-development" --region us-east-1 --profile your-profile

# Check specific task details
aws ecs describe-tasks --cluster "cluster-your-app-development" --tasks "TASK_ID" --region us-east-1 --profile your-profile
```

### 🔗 Connect to Running Containers (ECS Exec)

Use the interactive script to connect to your running containers:

```bash
# Interactive mode
cd terraform/scripts
./ecs-exec.sh

# CLI mode - specify all options upfront
./ecs-exec.sh -s myapp -e development -c bash
./ecs-exec.sh -s myapp -e production -c django
./ecs-exec.sh -s myapp -e staging -c "python manage.py migrate"
```

**What the script does:**
- Lists all available services in your cluster
- Shows running tasks for selected service
- Connects you to the container with various shell options

**Available commands:**
1. `/bin/bash` - Interactive bash shell
2. `/bin/sh` - Fallback shell
3. `python manage.py shell` - Django shell
4. `python manage.py dbshell` - Database shell  
5. Custom command - Run any command you specify

**Requirements:**
- ECS Exec is already enabled (`enable_execute_command = true`)
- Session Manager plugin installed (see installation instructions below)

### 📦 Session Manager Plugin Installation

The ECS exec functionality requires the AWS Session Manager plugin:

**macOS:**
```bash
# Using Homebrew (recommended)
brew install --cask session-manager-plugin

# Or download manually
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/mac/sessionmanager-bundle.zip" -o "sessionmanager-bundle.zip"
unzip sessionmanager-bundle.zip
sudo ./sessionmanager-bundle/install -i /usr/local/sessionmanagerplugin -b /usr/local/bin/session-manager-plugin
```

**Linux (Ubuntu/Debian):**
```bash
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb
```

**Linux (Amazon Linux/RHEL/CentOS):**
```bash
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
sudo yum install -y session-manager-plugin.rpm
```

**Windows:**
```powershell
Invoke-WebRequest -Uri "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/windows/SessionManagerPluginSetup.exe" -OutFile "SessionManagerPluginSetup.exe"
.\SessionManagerPluginSetup.exe
```

**Verify installation:**
```bash
session-manager-plugin
# Should output: "The Session Manager plugin was installed successfully..."
```

**Manual ECS exec (if you prefer):**
```bash
# Get running task ID
aws ecs list-tasks --cluster cluster-myapp-development --service-name service-server-myapp-development

# Connect to task
aws ecs execute-command \
  --cluster cluster-myapp-development \
  --task TASK_ID \
  --container server-myapp-development \
  --interactive \
  --command "/bin/bash"
```

### Force Terraform to Recreate Resources
```bash
# Force new task definition
terraform taint aws_ecs_task_definition.server
terraform apply
```

## 🔧 Worker Modules

The infrastructure includes a modular worker system for background tasks, task queues, email processing, and other async operations.

### 📁 Worker Module Structure
```
terraform/
├── modules/
│   └── worker/              # Reusable worker module
│       ├── main.tf         # ECS task definition & service
│       ├── variables.tf    # Input parameters
│       └── outputs.tf      # Worker outputs
└── workers.tf              # Worker instantiations
```

### ➕ Adding New Workers

Add a new module block to `workers.tf`:

```hcl
module "my_new_worker" {
  source = "./modules/worker"

  name        = "data-processor"
  service     = var.service
  environment = var.environment

  cluster_id = aws_ecs_cluster.main.id
  image_uri  = "${data.aws_ecr_repository.server.repository_url}:${data.aws_ecr_image.server.image_tag}"
  command    = ["python", "manage.py", "process_data"]

  cpu           = 512
  memory        = 1024
  desired_count = 2

  execution_role_arn = aws_iam_role.ecs_tasks_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_role.arn

  subnets         = [aws_subnet.public.id]
  security_groups = [aws_security_group.server.id]

  environment_variables = concat(local.common_environment, [
    {
      name  = "WORKER_TYPE"
      value = "data_processing"
    },
    {
      name  = "BATCH_SIZE"
      value = "100"
    }
  ])

  secrets = local.common_secrets

  log_group_name = aws_cloudwatch_log_group.cw_logs.name
}
```

### ⚙️ Worker Configuration Options

**Required Parameters:**
- `name` - Worker identifier (e.g., "bg-processor")
- `command` - Container command to execute
- `cluster_id`, `image_uri`, `execution_role_arn`, `task_role_arn`
- `subnets`, `security_groups`, `log_group_name`

**Optional Parameters:**
- `cpu` - CPU units (default: 256)
- `memory` - Memory in MB (default: 512)
- `desired_count` - Number of instances (default: 1)
- `environment_variables` - Custom environment variables
- `secrets` - Additional secret variables

### 📊 Worker Management

**Scale workers:**
```hcl
# In workers.tf, change desired_count
desired_count = 3  # Scale to 3 instances
desired_count = 0  # Scale to 0 (temporarily disable)
```

**Temporarily disable workers (recommended):**
```hcl
# Set desired_count to 0 - keeps service/task definition ready
module "bg_processor" {
  # ... other config
  desired_count = 0  # No running instances, but service exists
}
# ✅ Fast restart: just change back to desired_count = 1
# ✅ ECS service and task definition remain ready
# ✅ Minimal AWS costs
```

**Permanently remove workers:**
```hcl
# Comment out the entire module block
# module "email_sender" {
#   ...
# }
# ❌ Slower restart: full resource recreation needed
# ✅ Zero AWS costs
# 💡 Use this for long-term removal
```

**Monitor workers:**
```bash
# Check worker status
aws ecs describe-services --cluster cluster-myapp-development --services service-bg-processor-myapp-development

# View worker logs
aws logs describe-log-streams --log-group-name /ecs/myapp/development | grep worker-bg-processor
```

### 🔗 Shared Resources

Workers automatically inherit:
- ✅ **Environment variables** - DB_HOST, REDIS_HOST, etc.
- ✅ **Secrets** - SECRET_KEY, database credentials, AWS keys
- ✅ **Network access** - Same VPC, security groups as main app
- ✅ **IAM permissions** - ECS execution and task roles
- ✅ **Logging** - CloudWatch logs with worker-specific prefixes

### 💡 Best Practices

1. **Resource sizing** - Start small (256 CPU, 512 MB) and scale based on monitoring
2. **Worker naming** - Use descriptive names: `email-sender`, `bg-processor`, `data-sync`
3. **Environment separation** - Workers get same environment variables as main app
4. **Monitoring** - Each worker gets separate CloudWatch log streams
5. **Deployment** - Workers deploy automatically with `terraform apply`

## ⏰ Scheduled Tasks (Cron Jobs)

The infrastructure includes EventBridge-triggered scheduled tasks for running Django management commands on a schedule.

### 🏗️ How It Works

Your existing django-background-tasks setup remains unchanged:
- **Background worker** (`bg-processor`) - runs `python manage.py process_tasks` continuously
- **Scheduled workers** - triggered by EventBridge at specific intervals

### 📋 Pre-configured Scheduled Tasks

**Every 5 minutes:**
- Worker: `django-scheduler`
- Command: `python manage.py your_custom_command` (customize this)
- Use case: Frequent data syncing, status checks


### ➕ Adding New Scheduled Tasks

**1. Create the worker module in `workers.tf`:**
```hcl
module "my_scheduled_task" {
  source = "./modules/worker"
  
  name        = "my-scheduled-task"
  service     = var.service
  environment = var.environment
  
  command       = ["python", "manage.py", "my_custom_command"]
  desired_count = 0  # Important: Don't run continuously
  
  # ... same config as other workers
}
```

**2. Create the EventBridge rule in `scheduled-tasks.tf`:**
```hcl
resource "aws_cloudwatch_event_rule" "my_schedule" {
  name                = "my-schedule-${var.service}-${var.environment}"
  description         = "Run my task hourly"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "my_schedule" {
  rule      = aws_cloudwatch_event_rule.my_schedule.name
  target_id = "MyScheduleTarget"
  arn       = aws_ecs_cluster.main.arn
  role_arn  = aws_iam_role.eventbridge_ecs_role.arn

  ecs_target {
    task_definition_arn = module.my_scheduled_task.task_definition_arn
    launch_type         = "FARGATE"
    platform_version    = "LATEST"
    
    network_configuration {
      subnets          = [aws_subnet.public.id]
      security_groups  = [aws_security_group.server.id]
      assign_public_ip = true
    }
  }
}
```

### ⏲️ Schedule Expression Examples

```hcl
# Every 5 minutes
schedule_expression = "rate(5 minutes)"

# Every hour
schedule_expression = "rate(1 hour)"

# Daily at 2:30 AM UTC
schedule_expression = "cron(30 2 * * ? *)"

# Every Sunday at midnight UTC  
schedule_expression = "cron(0 0 ? * SUN *)"

# Every weekday at 9 AM UTC
schedule_expression = "cron(0 9 ? * MON-FRI *)"

# Every 1st day of month at 3 AM UTC
schedule_expression = "cron(0 3 1 * ? *)"
```

### 🔍 Monitoring Scheduled Tasks

**View task execution history:**
```bash
# Check EventBridge rule status
aws events describe-rule --name django-command-5min-myapp-development

# View ECS task runs
aws ecs list-tasks --cluster cluster-myapp-development --service-name service-django-scheduler-myapp-development

# Check logs for specific scheduled task
aws logs filter-log-events --log-group-name /ecs/myapp/development --filter-pattern "worker-django-scheduler"
```

**Task execution outputs:**
- ✅ **Success** - Task completes and stops
- ❌ **Failure** - Check CloudWatch logs for errors
- ⏱️ **Timing** - EventBridge handles scheduling reliability

### 🎯 Current Setup Summary

| Type | Worker | Runs | Purpose |
|------|--------|------|---------|
| **Continuous** | `bg-processor` | Always | django-background-tasks queue processing |
| **Continuous** | `email-sender` | Always | Email queue processing |
| **Scheduled** | `django-scheduler` | Every 5 min | Custom management commands |
| **Scheduled** | `django-cleanup` | Daily 2 AM | Maintenance and cleanup |

### ⚠️ Important Notes

1. **Scheduled workers must have `desired_count = 0`** - they're only triggered by events
2. **Customize the commands** - Replace placeholder commands with your actual Django management commands
3. **Same environment** - Scheduled tasks use the same database, Redis, and secrets as your main app
4. **Cost efficient** - Tasks only run when scheduled, no idle costs