---
paths: server/**/test*.py, server/**/*_test.py, server/**/tests/**/*.py
---
# Backend Testing Checklist

## Required Patterns

- [ ] Use `@pytest.mark.django_db` decorator for database tests
- [ ] Use Factory Boy: `user_factory()`, NOT `User.objects.create()`
- [ ] Use `requests_mock` for external API calls
- [ ] Use `APIClient` with `client.force_authenticate(user=user)`

## Test Structure

- [ ] Use `pytest-factoryboy` registered factories from `conftest.py`
- [ ] Include `json_headers` fixture for API calls
- [ ] Test access control (user sees only their own data)
- [ ] Test staff bypass (staff sees all data)

## Common Fixtures

```python
# Available from conftest.py:
user_factory  # Creates test users
```

## Key Locations

- **Test factories**: `server/<project>/conftest.py` (pytest-factoryboy registered)
- **App factories**: `server/<project>/<app>/factories.py`

## Traefik-Aware Test Execution

When Traefik is running (`docker inspect traefik` succeeds), the `docker-compose.override.yml` is **not loaded** — postgres port 5432 is not mapped to the host. Backend tests must run inside the server container:

```bash
just server-test-docker
```

When Traefik is **not** running, `just server-test` works as normal (postgres is on `localhost:5432` via the override file).

**Full patterns:** See `.claude/rules/backend.md` - Testing Patterns section
