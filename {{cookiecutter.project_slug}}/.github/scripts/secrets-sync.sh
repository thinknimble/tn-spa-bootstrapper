#!/bin/bash

# Sync secrets between local files and S3
# Usage: ./secrets-sync.sh [pull|push] [environment] [options]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../environments.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Show usage
show_usage() {
    echo "Sync secrets between local files and S3"
    echo ""
    echo "Usage: $0 [command] [environment] [options]"
    echo ""
    echo "Commands:"
    echo "  pull       Download secrets from S3 to local file"
    echo "  push       Upload secrets from local file to S3"
    echo "  template   Create a secrets template file"
    echo "  list       List available secrets in S3"
    echo "  validate   Validate local secrets file"
    echo ""
    echo "Arguments:"
    echo "  environment    Environment name (production, staging, development)"
    echo ""
    echo "Options:"
    echo "  --aws-profile PROFILE    AWS profile to use"
    echo "  --file FILE             Local secrets file (default: secrets-{env}.json)"
    echo "  --dry-run               Show what would be done without making changes"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 pull production                      # Download prod secrets"
    echo "  $0 push staging --file my-secrets.json # Upload staging secrets"
    echo "  $0 template development                 # Create template file"
    echo "  $0 list production                      # List available secrets"
}

# Get environment configuration using the existing script
get_env_config() {
    local env_name=$1
    
    if [[ ! -f "$SCRIPT_DIR/get-env-config.sh" ]]; then
        print_colored $RED "❌ get-env-config.sh script not found"
        exit 1
    fi
    
    local config_output=$("$SCRIPT_DIR/get-env-config.sh" "$env_name" 2>/dev/null)
    
    ACCOUNT_ID=$(echo "$config_output" | grep "^account_id=" | cut -d= -f2 || echo "")
    REGION=$(echo "$config_output" | grep "^region=" | cut -d= -f2)
    SECRETS_BUCKET=$(echo "$config_output" | grep "^secrets_bucket=" | cut -d= -f2 || echo "")
    
    if [[ -z "$REGION" ]]; then
        print_colored $RED "❌ Could not determine region for environment: $env_name"
        exit 1
    fi
    
    # Fallback for missing secrets_bucket
    if [[ -z "$SECRETS_BUCKET" ]]; then
        local service_name=$(jq -r '.service // "{{cookiecutter.project_slug}}"' "$CONFIG_FILE" 2>/dev/null || echo "{{cookiecutter.project_slug}}")
        SECRETS_BUCKET="${service_name}-terraform-secrets"
        print_colored $YELLOW "⚠️  Using default secrets bucket: $SECRETS_BUCKET"
    fi
}

# Build S3 key for secrets
build_s3_key() {
    local env_name=$1
    echo "${env_name}/secrets.json"
}

# Pull secrets from S3
pull_secrets() {
    local env_name=$1
    local local_file=$2
    local profile_flag=$3
    local dry_run=$4
    
    get_env_config "$env_name"
    local s3_key=$(build_s3_key "$env_name")
    local s3_path="s3://${SECRETS_BUCKET}/${s3_key}"
    
    print_colored $BLUE "📥 Pulling secrets from S3..."
    print_colored $BLUE "   Environment: $env_name"
    print_colored $BLUE "   S3 Path: $s3_path"
    print_colored $BLUE "   Local File: $local_file"
    echo ""
    
    if [[ "$dry_run" == "true" ]]; then
        print_colored $YELLOW "🔍 DRY RUN - Would download: $s3_path"
        return 0
    fi
    
    # Check if secrets exist in S3
    if ! aws s3api head-object --bucket "$SECRETS_BUCKET" --key "$s3_key" $profile_flag >/dev/null 2>&1; then
        
        # For PR environments, try to fall back to development secrets
        if [[ "$env_name" =~ ^pr-[0-9]+$ ]]; then
            print_colored $YELLOW "⚠️  PR secrets not found, trying development fallback..."
            local dev_key="development/secrets.json"
            local dev_path="s3://${SECRETS_BUCKET}/${dev_key}"
            
            if aws s3api head-object --bucket "$SECRETS_BUCKET" --key "$dev_key" $profile_flag >/dev/null 2>&1; then
                print_colored $BLUE "📋 Using development secrets as fallback for PR environment"
                print_colored $BLUE "   Development Path: $dev_path"
                print_colored $BLUE "   Local File: $local_file"
                
                if aws s3 cp "$dev_path" "$local_file" $profile_flag; then
                    print_colored $GREEN "✅ Successfully copied development secrets for PR environment"
                    
                    # Add a note to the file indicating it's from development
                    local temp_file=$(mktemp)
                    jq '. + {
                        "pr_environment": "'$env_name'",
                        "fallback_source": "development",
                        "fallback_note": "This PR environment is using development secrets as a fallback. Customize as needed and push to create PR-specific secrets."
                    }' "$local_file" > "$temp_file" && mv "$temp_file" "$local_file"
                    
                    print_colored $BLUE "💡 To customize secrets for this PR:"
                    print_colored $BLUE "   1. Edit $local_file"
                    print_colored $BLUE "   2. Run: $0 push $env_name"
                    return 0
                else
                    print_colored $RED "❌ Failed to copy development secrets"
                fi
            else
                print_colored $YELLOW "⚠️  Development secrets also not found"
            fi
        fi
        
        print_colored $YELLOW "⚠️  Secrets not found in S3, creating template..."
        create_secrets_template "$env_name" "$local_file"
        return 0
    fi
    
    # Download from S3
    if aws s3 cp "$s3_path" "$local_file" $profile_flag; then
        print_colored $GREEN "✅ Successfully downloaded secrets to: $local_file"
        
        # Validate downloaded file
        if jq empty "$local_file" 2>/dev/null; then
            print_colored $GREEN "✅ JSON validation passed"
            
            # Show metadata
            local updated_at=$(jq -r '.updated_at // "unknown"' "$local_file")
            local updated_by=$(jq -r '.updated_by // "unknown"' "$local_file")
            print_colored $BLUE "📄 Last updated: $updated_at by $updated_by"
        else
            print_colored $RED "❌ Downloaded file contains invalid JSON"
            rm -f "$local_file"
            exit 1
        fi
    else
        print_colored $RED "❌ Failed to download secrets"
        exit 1
    fi
}

