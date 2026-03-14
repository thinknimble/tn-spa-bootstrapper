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

This project supports two operational modes for Docker development:

### Standalone Mode (Default)

Works out of the box with standard port mappings. Ideal for working on a single project.

**Setup:**
1. Copy `.env.example` to `.env`
2. Run `docker-compose up`
3. Access the application:
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:8000`
   - Django admin: `http://localhost:8000/staff/`

**How it works:** Docker Compose automatically loads `docker-compose.yaml` and `docker-compose.override.yml`, which defines port mappings for all services.

### Traefik Mode (Multiple Projects Simultaneously)

Enables running multiple project instances at once without port conflicts. Each project is accessed via unique hostnames.

**Prerequisites:**
1. Create the shared Docker network (once):
   ```bash
   docker network create proxy
   ```

2. Run Traefik (if not already running):
   ```bash
   docker run -d \
     --name traefik \
     --network proxy \
     -p 80:80 \
     -p 8081:8080 \
     -v /var/run/docker.sock:/var/run/docker.sock:ro \
     traefik:v2.10 \
     --api.insecure=true \
     --providers.docker=true \
     --providers.docker.exposedbydefault=false \
     --entrypoints.web.address=:80
   ```
   
   Or use a `docker-compose.yaml` for Traefik in a dedicated directory. See [Traefik Docker Provider docs](https://doc.traefik.io/traefik/providers/docker/) for more options.

**Setup:**
1. Copy `.env.example` to `.env`
2. Edit `.env` and set:
   ```
   PROJECT=myproject
   COMPOSE_FILE=docker-compose.yaml:docker-compose.traefik.yml
   ```
3. Run `docker-compose up`
4. Access the application:
   - Frontend: `http://myproject.localhost`
   - Backend API: `http://api.myproject.localhost`

**How it works:** Setting `COMPOSE_FILE` tells Docker Compose to load `docker-compose.yaml` and `docker-compose.traefik.yml` (skipping `docker-compose.override.yml`). This removes host port mappings and attaches services to the shared `proxy` network, where Traefik routes traffic based on hostnames.

**Running multiple projects:**
- Generate or clone additional project instances
- Give each a unique `PROJECT` value in `.env`
- Start all projects: each will be accessible at `{PROJECT}.localhost`
- No port conflicts!

### Switching Modes

To switch from standalone to Traefik mode (or vice versa):

1. Edit `.env` to comment/uncomment the `COMPOSE_FILE` variable
2. Restart containers:
   ```bash
   docker-compose down
   docker-compose up
   ```

### Troubleshooting

**Cannot reach `{project}.localhost`:**
- Verify the `proxy` network exists: `docker network ls | grep proxy`
- If missing: `docker network create proxy`
- Verify Traefik is running: `docker ps | grep traefik`
- Check service is attached to proxy network: `docker inspect {PROJECT}-server | grep -A5 Networks`
- Verify Traefik labels: `docker inspect {PROJECT}-server | grep traefik`

**Port already in use:**
- Switch to Traefik mode (no host ports mapped)
- Stop conflicting containers: `docker ps` and `docker stop <container>`
- Check for other services: `lsof -i :8080`, `lsof -i :8000`

**Verify Traefik routing:**
- Access Traefik dashboard (if enabled): `http://localhost:8081` (or configured port)
- Check Traefik logs: `docker logs traefik`
- Test routing manually: `curl -H "Host: project.localhost" http://localhost/`

For more details, see the [Traefik documentation](https://doc.traefik.io/traefik/).

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
