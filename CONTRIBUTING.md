# How to Contribute

We are always happy to get issues identified and pull requests!

## Testing locally

Make sure to clean up your local DB between runs so you can test things as a fresh install:
```bash
sudo -u $(whoami) psql -c "DROP DATABASE <project_slug>_db;"
sudo -u $(whoami) psql -c "DROP USER <project_slug>;"
```

You can run cookiecutter against the `main` branch on Github:

`cookiecutter https://github.com/thinknimble/tn-spa-bootstrapper.git`

You can run it against your own branch:

`cookiecutter https://github.com/thinknimble/tn-spa-bootstrapper.git --checkout my-branch-name`

You can run it against your locally cloned changes:

`cookiecutter tn-spa-bootstrapper/`

To accept the default answer for every prompt, run:

`cookiecutter tn-spa-bootstrapper/ --no-input`

## Getting your pull request merged in

1. Keep it small. The smaller the pull request, the more likely we'll pull it in.
1. Pull requests that fix a current issue get priority for review.

## Testing

The repo uses [uv](https://docs.astral.sh/uv/) for dependency management, the same as CI.

Install the dependencies (this includes [pytest-cookies](https://pypi.org/project/pytest-cookies/), which tests the template itself):

```bash
uv sync
```

Run the template tests:

```bash
uv run pytest
```

To run one test, use pytest's `-k` selector, for example:

```bash
uv run pytest -k test_project_generation
```

Lint and check formatting the same way CI does:

```bash
uv run ruff check .
uv run ruff format --check .
```

The pre-commit hooks also render the template and lint the generated project on every commit. Install them once with `uv run pre-commit install`.