# Push secrets to S3
push_secrets() {
    local env_name=$1
    local local_file=$2
    local profile_flag=$3
    local dry_run=$4
    
    if [[ ! -f "$local_file" ]]; then
        print_colored $RED "❌ Local secrets file not found: $local_file"
        exit 1
    fi
    
    get_env_config "$env_name"
    local s3_key=$(build_s3_key "$env_name")
    local s3_path="s3://${SECRETS_BUCKET}/${s3_key}"
    
    print_colored $BLUE "📤 Pushing secrets to S3..."
    print_colored $BLUE "   Environment: $env_name"
    print_colored $BLUE "   Local File: $local_file"
    print_colored $BLUE "   S3 Path: $s3_path"
    echo ""
    
    # Validate local file first
    validate_secrets_file "$local_file"
    
    if [[ "$dry_run" == "true" ]]; then
        print_colored $YELLOW "🔍 DRY RUN - Would upload to: $s3_path"
        return 0
    fi
    
    # Add metadata before upload
    local temp_file=$(mktemp)
    local service_name=$(jq -r '.service // "{{cookiecutter.project_slug}}"' "$CONFIG_FILE" 2>/dev/null || echo "{{cookiecutter.project_slug}}")
    
    jq --arg updated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg updated_by "$(git config user.email 2>/dev/null || whoami)" \
       --arg service "$service_name" \
       --arg environment "$env_name" \
       --arg account_id "$ACCOUNT_ID" \
       '. + {
         updated_at: $updated_at,
         updated_by: $updated_by,
         service: $service,
         environment: $environment,
         account_id: $account_id,
         schema_version: "1.0"
       }' "$local_file" > "$temp_file"
    
    # Upload to S3 with encryption
    if aws s3 cp "$temp_file" "$s3_path" \
        --sse \
        --metadata "service=$service_name,environment=$env_name,updated-by=$(git config user.email 2>/dev/null || whoami)" \
        $profile_flag; then
        print_colored $GREEN "✅ Successfully uploaded secrets to S3"
        
        # Show object info
        print_colored $BLUE "📄 S3 object info:"
        aws s3api head-object --bucket "$SECRETS_BUCKET" --key "$s3_key" $profile_flag | \
            jq -r '"   Size: " + (.ContentLength | tostring) + " bytes, Last Modified: " + .LastModified'
    else
        print_colored $RED "❌ Failed to upload secrets"
        rm -f "$temp_file"
        exit 1
    fi
    
    rm -f "$temp_file"
}

# Create secrets template
create_secrets_template() {
    local env_name=$1
    local local_file=$2
    
    local service_name=$(jq -r '.service // "{{cookiecutter.project_slug}}"' "$CONFIG_FILE" 2>/dev/null || echo "{{cookiecutter.project_slug}}")
    
    cat > "$local_file" << EOF
{
  "service": "$service_name",
  "environment": "$env_name",
  "secrets": {
    "django_secret_key": "CHANGE-ME-50-character-random-string-for-$env_name",
    "db_password": "CHANGE-ME-secure-database-password",
    "django_superuser_password": "CHANGE-ME-admin-password",
    "rollbar_access_token": "CHANGE-ME-rollbar-token-or-remove-if-unused",
    "aws_access_key_id": "CHANGE-ME-or-use-iam-roles",
    "aws_secret_access_key": "CHANGE-ME-or-use-iam-roles",
    "playwright_test_user_pass": "CHANGE-ME-test-user-password"
  },
  "metadata": {
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "created_by": "$(git config user.email 2>/dev/null || whoami)",
    "template_version": "1.0",
    "notes": "Replace all CHANGE-ME values before uploading"
  }
}
EOF
    
    print_colored $GREEN "✅ Created secrets template: $local_file"
    print_colored $YELLOW "📝 Please edit the file and replace all CHANGE-ME values"
    print_colored $YELLOW "💡 Use 'python -c \"import secrets; print(secrets.token_urlsafe(50))\"' to generate Django secret key"
}

