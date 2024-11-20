# This file is where you'll store any variables used in your configuration
variable "aws_profile" {
  type        = string
  description = "The AWS profile to use for deployment"
  default = "default"
}