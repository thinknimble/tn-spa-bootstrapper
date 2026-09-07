output "task_definition_arn" {
  description = "ARN of the worker task definition"
  value       = aws_ecs_task_definition.worker.arn
}

output "service_name" {
  description = "Name of the worker ECS service"
  value       = aws_ecs_service.worker.name
}

output "service_arn" {
  description = "ARN of the worker ECS service"
  value       = aws_ecs_service.worker.id
}

output "task_definition_family" {
  description = "Family name of the task definition"
  value       = aws_ecs_task_definition.worker.family
}