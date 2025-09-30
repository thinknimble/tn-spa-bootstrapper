{% raw %}#!/bin/bash

# Environment Variable Management Script
# This script helps add new environment variables to your Terraform infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Files to modify
VARIABLES_FILE="variables.tf"
EXAMPLE_FILE="terraform.tfvars.example"
SECRETS_FILE="secrets.tf"
APP_FILE="app.tf"
WORKERS_FILE="workers.tf"

# Function to print colored output
print_colored() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if required files exist
check_files() {
    local missing_files=()
    
    if [[ ! -f "$VARIABLES_FILE" ]]; then
        missing_files+=("$VARIABLES_FILE")
    fi
    
    if [[ ! -f "$EXAMPLE_FILE" ]]; then
        missing_files+=("$EXAMPLE_FILE")
    fi
    
    if [[ ! -f "$SECRETS_FILE" ]]; then
        missing_files+=("$SECRETS_FILE")
    fi
    
    if [[ ! -f "$APP_FILE" ]]; then
        missing_files+=("$APP_FILE")
    fi
    
    if [[ ! -f "$WORKERS_FILE" ]]; then
        missing_files+=("$WORKERS_FILE")
    fi
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        print_colored $RED "❌ Missing required files:"
        for file in "${missing_files[@]}"; do
            print_colored $RED "   - $file"
        done
        print_colored $YELLOW "Please run this script from the terraform directory."
        exit 1
    fi
}

# Function to convert snake_case to UPPER_SNAKE_CASE
to_upper_snake_case() {
    echo "$1" | tr '[:lower:]' '[:upper:]'
}

# Function to convert any case to snake_case
to_snake_case() {
    echo "$1" | sed 's/\([A-Z]\)/_\1/g' | tr '[:upper:]' '[:lower:]' | sed 's/^_//'
}

# Function to validate variable name
validate_variable_name() {
    local var_name=$1
    
    # Allow letters, numbers, underscores - we'll convert to proper format
    if [[ ! $var_name =~ ^[a-zA-Z][a-zA-Z0-9_]*$ ]]; then
        print_colored $RED "❌ Invalid variable name: $var_name"
        print_colored $YELLOW "Variable names must:"
        print_colored $YELLOW "  - Start with a letter"
        print_colored $YELLOW "  - Contain only letters, numbers, and underscores"
        print_colored $YELLOW "  - Examples: myApiKey, my_api_key, MY_API_KEY"
        return 1
    fi
    
    # Convert to snake_case for consistency check
    local snake_case_name=$(to_snake_case "$var_name")
    
    # Special handling for aws_region - it's already configured for multi-account deployments
    if [[ "$snake_case_name" == "aws_region" ]]; then
        print_colored $YELLOW "💡 The 'aws_region' variable already exists and is configured for multi-account deployments."
        print_colored $YELLOW "Region settings are managed in .github/environments.json"
        print_colored $YELLOW "See the README for configuration details."
        return 1
    fi
    
    # Check if variable already exists
    if grep -q "variable \"$snake_case_name\"" "$VARIABLES_FILE"; then
        print_colored $RED "❌ Variable '$snake_case_name' already exists in $VARIABLES_FILE"
        return 1
    fi
    
    return 0
}

# Function to add variable to variables.tf
add_to_variables_tf() {
    local var_name=$1
    local description=$2
    local is_sensitive=$3
    local default_value=$4
    
    print_colored $BLUE "📝 Adding variable to $VARIABLES_FILE..."
    
    local variable_block="
variable \"$var_name\" {
  type        = string
  description = \"$description\""
    
    if [[ "$is_sensitive" == "true" ]]; then
        variable_block="${variable_block}
  sensitive   = true"
    fi
    
    if [[ -n "$default_value" ]]; then
        variable_block="${variable_block}
  default     = \"$default_value\""
    fi
    
    variable_block="${variable_block}
}
"
    
    echo "$variable_block" >> "$VARIABLES_FILE"
    print_colored $GREEN "✅ Added variable to $VARIABLES_FILE"
}

# Function to add variable to terraform.tfvars.example
add_to_example_tfvars() {
    local var_name=$1
    local example_value=$2
    
    print_colored $BLUE "📝 Adding variable to $EXAMPLE_FILE..."
    
    echo "${var_name} = \"${example_value}\"" >> "$EXAMPLE_FILE"
    print_colored $GREEN "✅ Added variable to $EXAMPLE_FILE"
}

# Function to add sensitive variable to secrets.tf
add_to_secrets_tf() {
    local var_name=$1
    
    print_colored $BLUE "📝 Adding secret resources to $SECRETS_FILE..."
    
    local secret_block="
resource \"aws_secretsmanager_secret\" \"$var_name\" {
  name = \"\${var.service}-\${var.environment}-$var_name\"
}

