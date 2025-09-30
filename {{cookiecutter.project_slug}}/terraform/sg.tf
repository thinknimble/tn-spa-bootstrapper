resource "aws_security_group" "ecs_load_balancer" {
  name        = "ecs-lb-sg-${var.service}-${var.environment}"
  description = "Allow inbound traffic to the load balancer"
  vpc_id      = aws_vpc.main.id
  tags = {
    Name = "ecs-lb-sg-${var.service}-${var.environment}"
  }
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer" {
  security_group_id = aws_security_group.ecs_load_balancer.id
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer_tls" {
  security_group_id = aws_security_group.ecs_load_balancer.id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}



resource "aws_vpc_security_group_egress_rule" "load_balancer" {
  security_group_id = aws_security_group.ecs_load_balancer.id
  from_port         = 8000
  to_port           = 8000
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}



resource "aws_vpc_security_group_egress_rule" "load_balancer_https" {
  security_group_id = aws_security_group.ecs_load_balancer.id
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}






resource "aws_security_group" "app" {
  vpc_id      = aws_vpc.main.id
  name        = "ecs-app-${var.service}-${var.environment}"
  description = "Allow inbound traffic to the app"

  tags = {
    Name = "ecs-app-${var.service}-${var.environment}"
  }
}

resource "aws_vpc_security_group_ingress_rule" "app" {
  security_group_id            = aws_security_group.app.id
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs_load_balancer.id
}


# resource "aws_vpc_security_group_egress_rule" "app_to_db" {
#   security_group_id = aws_security_group.app.id
#   from_port         = 5432
#   to_port           = 5432
#   ip_protocol       = "tcp"
#   referenced_security_group_id = aws_security_group.rds.id
# }

resource "aws_security_group_rule" "allow_all_egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.app.id
}

resource "aws_security_group" "rds" {
  name        = "rds-sg-${var.service}"
  description = "Allow inbound traffic to RDS"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "rds-sg-${var.service}-${var.environment}"
  }


}

resource "aws_security_group_rule" "rds" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.app.id
  security_group_id        = aws_security_group.rds.id

}






# Security group for Redis
resource "aws_security_group" "redis" {
  name        = "redis-sg-${var.service}-${var.environment}"
  description = "Allow inbound traffic to Redis"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "redis-sg-${var.service}-${var.environment}"
  }
}

resource "aws_security_group_rule" "redis_from_app" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.app.id
  security_group_id        = aws_security_group.redis.id
}

