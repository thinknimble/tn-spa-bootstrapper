variable "service" {
  type        = string
  description = "The service name for AWS resources (lowercase, alphanumeric and hyphens only, no underscores)"
  default     = "{{ cookiecutter.sanitized_tf_service_name }}"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.service))
    error_message = "Service name must be lowercase alphanumeric characters and hyphens only (no underscores or uppercase). AWS resource naming constraints require this format."
  }
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

variable "ecr_app_repository_name" {
  type        = string
  description = "The ECR repository name for the app service backend"
  default     = "{{ cookiecutter.sanitized_tf_service_name }}-app"
}


variable "ecr_tag" {
  type        = string
  description = "The ECR tag for the app services"
  default     = "latest"
}


## Django environment variables

variable "environment" {
  type        = string
  description = "Environment name for the app service backend (lowercase, alphanumeric and hyphens only, no underscores)"
  default     = "development"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.environment))
    error_message = "Environment name must be lowercase alphanumeric characters and hyphens only (no underscores or uppercase). AWS resource naming constraints require this format."
  }
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

# Domain and DNS configuration
variable "base_domain" {
  type        = string
  description = "Base domain for generating subdomains (e.g., dev.myapp.com, myapp.com)"
  default     = ""
}

variable "use_custom_domain" {
  type        = bool
  description = "If true, use current_domain as-is. If false, auto-generate subdomain and create Route53 record"
  default     = false
}

variable "route53_zone_id" {
  type        = string
  description = "Route53 zone ID for auto-creating DNS records (only used when use_custom_domain = false)"
  default     = ""
}

variable "certificate_arn" {
  type        = string
  description = "ARN of the SSL certificate to use for HTTPS"
  default     = ""
}

# Deprecated variables (kept for backward compatibility)
variable "default_certificate_arn" {
  type        = string
  description = "DEPRECATED: Use certificate_arn instead. ARN of the default certificate to use"
  default     = ""
}

variable "custom_certificate_arn" {
  type        = string
  description = "DEPRECATED: Use certificate_arn instead. ARN of a custom certificate"
  default     = ""
}

# VPC sharing configuration
variable "use_per_project_shared_vpc" {
  type        = bool
  description = "If true, create per-project shared VPCs (shared-dev-vpc-PROJECT). If false, use account-wide shared VPC (shared-dev-vpc)"
  default     = false
}

