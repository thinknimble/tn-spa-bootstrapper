terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  # Only use profile for local development, not in CI/CD
  profile = var.aws_profile != "" ? var.aws_profile : null
}

# Create an ECS cluster
resource "aws_ecs_cluster" "main" {
  name = "cluster-${var.service}-${var.environment}"
}


# External data source to check if shared VPC exists (doesn't fail if not found)
data "external" "check_shared_vpc" {
  count = local.is_shared_vpc_env ? 1 : 0
  
  program = ["bash", "-c", <<-EOF
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=${local.shared_vpc_name}" "Name=state,Values=available" --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "None")
    if [ "$VPC_ID" = "None" ] || [ "$VPC_ID" = "null" ]; then
      echo '{"exists": "false", "vpc_id": ""}'
    else
      echo "{\"exists\": \"true\", \"vpc_id\": \"$VPC_ID\"}"
    fi
EOF
  ]
}

# Data source to find existing shared VPC (only if it exists)
data "aws_vpc" "shared" {
  count = local.is_shared_vpc_env && try(data.external.check_shared_vpc[0].result.exists, "false") == "true" ? 1 : 0
  
  filter {
    name   = "tag:Name"
    values = [local.shared_vpc_name]
  }
  
  filter {
    name   = "state"
    values = ["available"]
  }
}

# Create shared VPC for development environments (only if it doesn't exist)
resource "aws_vpc" "shared" {
  count      = local.is_shared_vpc_env && try(data.external.check_shared_vpc[0].result.exists, "false") == "false" ? 1 : 0
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = local.shared_vpc_name
    Environment = "shared-development"
    Purpose = "Shared VPC for development and PR environments"
  }
}

# Create dedicated VPC for production/staging environments  
resource "aws_vpc" "main" {
  count      = local.is_shared_vpc_env ? 0 : 1
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "vpc-${var.service}-${var.environment}"
  }
}

# Local to get the correct VPC ID
locals {
  vpc_id = local.is_shared_vpc_env ? (
    length(try(data.aws_vpc.shared, [])) > 0 ? data.aws_vpc.shared[0].id : aws_vpc.shared[0].id
  ) : aws_vpc.main[0].id
}

# Data source to find existing shared Internet Gateway (only if VPC exists)
data "aws_internet_gateway" "shared" {
  count = local.is_shared_vpc_env && try(data.external.check_shared_vpc[0].result.exists, "false") == "true" ? 1 : 0
  
  filter {
    name   = "tag:Name"
    values = ["shared-dev-igw"]
  }
  
  filter {
    name   = "attachment.vpc-id"
    values = [local.vpc_id]
  }
}

# Create shared Internet Gateway (only if it doesn't exist)
resource "aws_internet_gateway" "shared" {
  count  = local.is_shared_vpc_env && try(data.external.check_shared_vpc[0].result.exists, "false") == "false" ? 1 : 0
  vpc_id = local.vpc_id

  tags = {
    Name = "shared-dev-igw"
    Environment = "shared-development"
  }
}

# Create dedicated Internet Gateway for production/staging
resource "aws_internet_gateway" "main" {
  count  = local.is_shared_vpc_env ? 0 : 1
  vpc_id = local.vpc_id

  tags = {
    Name = "igw-${var.service}-${var.environment}"
  }
}

# Local to get the correct Internet Gateway ID
locals {
  igw_id = local.is_shared_vpc_env ? (
    length(try(data.aws_internet_gateway.shared, [])) > 0 ? data.aws_internet_gateway.shared[0].id : aws_internet_gateway.shared[0].id
  ) : aws_internet_gateway.main[0].id
}

# Data source to find existing shared route table (only if VPC exists)
data "aws_route_table" "shared" {
  count = local.is_shared_vpc_env && try(data.external.check_shared_vpc[0].result.exists, "false") == "true" ? 1 : 0
  
  filter {
    name   = "tag:Name"
    values = ["shared-dev-rt"]
  }
  
  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }
}

# Create shared route table (only if it doesn't exist)
resource "aws_route_table" "shared" {
  count  = local.is_shared_vpc_env && try(data.external.check_shared_vpc[0].result.exists, "false") == "false" ? 1 : 0
  vpc_id = local.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = local.igw_id
  }

  tags = {
    Name = "shared-dev-rt"
    Environment = "shared-development"
  }
}

# Create dedicated route table for production/staging
resource "aws_route_table" "main" {
  count  = local.is_shared_vpc_env ? 0 : 1
  vpc_id = local.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = local.igw_id
  }

  tags = {
    Name = "rt-${var.service}-${var.environment}"
  }
}

# Local to get the correct Route Table ID
locals {
  route_table_id = local.is_shared_vpc_env ? (
    length(try(data.aws_route_table.shared, [])) > 0 ? data.aws_route_table.shared[0].id : aws_route_table.shared[0].id
  ) : aws_route_table.main[0].id
}

# Create environment-specific public subnets
resource "aws_subnet" "public" {
  vpc_id                  = local.vpc_id
  cidr_block              = local.subnet_a_cidr
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet-${var.service}-${var.environment}-a"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_b" {
  vpc_id            = local.vpc_id
  cidr_block        = local.subnet_b_cidr
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "subnet-${var.service}-${var.environment}-b"
    Environment = var.environment
  }
}

# Route table associations for the subnets
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = local.route_table_id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = local.route_table_id
}




# Create a subnet group for the RDS instance
resource "aws_db_subnet_group" "database" {
  name       = "db-sng-${var.service}-${var.environment}"
  subnet_ids = [aws_subnet.public.id, aws_subnet.public_b.id]

  tags = {
    Name = "db-sng-${var.service}-${var.environment}"
  }
}

# Create an RDS Postgres instance for the ECS service
resource "aws_db_instance" "postgres" {
  identifier             = local.db_identifier
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t3.micro"
  db_name                = var.db_name
  username               = var.db_user
  password               = var.db_pass
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.database.name
  storage_encrypted      = true

  # tags = {
  #   Name = "db-${var.service}-${var.environment}}"
  # }
}


data "aws_iam_policy_document" "ecs_tasks_execution_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ecs_tasks_execution_role" {
  name               = "ecs-exec-role-${var.service}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_execution_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_tasks_execution_role" {
  role       = aws_iam_role.ecs_tasks_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Create a load balancer for the ECS service



resource "aws_lb" "ecs" {
  name               = local.alb_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecs_load_balancer.id]
  subnets            = [aws_subnet.public.id, aws_subnet.public_b.id]

  enable_deletion_protection = false

  tags = {
    Name = "ecs-lb-${var.service}-${var.environment}"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.ecs.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}



resource "aws_lb_listener" "https" {
  count             = var.enable_https ? 1 : 0
  load_balancer_arn = aws_lb.ecs.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = local.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
  lifecycle {
    prevent_destroy = false
  }
}


# Redis ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "redis-subnet-group-${var.service}-${var.environment}"
  subnet_ids = [aws_subnet.public.id, aws_subnet.public_b.id]

  tags = {
    Name = "redis-subnet-group-${var.service}-${var.environment}"
  }
}

# Redis ElastiCache Cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = local.redis_cluster_id
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name = "redis-${var.service}-${var.environment}"
  }
}
