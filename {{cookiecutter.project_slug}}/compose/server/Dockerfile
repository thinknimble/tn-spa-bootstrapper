FROM python:3.12-slim-bullseye

# These environment values help with watching for file changes
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Install system-level dependencies.
RUN apt-get update \
    # dependencies for building Python packages
    && apt-get install -y build-essential \
    && apt-get install -y gcc \
    # psycopg2 dependencies
    && apt-get install -y libpq-dev \
    # Pillow dependencies
    && apt-get install -y libjpeg-dev zlib1g-dev \
    && apt-get install -y python3-pip

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


# Move the 'start' shell script to the root
# and alter line endings for compatibility.
COPY ./compose/server/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start