#!/bin/bash

# S3 Backend Setup Script
# This script creates the S3 bucket and DynamoDB table needed for Terraform remote state backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to get user input with default
get_input() {
    local prompt=$1
    local default=$2
    local var_name=$3
    
    echo -n "$prompt [$default]: "
    read input
    
    if [[ -z "$input" ]]; then
        input="$default"
    fi
    
    eval "$var_name='$input'"
}

# Function to check if AWS CLI is configured
check_aws_cli() {
    local profile=$1
    local profile_flag=""
    
    if ! command -v aws &> /dev/null; then
        print_colored $RED "❌ AWS CLI not found. Please install AWS CLI first."
        exit 1
    fi
    
    if [[ -n "$profile" && "$profile" != "default" ]]; then
        profile_flag="--profile $profile"
    fi
    
    if ! aws sts get-caller-identity $profile_flag &> /dev/null; then
        print_colored $RED "❌ AWS CLI not configured for profile '$profile'. Please run 'aws configure --profile $profile' first."
        exit 1
    fi
    
    print_colored $GREEN "✅ AWS CLI configured for profile: $profile"
}

# Function to create S3 bucket
create_s3_bucket() {
    local bucket_name=$1
    local region=$2
    local profile=$3
    local profile_flag=""
    
    if [[ -n "$profile" && "$profile" != "default" ]]; then
        profile_flag="--profile $profile"
    fi
    
    print_colored $BLUE "🪣 Creating S3 bucket: $bucket_name"
    
    # Check if bucket already exists
    if aws s3api head-bucket --bucket "$bucket_name" --region "$region" $profile_flag 2>/dev/null; then
        print_colored $YELLOW "⚠️  S3 bucket '$bucket_name' already exists"
        return 0
    fi
    
    # Create bucket
    if [[ "$region" == "us-east-1" ]]; then
        aws s3api create-bucket \
            --bucket "$bucket_name" \
            --region "$region" \
            $profile_flag
    else
        aws s3api create-bucket \
            --bucket "$bucket_name" \
            --region "$region" \
            --create-bucket-configuration LocationConstraint="$region" \
            $profile_flag
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$bucket_name" \
        --versioning-configuration Status=Enabled \
        $profile_flag
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket "$bucket_name" \
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
    aws s3api put-public-access-block \
        --bucket "$bucket_name" \
        --public-access-block-configuration \
            BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
        $profile_flag
    
    print_colored $GREEN "✅ S3 bucket created with versioning, encryption, and public access blocked"
}

# Function to create DynamoDB table
create_dynamodb_table() {
    local table_name=$1
    local region=$2
    local profile=$3
    local profile_flag=""
    
    if [[ -n "$profile" && "$profile" != "default" ]]; then
        profile_flag="--profile $profile"
    fi
    
    print_colored $BLUE "🗃️  Creating DynamoDB table: $table_name"
    
    # Check if table already exists
    if aws dynamodb describe-table --table-name "$table_name" --region "$region" $profile_flag 2>/dev/null; then
        print_colored $YELLOW "⚠️  DynamoDB table '$table_name' already exists"
        return 0
    fi
    
    # Create table
    aws dynamodb create-table \
        --table-name "$table_name" \
        --attribute-definitions \
            AttributeName=LockID,AttributeType=S \
        --key-schema \
            AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$region" \
        $profile_flag
    
    # Wait for table to be active
    print_colored $BLUE "⏳ Waiting for DynamoDB table to be active..."
    aws dynamodb wait table-exists --table-name "$table_name" --region "$region" $profile_flag
    
    print_colored $GREEN "✅ DynamoDB table created successfully"
}

