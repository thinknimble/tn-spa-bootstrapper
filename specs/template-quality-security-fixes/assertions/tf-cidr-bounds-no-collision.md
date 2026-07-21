---
id: tf-cidr-bounds-no-collision
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: draft
branch: feature/aws-fargate
---

# Terraform: CIDR Calculation Has Bounds Checking and No Collision With Reserved Octets

## What Must Be True

`locals.tf` CIDR calculation for PR environments uses modulo arithmetic (or equivalent) to keep the computed octet within the valid range (1-254). PR environment CIDRs do not collide with CIDRs reserved for named environments (dev, staging, production).

## Context

`locals.tf` lines 14-21 compute a CIDR octet from the PR number. PR #10 collides with the dev environment (both get octet 10). PR numbers 155 and above produce octets greater than 255, which are invalid CIDR components. There is no modulo or bounds checking.

## Success Criteria

- The computed CIDR octet is always within the valid range (1-254) for any positive PR number
- PR environment CIDRs do not collide with octets reserved for named environments (dev, staging, production)
- The calculation uses modulo arithmetic or equivalent to wrap large PR numbers into the valid range
- PR numbers that would previously produce invalid CIDRs (e.g., PR #155, #256, #1000) produce valid, non-colliding CIDRs
- A comment in `locals.tf` documents the reserved octets and the wrapping strategy