# List secrets in S3
list_secrets() {
    local env_name=$1
    local profile_flag=$2
    
    get_env_config "$env_name"
    
    print_colored $BLUE "📋 Available secrets:"
    print_colored $BLUE "   Bucket: $SECRETS_BUCKET"
    print_colored $BLUE "   Environment: $env_name"
    echo ""
    
    local prefix=""
    if [[ "$env_name" != "all" ]]; then
        prefix="${env_name}/"
    fi
    
    aws s3 ls "s3://${SECRETS_BUCKET}/${prefix}" --recursive $profile_flag | \
        grep secrets.json || {
        print_colored $YELLOW "⚠️  No secrets found"
        print_colored $YELLOW "💡 Use 'template' command to create initial secrets"
    }
}

# Validate secrets file
validate_secrets_file() {
    local local_file=$1
    
    print_colored $BLUE "🔍 Validating secrets file: $local_file"
    
    # Check file exists
    if [[ ! -f "$local_file" ]]; then
        print_colored $RED "❌ File not found: $local_file"
        exit 1
    fi
    
    # Validate JSON syntax
    if ! jq empty "$local_file" 2>/dev/null; then
        print_colored $RED "❌ Invalid JSON syntax"
        exit 1
    fi
    
    # Check required fields
    local required_fields=("service" "environment" "secrets")
    for field in "${required_fields[@]}"; do
        if [[ "$(jq -r ".$field // empty" "$local_file")" == "" ]]; then
            print_colored $RED "❌ Missing required field: $field"
            exit 1
        fi
    done
    
    # Check for CHANGE-ME placeholders
    if jq -r '.secrets | to_entries[] | .value' "$local_file" | grep -q "CHANGE-ME"; then
        print_colored $RED "❌ Found CHANGE-ME placeholder values. Please update:"
        jq -r '.secrets | to_entries[] | select(.value | contains("CHANGE-ME")) | .key' "$local_file" | \
            while read key; do
                print_colored $RED "   - $key"
            done
        exit 1
    fi

    print_colored $GREEN "✅ Secrets file validation passed"
}

# Main function
main() {
    local command=""
    local environment=""
    local aws_profile=""
    local local_file=""
    local dry_run="false"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            pull|push|template|list|validate)
                command="$1"
                shift
                ;;
            --aws-profile)
                aws_profile="$2"
                shift 2
                ;;
            --file)
                local_file="$2"
                shift 2
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            -*)
                print_colored $RED "❌ Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [[ -z "$environment" ]]; then
                    environment="$1"
                else
                    print_colored $RED "❌ Too many arguments"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Validate required arguments
    if [[ -z "$command" ]]; then
        print_colored $RED "❌ Command is required"
        show_usage
        exit 1
    fi
    
    if [[ -z "$environment" && "$command" != "validate" ]]; then
        print_colored $RED "❌ Environment is required"
        show_usage
        exit 1
    fi
    
    # Set default local file
    if [[ -z "$local_file" && "$command" != "list" ]]; then
        if [[ "$command" == "validate" ]]; then
            print_colored $RED "❌ File is required for validate command"
            show_usage
            exit 1
        fi
        local_file="secrets-${environment}.json"
    fi
    
    # Set up AWS profile flag
    local profile_flag=""
    if [[ -n "$aws_profile" ]]; then
        profile_flag="--profile $aws_profile"
    fi
    
    print_colored $BLUE "🔐 Secrets Sync Tool"
    print_colored $BLUE "==================="
    print_colored $BLUE "Command: $command"
    if [[ -n "$environment" ]]; then
        print_colored $BLUE "Environment: $environment"
    fi
    if [[ -n "$local_file" ]]; then
        print_colored $BLUE "Local File: $local_file"
    fi
    echo ""
    
    # Execute command
    case "$command" in
        pull)
            pull_secrets "$environment" "$local_file" "$profile_flag" "$dry_run"
            ;;
        push)
            push_secrets "$environment" "$local_file" "$profile_flag" "$dry_run"
            ;;
        template)
            create_secrets_template "$environment" "$local_file"
            ;;
        list)
            list_secrets "$environment" "$profile_flag"
            ;;
        validate)
            validate_secrets_file "$local_file"
            ;;
        *)
            print_colored $RED "❌ Unknown command: $command"
            exit 1
            ;;
    esac
}

main "$@"