# Function to create backend config template
create_backend_config_template() {
    local bucket_name=$1
    local table_name=$2
    local region=$3
    local aws_account_id=$4
    
    # Generate in terraform directory (parent of scripts)
    local terraform_dir="$(dirname "$(pwd)")"
    local config_file="${terraform_dir}/backend-${aws_account_id}.hcl"
    
    cat > "$config_file" << EOF
# Terraform Backend Configuration for Account: $aws_account_id
# Generated by setup_backend.sh
# This is a template - actual state key will be set by init_backend.sh

bucket         = "$bucket_name"
region         = "$region"
dynamodb_table = "$table_name"
encrypt        = true

# Note: The 'key' parameter is dynamically set based on:
# environment/terraform.tfstate
# Examples:
#   development/terraform.tfstate
#   pr-123/terraform.tfstate  
#   production/terraform.tfstate
#   staging/terraform.tfstate
EOF

    # Also create a generic backend.hcl that points to this account's config
    local default_backend="${terraform_dir}/backend.hcl"
    if [[ ! -f "$default_backend" ]]; then
        cp "$config_file" "$default_backend"
        print_colored $BLUE "📋 Created default backend.hcl pointing to account $aws_account_id"
    fi

    print_colored $GREEN "✅ Created backend config: $config_file"
    print_colored $BLUE "💡 Use ./scripts/init_backend.sh to initialize with environment-specific keys"
}

