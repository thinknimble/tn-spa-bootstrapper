variable "name" {
  type        = string
  description = "Worker name (lowercase, alphanumeric and hyphens only, no underscores)"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.name))
    error_message = "Worker name must be lowercase alphanumeric characters and hyphens only (no underscores or uppercase). AWS resource naming constraints require this format."
  }
}

variable "service" {
  type        = string
  description = "Service name for resource naming (lowercase, alphanumeric and hyphens only, no underscores)"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.service))
    error_message = "Service name must be lowercase alphanumeric characters and hyphens only (no underscores or uppercase). AWS resource naming constraints require this format."
  }
}

variable "environment" {
  type        = string
  description = "Environment name (lowercase, alphanumeric and hyphens only, no underscores)"
  
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.environment))
    error_message = "Environment name must be lowercase alphanumeric characters and hyphens only (no underscores or uppercase). AWS resource naming constraints require this format."
  }
}

variable "cluster_id" {
  type        = string
  description = "ECS cluster ID"
}

variable "image_uri" {
  type        = string
  description = "Docker image URI"
}

variable "command" {
  type        = list(string)
  description = "Container command to run"
}

variable "cpu" {
  type        = number
  description = "CPU units (256, 512, 1024, etc.)"
  default     = 256
}

variable "memory" {
  type        = number
  description = "Memory in MB"
  default     = 512
}

variable "desired_count" {
  type        = number
  description = "Number of instances to run"
  default     = 1
}

variable "execution_role_arn" {
  type        = string
  description = "ECS execution role ARN"
}

variable "task_role_arn" {
  type        = string
  description = "ECS task role ARN"
}

variable "subnets" {
  type        = list(string)
  description = "Subnet IDs for the worker"
}

variable "security_groups" {
  type        = list(string)
  description = "Security group IDs"
}

variable "environment_variables" {
  type        = list(object({
    name  = string
    value = string
  }))
  description = "Environment variables"
  default     = []
}

variable "secrets" {
  type        = list(object({
    name      = string
    valueFrom = string
  }))
  description = "Secret environment variables"
  default     = []
}

variable "aws_region" {
  type        = string
  description = "The AWS region for log configuration"
}

variable "log_group_name" {
  type        = string
  description = "CloudWatch log group name"
}

variable "stop_timeout" {
  type        = number
  description = "Seconds ECS waits after SIGTERM before SIGKILL (Fargate maximum is 120)"
  default     = 120
}

variable "deployment_minimum_healthy_percent" {
  type        = number
  description = "Minimum healthy percent during a deploy; 0 stops the old task before the new one starts"
  default     = 0
}

variable "deployment_maximum_percent" {
  type        = number
  description = "Maximum percent of desired_count running during a deploy; 100 never runs old and new together"
  default     = 100
}

variable "enable_failure_alert" {
  type        = bool
  description = "Alert alerts_topic_arn when the worker stops with a non-zero exit or never starts (a bool so count is known at plan time)"
  default     = false
}

variable "alerts_topic_arn" {
  type        = string
  description = "SNS topic that receives the failure alert; required when enable_failure_alert is true"
  default     = ""
}
