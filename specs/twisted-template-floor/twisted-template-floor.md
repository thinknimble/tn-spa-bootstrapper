---
id: twisted-template-floor
created: 2026-10-31T00:00:00Z
priority: 1
---

# Patched Twisted in the Python Template

## Problem

The template lock resolves Twisted 26.4.0 through Daphne. This version is in the vulnerable range of eight open alerts. A new project must start with the stable patched version.

## Scope

The template Python manifest and lock must select Twisted 26.10.0 or later. The generated example is outside this change.
