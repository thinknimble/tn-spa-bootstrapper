#!/bin/bash

# Dynamic Terraform Backend Initialization Script
# This script initializes Terraform with the correct backend configuration based on environment

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -e, --environment ENV   Environment name (development, staging, production, pr-123)"
    echo "  -s, --service SERVICE   Service name (defaults to terraform.tfvars value)"
    echo "  -p, --profile PROFILE   AWS profile (defaults to terraform.tfvars value)"
    echo "  -f, --force             Force re-initialization (migrate state if needed)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Interactive mode"
    echo "  $0 -e development                    # Development environment"
    echo "  $0 -e pr-123 -s myapp               # PR review app"
    echo "  $0 -e production -p prod-profile     # Production with specific profile"
}

# Function to get value from terraform.tfvars
get_tfvar_value() {
    local var_name=$1
    local default_value=$2
    
    if [[ -f "terraform.tfvars" ]]; then
        # Extract the value from terraform.tfvars, handling the specific spacing format
        local value=$(grep "^[[:space:]]*${var_name}[[:space:]]*=" terraform.tfvars | sed 's/^[^=]*=[[:space:]]*"\([^"]*\)".*/\1/' | head -1)
        if [[ -n "$value" ]]; then
            echo "$value"
            return
        fi
    fi
    
    echo "$default_value"
}

# Function to generate state key
generate_state_key() {
    local service=$1
    local environment=$2
    echo "${service}/${environment}/terraform.tfstate"
}

# Function to initialize backend
init_backend() {
    local service=$1
    local environment=$2
    local aws_profile=$3
    local bucket=$4
    local region=$5
    local table=$6
    local force=$7
    
    local state_key=$(generate_state_key "$service" "$environment")
    
    print_colored $BLUE "🚀 Initializing Terraform Backend"
    print_colored $BLUE "=================================="
    echo "  Service: $service"
    echo "  Environment: $environment"
    echo "  AWS Profile: $aws_profile"
    echo "  State Key: $state_key"
    echo "  S3 Bucket: $bucket"
    echo "  DynamoDB Table: $table"
    echo "  Region: $region"
    echo ""
    
    # Prepare backend config
    local backend_args=""
    backend_args+=" -backend-config=\"bucket=${bucket}\""
    backend_args+=" -backend-config=\"key=${state_key}\""
    backend_args+=" -backend-config=\"region=${region}\""
    backend_args+=" -backend-config=\"dynamodb_table=${table}\""
    backend_args+=" -backend-config=\"encrypt=true\""
    
    # Add profile if not default
    if [[ -n "$aws_profile" && "$aws_profile" != "default" ]]; then
        backend_args+=" -backend-config=\"profile=${aws_profile}\""
    fi
    
    # Add force flag if requested
    if [[ "$force" == "true" ]]; then
        backend_args+=" -migrate-state"
    fi
    
    print_colored $BLUE "🔄 Running terraform init..."
    print_colored $YELLOW "Debug: Backend arguments: ${backend_args}"
    
    # Execute terraform init
    eval "terraform init ${backend_args}"
    
    if [[ $? -eq 0 ]]; then
        print_colored $GREEN "✅ Backend initialized successfully!"
        print_colored $BLUE "💡 Current workspace: $(terraform workspace show)"
        
        # Show backend configuration
        print_colored $YELLOW "📋 Backend Configuration:"
        echo "  State Location: s3://${bucket}/${state_key}"
        echo "  Lock Table: ${table}"
        echo "  Environment: ${environment}"
    else
        print_colored $RED "❌ Backend initialization failed!"
        exit 1
    fi
}

