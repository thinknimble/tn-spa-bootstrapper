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


# Create a VPC for the ECS service
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "vpc-${var.service}-${var.environment}"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "nginx-gw-${var.service}-${var.environment}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "nginx-route-table-${var.service}-${var.environment}"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Create a public subnet in the VPC
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "nginx-subnet-${var.service}-${var.environment}"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "nginx-subnet-b-${var.service}-${var.environment}"
  }
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