resource \"aws_secretsmanager_secret_version\" \"$var_name\" {
  secret_id     = aws_secretsmanager_secret.$var_name.id
  secret_string = var.$var_name
}
"
    
    echo "$secret_block" >> "$SECRETS_FILE"
    print_colored $GREEN "✅ Added secret resources to $SECRETS_FILE"
}

# Function to add GitHub repository variable
add_github_variable_prompt() {
    local var_name=$1
    local github_var_name=$(to_upper_snake_case "$var_name")
    
    echo ""
    print_colored $BLUE "💡 GitHub Variable Setup"
    print_colored $YELLOW "For multi-account deployments, most variables are handled via Terraform."
    print_colored $YELLOW "Only add GitHub variables for:"
    print_colored $YELLOW "  - SERVICE_NAME, ECR_REPOSITORY_NAME, AWS_ACCOUNT_ID, STAFF_EMAIL"
    print_colored $YELLOW "  - Environment-specific role ARNs (DEV_AWS_ROLE_ARN, etc.)"
    echo ""
    
    echo -n "GitHub repository (format: owner/repo): "
    read github_repo
    
    if [[ -z "$github_repo" ]]; then
        print_colored $YELLOW "⚠️  Skipping GitHub variable setup"
        return
    fi
    
    echo -n "Value for GitHub variable $github_var_name: "
    read github_value
    
    if [[ -z "$github_value" ]]; then
        print_colored $YELLOW "⚠️  Skipping GitHub variable setup (no value provided)"
        return
    fi
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        print_colored $YELLOW "❌ GitHub CLI (gh) not found. Run manually:"
        print_colored $BLUE "gh variable set $github_var_name -b \"$github_value\" -R $github_repo"
    else
        if gh variable set "$github_var_name" -b "$github_value" -R "$github_repo"; then
            print_colored $GREEN "✅ GitHub variable $github_var_name set successfully"
        else
            print_colored $RED "❌ Failed to set GitHub variable"
        fi
    fi
}

# Function to add S3 secrets workflow guidance
add_s3_secrets_guidance() {
    local var_name=$1
    local snake_case_name=$(to_snake_case "$var_name")
    
    echo ""
    print_colored $BLUE "💡 S3 Secrets Management"
    print_colored $YELLOW "Secrets are stored in S3 for security and visibility."
    print_colored $YELLOW "This variable '$snake_case_name' will be available in your secrets file."
    print_colored $YELLOW "Use the secrets-sync.sh script to manage secrets:"
    print_colored $BLUE "  .github/scripts/secrets-sync.sh pull development"
    print_colored $BLUE "  .github/scripts/secrets-sync.sh push development"
    echo ""
}

# Function to add environment variable to workers.tf (common variables)
add_to_workers_tf() {
    local var_name=$1
    local env_var_name=$2
    local is_sensitive=$3
    
    print_colored $BLUE "📝 Adding environment variable to $WORKERS_FILE (common variables)..."
    
    # Find the line number where we should insert the new environment variable
    if [[ "$is_sensitive" == "true" ]]; then
        # Add to common_secrets array
        local insert_pattern="  common_secrets = \["
        local new_entry="    {
      name      = \"$env_var_name\"
      valueFrom = aws_secretsmanager_secret_version.$var_name.arn
    },"
    else
        # Add to common_environment array
        local insert_pattern="  common_environment = \["
        local new_entry="    {
      name  = \"$env_var_name\"
      value = var.$var_name
    },"
    fi
    
    # Find the line number with the pattern
    local line_num=$(grep -n "$insert_pattern" "$WORKERS_FILE" | head -1 | cut -d: -f1)
    
    if [[ -z "$line_num" ]]; then
        print_colored $RED "❌ Could not find insertion point in $WORKERS_FILE"
        print_colored $YELLOW "💡 Please add manually to the local common_environment or common_secrets array"
        return 1
    fi
    
    # Insert the new entry after the opening bracket
    sed -i.bak "${line_num}a\\
$new_entry
" "$WORKERS_FILE"
    
    if [[ $? -eq 0 ]]; then
        print_colored $GREEN "✅ Added environment variable to $WORKERS_FILE"
        rm -f "${WORKERS_FILE}.bak"
    else
        print_colored $RED "❌ Failed to update $WORKERS_FILE"
        return 1
    fi
}

