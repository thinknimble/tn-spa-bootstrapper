#!/bin/bash

# Setup S3 bucket for secrets storage with proper security
# Usage: ./setup-secrets-bucket.sh [environment] [--aws-profile profile]

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
    echo "Setup S3 bucket for secrets storage"
    echo ""
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Arguments:"
    echo "  environment    Environment name (production, staging, development, or 'all')"
    echo ""
    echo "Options:"
    echo "  --aws-profile PROFILE    AWS profile to use"
    echo "  --dry-run               Show what would be created without making changes"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 production                           # Setup production secrets bucket"
    echo "  $0 all                                  # Setup buckets for all environments"
    echo "  $0 staging --aws-profile staging       # Use specific AWS profile"
}

# Get environment configuration
get_env_config() {
    local env_name=$1
    
    if [[ ! -f "$CONFIG_FILE" ]]; then
        print_colored $RED "❌ Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # Use the existing get-env-config.sh script
    local config_output=$("$SCRIPT_DIR/get-env-config.sh" "$env_name" 2>/dev/null)
    
    ACCOUNT_ID=$(echo "$config_output" | grep "^account_id=" | cut -d= -f2)
    REGION=$(echo "$config_output" | grep "^region=" | cut -d= -f2)
    SECRETS_BUCKET=$(echo "$config_output" | grep "^secrets_bucket=" | cut -d= -f2)
    
    if [[ -z "$ACCOUNT_ID" || -z "$REGION" || -z "$SECRETS_BUCKET" ]]; then
        print_colored $RED "❌ Missing required configuration for environment: $env_name"
        exit 1
    fi
}

# Check if bucket exists
bucket_exists() {
    local bucket_name=$1
    local profile_flag=$2
    
    aws s3api head-bucket --bucket "$bucket_name" $profile_flag 2>/dev/null
}

# Get existing bucket policy
get_existing_bucket_policy() {
    local bucket_name=$1
    local profile_flag=$2
    
    aws s3api get-bucket-policy --bucket "$bucket_name" --query 'Policy' --output text $profile_flag 2>/dev/null || echo ""
}

# Check if environment already has access in bucket policy
check_env_in_bucket_policy() {
    local existing_policy=$1
    local env_name=$2
    local account_id=$3
    
    if [[ -z "$existing_policy" ]]; then
        return 1
    fi
    
    echo "$existing_policy" | python3 -c "
import sys, json
try:
    policy = json.loads(sys.stdin.read())
    env_name = '$env_name'
    account_id = '$account_id'
    role_arn = f'arn:aws:iam::{account_id}:role/github-actions-{env_name}'
    
    for stmt in policy.get('Statement', []):
        principal = stmt.get('Principal', {})
        aws_principal = principal.get('AWS', '')
        if isinstance(aws_principal, str):
            if role_arn == aws_principal:
                sys.exit(0)
        elif isinstance(aws_principal, list):
            if role_arn in aws_principal:
                sys.exit(0)
    sys.exit(1)
except:
    sys.exit(1)
" 2>/dev/null
    return $?
}

