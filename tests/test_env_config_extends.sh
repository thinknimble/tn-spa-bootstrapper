#!/bin/bash

# Tests for get-env-config.sh: flat environment lookup
# Validates exact-match and pr-N → pr pattern mapping.

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
echo "=== exact match: looks up environment by name ==="
# -------------------------------------------------------

cat > "$CONFIG_FILE" << 'EOJSON'
{
  "production": {
    "account": "prod",
    "account_id": "222222222222",
    "region": "us-west-2",
    "role_arn": "arn:aws:iam::222222222222:role/github-actions-prod",
    "secrets_bucket": "prod-secrets",
    "base_domain": "example.com",
    "use_custom_domain": true,
    "custom_domain": "app.example.com",
    "debug": false,
    "enable_https": true,
    "alert_email": "alerts@example.com"
  },
  "staging": {
    "account": "dev",
    "account_id": "111111111111",
    "region": "us-east-1",
    "role_arn": "arn:aws:iam::111111111111:role/github-actions-staging",
    "secrets_bucket": "dev-secrets",
    "debug": true,
    "enable_https": true
  },
  "dev": {
    "account": "dev",
    "account_id": "111111111111",
    "region": "us-east-1",
    "role_arn": "arn:aws:iam::111111111111:role/github-actions-dev",
    "secrets_bucket": "dev-secrets",
    "debug": true,
    "enable_https": false
  },
  "pr": {
    "account": "dev",
    "account_id": "111111111111",
    "region": "us-east-1",
    "role_arn": "arn:aws:iam::111111111111:role/github-actions-dev",
    "secrets_bucket": "dev-secrets",
    "debug": true,
    "enable_https": true
  }
}
EOJSON

output=$("$SCRIPT_UNDER_TEST" production 2>/dev/null)

if echo "$output" | grep -q "account_id=222222222222"; then
    pass "production returns correct account_id"
else
    fail "production should return account_id=222222222222"
fi

if echo "$output" | grep -q "region=us-west-2"; then
    pass "production returns correct region"
else
    fail "production should return region=us-west-2"
fi

if echo "$output" | grep -q "debug=false"; then
    pass "production returns debug=false"
else
    fail "production should return debug=false"
fi

if echo "$output" | grep -q "use_custom_domain=true"; then
    pass "production returns use_custom_domain=true"
else
    fail "production should return use_custom_domain=true"
fi

if echo "$output" | grep -q "alert_email=alerts@example.com"; then
    pass "production returns alert_email"
else
    fail "production should return alert_email"
fi

# -------------------------------------------------------
echo ""
echo "=== exact match: staging has different values ==="
# -------------------------------------------------------

output=$("$SCRIPT_UNDER_TEST" staging 2>/dev/null)

if echo "$output" | grep -q "account_id=111111111111"; then
    pass "staging returns its own account_id"
else
    fail "staging should return account_id=111111111111"
fi

if echo "$output" | grep -q "role_arn=arn:aws:iam::111111111111:role/github-actions-staging"; then
    pass "staging returns its own role_arn"
else
    fail "staging should return its own role_arn"
fi

if echo "$output" | grep -q "debug=true"; then
    pass "staging returns debug=true"
else
    fail "staging should return debug=true"
fi

# -------------------------------------------------------
echo ""
echo "=== pr-N pattern: maps to pr key ==="
# -------------------------------------------------------

output=$("$SCRIPT_UNDER_TEST" pr-42 2>/dev/null)

if echo "$output" | grep -q "account_id=111111111111"; then
    pass "pr-42 resolves to pr config"
else
    fail "pr-42 should resolve to pr config"
fi

if echo "$output" | grep -q "enable_https=true"; then
    pass "pr-42 returns enable_https=true from pr config"
else
    fail "pr-42 should return enable_https=true from pr config"
fi

output=$("$SCRIPT_UNDER_TEST" pr-999 2>/dev/null)

if echo "$output" | grep -q "account_id=111111111111"; then
    pass "pr-999 also resolves to pr config"
else
    fail "pr-999 should also resolve to pr config"
fi

# -------------------------------------------------------
echo ""
echo "=== dev environment: different from pr ==="
# -------------------------------------------------------

output=$("$SCRIPT_UNDER_TEST" dev 2>/dev/null)

if echo "$output" | grep -q "enable_https=false"; then
    pass "dev returns enable_https=false (differs from pr)"
else
    fail "dev should return enable_https=false"
fi

# -------------------------------------------------------
echo ""
echo "=== unknown environment: exits non-zero ==="
# -------------------------------------------------------

if output=$("$SCRIPT_UNDER_TEST" unknown-env 2>&1); then
    fail "should exit non-zero for unknown environment"
else
    pass "exits non-zero for unknown environment"
fi

if echo "$output" | grep -qi "no configuration found"; then
    pass "error message describes the problem"
else
    fail "error message should mention missing configuration"
fi

# -------------------------------------------------------
echo ""
echo "=== computed values: ecr_registry ==="
# -------------------------------------------------------

output=$("$SCRIPT_UNDER_TEST" production 2>/dev/null)

if echo "$output" | grep -q "ecr_registry=222222222222.dkr.ecr.us-west-2.amazonaws.com"; then
    pass "ecr_registry computed correctly"
else
    fail "ecr_registry should be computed from account_id and region"
fi

# -------------------------------------------------------
echo ""
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"

if [[ $FAIL -gt 0 ]]; then
    exit 1
fi
