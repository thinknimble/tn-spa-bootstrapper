variable "name" {
  type        = string
  description = "Worker name (e.g., 'bg-processor')"
}

variable "service" {
  type        = string
  description = "Service name for resource naming"
}

variable "environment" {
  type        = string
  description = "Environment (dev/staging/prod)"
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

variable "log_group_name" {
  type        = string
  description = "CloudWatch log group name"
}