---
id: env-config-fail-on-missing
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 2
status: not_started
branch: feature/aws-fargate
---

# Environment Config Scripts: Fail on Missing or Invalid Config, Never Fall Back Silently

## What Must Be True

`get-env-config.sh` exits with a non-zero exit code when the config file is missing or contains invalid JSON. `secrets-sync.sh` does not suppress stderr in a way that hides config lookup failures. No script silently falls back to dummy/default data when required configuration is absent.

## Context

`get-env-config.sh` exits 0 with fallback data (fake account ID, empty `role_arn`) when the config file is missing or contains invalid JSON. `secrets-sync.sh` line 62 suppresses all stderr with `2>/dev/null`, masking any config errors. The main deploy path is partially saved by an empty `role_arn` check in `setup-environment`, but the `secrets-sync.sh` path is fully vulnerable to silent misconfiguration.

## Success Criteria

- `get-env-config.sh` exits with a non-zero exit code if the config file does not exist
- `get-env-config.sh` exits with a non-zero exit code if the config file contains invalid JSON
- `get-env-config.sh` does not return fallback/dummy values (fake account IDs, empty role ARNs) on error
- `secrets-sync.sh` does not use `2>/dev/null` to suppress config lookup errors
- A clear error message names the missing file or parse error when config lookup fails
- The deploy workflow fails fast on config errors rather than proceeding with incorrect values
