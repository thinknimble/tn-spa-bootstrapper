#!/bin/bash

# Tests for get-env-config.sh: extends resolution via deep merge
# Validates that the extends keyword properly inherits and overrides config.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."
TEMPLATE_DIR="$PROJECT_DIR/{{cookiecutter.project_slug}}"
SCRIPT_UNDER_TEST="$TEMPLATE_DIR/.github/scripts/get-env-config.sh"
CONFIG_FILE="$TEMPLATE_DIR/.github/environments.json"

PASS=0
FAIL=0

pass() {
    PASS=$((PASS + 1))
    echo "  PASS: $1"
}

fail() {
    FAIL=$((FAIL + 1))
    echo "  FAIL: $1"
}

# Backup real config
if [[ -f "$CONFIG_FILE" ]]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.bak"
fi

cleanup() {
    rm -f "$CONFIG_FILE"
    if [[ -f "$CONFIG_FILE.bak" ]]; then
        mv "$CONFIG_FILE.bak" "$CONFIG_FILE"
    fi
}
trap cleanup EXIT

# -------------------------------------------------------
echo "=== extends: deep merge inherits base fields ==="
# -------------------------------------------------------

cat > "$CONFIG_FILE" << 'EOJSON'
{
  "environments": {
    "development": {
      "account": "dev",
      "account_id": "111111111111",
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::111111111111:role/github-actions-dev",
      "secrets_bucket": "my-secrets",
      "description": "Dev env",
      "domain": {
        "base_domain": "dev.example.com",
        "use_custom_domain": false,
        "route53_zone_id": "ZDEV",
        "certificate_arn": "arn:aws:acm:us-east-1:111111111111:certificate/dev-cert"
      }
    },
    "staging": {
      "extends": "development",
      "role_arn": "arn:aws:iam::111111111111:role/github-actions-staging",
      "description": "Staging env"
    }
  }
}
EOJSON

output=$("$SCRIPT_UNDER_TEST" staging 2>/dev/null)

# Should inherit account_id from development
if echo "$output" | grep -q "account_id=111111111111"; then
    pass "staging inherits account_id from development"
else
    fail "staging should inherit account_id from development"
fi

# Should use its own role_arn override
if echo "$output" | grep -q "role_arn=arn:aws:iam::111111111111:role/github-actions-staging"; then
    pass "staging overrides role_arn"
else
    fail "staging should override role_arn"
fi

# Should inherit nested domain fields
if echo "$output" | grep -q "base_domain=dev.example.com"; then
    pass "staging inherits nested domain.base_domain"
else
    fail "staging should inherit nested domain.base_domain"
fi

if echo "$output" | grep -q "route53_zone_id=ZDEV"; then
    pass "staging inherits domain.route53_zone_id"
else
    fail "staging should inherit domain.route53_zone_id"
fi

# -------------------------------------------------------
echo ""
echo "=== extends: nested object deep merge (not replace) ==="
# -------------------------------------------------------

cat > "$CONFIG_FILE" << 'EOJSON'
{
  "environments": {
    "development": {
      "account": "dev",
      "account_id": "111111111111",
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::111111111111:role/github-actions-dev",
      "secrets_bucket": "my-secrets",
      "description": "Dev env",
      "domain": {
        "base_domain": "dev.example.com",
        "use_custom_domain": false,
        "route53_zone_id": "ZDEV",
        "certificate_arn": "arn:aws:acm:us-east-1:111111111111:certificate/dev-cert"
      }
    },
    "production": {
      "extends": "development",
      "role_arn": "arn:aws:iam::111111111111:role/github-actions-prod",
      "description": "Prod env",
      "domain": {
        "use_custom_domain": true,
        "custom_domain": "app.example.com"
      }
    }
  }
}
EOJSON

output=$("$SCRIPT_UNDER_TEST" production 2>/dev/null)

# domain.use_custom_domain should be overridden to true
if echo "$output" | grep -q "use_custom_domain=true"; then
    pass "production overrides domain.use_custom_domain"
else
    fail "production should override domain.use_custom_domain to true"
fi

# domain.base_domain should be inherited (deep merge, not replaced)
if echo "$output" | grep -q "base_domain=dev.example.com"; then
    pass "production inherits domain.base_domain via deep merge"
else
    fail "production should inherit domain.base_domain (deep merge, not replace)"
fi

# domain.custom_domain should be set from override
if echo "$output" | grep -q "custom_domain=app.example.com"; then
    pass "production adds domain.custom_domain"
else
    fail "production should add domain.custom_domain"
fi

# domain.route53_zone_id should be inherited
if echo "$output" | grep -q "route53_zone_id=ZDEV"; then
    pass "production inherits domain.route53_zone_id via deep merge"
else
    fail "production should inherit domain.route53_zone_id"
fi