# Merge environment access into existing bucket policy
merge_bucket_policy() {
    local existing_policy=$1
    local env_name=$2
    local account_id=$3
    local region=$4
    local secrets_bucket=$5
    
    echo "$existing_policy" | python3 -c "
import sys, json
try:
    env_name = '$env_name'
    account_id = '$account_id'
    region = '$region'
    secrets_bucket = '$secrets_bucket'
    role_arn = f'arn:aws:iam::{account_id}:role/github-actions-{env_name}'
    
    # If no existing policy, create new one
    existing_policy_text = sys.stdin.read().strip()
    if not existing_policy_text:
        policy = {
            'Version': '2012-10-17',
            'Statement': []
        }
    else:
        policy = json.loads(existing_policy_text)
    
    # Add object access statement
    object_stmt = {
        'Sid': f'AllowGitHubOIDCAccess{env_name.title()}',
        'Effect': 'Allow',
        'Principal': {
            'AWS': role_arn
        },
        'Action': [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject'
        ],
        'Resource': [
            f'arn:aws:s3:::{secrets_bucket}/{env_name}/*'
        ],
        'Condition': {
            'StringEquals': {
                'aws:RequestedRegion': region
            }
        }
    }
    
    # Add list bucket statement
    list_stmt = {
        'Sid': f'AllowListBucketForEnvironment{env_name.title()}',
        'Effect': 'Allow',
        'Principal': {
            'AWS': role_arn
        },
        'Action': [
            's3:ListBucket'
        ],
        'Resource': [
            f'arn:aws:s3:::{secrets_bucket}'
        ],
        'Condition': {
            'StringEquals': {
                'aws:RequestedRegion': region
            },
            'StringLike': {
                's3:prefix': f'{env_name}/*'
            }
        }
    }
    
    # Remove any existing statements for this environment
    policy['Statement'] = [s for s in policy['Statement'] 
                          if not (s.get('Principal', {}).get('AWS') == role_arn)]
    
    # Add new statements
    policy['Statement'].extend([object_stmt, list_stmt])
    
    print(json.dumps(policy, indent=2))
except Exception as e:
    print(f'Error merging bucket policy: {e}', file=sys.stderr)
    sys.exit(1)
"
}

# Create S3 bucket with security settings
create_secrets_bucket() {
    local env_name=$1
    local profile_flag=$2
    local dry_run=$3
    
    get_env_config "$env_name"
    
    print_colored $BLUE "🗂️  Setting up secrets bucket for: $env_name"
    print_colored $BLUE "   Account ID: $ACCOUNT_ID"
    print_colored $BLUE "   Region: $REGION" 
    print_colored $BLUE "   Bucket: $SECRETS_BUCKET"
    echo ""
    
    # Check if bucket already exists
    local bucket_already_exists=false
    if bucket_exists "$SECRETS_BUCKET" "$profile_flag"; then
        print_colored $YELLOW "⚠️  Bucket $SECRETS_BUCKET already exists"
        bucket_already_exists=true
    fi
    
    if [[ "$dry_run" == "true" ]]; then
        print_colored $YELLOW "🔍 DRY RUN - Would create bucket: $SECRETS_BUCKET"
        return 0
    fi
    
    # Create bucket only if it doesn't exist
    if [[ "$bucket_already_exists" == "false" ]]; then
        # Create bucket
        print_colored $BLUE "📦 Creating S3 bucket: $SECRETS_BUCKET"
        if [[ "$REGION" == "us-east-1" ]]; then
            aws s3api create-bucket \
                --bucket "$SECRETS_BUCKET" \
                $profile_flag
        else
            aws s3api create-bucket \
                --bucket "$SECRETS_BUCKET" \
                --region "$REGION" \
                --create-bucket-configuration LocationConstraint="$REGION" \
                $profile_flag
        fi
        
        # Enable versioning
        print_colored $BLUE "🔄 Enabling versioning..."
        aws s3api put-bucket-versioning \
            --bucket "$SECRETS_BUCKET" \
            --versioning-configuration Status=Enabled \
            $profile_flag
        
        # Enable server-side encryption
        print_colored $BLUE "🔐 Enabling server-side encryption..."
        aws s3api put-bucket-encryption \
            --bucket "$SECRETS_BUCKET" \
            --server-side-encryption-configuration '{
                "Rules": [
                    {
                        "ApplyServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256"
                        },
                        "BucketKeyEnabled": true
                    }
                ]
            }' \
            $profile_flag
        
        # Block public access
        print_colored $BLUE "🚫 Blocking public access..."
        aws s3api put-public-access-block \
            --bucket "$SECRETS_BUCKET" \
            --public-access-block-configuration \
            BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
            $profile_flag
    fi
    
    # Enable access logging (optional - requires a separate logging bucket)
    # print_colored $BLUE "📝 Configuring access logging..."
    # aws s3api put-bucket-logging \
    #     --bucket "$SECRETS_BUCKET" \
    #     --bucket-logging-status '{
    #         "LoggingEnabled": {
    #             "TargetBucket": "'$SECRETS_BUCKET'-access-logs",
    #             "TargetPrefix": "access-logs/"
    #         }
    #     }' \
    #     $profile_flag
    
    # Create or update bucket policy for OIDC role access
    print_colored $BLUE "🔑 Creating/updating bucket policy for OIDC access..."
    
    # Get existing bucket policy
    local existing_policy=$(get_existing_bucket_policy "$SECRETS_BUCKET" "$profile_flag")
    
    # Check if this environment already has access
    if check_env_in_bucket_policy "$existing_policy" "$env_name" "$ACCOUNT_ID"; then
        print_colored $YELLOW "⚠️  Environment '$env_name' already has access to bucket"
        return 0
    fi
    
    # Merge the new environment access into existing policy
    local merged_policy=$(merge_bucket_policy "$existing_policy" "$env_name" "$ACCOUNT_ID" "$REGION" "$SECRETS_BUCKET")
    
    if [[ $? -ne 0 ]]; then
        print_colored $RED "❌ Failed to merge bucket policy for environment: $env_name"
        return 1
    fi
    
    # Write merged policy to temp file
    echo "$merged_policy" > /tmp/bucket-policy.json
    
    # Apply the updated policy
    aws s3api put-bucket-policy \
        --bucket "$SECRETS_BUCKET" \
        --policy file:///tmp/bucket-policy.json \
        $profile_flag
    
    if [[ $? -eq 0 ]]; then
        print_colored $GREEN "✅ Added environment '$env_name' access to bucket policy"
    else
        print_colored $RED "❌ Failed to update bucket policy"
        return 1
    fi
    
    rm -f /tmp/bucket-policy.json
    
    print_colored $GREEN "✅ Successfully created secrets bucket: $SECRETS_BUCKET"
}

