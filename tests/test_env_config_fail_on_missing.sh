#!/bin/bash

# Tests for get-env-config.sh: fail on missing or invalid config
# These tests verify that the script exits non-zero on error conditions
# rather than silently falling back to dummy values.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."
TEMPLATE_DIR="$PROJECT_DIR/{{cookiecutter.project_slug}}"
SCRIPT_UNDER_TEST="$TEMPLATE_DIR/.github/scripts/get-env-config.sh"
SECRETS_SCRIPT="$TEMPLATE_DIR/.github/scripts/secrets-sync.sh"
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

# --- get-env-config.sh tests ---

echo "=== get-env-config.sh: missing config file ==="

# Backup real config if it exists
if [[ -f "$CONFIG_FILE" ]]; then
    cp "$CONFIG_FILE" "$CONFIG_FILE.bak"
    rm "$CONFIG_FILE"
fi

# Test: exits non-zero when config file is missing
if output=$("$SCRIPT_UNDER_TEST" staging 2>&1); then
    fail "should exit non-zero when config file is missing"
else
    pass "exits non-zero when config file is missing"
fi

# Test: does not output fallback values when config is missing
if echo "$output" | grep -q "account_id="; then
    fail "should not output fallback key=value data when config is missing"
else
    pass "no fallback key=value data when config is missing"
fi

# Test: error message mentions the missing file
if echo "$output" | grep -qi "not found"; then
    pass "error message mentions missing file"
else
    fail "error message should mention missing file"
fi

echo ""
echo "=== get-env-config.sh: invalid JSON config file ==="

# Create an invalid JSON file
echo "this is not json {{{" > "$CONFIG_FILE"

if output=$("$SCRIPT_UNDER_TEST" staging 2>&1); then
    fail "should exit non-zero when config file has invalid JSON"
else
    pass "exits non-zero when config file has invalid JSON"
fi

# Test: does not output fallback values on invalid JSON
if echo "$output" | grep -q "account_id="; then
    fail "should not output fallback data when JSON is invalid"
else
    pass "no fallback data when JSON is invalid"
fi

# Test: error message mentions invalid JSON
if echo "$output" | grep -qi "invalid json"; then
    pass "error message mentions invalid JSON"
else
    fail "error message should mention invalid JSON"
fi

# Restore real config
rm -f "$CONFIG_FILE"
if [[ -f "$CONFIG_FILE.bak" ]]; then
    mv "$CONFIG_FILE.bak" "$CONFIG_FILE"
fi

echo ""
echo "=== secrets-sync.sh: no stderr suppression of config errors ==="

# Test: secrets-sync.sh does not contain 2>/dev/null on get-env-config call
if grep -n 'get-env-config\.sh.*2>/dev/null' "$SECRETS_SCRIPT"; then
    fail "secrets-sync.sh still suppresses stderr from get-env-config.sh"
else
    pass "secrets-sync.sh does not suppress stderr from get-env-config.sh"
fi

echo ""
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"

if [[ $FAIL -gt 0 ]]; then
    exit 1
fi