# -------------------------------------------------------
echo ""
echo "=== extends: extends key stripped from output ==="
# -------------------------------------------------------

# The word "extends" should not appear in stdout output
if echo "$output" | grep -q "extends"; then
    fail "extends key should not appear in output"
else
    pass "extends key is stripped from output"
fi

# -------------------------------------------------------
echo ""
echo "=== extends: patterns section ==="
# -------------------------------------------------------

cat > "$CONFIG_FILE" << 'EOJSON'
{
  "environments": {
    "development": {
      "account": "dev",
      "account_id": "111111111111",
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::111111111111:role/github-actions-dev",
      "secrets_bucket": "my-secrets",
      "description": "Dev env",
      "domain": {
        "base_domain": "dev.example.com",
        "use_custom_domain": false,
        "route53_zone_id": "ZDEV",
        "certificate_arn": "arn:aws:acm:us-east-1:111111111111:certificate/dev-cert"
      }
    }
  },
  "patterns": {
    "pr-*": { "extends": "development" },
    "main": { "extends": "development" }
  },
  "defaults": { "extends": "development" }
}
EOJSON

# Test pattern: pr-42 should resolve via extends
output=$("$SCRIPT_UNDER_TEST" pr-42 2>/dev/null)

if echo "$output" | grep -q "account_id=111111111111"; then
    pass "pr-42 pattern resolves extends to development"
else
    fail "pr-42 pattern should resolve extends to development"
fi

if echo "$output" | grep -q "base_domain=dev.example.com"; then
    pass "pr-42 pattern inherits domain from development"
else
    fail "pr-42 pattern should inherit domain from development"
fi

# Test pattern: main
output=$("$SCRIPT_UNDER_TEST" main 2>/dev/null)

if echo "$output" | grep -q "account_id=111111111111"; then
    pass "main pattern resolves extends to development"
else
    fail "main pattern should resolve extends to development"
fi

# Test defaults: unknown-env falls through to defaults
output=$("$SCRIPT_UNDER_TEST" unknown-env 2>/dev/null)

if echo "$output" | grep -q "account_id=111111111111"; then
    pass "defaults section resolves extends to development"
else
    fail "defaults section should resolve extends to development"
fi

# -------------------------------------------------------
echo ""
echo "=== extends: circular reference detection ==="
# -------------------------------------------------------

cat > "$CONFIG_FILE" << 'EOJSON'
{
  "environments": {
    "alpha": {
      "extends": "beta",
      "account": "dev",
      "region": "us-east-1"
    },
    "beta": {
      "extends": "alpha",
      "account": "dev",
      "region": "us-east-1"
    }
  }
}
EOJSON

if output=$("$SCRIPT_UNDER_TEST" alpha 2>&1); then
    fail "should exit non-zero on circular extends"
else
    pass "exits non-zero on circular extends"
fi

if echo "$output" | grep -qi "circular"; then
    pass "error message mentions circular reference"
else
    fail "error message should mention circular reference"
fi

# -------------------------------------------------------
echo ""
echo "=== extends: non-existent base detection ==="
# -------------------------------------------------------

cat > "$CONFIG_FILE" << 'EOJSON'
{
  "environments": {
    "staging": {
      "extends": "nonexistent",
      "account": "dev",
      "region": "us-east-1"
    }
  }
}
EOJSON

if output=$("$SCRIPT_UNDER_TEST" staging 2>&1); then
    fail "should exit non-zero when extends references non-existent env"
else
    pass "exits non-zero on non-existent extends target"
fi

if echo "$output" | grep -qi "non-existent"; then
    pass "error message mentions non-existent environment"
else
    fail "error message should mention non-existent environment"
fi

# -------------------------------------------------------
echo ""
echo "=== extends: backward compatibility (no extends) ==="
# -------------------------------------------------------

cat > "$CONFIG_FILE" << 'EOJSON'
{
  "environments": {
    "development": {
      "account": "dev",
      "account_id": "111111111111",
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::111111111111:role/github-actions-dev",
      "secrets_bucket": "my-secrets",
      "description": "Dev env",
      "domain": {
        "base_domain": "dev.example.com",
        "use_custom_domain": false,
        "route53_zone_id": "ZDEV",
        "certificate_arn": "arn:aws:acm:us-east-1:111111111111:certificate/dev-cert"
      }
    }
  }
}
EOJSON

output=$("$SCRIPT_UNDER_TEST" development 2>/dev/null)

if echo "$output" | grep -q "account_id=111111111111"; then
    pass "entries without extends still work"
else
    fail "entries without extends should still work"
fi

if echo "$output" | grep -q "base_domain=dev.example.com"; then
    pass "entries without extends preserve nested values"
else
    fail "entries without extends should preserve nested values"
fi

# -------------------------------------------------------
echo ""
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"

if [[ $FAIL -gt 0 ]]; then
    exit 1
fi
