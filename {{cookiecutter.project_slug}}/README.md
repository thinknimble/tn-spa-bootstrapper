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

## Multi-Project Development

This project supports two operational modes for local Docker development.

### Standalone Mode (Default)

No configuration needed — `just up` works out of the box.

- Access the frontend at `http://localhost:8080`
- Access the backend API at `http://localhost:8000`
- Port bindings come from `docker-compose.override.yml` (loaded automatically by Docker Compose)

### Traefik Mode (Multiple Projects Simultaneously)

Run multiple projects (or worktrees) at the same time without port conflicts. Each project gets a unique hostname derived from the git branch name.

**One-time setup:**
```bash
just setup-traefik
```
This creates the `proxy` Docker network, generates `~/traefik/docker-compose.yml`, and starts the Traefik gateway. It is idempotent — safe to run multiple times.

**Then just use `just up` as normal.** It auto-detects the `proxy` network and switches to hostname routing automatically — no `.env` changes required.

**Access your project:**
- `PROJECT` is derived from the current git branch automatically
  - `main` branch → `{{cookiecutter.project_slug}}-main`
  - `feature/auth` branch → `{{cookiecutter.project_slug}}-auth`
- Frontend: `http://${PROJECT}.localhost`
- Backend API: `http://api.${PROJECT}.localhost`
- Traefik dashboard: `http://localhost:9090`

**To switch back to standalone mode:** Stop Traefik (`docker stop traefik`) and run `just up`. It falls back to port bindings automatically.

### Worktree Workflow

Work on multiple branches simultaneously with fully isolated Docker stacks:

```bash
# Create a worktree with its own Docker stack
just worktree add feature/experiment

# Each worktree gets its own PROJECT from the branch name:
#   main worktree      → PROJECT={{cookiecutter.project_slug}}-main
#   experiment worktree → PROJECT={{cookiecutter.project_slug}}-experiment

# Start both stacks (no port conflicts in Traefik mode)
just up                                           # in main worktree
cd ../{{cookiecutter.project_slug}}-experiment && just up   # in experiment worktree

# Tear down and remove a worktree
just worktree remove feature/experiment
```

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
