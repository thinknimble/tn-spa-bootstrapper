#!/bin/bash

# Get environment configuration from environments.json
# Usage: ./get-env-config.sh <environment_name>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../environments.json"
ENV_NAME="${1:-}"

# Validation
if [[ -z "$ENV_NAME" ]]; then
    echo "Error: Environment name is required" >&2
    echo "Usage: $0 <environment_name>" >&2
    exit 1
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Error: Configuration file not found: $CONFIG_FILE" >&2
    echo "Create .github/environments.json with your environment configuration." >&2
    exit 1
fi

# Validate JSON file
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
    echo "Error: Invalid JSON in configuration file: $CONFIG_FILE" >&2
    echo "Fix the JSON syntax and try again." >&2
    exit 1
fi

# Function to resolve 'extends' chains via deep merge.
# Looks up the base environment from .environments, recursively resolves it,
# then deep-merges the child on top. Detects circular and missing references.
resolve_extends() {
    local config="$1"
    local visited="$2"  # colon-separated list of already-visited env names

    local extends_target
    extends_target=$(echo "$config" | jq -r '.extends // empty')

    # No extends — return config as-is
    if [[ -z "$extends_target" ]]; then
        echo "$config"
        return 0
    fi

    # Circular reference check
    if [[ ":${visited}:" == *":${extends_target}:"* ]]; then
        echo "Error: Circular extends reference detected involving '${extends_target}'" >&2
        return 1
    fi

    # Load the base environment
    local base_config
    base_config=$(jq -r --arg env "$extends_target" '.environments[$env] // empty' "$CONFIG_FILE")

    if [[ -z "$base_config" || "$base_config" == "null" ]]; then
        echo "Error: extends references non-existent environment '${extends_target}'" >&2
        return 1
    fi

    # Recursively resolve the base (it may also have extends)
    local resolved_base
    if ! resolved_base=$(resolve_extends "$base_config" "${visited:+${visited}:}${extends_target}"); then
        return 1
    fi

    # Deep merge: base * child, then strip the extends key
    echo "$config" | jq --argjson base "$resolved_base" '$base * . | del(.extends)'
}

# Function to get config for exact environment name
get_exact_config() {
    local env_name="$1"
    jq -r --arg env "$env_name" '.environments[$env] // empty' "$CONFIG_FILE"
}

# Function to get config for pattern match
get_pattern_config() {
    local env_name="$1"
    local pattern_config=""

    # Check if env_name matches any patterns
    if [[ "$env_name" =~ ^pr-[0-9]+$ ]]; then
        pattern_config=$(jq -r '.patterns["pr-*"] // empty' "$CONFIG_FILE")
    elif [[ "$env_name" == "main" ]]; then
        pattern_config=$(jq -r '.patterns["main"] // empty' "$CONFIG_FILE")
    fi

    echo "$pattern_config"
}

# Function to get default config
get_default_config() {
    jq -r '.defaults' "$CONFIG_FILE"
}

# Try to get config in order of precedence: exact match -> pattern match -> defaults
CONFIG=""

# 1. Try exact environment match
CONFIG=$(get_exact_config "$ENV_NAME")

# 2. If no exact match, try pattern matching
if [[ -z "$CONFIG" || "$CONFIG" == "null" ]]; then
    CONFIG=$(get_pattern_config "$ENV_NAME")
fi

# 3. If still no match, use defaults
if [[ -z "$CONFIG" || "$CONFIG" == "null" ]]; then
    CONFIG=$(get_default_config)
fi

# 4. Resolve extends chain (deep merge with base environment)
if [[ -n "$CONFIG" && "$CONFIG" != "null" ]]; then
    CONFIG=$(resolve_extends "$CONFIG" "") || exit 1
fi

# Extract individual values
ACCOUNT=$(echo "$CONFIG" | jq -r '.account')
ACCOUNT_ID=$(echo "$CONFIG" | jq -r '.account_id // empty')
REGION=$(echo "$CONFIG" | jq -r '.region') 
ROLE_ARN=$(echo "$CONFIG" | jq -r '.role_arn // empty')
SECRETS_BUCKET=$(echo "$CONFIG" | jq -r '.secrets_bucket // empty')
DESCRIPTION=$(echo "$CONFIG" | jq -r '.description')

# Extract domain configuration
BASE_DOMAIN=$(echo "$CONFIG" | jq -r '.domain.base_domain // empty')
USE_CUSTOM_DOMAIN=$(echo "$CONFIG" | jq -r '.domain.use_custom_domain // false')
CUSTOM_DOMAIN=$(echo "$CONFIG" | jq -r '.domain.custom_domain // empty')
ROUTE53_ZONE_ID=$(echo "$CONFIG" | jq -r '.domain.route53_zone_id // empty')
CERTIFICATE_ARN=$(echo "$CONFIG" | jq -r '.domain.certificate_arn // empty')

# Validate extracted values
if [[ -z "$ACCOUNT" || "$ACCOUNT" == "null" ]]; then
    echo "Error: No account specified in configuration" >&2
    ACCOUNT="dev"
fi

if [[ -z "$REGION" || "$REGION" == "null" ]]; then
    echo "Error: No region specified in configuration" >&2
    REGION="us-east-1"
fi

if [[ -z "$ACCOUNT_ID" || "$ACCOUNT_ID" == "null" ]]; then
    echo "Warning: No account_id specified in configuration for '$ENV_NAME'" >&2
    echo "💡 Consider adding 'account_id' field to environments.json for this environment" >&2
    ACCOUNT_ID=""
fi

# Validate AWS region format
if [[ ! "$REGION" =~ ^[a-z]{2}-[a-z]+-[0-9]+$ ]]; then
    echo "Warning: Region '$REGION' doesn't match AWS region format" >&2
fi

# Output in GitHub Actions format
echo "account=$ACCOUNT"
echo "account_id=$ACCOUNT_ID"
echo "region=$REGION"
echo "role_arn=$ROLE_ARN"
echo "secrets_bucket=$SECRETS_BUCKET"
echo "description=${DESCRIPTION:-"No description"}"

# Domain configuration outputs
echo "base_domain=$BASE_DOMAIN"
echo "use_custom_domain=$USE_CUSTOM_DOMAIN"
echo "custom_domain=$CUSTOM_DOMAIN"
echo "route53_zone_id=$ROUTE53_ZONE_ID"
echo "certificate_arn=$CERTIFICATE_ARN"

# Also output ECR registry
echo "ecr_registry=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Debug info to stderr
echo "✅ Environment '$ENV_NAME' mapped to account '$ACCOUNT' in region '$REGION'" >&2