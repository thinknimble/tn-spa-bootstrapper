resource "aws_secretsmanager_secret" "secret_key" {
  name = "${var.service}-${var.environment}-secret_key"
}

resource "aws_secretsmanager_secret_version" "secret_key" {
  secret_id     = aws_secretsmanager_secret.secret_key.id
  secret_string = var.secret_key
}

resource "aws_secretsmanager_secret" "django_superuser_password" {
  name = "${var.service}-${var.environment}-django_superuser_password"
}

resource "aws_secretsmanager_secret_version" "django_superuser_password" {
  secret_id     = aws_secretsmanager_secret.django_superuser_password.id
  secret_string = var.django_superuser_password
}


resource "aws_secretsmanager_secret" "aws_access_key_id" {
  name = "${var.service}-${var.environment}-aws_access_key_id"
}

resource "aws_secretsmanager_secret_version" "aws_access_key_id" {
  secret_id     = aws_secretsmanager_secret.aws_access_key_id.id
  secret_string = var.aws_access_key_id != "" ? var.aws_access_key_id : "default_value"
}

resource "aws_secretsmanager_secret" "aws_secret" {
  name = "${var.service}-${var.environment}-aws_secret"
}

resource "aws_secretsmanager_secret_version" "aws_secret_access_key" {
  secret_id     = aws_secretsmanager_secret.aws_secret.id
  secret_string = var.aws_secret_access_key != "" ? var.aws_secret_access_key : "default_value"
}

resource "aws_secretsmanager_secret" "db_name" {
  name = "${var.service}-${var.environment}-db_name"
}

resource "aws_secretsmanager_secret_version" "db_name" {
  secret_id     = aws_secretsmanager_secret.db_name.id
  secret_string = var.db_name
}


resource "aws_secretsmanager_secret" "db_user" {
  name = "${var.service}-${var.environment}-db_user"
}

resource "aws_secretsmanager_secret_version" "db_user" {
  secret_id     = aws_secretsmanager_secret.db_user.id
  secret_string = var.db_user
}

resource "aws_secretsmanager_secret" "db_pass" {
  name = "${var.service}-${var.environment}-db_pass"
}

resource "aws_secretsmanager_secret_version" "db_pass" {
  secret_id     = aws_secretsmanager_secret.db_pass.id
  secret_string = var.db_pass
}

resource "aws_secretsmanager_secret" "rollbar_access_token" {
  name = "${var.service}-${var.environment}-rollbar_access_token"

}

resource "aws_secretsmanager_secret_version" "rollbar_access_token" {
  secret_id     = aws_secretsmanager_secret.rollbar_access_token.id
  secret_string = var.rollbar_access_token

}
