#!/bin/bash

# GitHub Actions OIDC IAM Role Setup Script
# Creates a reusable IAM role for GitHub Actions across all your projects
# Run this once per AWS account, then use the role ARN in all your GitHub repositories
#
# Note: The OIDC thumbprint may need updating when GitHub rotates their SSL certificates.
# To get the current thumbprint, run:
# openssl s_client -servername token.actions.githubusercontent.com -showcerts -connect token.actions.githubusercontent.com:443 < /dev/null 2>/dev/null | openssl x509 -fingerprint -sha1 -noout | cut -d= -f2 | tr -d :

# Exit on error (but handle sourcing gracefully)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script is being executed directly
    set -e
else
    # Script is being sourced
    set -E
    trap 'echo "❌ Script failed at line $LINENO. Returning to shell."; return 1' ERR
fi

echo "🚀 Setting up GitHub Actions OIDC IAM Role..."
echo "=============================================="

# Get AWS profile
echo -n "Enter AWS profile (default): "
read AWS_PROFILE
AWS_PROFILE=${AWS_PROFILE:-default}

# Set up AWS command function to handle profile
run_aws() {
    if [[ "$AWS_PROFILE" != "default" && -n "$AWS_PROFILE" ]]; then
        aws --profile "$AWS_PROFILE" "$@"
    else
        aws "$@"
    fi
}

# Get GitHub organization/username
echo -n "Enter your GitHub organization/username: "
read GITHUB_ORG
if [[ -z "$GITHUB_ORG" ]]; then
    echo "❌ GitHub organization/username is required"
    exit 1
fi

# Get environments for role naming
echo "Select environments to create roles for:"
echo "1) Production"
echo "2) Staging" 
echo "3) Development"
echo "4) All environments"
echo -n "Enter your choice(s) (e.g., 1,3 or 4): "
read ENV_CHOICE

ENVIRONMENTS=()
case "$ENV_CHOICE" in
    *4*|*"all"*|*"All"*)
        ENVIRONMENTS=("production" "staging" "development")
        ;;
    *)
        [[ "$ENV_CHOICE" == *"1"* ]] && ENVIRONMENTS+=("production")
        [[ "$ENV_CHOICE" == *"2"* ]] && ENVIRONMENTS+=("staging")
        [[ "$ENV_CHOICE" == *"3"* ]] && ENVIRONMENTS+=("development")
        ;;
esac

