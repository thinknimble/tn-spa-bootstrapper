#!/bin/bash

# GitHub Actions OIDC IAM Role Setup Script
# Creates a reusable IAM role for GitHub Actions across all your projects
# Run this once per AWS account, then use the role ARN in all your GitHub repositories

set -e

echo "🚀 Setting up GitHub Actions OIDC IAM Role..."
echo "=============================================="

# Get AWS profile
read -p "Enter AWS profile (default): " AWS_PROFILE
AWS_PROFILE=${AWS_PROFILE:-default}

# Set profile flag
if [[ "$AWS_PROFILE" != "default" ]]; then
    PROFILE_FLAG="--profile $AWS_PROFILE"
else
    PROFILE_FLAG=""
fi

# Get GitHub organization/username
read -p "Enter your GitHub organization/username: " GITHUB_ORG
if [[ -z "$GITHUB_ORG" ]]; then
    echo "❌ GitHub organization/username is required"
    exit 1
fi

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text $PROFILE_FLAG)
echo "📋 AWS Account ID: $ACCOUNT_ID"
echo "🏢 GitHub Org: $GITHUB_ORG"

# 1. Create OIDC Identity Provider
echo ""
echo "🔗 Creating OIDC Identity Provider..."
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "arn:aws:iam::$ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com" $PROFILE_FLAG &>/dev/null; then
    echo "⚠️  OIDC provider already exists"
else
    aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --client-id-list sts.amazonaws.com \
        --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
        $PROFILE_FLAG
    echo "✅ OIDC provider created"
fi

# 2. Create IAM Role
echo ""
echo "👤 Creating IAM Role..."
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

if aws iam get-role --role-name GitHubActionsRole $PROFILE_FLAG &>/dev/null; then
    echo "⚠️  Role GitHubActionsRole already exists"
else
    aws iam create-role \
        --role-name GitHubActionsRole \
        --assume-role-policy-document file:///tmp/github-actions-trust-policy.json \
        $PROFILE_FLAG
    echo "✅ IAM role created"
fi

# 3. Attach policies
echo ""
echo "📋 Attaching policies..."
policies=(
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
    "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
    "arn:aws:iam::aws:policy/AmazonVPCFullAccess"
    "arn:aws:iam::aws:policy/AmazonRDSFullAccess"
    "arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess"
    "arn:aws:iam::aws:policy/IAMFullAccess"
    "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
    "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
    "arn:aws:iam::aws:policy/AmazonS3FullAccess"
    "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
    "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess"
    "arn:aws:iam::aws:policy/AmazonElastiCacheFullAccess"
    "arn:aws:iam::aws:policy/AmazonRoute53FullAccess"
    "arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess"
)

for policy in "${policies[@]}"; do
    aws iam attach-role-policy --role-name GitHubActionsRole --policy-arn "$policy" $PROFILE_FLAG
    echo "  ✅ Attached $(basename "$policy")"
done

# 4. Get role ARN
ROLE_ARN=$(aws iam get-role --role-name GitHubActionsRole --query Role.Arn --output text $PROFILE_FLAG)

# Clean up temp file
rm -f /tmp/github-actions-trust-policy.json

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "Role ARN: $ROLE_ARN"
echo ""
echo "Usage:"
echo "1. In each GitHub repository, go to Settings → Secrets and variables → Actions → Variables"
echo "2. Add variable: TF_AWS_ROLE_ARN = $ROLE_ARN"
echo ""
echo "This role works for all repositories under: $GITHUB_ORG/*"