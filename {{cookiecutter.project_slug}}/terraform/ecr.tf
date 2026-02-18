# Server ECR Repository
data "aws_ecr_image" "app" {
  repository_name = var.ecr_app_repository_name
  # in order to trigger a new task definition revision this would need to change
  # assuming we have a ci/cd pipleline that updates the image tag we would use the tag here
  # e.g on merge to main we would update the tag to the git commit sha for staging and production
  # for review apps we use the pr number and commit sha
  # therefore this is set using the var ecr_tag manually BUT in ci/cd will use TF_VAR_ecr_tag
  # the other option would be to use terraform taint
  image_tag = var.ecr_tag
}

data "aws_ecr_repository" "app" {
  name = var.ecr_app_repository_name
}


output "ecr_app_repository_url" {
  value = data.aws_ecr_repository.app.repository_url
}

