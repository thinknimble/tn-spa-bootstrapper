#!/bin/bash
# Runs `migrate` as a one-off task of the app's task definition and fails unless it exits 0.
# Called by `terraform_data.migrate` before `aws_ecs_service.app` rolls out, so the schema
# has exactly one writer per deploy and web tasks start against a migrated database.
set -euo pipefail

: "${CLUSTER:?}" "${TASK_DEF:?}" "${CONTAINER:?}" "${SUBNETS:?}" "${SECURITY_GROUPS:?}" "${LOG_GROUP:?}" "${AWS_REGION:?}"
export AWS_DEFAULT_REGION="$AWS_REGION"

TASK_ARN=$(aws ecs run-task \
  --cluster "$CLUSTER" \
  --task-definition "$TASK_DEF" \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUPS],assignPublicIp=ENABLED}" \
  --overrides "{\"containerOverrides\":[{\"name\":\"$CONTAINER\",\"command\":[\"python\",\"manage.py\",\"migrate\",\"--noinput\"]}]}" \
  --started-by "terraform-migrate" \
  --query 'tasks[0].taskArn' --output text)
TASK_ID="${TASK_ARN##*/}"
echo "Migrating with $TASK_DEF (task $TASK_ID)"

ELAPSED=0
while :; do
  STATUS=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" \
    --query 'tasks[0].lastStatus' --output text)
  [ "$STATUS" = "STOPPED" ] && break
  if [ "$ELAPSED" -ge 1800 ]; then
    echo "Migration task $TASK_ID still $STATUS after 30 minutes; stopping it." >&2
    aws ecs stop-task --cluster "$CLUSTER" --task "$TASK_ARN" --reason "migrate timed out" >/dev/null
    exit 1
  fi
  sleep 10
  ELAPSED=$((ELAPSED + 10))
done

read -r EXIT_CODE STOP_CODE <<<"$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].[containers[0].exitCode, stopCode]' --output text)"

if [ "$EXIT_CODE" = "0" ]; then
  echo "Migrations applied (${ELAPSED}s)"
  exit 0
fi

REASON=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" \
  --query 'tasks[0].stoppedReason' --output text)
echo "Migration task $TASK_ID failed (exit code $EXIT_CODE, $STOP_CODE: $REASON). Last log lines:" >&2
aws logs get-log-events --log-group-name "$LOG_GROUP" \
  --log-stream-name "ecs/$CONTAINER/$TASK_ID" --limit 50 \
  --query 'events[].message' --output text 2>/dev/null | tr '\t' '\n' >&2 || true
exit 1
