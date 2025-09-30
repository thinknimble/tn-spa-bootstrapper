[![Built with Cookiecutter](https://img.shields.io/badge/built%20with-Cookiecutter-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter)

# {{cookiecutter.project_name}}

## Setup

### Docker

If this is your first time...

1. [Install Docker](https://www.docker.com/)
1. Run `uv sync` to generate a uv.lock
1. Run `cd client && npm install` so you have node_modules available outside of Docker
1. Back in the root directory, run `just docker-run-all`
1. If the DB is new, run `just create-test-data`
   1. SuperUser `admin@thinknimble.com` with credentials from your `.env`
   1. User `playwright@thinknimble.com` with credentials from your `.env` is used by the Playwright
      tests
1. View other available scripts/commands with `just`
1. `localhost:8080` to view the app.
1. `localhost:8000/staff/` to log into the Django admin
1. `localhost:8000/api/docs/` to view backend API endpoints available for frontend development

### Backend

If not using Docker...
See the [backend README](server/README.md)

### Frontend

If not using Docker...
See the [frontend README](client/README.md)

## Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality and consistency. The hooks will automatically run before each commit to check for issues.

### Setup

1. Install pre-commit hooks: `uv run pre-commit install`
2. (Optional) Run hooks manually on all files: `uv run pre-commit run --all-files`

The pre-commit configuration includes:
- Python linting and formatting with Ruff
- Frontend linting with ESLint and Prettier
- TypeScript type checking
- General checks (trailing whitespace, YAML/JSON validation, etc.)

## Testing & Linting Locally

1. `uv sync`
1. `uv run pytest server`
1. `uv run black server`
1. `uv run isort server --diff` (shows you what isort is expecting)

## Frontend E2E Testing with Playwright

1. `cd client`
1. `npx playwright install` - Installs browser driver
1. `npx playwright install-deps` - Install system-level dependencies
1. `npx playwright test`
1. `npx playwright codegen localhost:8080` - Generate your tests through manual testing

## AWS Deployment (Terraform)

This project includes a complete AWS ECS Fargate deployment setup with Terraform and GitHub Actions CI/CD.

### Quick Setup

1. **Configure environments.json** - Update `.github/environments.json` with your AWS account details:
   ```json
   {
     "patterns": {
       "pr-*": {
         "account_id": "123456789012",
         "role_arn": "arn:aws:iam::123456789012:role/github-actions-development",
         "region": "us-east-1",
         "secrets_bucket": "myapp-terraform-secrets"
       }
     }
   }
   ```

2. **Set up GitHub repository variables** (Settings → Secrets and variables → Actions → Variables):
   - `ECR_REPOSITORY_NAME`: Your ECR repository name
   - `SERVICE_NAME`: Your service name

3. **Set up AWS backend infrastructure**:
   ```bash
   cd terraform/scripts
   ./setup_backend.sh
   ```

4. **Set up GitHub OIDC roles**:
   ```bash
   cd terraform/scripts  
   ./setup-github-oidc-role.sh
   ```

5. **Deploy via GitHub Actions** - Push to a branch to trigger deployment

### Multi-Account Setup

For production isolation, set up separate AWS accounts:

**Dev Account (123456789012):**
- Environments: `development`, `pr-*`, `main`
- Resources: `123456789012-myapp-terraform-state`

**Prod Account (345678901234):**
- Environments: `production`, `staging`  
- Resources: `345678901234-myapp-terraform-state`

The deployment automatically selects the correct backend based on your AWS account.

### Manual Deployment

```bash
# Initialize terraform backend
cd terraform
./scripts/init_backend.sh -e development -s myapp

# Deploy
terraform plan
terraform apply
```

### Secrets Management

Manage application secrets with the included secrets sync tool:

```bash
# Create secrets template
.github/scripts/secrets-sync.sh template development

# Edit secrets-development.json with your values

# Upload to S3
.github/scripts/secrets-sync.sh push development

# Pull from S3  
.github/scripts/secrets-sync.sh pull development
```

### Log Streaming

Stream real-time logs from your deployed application:

```bash
cd terraform/scripts
./stream-logs.sh -s myapp -e development -t a  # All server logs
./stream-logs.sh -s myapp -e production -t w   # All worker logs
```

### Architecture

- **ECS Fargate** - Serverless container hosting
- **Application Load Balancer** - Traffic distribution
- **RDS PostgreSQL** - Managed database
- **S3** - Static files and Terraform state
- **CloudWatch** - Logging and monitoring
- **GitHub Actions** - CI/CD pipeline
- **OIDC Authentication** - Secure AWS access

### Environment Variables

Key environment variables are automatically configured from your environments.json:

- `DJANGO_SECRET_KEY` - From secrets
- `DATABASE_URL` - Auto-generated from RDS
- `ALLOWED_HOSTS` - From environment config
- `AWS_STORAGE_BUCKET_NAME` - For S3 static files
- `PLAYWRIGHT_TEST_BASE_URL` - Auto-generated from deployment URL
