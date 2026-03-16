# Remote State Backend Configuration
# This configuration stores Terraform state in S3 with DynamoDB locking
# This allows teams to collaborate and prevents concurrent modifications

terraform {
  backend "s3" {
    # These values will be set during terraform init
    # or can be configured in a backend config file
    
    # Example configuration (uncomment and customize):
    # bucket         = "your-company-terraform-state"
    # key            = "myapp/development/terraform.tfstate" 
    # region         = "us-east-1"
    # dynamodb_table = "terraform-state-lock"
    # encrypt        = true
    
    # Note: The actual values should be provided via:
    # 1. Backend config file: terraform init -backend-config=backend.hcl
    # 2. Command line: terraform init -backend-config="bucket=my-bucket"
    # 3. Environment variables: TF_CLI_ARGS_init="-backend-config=bucket=my-bucket"
  }
}

# Alternative: Use variables for backend configuration (partial configuration)
# When using this approach, you'll need to provide the actual values during init
# terraform {
#   backend "s3" {
#     # Partial configuration - actual values provided during init
#     encrypt = true
#   }
# }