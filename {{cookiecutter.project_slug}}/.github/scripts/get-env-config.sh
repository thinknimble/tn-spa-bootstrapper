#!/bin/bash

# Get environment configuration from environments.json
# Usage: ./get-env-config.sh <environment_name>
#
# Flat lookup: environment name maps directly to a top-level key.
# PR environments (pr-123) are mapped to the "pr" key.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../environments.json"
ENV_NAME="${1:-}"

if [[ -z "$ENV_NAME" ]]; then
    echo "Error: Environment name is required" >&2
    echo "Usage: $0 <environment_name>" >&2
    exit 1
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "Error: Configuration file not found: $CONFIG_FILE" >&2
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "Error: jq is required by $0 but is not installed" >&2
    echo "Install it with: apt-get install jq | brew install jq" >&2
    exit 127
fi

if ! jq_error=$(jq empty "$CONFIG_FILE" 2>&1); then
    echo "Error: Invalid JSON in configuration file: $CONFIG_FILE" >&2
    echo "$jq_error" >&2
    exit 1
fi

# Map pr-N → pr; everything else is an exact key match
CONFIG_KEY="$ENV_NAME"
if [[ "$ENV_NAME" =~ ^pr-[0-9]+$ ]]; then
    CONFIG_KEY="pr"
fi

CONFIG=$(jq -r --arg key "$CONFIG_KEY" '.[$key] // empty' "$CONFIG_FILE")

if [[ -z "$CONFIG" || "$CONFIG" == "null" ]]; then
    echo "Error: No configuration found for '$ENV_NAME' (key: $CONFIG_KEY)" >&2
    echo "Available environments: $(jq -r 'keys | join(", ")' "$CONFIG_FILE")" >&2
    exit 1
fi

# Output all values as flat key=value pairs
echo "$CONFIG" | jq -r '
  "account=\(.account // "dev")",
  "account_id=\(.account_id // "")",
  "region=\(.region // "us-east-1")",
  "role_arn=\(.role_arn // "")",
  "secrets_bucket=\(.secrets_bucket // "")",
  "base_domain=\(.base_domain // "")",
  "use_custom_domain=\(if .use_custom_domain == null then false else .use_custom_domain end)",
  "custom_domain=\(.custom_domain // "")",
  "route53_zone_id=\(.route53_zone_id // "")",
  "certificate_arn=\(.certificate_arn // "")",
  "debug=\(if .debug == null then true else .debug end)",
  "current_port=\(.current_port // 8000)",
  "allowed_hosts=\(.allowed_hosts // "server,localhost,127.0.0.1")",
  "enable_emails=\(if .enable_emails == null then false else .enable_emails end)",
  "staff_email=\(.staff_email // "admin@example.com")",
  "use_aws_storage=\(if .use_aws_storage == null then false else .use_aws_storage end)",
  "aws_s3_region_name=\(.aws_s3_region_name // "")",
  "enable_https=\(if .enable_https == null then true else .enable_https end)",
  "alert_email=\(.alert_email // "")"
'

# Computed values
ACCOUNT_ID=$(echo "$CONFIG" | jq -r '.account_id // ""')
REGION=$(echo "$CONFIG" | jq -r '.region // "us-east-1"')
echo "ecr_registry=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "✅ Environment '$ENV_NAME' configured (key: $CONFIG_KEY)" >&2