# Function to create IAM policies for OIDC role access to Terraform state
create_oidc_terraform_state_policy() {
    local bucket_name=$1
    local table_name=$2
    local region=$3
    local service_name=$4
    local aws_account_id=$5
    local profile_flag=$6
    
    print_colored $BLUE "🔐 Creating role-based IAM policies for GitHub Actions OIDC access..."
    
    # Get environments from environments.json that use this account
    local config_file="../../.github/environments.json"
    if [[ ! -f "$config_file" ]]; then
        print_colored $YELLOW "⚠️  environments.json not found - creating basic development policy"
        create_role_policy "github-actions-development" "development" "$bucket_name" "$table_name" "$region" "$aws_account_id" "$profile_flag"
        return 0
    fi
    
    # Get unique roles and their associated environments/patterns
    local roles_data=$(jq -r --arg account_id "$aws_account_id" '
        (.environments // {}) as $envs |
        (.patterns // {}) as $patterns |
        
        # Collect all role ARNs for this account
        [
            ($envs | to_entries[] | select(.value.account_id == $account_id) | {env: .key, role_arn: .value.role_arn}),
            ($patterns | to_entries[] | select(.value.account_id == $account_id) | {env: .key, role_arn: .value.role_arn})
        ] | 
        group_by(.role_arn) |
        map({
            role_arn: .[0].role_arn,
            environments: map(.env)
        })
    ' "$config_file" 2>/dev/null)
    
    if [[ -z "$roles_data" || "$roles_data" == "null" || "$roles_data" == "[]" ]]; then
        print_colored $YELLOW "⚠️  No roles found for account $aws_account_id - creating basic development policy"
        create_role_policy "github-actions-development" "development" "$bucket_name" "$table_name" "$region" "$aws_account_id" "$profile_flag"
        return 0
    fi
    
    # Process each unique role
    echo "$roles_data" | jq -c '.[]' | while read role_info; do
        local role_arn=$(echo "$role_info" | jq -r '.role_arn')
        local role_name=$(echo "$role_arn" | cut -d'/' -f2)
        local envs=$(echo "$role_info" | jq -r '.environments[]')
        
        print_colored $BLUE "📋 Creating policy for role: $role_name"
        print_colored $BLUE "   Environments: $(echo $envs | tr '\n' ' ')"
        
        create_role_policy "$role_name" "$envs" "$bucket_name" "$table_name" "$region" "$aws_account_id" "$profile_flag"
    done
}

# Function to create a comprehensive policy for a role covering all its environments
create_role_policy() {
    local role_name=$1
    local environments=$2  # Space or newline separated list
    local bucket_name=$3
    local table_name=$4
    local region=$5
    local aws_account_id=$6
    local profile_flag=$7
    
    # Check if role exists
    if ! aws iam get-role --role-name "$role_name" $profile_flag &>/dev/null; then
        print_colored $YELLOW "⚠️  OIDC role '$role_name' not found - skipping"
        return 0
    fi
    
    print_colored $BLUE "🔐 Creating comprehensive Terraform state policy for role: $role_name"
    
    # Convert newline-separated environments to space-separated
    local env_list=$(echo "$environments" | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^ *//g' | sed 's/ *$//g')
    print_colored $BLUE "   S3 Prefixes: $env_list"
    
    # Build prefix array for JSON
    local prefix_array=""
    local first=true
    for env in $env_list; do
        if [[ -n "$env" ]]; then
            if [[ "$first" == "true" ]]; then
                first=false
            else
                prefix_array="${prefix_array}, "
            fi
            
            if [[ "$env" == "pr-*" ]]; then
                prefix_array="${prefix_array}\"pr-*\""
            else
                prefix_array="${prefix_array}\"$env/*\""
            fi
        fi
    done
    
    print_colored $BLUE "   Generated prefix array: [$prefix_array]"
    
    # Create policy document
    cat > /tmp/terraform-state-policy-$role_name.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "TerraformStateS3ObjectAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::$bucket_name/*"
        },
        {
            "Sid": "TerraformStateS3ListAccess",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::$bucket_name",
            "Condition": {
                "StringLike": {
                    "s3:prefix": [$prefix_array]
                }
            }
        },
        {
            "Sid": "TerraformStateDynamoDBAccess",
            "Effect": "Allow",
            "Action": [
                "dynamodb:DescribeTable",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:$region:$aws_account_id:table/$table_name"
        }
    ]
}
EOF

    local policy_name="$role_name-terraform-state-access"
    local policy_arn="arn:aws:iam::$aws_account_id:policy/$policy_name"
    
    # Delete existing policy if it exists
    if aws iam get-policy --policy-arn "$policy_arn" $profile_flag &>/dev/null; then
        print_colored $YELLOW "🔄 Updating existing policy: $policy_name"
        # Detach from role first
        aws iam detach-role-policy --role-name "$role_name" --policy-arn "$policy_arn" $profile_flag || true
        # Delete all policy versions except default
        aws iam list-policy-versions --policy-arn "$policy_arn" $profile_flag --query 'Versions[?!IsDefaultVersion].[VersionId]' --output text | while read version; do
            aws iam delete-policy-version --policy-arn "$policy_arn" --version-id "$version" $profile_flag 2>/dev/null || true
        done
        # Delete policy
        aws iam delete-policy --policy-arn "$policy_arn" $profile_flag || true
    fi
    
    # Create new policy
    aws iam create-policy \
        --policy-name "$policy_name" \
        --policy-document file:///tmp/terraform-state-policy-$role_name.json \
        $profile_flag
    
    # Attach to role
    print_colored $BLUE "🔗 Attaching policy to role: $role_name"
    if aws iam attach-role-policy \
        --role-name "$role_name" \
        --policy-arn "$policy_arn" \
        $profile_flag; then
        print_colored $GREEN "✅ Successfully attached policy to role"
    else
        print_colored $RED "❌ Failed to attach policy to role"
        return 1
    fi
    
    # Verify attachment
    print_colored $BLUE "🔍 Verifying policy attachment..."
    local attached_policies=$(aws iam list-attached-role-policies --role-name "$role_name" $profile_flag --query 'AttachedPolicies[?PolicyName==`'$policy_name'`].PolicyName' --output text)
    if [[ -n "$attached_policies" ]]; then
        print_colored $GREEN "✅ Policy successfully attached and verified"
    else
        print_colored $YELLOW "⚠️  Policy attachment verification failed"
    fi
    
    # Clean up temp file
    rm -f /tmp/terraform-state-policy-$role_name.json
    
    print_colored $GREEN "✅ Created comprehensive policy for role: $role_name"
}

# Function to create a single environment-specific policy
create_single_environment_policy() {
    local environment=$1
    local bucket_name=$2
    local table_name=$3
    local region=$4
    local aws_account_id=$5
    local profile_flag=$6
    
    # Get the role ARN from environments.json
    local config_file="../../.github/environments.json"
    local role_arn=""
    
    # First check exact environment match
    role_arn=$(jq -r --arg env "$environment" '.environments[$env].role_arn // empty' "$config_file" 2>/dev/null)
    
    # If no exact match, check pattern matches
    if [[ -z "$role_arn" || "$role_arn" == "null" ]]; then
        if [[ "$environment" =~ ^pr-[0-9]+$ ]]; then
            role_arn=$(jq -r '.patterns["pr-*"].role_arn // empty' "$config_file" 2>/dev/null)
            environment="pr-*"  # Use the pattern for the S3 prefix
        elif [[ "$environment" == "main" ]]; then
            role_arn=$(jq -r '.patterns["main"].role_arn // empty' "$config_file" 2>/dev/null)
        fi
    fi
    
    # If still no role ARN found, skip
    if [[ -z "$role_arn" || "$role_arn" == "null" ]]; then
        print_colored $YELLOW "⚠️  No role_arn found for environment '$environment' - skipping"
        return 0
    fi
    
    # Extract role name from ARN (arn:aws:iam::123456789012:role/role-name)
    local role_name=$(echo "$role_arn" | cut -d'/' -f2)
    
    # Check if role exists
    if ! aws iam get-role --role-name "$role_name" $profile_flag &>/dev/null; then
        print_colored $YELLOW "⚠️  OIDC role '$role_name' not found - skipping"
        print_colored $BLUE "💡 Role ARN from environments.json: $role_arn"
        return 0
    fi
    
    print_colored $BLUE "🔐 Creating Terraform state policy for environment: $environment"
    
    # Create policy document with environment-specific prefixes
    cat > /tmp/terraform-state-policy-$environment.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "TerraformStateS3ObjectAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": [
                "arn:aws:s3:::$bucket_name/$environment/*"
            ]
        },
        {
            "Sid": "TerraformStateS3ListAccess",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::$bucket_name",
            "Condition": {
                "StringLike": {
                    "s3:prefix": "$environment/*"
                }
            }
        },
        {
            "Sid": "TerraformStateDynamoDBAccess",
            "Effect": "Allow",
            "Action": [
                "dynamodb:DescribeTable",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:DeleteItem"
            ],
            "Resource": "arn:aws:dynamodb:$region:$aws_account_id:table/$table_name"
        }
    ]
}
EOF

    local policy_name="$role_name-terraform-state-access"
    local policy_arn="arn:aws:iam::$aws_account_id:policy/$policy_name"
    
    # Delete existing policy if it exists
    if aws iam get-policy --policy-arn "$policy_arn" $profile_flag &>/dev/null; then
        print_colored $YELLOW "🔄 Updating existing policy: $policy_name"
        # Detach from role first
        aws iam detach-role-policy --role-name "$role_name" --policy-arn "$policy_arn" $profile_flag || true
        # Delete all policy versions except default
        aws iam list-policy-versions --policy-arn "$policy_arn" $profile_flag --query 'Versions[?!IsDefaultVersion].[VersionId]' --output text | while read version; do
            aws iam delete-policy-version --policy-arn "$policy_arn" --version-id "$version" $profile_flag 2>/dev/null || true
        done
        # Delete policy
        aws iam delete-policy --policy-arn "$policy_arn" $profile_flag || true
    fi
    
    # Create new policy
    aws iam create-policy \
        --policy-name "$policy_name" \
        --policy-document file:///tmp/terraform-state-policy-$environment.json \
        $profile_flag
    
    # Attach to role
    print_colored $BLUE "🔗 Attaching policy to role: $role_name"
    if aws iam attach-role-policy \
        --role-name "$role_name" \
        --policy-arn "$policy_arn" \
        $profile_flag; then
        print_colored $GREEN "✅ Successfully attached policy to role"
    else
        print_colored $RED "❌ Failed to attach policy to role"
        return 1
    fi
    
    # Verify attachment
    print_colored $BLUE "🔍 Verifying policy attachment..."
    local attached_policies=$(aws iam list-attached-role-policies --role-name "$role_name" $profile_flag --query 'AttachedPolicies[?PolicyName==`'$policy_name'`].PolicyName' --output text)
    if [[ -n "$attached_policies" ]]; then
        print_colored $GREEN "✅ Policy successfully attached and verified"
    else
        print_colored $YELLOW "⚠️  Policy attachment verification failed"
    fi
    
    # Clean up temp file
    rm -f /tmp/terraform-state-policy-$environment.json
    
    print_colored $GREEN "✅ Created policy for $environment: $policy_name"
}