if [[ ${#ENVIRONMENTS[@]} -eq 0 ]]; then
    echo "❌ No valid environment selected. Defaulting to development."
    ENVIRONMENTS=("development")
fi

echo "📋 Selected environments: ${ENVIRONMENTS[*]}"

# Get secrets bucket name for S3 permissions
echo -n "Enter secrets bucket name (project-terraform-secrets): "
read SECRETS_BUCKET
if [[ -z "$SECRETS_BUCKET" ]]; then
    echo "❌ Secrets bucket name is required"
    exit 1
fi

# Get AWS account ID
ACCOUNT_ID=$(run_aws sts get-caller-identity --query Account --output text)
echo "📋 AWS Account ID: $ACCOUNT_ID"
echo "🏢 GitHub Org: $GITHUB_ORG"
echo "🏷️  Environments: ${ENVIRONMENTS[*]}"
echo "🪣 Secrets Bucket: $SECRETS_BUCKET"

# 1. Create OIDC Identity Provider (only needed once per account)
echo ""
echo "🔗 Creating OIDC Identity Provider..."
if run_aws iam get-open-id-connect-provider --open-id-connect-provider-arn "arn:aws:iam::$ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com" &>/dev/null; then
    echo "⚠️  OIDC provider already exists"
else
    run_aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --client-id-list sts.amazonaws.com \
        --thumbprint-list 1c58a3a8518e8759bf075b76b750d4f2df264fcd
    echo "✅ OIDC provider created"
fi

# Variables to store created role ARNs (compatible with older Bash versions)
ROLE_ARNS_OUTPUT=""

# Loop through each selected environment
for ENVIRONMENT in "${ENVIRONMENTS[@]}"; do
    echo ""
    echo "🌟 Processing environment: $ENVIRONMENT"
    echo "========================================"

# Function to check if GitHub org already exists in trust policy
check_github_org_in_trust_policy() {
    local role_name="$1"
    local github_org="$2"
    
    local trust_policy=$(run_aws iam get-role --role-name "$role_name" --query 'Role.AssumeRolePolicyDocument' --output json 2>/dev/null)
    if [[ $? -eq 0 ]]; then
        echo "$trust_policy" | python3 -c "
import sys, json
try:
    policy = json.loads(sys.stdin.read())
    github_org = '$github_org'
    search_pattern = f'repo:{github_org}/*:*'
    
    for stmt in policy.get('Statement', []):
        condition = stmt.get('Condition', {})
        string_like = condition.get('StringLike', {})
        sub_condition = string_like.get('token.actions.githubusercontent.com:sub', '')
        if isinstance(sub_condition, list):
            for sub in sub_condition:
                if search_pattern in sub:
                    sys.exit(0)
        elif search_pattern in str(sub_condition):
            sys.exit(0)
    sys.exit(1)
except Exception as e:
    print(f'Error checking trust policy: {e}', file=sys.stderr)
    sys.exit(1)
" 2>/dev/null
        return $?
    fi
    return 1
}

# Function to update trust policy with new GitHub org
update_trust_policy_with_github_org() {
    local role_name="$1"
    local github_org="$2"
    
    # Get current trust policy in JSON format
    local current_policy=$(run_aws iam get-role --role-name "$role_name" --query 'Role.AssumeRolePolicyDocument' --output json)
    
    # Create updated policy with new GitHub org
    echo "$current_policy" | python3 -c "
import sys, json
try:
    policy = json.loads(sys.stdin.read())
    github_org = '$github_org'
    
    for stmt in policy.get('Statement', []):
        condition = stmt.get('Condition', {})
        string_like = condition.get('StringLike', {})
        sub_condition = string_like.get('token.actions.githubusercontent.com:sub', '')
        
        if isinstance(sub_condition, str):
            # Convert single string to list and add new org
            string_like['token.actions.githubusercontent.com:sub'] = [sub_condition, f'repo:{github_org}/*:*']
        elif isinstance(sub_condition, list):
            # Add to existing list if not already present
            new_sub = f'repo:{github_org}/*:*'
            if new_sub not in sub_condition:
                sub_condition.append(new_sub)
        else:
            # Create new condition
            string_like['token.actions.githubusercontent.com:sub'] = f'repo:{github_org}/*:*'
    
    print(json.dumps(policy, indent=2))
except Exception as e:
    print(f'Error updating trust policy: {e}', file=sys.stderr)
    sys.exit(1)
" > /tmp/updated-trust-policy.json
    
    if [[ $? -eq 0 ]]; then
        run_aws iam update-assume-role-policy \
            --role-name "$role_name" \
            --policy-document file:///tmp/updated-trust-policy.json
        return $?
    fi
    return 1
}

# 2. Create or Update IAM Role
echo ""
echo "👤 Processing IAM Role..."

ROLE_NAME="github-actions-$ENVIRONMENT"

if run_aws iam get-role --role-name "$ROLE_NAME" &>/dev/null; then
    echo "⚠️  Role $ROLE_NAME already exists"
    
    # Check if the GitHub org is already in the trust policy
    if check_github_org_in_trust_policy "$ROLE_NAME" "$GITHUB_ORG"; then
        echo "✅ GitHub org '$GITHUB_ORG' already has access to role $ROLE_NAME"
    else
        echo "🔄 Adding GitHub org '$GITHUB_ORG' to existing role $ROLE_NAME..."
        if update_trust_policy_with_github_org "$ROLE_NAME" "$GITHUB_ORG"; then
            echo "✅ Successfully added GitHub org '$GITHUB_ORG' to role $ROLE_NAME"
        else
            echo "❌ Failed to update trust policy for role $ROLE_NAME"
            exit 1
        fi
    fi
else
    # Create new role with initial trust policy
    echo "📋 Creating trust policy for GitHub org: $GITHUB_ORG"
    echo "   This will allow access from repositories: repo:$GITHUB_ORG/*:*"
    
    cat > /tmp/github-actions-trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::$ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                },
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:$GITHUB_ORG/*:*"
                }
            }
        }
    ]
}
EOF

    echo "📄 Trust policy content:"
    cat /tmp/github-actions-trust-policy.json | jq .
    
    run_aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/github-actions-trust-policy.json
    echo "✅ IAM role created: $ROLE_NAME"
    
    # Verify the trust policy was set correctly
    echo "🔍 Verifying trust policy..."
    ACTUAL_POLICY=$(run_aws iam get-role --role-name "$ROLE_NAME" --query 'Role.AssumeRolePolicyDocument' --output json)
    echo "📄 Actual trust policy set:"
    echo "$ACTUAL_POLICY" | jq .
fi

# 3. Create comprehensive GitHub Actions policy
echo ""
echo "📋 Creating GitHub Actions deployment policy..."
cat > /tmp/github-actions-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ECRFullAccess",
            "Effect": "Allow",
            "Action": [
                "ecr:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ECSFullAccess",
            "Effect": "Allow",
            "Action": [
                "ecs:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "VPCAccess",
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "ec2:CreateVpc",
                "ec2:DeleteVpc",
                "ec2:ModifyVpcAttribute",
                "ec2:CreateSubnet",
                "ec2:DeleteSubnet",
                "ec2:ModifySubnetAttribute",
                "ec2:CreateInternetGateway",
                "ec2:DeleteInternetGateway",
                "ec2:AttachInternetGateway",
                "ec2:DetachInternetGateway",
                "ec2:CreateRouteTable",
                "ec2:DeleteRouteTable",
                "ec2:CreateRoute",
                "ec2:DeleteRoute",
                "ec2:AssociateRouteTable",
                "ec2:DisassociateRouteTable",
                "ec2:CreateSecurityGroup",
                "ec2:DeleteSecurityGroup",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:AuthorizeSecurityGroupEgress",
                "ec2:RevokeSecurityGroupIngress",
                "ec2:RevokeSecurityGroupEgress",
                "ec2:CreateTags",
                "ec2:DeleteTags"
            ],
            "Resource": "*"
        },
        {
            "Sid": "RDSAccess",
            "Effect": "Allow",
            "Action": [
                "rds:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ACMAccess",
            "Effect": "Allow",
            "Action": [
                "acm:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "IAMAccess",
            "Effect": "Allow",
            "Action": [
                "iam:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "SecretsManagerAccess",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "CloudWatchLogsAccess",
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "S3FullAccess",
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "DynamoDBAccess",
            "Effect": "Allow",
            "Action": [
                "dynamodb:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ELBAccess",
            "Effect": "Allow",
            "Action": [
                "elasticloadbalancing:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ElastiCacheAccess",
            "Effect": "Allow",
            "Action": [
                "elasticache:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "Route53Access",
            "Effect": "Allow",
            "Action": [
                "route53:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "EventBridgeAccess",
            "Effect": "Allow",
            "Action": [
                "events:*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "STSAccess",
            "Effect": "Allow",
            "Action": [
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
EOF

GITHUB_ACTIONS_POLICY_NAME="$ROLE_NAME-deployment-policy"

# Delete existing policy if it exists
if run_aws iam get-policy --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$GITHUB_ACTIONS_POLICY_NAME" &>/dev/null; then
    # Detach from role first
    run_aws iam detach-role-policy --role-name "$ROLE_NAME" --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$GITHUB_ACTIONS_POLICY_NAME" || true
    # Delete all policy versions except default
    run_aws iam list-policy-versions --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$GITHUB_ACTIONS_POLICY_NAME" --query 'Versions[?!IsDefaultVersion].[VersionId]' --output text | while read version; do
        run_aws iam delete-policy-version --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$GITHUB_ACTIONS_POLICY_NAME" --version-id "$version" 2>/dev/null || true
    done
    # Delete policy
    run_aws iam delete-policy --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$GITHUB_ACTIONS_POLICY_NAME" || true
fi

# Create new policy
run_aws iam create-policy \
    --policy-name "$GITHUB_ACTIONS_POLICY_NAME" \
    --policy-document file:///tmp/github-actions-policy.json

# Attach to role
run_aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$GITHUB_ACTIONS_POLICY_NAME"

echo "  ✅ Created and attached GitHub Actions deployment policy"

# 4. Create and attach S3 secrets policy
echo ""
echo "🔐 Creating S3 secrets policy..."
cat > /tmp/s3-secrets-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "SecretsS3Access",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": [
                "arn:aws:s3:::$SECRETS_BUCKET/$ENVIRONMENT/*"
            ]
        },
        {
            "Sid": "AllowListBucketForEnvironment", 
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::$SECRETS_BUCKET",
            "Condition": {
                "StringLike": {
                    "s3:prefix": "$ENVIRONMENT/*"
                }
            }
        },
        {
            "Sid": "AllowListBucketsForSecretsAccess",
            "Effect": "Allow",
            "Action": "s3:ListAllMyBuckets",
            "Resource": "*"
        }
    ]
}
EOF

SECRETS_POLICY_NAME="$ROLE_NAME-secrets-access"

# Delete existing policy if it exists
if run_aws iam get-policy --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$SECRETS_POLICY_NAME" &>/dev/null; then
    # Detach from role first
    run_aws iam detach-role-policy --role-name "$ROLE_NAME" --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$SECRETS_POLICY_NAME" || true
    # Delete all policy versions except default
    run_aws iam list-policy-versions --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$SECRETS_POLICY_NAME" --query 'Versions[?!IsDefaultVersion].[VersionId]' --output text | while read version; do
        run_aws iam delete-policy-version --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$SECRETS_POLICY_NAME" --version-id "$version" 2>/dev/null || true
    done
    # Delete policy
    run_aws iam delete-policy --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$SECRETS_POLICY_NAME" || true
fi

# Create new policy
run_aws iam create-policy \
    --policy-name "$SECRETS_POLICY_NAME" \
    --policy-document file:///tmp/s3-secrets-policy.json

# Attach to role
run_aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/$SECRETS_POLICY_NAME"

echo "  ✅ Attached S3 secrets policy"

# 5. Get role ARN and store it
ROLE_ARN=$(run_aws iam get-role --role-name "$ROLE_NAME" --query Role.Arn --output text)
ROLE_ARNS_OUTPUT="${ROLE_ARNS_OUTPUT}${ENVIRONMENT}:${ROLE_ARN}\n"

echo "  ✅ Role created for $ENVIRONMENT: $ROLE_ARN"

done  # End of environment loop

# Clean up temp files
rm -f /tmp/github-actions-trust-policy.json
rm -f /tmp/updated-trust-policy.json
rm -f /tmp/github-actions-policy.json
rm -f /tmp/s3-secrets-policy.json

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "Created roles for ${#ENVIRONMENTS[@]} environment(s):"
echo -e "$ROLE_ARNS_OUTPUT" | while IFS=: read -r env role_arn; do
    if [[ -n "$env" && -n "$role_arn" ]]; then
        echo "  📋 $(echo $env | tr '[:lower:]' '[:upper:]'): $role_arn"
    fi
done
echo ""
echo "Usage:"
echo "1. In each GitHub repository, go to Settings → Secrets and variables → Actions → Variables"
echo "2. Add these variables:"
echo -e "$ROLE_ARNS_OUTPUT" | while IFS=: read -r env role_arn; do
    if [[ -n "$env" && -n "$role_arn" ]]; then
        echo "   - $(echo $env | tr '[:lower:]' '[:upper:]')_AWS_ROLE_ARN = $role_arn"
    fi
done
echo ""
echo "3. Update your .github/environments.json to use these role ARNs"
echo ""
echo "These roles work for:"
echo "  - All repositories under: $GITHUB_ORG/*"
echo "  - S3 secrets bucket: $SECRETS_BUCKET"
echo "  - Environments: ${ENVIRONMENTS[*]}"