# Get service name from config
get_service_name() {
    if [[ -f "$CONFIG_FILE" ]]; then
        SERVICE_NAME=$(jq -r '.service // "{{cookiecutter.project_slug}}"' "$CONFIG_FILE")
    else
        SERVICE_NAME="{{cookiecutter.project_slug}}"
    fi
}

# Main function
main() {
    local environment=""
    local aws_profile=""
    local dry_run="false"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --aws-profile)
                aws_profile="$2"
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
    
    if [[ -z "$environment" ]]; then
        print_colored $RED "❌ Environment is required"
        show_usage
        exit 1
    fi
    
    # Set up AWS profile flag
    local profile_flag=""
    if [[ -n "$aws_profile" ]]; then
        profile_flag="--profile $aws_profile"
    fi
    
    get_service_name
    
    print_colored $BLUE "🚀 S3 Secrets Bucket Setup"
    print_colored $BLUE "=========================="
    print_colored $BLUE "Service: $SERVICE_NAME"
    echo ""
    
    if [[ "$environment" == "all" ]]; then
        # Setup buckets for all environments
        local environments=("development" "staging" "production")
        for env in "${environments[@]}"; do
            print_colored $YELLOW "🔄 Processing environment: $env"
            create_secrets_bucket "$env" "$profile_flag" "$dry_run"
            echo ""
        done
    else
        create_secrets_bucket "$environment" "$profile_flag" "$dry_run"
    fi
    
    print_colored $GREEN "🎉 Secrets bucket setup complete!"
    print_colored $YELLOW "📝 Next steps:"
    print_colored $YELLOW "   1. Update your GitHub repository variables with the correct role ARNs"
    print_colored $YELLOW "   2. Use ./secrets-sync.sh to manage your secrets"
    print_colored $YELLOW "   3. Test the workflow to ensure secrets are accessible"
}

main "$@"