# Function for interactive mode
interactive_mode() {
    print_colored $BLUE "🚀 Dynamic Backend Initialization"
    print_colored $BLUE "=================================\n"
    
    # Get current values from terraform.tfvars and backend.hcl
    local current_service=$(get_tfvar_value "service" "myapp")
    local current_environment=$(get_tfvar_value "environment" "development")
    local current_profile=$(get_tfvar_value "aws_profile" "default")
    
    # Read backend config from backend.hcl
    local current_bucket=""
    local current_region="us-east-1"
    local current_table="terraform-state-lock"
    
    if [[ -f "backend.hcl" ]]; then
        current_bucket=$(grep "^[[:space:]]*bucket[[:space:]]*=" backend.hcl | sed 's/^[^=]*=[[:space:]]*"\([^"]*\)".*/\1/' | head -1)
        current_region=$(grep "^[[:space:]]*region[[:space:]]*=" backend.hcl | sed 's/^[^=]*=[[:space:]]*"\([^"]*\)".*/\1/' | head -1 || echo "us-east-1")
        current_table=$(grep "^[[:space:]]*dynamodb_table[[:space:]]*=" backend.hcl | sed 's/^[^=]*=[[:space:]]*"\([^"]*\)".*/\1/' | head -1 || echo "terraform-state-lock")
    fi
    
    echo -n "Service name [$current_service]: "
    read service
    service=${service:-$current_service}
    
    echo -n "Environment (development, staging, production, pr-123) [$current_environment]: "
    read environment
    environment=${environment:-$current_environment}
    
    echo -n "AWS profile [$current_profile]: "
    read aws_profile
    aws_profile=${aws_profile:-$current_profile}
    
    # Backend configuration
    if [[ -z "$current_bucket" ]]; then
        echo -n "S3 bucket for state: "
        read bucket
    else
        echo -n "S3 bucket for state [$current_bucket]: "
        read bucket
        bucket=${bucket:-$current_bucket}
    fi
    
    echo -n "AWS region [$current_region]: "
    read region
    region=${region:-$current_region}
    
    echo -n "DynamoDB table [$current_table]: "
    read table
    table=${table:-$current_table}
    
    echo -n "Force re-initialization? (y/N): "
    read force_confirm
    local force="false"
    if [[ "$force_confirm" =~ ^[Yy]$ ]]; then
        force="true"
    fi
    
    echo ""
    init_backend "$service" "$environment" "$aws_profile" "$bucket" "$region" "$table" "$force"
}

# Main function
main() {
    # Check if we're in terraform directory
    if [[ ! -f "backend.tf" ]] || [[ ! -f "variables.tf" ]]; then
        print_colored $RED "❌ Please run this script from the terraform directory"
        exit 1
    fi
    
    # Parse command line arguments
    local environment=""
    local service=""
    local aws_profile=""
    local force="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -e|--environment)
                environment="$2"
                shift 2
                ;;
            -s|--service)
                service="$2"
                shift 2
                ;;
            -p|--profile)
                aws_profile="$2"
                shift 2
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            *)
                print_colored $RED "❌ Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # If no arguments provided, use interactive mode
    if [[ -z "$environment" && -z "$service" && -z "$aws_profile" ]]; then
        interactive_mode
        return
    fi
    
    # Get defaults from terraform.tfvars
    service=${service:-$(get_tfvar_value "service" "myapp")}
    environment=${environment:-$(get_tfvar_value "environment" "development")}
    aws_profile=${aws_profile:-$(get_tfvar_value "aws_profile" "default")}
    
    # Read backend configuration from backend.hcl
    local bucket=""
    local region="us-east-1"
    local table="terraform-state-lock"
    
    if [[ -f "backend.hcl" ]]; then
        bucket=$(grep "^[[:space:]]*bucket[[:space:]]*=" backend.hcl | sed 's/^[^=]*=[[:space:]]*"\([^"]*\)".*/\1/' | head -1)
        region=$(grep "^[[:space:]]*region[[:space:]]*=" backend.hcl | sed 's/^[^=]*=[[:space:]]*"\([^"]*\)".*/\1/' | head -1 || echo "us-east-1")
        table=$(grep "^[[:space:]]*dynamodb_table[[:space:]]*=" backend.hcl | sed 's/^[^=]*=[[:space:]]*"\([^"]*\)".*/\1/' | head -1 || echo "terraform-state-lock")
    fi
    
    # Validate required values
    if [[ -z "$bucket" ]]; then
        print_colored $RED "❌ Backend bucket not found in backend.hcl"
        print_colored $YELLOW "Run ./scripts/setup_backend.sh first to create backend resources"
        exit 1
    fi
    
    init_backend "$service" "$environment" "$aws_profile" "$bucket" "$region" "$table" "$force"
}

# Run main function
main "$@"