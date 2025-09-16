variable "service" {
  type        = string
  description = "The service name for AWS resources"
  default     = "{{ cookiecutter.project_slug }}"
}


variable "aws_profile" {
  type        = string
  description = "The AWS profile to use for deployment"
  default     = "default"
}

variable "aws_region" {
  type        = string
  description = "The AWS region for the ECS service"
  default     = "us-east-1"
}

# ECR

variable "ecr_server_repository_name" {
  type        = string
  description = "The ECR repository name for the server service backend"
  default     = "{{ cookiecutter.project_slug }}-server"
}


variable "ecr_tag" {
  type        = string
  description = "The ECR tag for both server and client services"
  default     = "latest"
}


# Backend Configuration Variables
# These are used for S3 remote state backend setup

variable "terraform_state_bucket" {
  type        = string
  description = "S3 bucket name for storing Terraform state files"
  default     = ""
}

variable "terraform_state_key" {
  type        = string
  description = "S3 key path for the Terraform state file"
  default     = ""
}

variable "terraform_state_region" {
  type        = string
  description = "AWS region for the S3 backend (usually matches aws_region)"
  default     = ""
}

variable "terraform_lock_table" {
  type        = string
  description = "DynamoDB table name for Terraform state locking"
  default     = ""
}



# TLS



## Django environment variables

variable "environment" {
  type        = string
  description = "ENVIRONMENT for the app service backend"
  default     = "development"
}

variable "secret_key" {
  type        = string
  description = "SECRET_KEY for the app service backend"
  sensitive   = true
  default     = "{{ random_ascii_string(50) }}"
}

variable "debug" {
  type        = string
  description = "Enable debug mode for the billflow service backend"
  default     = "True"
}

variable "current_domain" {
  type        = string
  description = "The current domain for the app service backend"
  default     = ""
}

variable "current_port" {
  type        = string
  description = "The current port for the app service backend"
  default     = "8080"
}

variable "allowed_hosts" {
  type        = string
  description = "The allowed hosts for the app service backend"
  default     = "server,localhost,127.0.0.1"
}

variable "db_name" {
  type        = string
  description = "The database name for the app service backend"
  sensitive   = true
  default     = "{{ cookiecutter.project_slug }}_db"
}

variable "db_user" {
  type        = string
  description = "The database user for the app service backend"
  sensitive   = true
  default     = "{{ cookiecutter.project_slug }}_user"
}

variable "db_pass" {
  type        = string
  description = "The database password for the app service backend"
  sensitive   = true
  default     = "{{ random_ascii_string(50) }}"
}

variable "use_aws_storage" {
  type        = string
  description = "Use AWS S3 storage for the app service backend"
  default     = false
}
variable "aws_storage_bucket_name" {
  type        = string
  description = "The AWS S3 bucket name for the app service backend"
  default     = ""
}
variable "aws_location" {
  type        = string
  description = "The AWS S3 location for the app service backend"
  default     = ""
}
variable "aws_s3_region_name" {
  type        = string
  description = "The AWS S3 region name for the app service backend"
  default     = ""
}
variable "aws_access_key_id" {
  type        = string
  description = "The AWS access key ID for the app service backend"
  sensitive   = true
  default     = ""
}
variable "aws_secret_access_key" {
  type        = string
  description = "The AWS secret access key for the app service backend"
  sensitive   = true
  default     = ""
}

variable "enable_emails" {
  type        = string
  description = "Enable email sending for the app service backend"
  default     = false
}

variable "staff_email" {
  type        = string
  description = "The staff email for the app service backend"
  default     = "{{ cookiecutter.author_name }} <{{ cookiecutter.email }}>"
}

variable "django_superuser_password" {
  type        = string
  description = "The password for the Django superuser"
  sensitive   = true
  default     = "{{ random_ascii_string(50) }}"
}

variable "playwright_test_user_pass" {
  type        = string
  description = "The password for the Playwright test user"
  sensitive   = true
  default     = "{{ random_ascii_string(50) }}"
}
variable "playwright_test_base_url" {
  type        = string
  description = "The base URL for Playwright tests"
  default     = "http://localhost:8080"
}

variable "rollbar_access_token" {
  type        = string
  description = "The Rollbar access token for the app service backend"
  sensitive   = true
  default     = "default_value"
}

variable "enable_https" {
  type        = bool
  description = "Enable HTTPS for the load balancer"
  default     = true  # Enable by default for review apps
}

# Base domain for auto-generated subdomains
variable "base_domain" {
  type        = string
  description = "Base domain for generating subdomains (e.g., kanw.3leafcoder.com)"
  default     = "kanw.3leafcoder.com"
}

variable "use_custom_domain" {
  type        = bool
  description = "If true, use current_domain as-is. If false, auto-generate subdomain and create Route53 record"
  default     = false
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 zone ID for auto-creating DNS records (only used when use_custom_domain = false)"
  default     = "Z06118351LUGXMN4X34BT"
}

variable "default_certificate_arn" {
  type        = string
  description = "ARN of the default certificate to use (e.g., wildcard certificate)"
  default     = "arn:aws:acm:us-east-1:458029411633:certificate/ef8fc192-5e26-4470-bd13-0b93fa3b8a0d"
}

variable "custom_certificate_arn" {
  type        = string
  description = "ARN of a custom certificate (optional, overrides default)"
  default     = ""
}