# Function to add environment variable to app.tf
add_to_app_tf() {
    local var_name=$1
    local env_var_name=$2
    local is_sensitive=$3
    
    print_colored $BLUE "📝 Adding environment variable to $APP_FILE..."
    
    # Find the line number where we should insert the new environment variable
    if [[ "$is_sensitive" == "true" ]]; then
        # Add to secrets array
        local insert_pattern="secrets = \["
        local new_entry="        {
          name      = \"$env_var_name\",
          valueFrom = aws_secretsmanager_secret_version.$var_name.arn
        },"
    else
        # Add to environment array
        local insert_pattern="environment = \["
        local new_entry="        {
          name  = \"$env_var_name\",
          value = var.$var_name
        },"
    fi
    
    # Find the line with the pattern and add the new entry after it
    local line_num=$(grep -n "$insert_pattern" "$APP_FILE" | head -1 | cut -d: -f1)
    
    if [[ -n "$line_num" ]]; then
        # Insert the new entry after the opening bracket
        sed -i "${line_num}a\\
$new_entry" "$APP_FILE"
        
        print_colored $GREEN "✅ Added environment variable to $APP_FILE"
    else
        print_colored $YELLOW "⚠️  Could not automatically add to $APP_FILE"
        print_colored $YELLOW "Please manually add the following to the appropriate array:"
        print_colored $BLUE "$new_entry"
    fi
}

# Function to add sensitive variable
add_sensitive_variable() {
    local input_var_name=$1
    local description=$2
    local example_value=$3
    
    # Convert to proper formats
    local var_name=$(to_snake_case "$input_var_name")
    local env_var_name=$(to_upper_snake_case "$var_name")
    
    print_colored $GREEN "🔒 Adding sensitive variable: $var_name (from input: $input_var_name)"
    
    add_to_variables_tf "$var_name" "$description" "true" ""
    add_to_example_tfvars "$var_name" "$example_value"
    add_to_secrets_tf "$var_name"
    add_to_app_tf "$var_name" "$env_var_name" "true"
    
    # Ask if variable should be added to workers
    echo ""
    echo -n "Should this variable be available to workers? (y/N): "
    read add_to_workers
    
    if [[ "$add_to_workers" =~ ^[Yy]$ ]]; then
        add_to_workers_tf "$var_name" "$env_var_name" "true"
    fi
    
    print_colored $GREEN "✅ Successfully added sensitive variable: $var_name"
    
    # Show S3 secrets guidance
    add_s3_secrets_guidance "$var_name"
    
    print_colored $YELLOW "📋 Next steps:"
    print_colored $YELLOW "  1. Add the actual value to your terraform.tfvars file"
    print_colored $YELLOW "  2. Add the secret to S3 using: .github/scripts/secrets-sync.sh template development"
    print_colored $YELLOW "  3. Edit the secrets file and add your value for '$var_name'"
    print_colored $YELLOW "  4. Upload secrets: .github/scripts/secrets-sync.sh push development"
    print_colored $YELLOW "  5. For multi-account setups, repeat for staging/production environments"
    print_colored $YELLOW "  6. Run 'terraform plan' to review changes"
    print_colored $YELLOW "  7. Run 'terraform apply' to deploy"
}

# Function to add non-sensitive variable
add_non_sensitive_variable() {
    local input_var_name=$1
    local description=$2
    local example_value=$3
    local default_value=$4
    
    # Convert to proper formats
    local var_name=$(to_snake_case "$input_var_name")
    local env_var_name=$(to_upper_snake_case "$var_name")
    
    print_colored $GREEN "🌐 Adding non-sensitive variable: $var_name (from input: $input_var_name)"
    
    add_to_variables_tf "$var_name" "$description" "false" "$default_value"
    add_to_example_tfvars "$var_name" "$example_value"
    add_to_app_tf "$var_name" "$env_var_name" "false"
    
    # Ask if variable should be added to workers
    echo ""
    echo -n "Should this variable be available to workers? (y/N): "
    read add_to_workers
    
    if [[ "$add_to_workers" =~ ^[Yy]$ ]]; then
        add_to_workers_tf "$var_name" "$env_var_name" "false"
    fi
    
    print_colored $GREEN "✅ Successfully added non-sensitive variable: $var_name"
    
    # Prompt to add GitHub variable
    echo ""
    echo -n "Add this as a GitHub repository variable? (y/N): "
    read add_github_var
    
    if [[ "$add_github_var" =~ ^[Yy]$ ]]; then
        add_github_variable_prompt "$var_name"
    fi
    
    print_colored $YELLOW "📋 Next steps:"
    print_colored $YELLOW "  1. Add the actual value to your terraform.tfvars file (or use default)"
    print_colored $YELLOW "  2. For multi-account setups, also add to environment-specific .tfvars files"
    print_colored $YELLOW "  3. Update app-config.json if this variable affects application behavior"
    print_colored $YELLOW "  4. Run 'terraform plan' to review changes"
    print_colored $YELLOW "  5. Run 'terraform apply' to deploy"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -i, --interactive       Interactive mode (default)"
    echo "  -s, --sensitive         Add sensitive variable (requires other options)"
    echo "  -n, --non-sensitive     Add non-sensitive variable (requires other options)"
    echo "  --name NAME             Variable name (snake_case)"
    echo "  --description DESC      Variable description"
    echo "  --example VALUE         Example value for tfvars.example"
    echo "  --default VALUE         Default value (non-sensitive only)"
    echo ""
    echo "Examples:"
    echo "  $0                                           # Interactive mode"
    echo "  $0 -s --name myApiKey --description 'API key for service' --example 'your-key-here'"
    echo "  $0 -s --name MY_API_KEY --description 'API key for service' --example 'your-key-here'"  
    echo "  $0 -n --name enableFeature --description 'Enable new feature' --example 'true' --default 'false'"
    echo ""
    echo "Multi-Account Setup:"
    echo "  • Configure regions in .github/environments.json"
    echo "  • Create environment-specific .tfvars files (terraform.tfvars.prod, etc.)"
    echo "  • Set GitHub role ARNs: DEV_AWS_ROLE_ARN, STAGING_AWS_ROLE_ARN, PROD_AWS_ROLE_ARN"
    echo "  • Manage secrets with: .github/scripts/secrets-sync.sh [pull|push] [environment]"
}