# Function to show summary
show_summary() {
    local bucket_name=$1
    local table_name=$2
    local region=$3
    
    print_colored $GREEN "\n🎉 Backend infrastructure setup complete!"
    print_colored $BLUE "==========================================\n"
    
    echo "Shared resources created:"
    echo "  📦 S3 Bucket: $bucket_name"
    echo "  🗃️  DynamoDB Table: $table_name"
    echo "  🌍 Region: $region"
    echo ""
    
    echo "Next steps:"
    echo "1. Initialize for your environment:"
    echo "   ./scripts/init_backend.sh"
    echo ""
    echo "2. Or specify environment directly:"
    echo "   ./scripts/init_backend.sh -e development -s myapp"
    echo "   ./scripts/init_backend.sh -e pr-123 -s myapp"
    echo ""
    echo "3. For multi-account setups, run this script in each account:"
    echo "   # In dev account (123456789012):"
    echo "   ./scripts/setup_backend.sh  # Creates backend-123456789012.hcl"
    echo "   # In prod account (345678901234):"
    echo "   ./scripts/setup_backend.sh  # Creates backend-345678901234.hcl"
    echo ""
    
    print_colored $GREEN "✅ These resources support ALL environments (development, staging, production, PR apps)"
    print_colored $YELLOW "⚠️  Keep backend.hcl secure - it contains your backend configuration"
}

