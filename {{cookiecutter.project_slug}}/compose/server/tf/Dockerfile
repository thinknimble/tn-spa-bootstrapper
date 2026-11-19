# syntax=docker/dockerfile:1
FROM python:3.12-slim-bullseye

# These environment values help with watching for file changes
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system-level dependencies.
RUN apt-get update \
    # dependencies for building Python packages
    && apt-get install -y build-essential \
    && apt-get install -y gcc \
    # psycopg2 dependencies
    && apt-get install -y libpq-dev \
    # Pillow dependencies
    && apt-get install -y libjpeg-dev zlib1g-dev \
    && apt-get install -y python3-pip \
    # Node.js for building client app
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set the name of the working directory inside the docker container
WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
COPY ./pyproject.toml /app/
COPY ./uv.lock /app/

RUN uv --version
# Copy server directory with pyproject.toml
COPY ./server /app/


ENV UV_PROJECT_ENVIRONMENT=/usr/local

# Install Python packages using uv sync
RUN uv sync

# Copy and build client application
COPY ./client /app/client

# Install client dependencies and build
WORKDIR /app/client
RUN npm ci

# Build the client, then upload its source maps to Rollbar and delete them from
# dist/ so collectstatic/WhiteNoise never serve them. SOURCE_VERSION (the git SHA)
# must match the client's baked code_version; the Rollbar tokens are mounted as a
# BuildKit secret so they never land in an image layer. ROLLBAR_SOURCEMAP_TOKENS is
# a comma-separated list of post_server_item tokens. AWS rebuilds a fresh image per
# environment, so here only the current environment's token is strictly needed, but
# the list is shared with Heroku (which promotes one slug across projects) and
# uploading to all of them is harmless. Both are optional: without them the upload
# is skipped but the maps are still stripped (see client/scripts/upload-sourcemaps.mjs).
ARG SOURCE_VERSION=dev
ENV SOURCE_VERSION=${SOURCE_VERSION}
RUN --mount=type=secret,id=rollbar_sourcemap_tokens \
    ROLLBAR_SOURCEMAP_TOKENS="$(cat /run/secrets/rollbar_sourcemap_tokens 2>/dev/null || true)" \
    npm run build && npm run upload-sourcemaps

# Move client dist and public to /client/ to match Django STATICFILES_DIRS
RUN mkdir -p /client && \
    mv /app/client/dist /client/dist && \
    mv /app/client/public /client/public && \
    ls -la /client/ && \
    echo "Client build moved to /client/dist and /client/public to match Django settings"

# Clean up Node.js to reduce image size
RUN apt-get remove -y nodejs npm curl && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Return to app directory
WORKDIR /app

# Move the 'start' shell script to the root
# and alter line endings for compatibility.
COPY ./compose/server/tf/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

# Set the start script as the entry point
CMD ["/start"]
