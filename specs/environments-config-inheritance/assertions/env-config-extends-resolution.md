---
id: env-config-extends-resolution
parent: environments-config-inheritance
created: 2026-07-21T22:00:00Z
priority: 1
status: done
branch: feature/aws-fargate
---

# get-env-config.sh resolves `extends` via deep merge

## What Must Be True

When a config entry in `environments.json` contains an `extends` key, `get-env-config.sh` loads the referenced base environment and deep-merges the current entry's overrides on top of it.

## Success Criteria

- If a resolved config entry has an `"extends": "<env-name>"` key, the script loads `environments.<env-name>` as the base config
- The entry's own fields are deep-merged on top of the base (jq `*` operator or equivalent), so nested objects like `domain` merge field-by-field rather than replacing the whole object
- The `extends` key itself is not included in the final output
- Circular `extends` references (A extends B, B extends A) produce a clear error and exit non-zero
- An `extends` referencing a non-existent environment produces a clear error and exit non-zero
- Entries without `extends` continue to work exactly as before (backward compatible)
- The resolution works for entries in `environments`, `patterns`, and `defaults` sections
