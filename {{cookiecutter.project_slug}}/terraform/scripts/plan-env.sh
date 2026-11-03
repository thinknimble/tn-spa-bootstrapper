#!/bin/bash

# Read-only `terraform plan` of this checkout against a deployed environment's state.
#
# Uses the exact tfvars the environment's last deploy saved next to its state
# (<env>/deploy.tfvars, written by app-deploy.yml) rather than regenerating them:
# regeneration drifts from the deploy and silently skips count-gated resources.
#
# Usage: terraform/scripts/plan-env.sh <environment> [terraform-dir]
#   environment     staging, production, dev, pr-123, ...
#   terraform-dir   defaults to the terraform/ directory this script lives in
#
# Requires AWS credentials for the state account (e.g. AWS_PROFILE=my-project).
# Never applies, never takes the state lock. Re-initializes terraform-dir's backend
# to the environment's state key; re-init before pointing it at another environment.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_colored() {
    echo -e "${1}${2}${NC}"
}

if [[ $# -lt 1 || "$1" == "-h" || "$1" == "--help" ]]; then
    sed -n '3,15p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
fi

ENVIRONMENT=$1
TF_DIR=${2:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"}
cd "$TF_DIR"

# Same backend selection as .github/actions/setup-terraform
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [[ -f "backend-${ACCOUNT_ID}.hcl" ]]; then
    BACKEND_FILE="backend-${ACCOUNT_ID}.hcl"
elif [[ -f "backend.hcl" ]]; then
    BACKEND_FILE="backend.hcl"
else
    print_colored "$RED" "❌ No backend.hcl or backend-${ACCOUNT_ID}.hcl in $TF_DIR"
    exit 1
fi
BUCKET=$(grep -E '^\s*bucket\s*=' "$BACKEND_FILE" | sed 's/.*=[[:space:]]*"\(.*\)"/\1/')

# The tfvars hold secrets: keep them out of the checkout and remove them on exit
VARS_FILE=$(mktemp -t "deploy-${ENVIRONMENT}.XXXXXX")
trap 'rm -f "$VARS_FILE"' EXIT

print_colored "$BLUE" "📥 s3://${BUCKET}/${ENVIRONMENT}/deploy.tfvars"
if ! aws s3 cp "s3://${BUCKET}/${ENVIRONMENT}/deploy.tfvars" "$VARS_FILE" --quiet; then
    print_colored "$RED" "❌ No saved deploy.tfvars for '$ENVIRONMENT'. Deploy it once through CI first."
    exit 1
fi

if [[ -f terraform.tfvars ]]; then
    print_colored "$YELLOW" "⚠️  terraform.tfvars in $TF_DIR is auto-loaded; variables it sets that deploy.tfvars does not will leak into this plan"
fi

print_colored "$BLUE" "🔧 terraform init ($BACKEND_FILE, key=${ENVIRONMENT}/terraform.tfstate)"
terraform init -input=false -reconfigure \
    -backend-config="$BACKEND_FILE" \
    -backend-config="key=${ENVIRONMENT}/terraform.tfstate" >/dev/null

PLAN_OUTPUT=$(mktemp -t "plan-${ENVIRONMENT}.XXXXXX")
trap 'rm -f "$VARS_FILE" "$PLAN_OUTPUT"' EXIT

print_colored "$BLUE" "📋 terraform plan against $ENVIRONMENT (read-only, no lock)"
terraform plan -input=false -lock=false -no-color -var-file="$VARS_FILE" | tee "$PLAN_OUTPUT"

echo ""
if grep -E "must be replaced|will be destroyed" "$PLAN_OUTPUT"; then
    print_colored "$YELLOW" "⚠️  The plan replaces or destroys the resources above. Check each is intended."
else
    print_colored "$GREEN" "✅ Nothing replaced or destroyed"
fi