# Main function
main() {
    # Check if we're in the scripts directory
    if [[ ! -f "setup_backend.sh" ]]; then
        print_colored $RED "❌ Please run this script from the terraform/scripts directory"
        exit 1
    fi
    
    print_colored $BLUE "🚀 Terraform S3 Backend Infrastructure Setup"
    print_colored $BLUE "============================================\n"
    
    # Get configuration from user
    local aws_profile=""
    local service_name=""
    
    get_input "Service name" "myapp" service_name
    get_input "AWS profile" "default" aws_profile
    
    # Check AWS CLI with profile
    check_aws_cli "$aws_profile"
    
    local profile_flag=""
    if [[ -n "$aws_profile" && "$aws_profile" != "default" ]]; then
        profile_flag="--profile $aws_profile"
    fi
    
    # Get AWS account info
    local aws_account_id=$(aws sts get-caller-identity $profile_flag --query Account --output text)
    local aws_region=$(aws configure get region $profile_flag || echo "us-east-1")
    
    print_colored $BLUE "📋 Current AWS Configuration:"
    echo "  Profile: $aws_profile"
    echo "  Account ID: $aws_account_id"
    echo "  Region: $aws_region"
    echo ""
    
    # Generate standard names based on service and account
    local bucket_name="${aws_account_id}-${service_name}-terraform-state"
    local table_name="${service_name}-terraform-state-lock"
    local region="$aws_region"
    
    print_colored $BLUE "📝 Generated Backend Configuration:"
    echo "  Service: $service_name"
    echo "  S3 Bucket: $bucket_name"
    echo "  DynamoDB Table: $table_name"
    echo "  Region: $region"
    echo ""
    
    # Show what environments will use this backend
    print_colored $YELLOW "🔍 Checking environments.json for environments using account $aws_account_id:"
    local config_file="../../.github/environments.json"
    if [[ -f "$config_file" ]]; then
        # Find environments that match this account ID
        local matching_envs=$(jq -r --arg account_id "$aws_account_id" '
            (.environments // {}) as $envs |
            (.patterns // {}) as $patterns |
            (.defaults // {}) as $defaults |
            [
                ($envs | to_entries[] | select(.value.account_id == $account_id) | .key),
                ($patterns | to_entries[] | select(.value.account_id == $account_id) | .key)
            ] | .[]
        ' "$config_file" 2>/dev/null | sort -u)
        
        if [[ -n "$matching_envs" ]]; then
            echo "  Environments using this backend:"
            echo "$matching_envs" | while read env; do
                echo "    - $env"
            done
        else
            print_colored $YELLOW "  ⚠️  No environments found in environments.json for account $aws_account_id"
            print_colored $YELLOW "  💡 You may need to update .github/environments.json"
        fi
    else
        print_colored $YELLOW "  ⚠️  environments.json not found at $config_file"
    fi
    echo ""
    
    print_colored $BLUE "💡 This backend will support all environments in account $aws_account_id"
    echo -n "Proceed with creation? (y/N): "
    read confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_colored $YELLOW "❌ Setup cancelled"
        exit 0
    fi
    
    echo ""
    
    # Create resources
    create_s3_bucket "$bucket_name" "$region" "$aws_profile"
    create_dynamodb_table "$table_name" "$region" "$aws_profile"
    create_backend_config_template "$bucket_name" "$table_name" "$region" "$aws_account_id"
    create_oidc_terraform_state_policy "$bucket_name" "$table_name" "$region" "$service_name" "$aws_account_id" "$profile_flag"
    
    # Show summary
    show_summary "$bucket_name" "$table_name" "$region"
}

# Run main function
main "$@"