# Interactive mode
interactive_mode() {
    print_colored $BLUE "🚀 Environment Variable Setup"
    print_colored $BLUE "=============================\n"
    
    print_colored $YELLOW "💡 Multi-Account Deployment Notes:"
    print_colored $YELLOW "• AWS regions are configured in .github/environments.json"
    print_colored $YELLOW "• GitHub variables use direct names (no TF_ prefix)"  
    print_colored $YELLOW "• Environment-specific role ARNs: DEV_AWS_ROLE_ARN, STAGING_AWS_ROLE_ARN, etc."
    print_colored $YELLOW "• Sensitive variables are stored in S3 using secrets-sync.sh script"
    print_colored $YELLOW "• Non-sensitive variables are managed via Terraform .tfvars files"
    echo ""
    
    # Get variable name
    while true; do
        echo -n "Variable name (any case, e.g., myApiKey, my_api_key, MY_API_KEY): "
        read var_name
        
        if validate_variable_name "$var_name"; then
            break
        fi
        echo ""
    done
    
    # Get description
    echo -n "Description: "
    read description
    
    # Get variable type
    echo ""
    print_colored $YELLOW "Is this variable sensitive? (contains passwords, API keys, tokens)"
    echo "1) Yes - Sensitive (stored in S3 and AWS Secrets Manager)"
    echo "2) No - Non-sensitive (passed as environment variable)"
    echo -n "Choose (1 or 2): "
    read choice
    
    case $choice in
        1)
            echo -n "Example value for terraform.tfvars.example: "
            read example_value
            add_sensitive_variable "$var_name" "$description" "$example_value"
            ;;
        2)
            echo -n "Example value for terraform.tfvars.example: "
            read example_value
            echo -n "Default value (leave empty for no default): "
            read default_value
            add_non_sensitive_variable "$var_name" "$description" "$example_value" "$default_value"
            ;;
        *)
            print_colored $RED "❌ Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Main function
main() {
    # Check if we're in the right directory
    if [[ ! -f "variables.tf" ]]; then
        print_colored $RED "❌ Please run this script from the terraform directory"
        exit 1
    fi
    
    # Check required files
    check_files
    
    # Parse command line arguments
    if [[ $# -eq 0 ]]; then
        interactive_mode
        exit 0
    fi
    
    local mode=""
    local var_name=""
    local description=""
    local example_value=""
    local default_value=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -i|--interactive)
                interactive_mode
                exit 0
                ;;
            -s|--sensitive)
                mode="sensitive"
                shift
                ;;
            -n|--non-sensitive)
                mode="non-sensitive"
                shift
                ;;
            --name)
                var_name="$2"
                shift 2
                ;;
            --description)
                description="$2"
                shift 2
                ;;
            --example)
                example_value="$2"
                shift 2
                ;;
            --default)
                default_value="$2"
                shift 2
                ;;
            *)
                print_colored $RED "❌ Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate required arguments for non-interactive mode
    if [[ -z "$mode" || -z "$var_name" || -z "$description" || -z "$example_value" ]]; then
        print_colored $RED "❌ Missing required arguments"
        show_usage
        exit 1
    fi
    
    # Validate variable name
    if ! validate_variable_name "$var_name"; then
        exit 1
    fi
    
    # Add variable based on mode
    case $mode in
        "sensitive")
            add_sensitive_variable "$var_name" "$description" "$example_value"
            ;;
        "non-sensitive")
            add_non_sensitive_variable "$var_name" "$description" "$example_value" "$default_value"
            ;;
        *)
            print_colored $RED "❌ Invalid mode: $mode"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
{% endraw %}