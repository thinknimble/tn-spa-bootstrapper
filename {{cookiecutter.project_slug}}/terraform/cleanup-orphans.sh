{% raw %}#!/usr/bin/env bash
# Manual backstop: delete orphaned PR-environment AWS resources directly via CLI,
# for the cases the CI teardown cannot reach — lost/empty Terraform state, or
# resources left behind by a partial destroy. Goes straight to the API.
#
# Two rules learned the hard way (do not regress):
#   1. NEVER touch an environment whose PR is still OPEN. Discovery is by name,
#      which cannot tell a live review app from an orphan — so we subtract the
#      open-PR set explicitly. Without this the script tore down live PRs.
#   2. Discover env numbers from EVERY resource type, not just ECS clusters. A PR
#      whose cluster was already deleted can still leak an ALB, RDS, Redis,
#      security groups or log groups — cluster-only discovery left those behind.
set -uo pipefail

REGION="us-east-1"
# Baked in at generation time from the same cookiecutter var Terraform uses for
# var.service, so resource names line up. Override if you set vars.SERVICE_NAME.
SERVICE="{% endraw %}{{cookiecutter.__sanitized_tf_service_name}}{% raw %}"
# Pin every aws call to the state region — discovery/deletion must not depend on
# the operator's ambient AWS_DEFAULT_REGION, or it silently targets the wrong one.
export AWS_DEFAULT_REGION="$REGION"

# Open PRs must be preserved — their review apps are live. Requires `gh` auth.
OPEN_PRS=$(gh pr list --state open --json number --jq '.[].number' 2>/dev/null | sort -u || true)
if [[ -z "$OPEN_PRS" ]]; then
  echo "⚠️  Could not read open PRs from gh — refusing to run without the exclusion list."
  echo "    Authenticate gh (gh auth status) and retry; deleting blind would tear down live PRs."
  exit 1
fi
echo "Open PRs (never deleted): $(echo "$OPEN_PRS" | tr '\n' ' ')"

# Discover candidate PR env numbers from every resource type, not just clusters.
discover() {
  aws ecs list-clusters --query 'clusterArns[*]' --output text 2>/dev/null | tr '\t' '\n'
  aws elbv2 describe-load-balancers --query 'LoadBalancers[*].LoadBalancerName' --output text 2>/dev/null | tr '\t' '\n'
  aws rds describe-db-instances --query 'DBInstances[*].DBInstanceIdentifier' --output text 2>/dev/null | tr '\t' '\n'
  aws elasticache describe-cache-clusters --query 'CacheClusters[*].CacheClusterId' --output text 2>/dev/null | tr '\t' '\n'
  aws ec2 describe-security-groups --query 'SecurityGroups[*].GroupName' --output text 2>/dev/null | tr '\t' '\n'
  aws logs describe-log-groups --query 'logGroups[*].logGroupName' --output text 2>/dev/null | tr '\t' '\n'
}

PR_NUMBERS=()
while IFS= read -r num; do
  [[ -z "$num" ]] && continue
  # Skip open PRs — name-based discovery cannot distinguish them from orphans.
  echo "$OPEN_PRS" | grep -qx "$num" && continue
  PR_NUMBERS+=("$num")
done < <(discover | grep -oE "${SERVICE}-pr-[0-9]+" | sed "s/.*pr-//" | sort -u -n)

echo "Found ${#PR_NUMBERS[@]} orphaned PR environments (open PRs excluded)"
echo ""
if [[ ${#PR_NUMBERS[@]} -eq 0 ]]; then
  echo "Nothing to clean up."
  exit 0
fi

DELETED=0

for PR in "${PR_NUMBERS[@]}"; do
  ENV="pr-${PR}"
  echo "============================================================"
  echo "Cleaning up: $ENV"
  echo "============================================================"

  # 1. Delete ECS services (must be zero before deleting cluster)
  CLUSTER="cluster-${SERVICE}-${ENV}"
  SERVICES=$(aws ecs list-services --cluster "$CLUSTER" --query 'serviceArns[*]' --output text 2>/dev/null | tr '\t' '\n' | grep -v '^$' || true)
  for SVC in $SERVICES; do
    echo "  Stopping ECS service: $SVC"
    aws ecs update-service --cluster "$CLUSTER" --service "$SVC" --desired-count 0 --no-cli-pager > /dev/null 2>&1 || true
    aws ecs delete-service --cluster "$CLUSTER" --service "$SVC" --force --no-cli-pager > /dev/null 2>&1 || true
  done

  # 2. Delete ECS task definitions (deregister)
  TASK_DEFS=$(aws ecs list-task-definitions --family-prefix "task-app-${SERVICE}-${ENV}" --query 'taskDefinitionArns[*]' --output text 2>/dev/null | tr '\t' '\n' | grep -v '^$' || true)
  for TD in $TASK_DEFS; do
    aws ecs deregister-task-definition --task-definition "$TD" --no-cli-pager > /dev/null 2>&1 || true
  done

  # 3. Delete ALB (listeners first, then target groups, then LB)
  LB_NAME="${SERVICE}-${ENV}"
  LB_ARN=$(aws elbv2 describe-load-balancers --names "$LB_NAME" --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)
  if [[ -n "$LB_ARN" && "$LB_ARN" != "None" ]]; then
    # Delete listeners
    LISTENERS=$(aws elbv2 describe-listeners --load-balancer-arn "$LB_ARN" --query 'Listeners[*].ListenerArn' --output text 2>/dev/null | tr '\t' '\n' | grep -v '^$' || true)
    for L in $LISTENERS; do
      echo "  Deleting listener: $L"
      aws elbv2 delete-listener --listener-arn "$L" --no-cli-pager > /dev/null 2>&1 || true
    done
    echo "  Deleting ALB: $LB_NAME"
    aws elbv2 delete-load-balancer --load-balancer-arn "$LB_ARN" --no-cli-pager > /dev/null 2>&1 || true
  fi

  # Delete target groups
  TGS=$(aws elbv2 describe-target-groups --query "TargetGroups[?contains(TargetGroupName, '${ENV}')].TargetGroupArn" --output text 2>/dev/null | tr '\t' '\n' | grep -v '^$' || true)
  for TG in $TGS; do
    echo "  Deleting target group: $TG"
    aws elbv2 delete-target-group --target-group-arn "$TG" --no-cli-pager > /dev/null 2>&1 || true
  done

  # 4. Delete RDS instance (skip final snapshot)
  DB_ID="db-${SERVICE}-${ENV}"
  DB_EXISTS=$(aws rds describe-db-instances --db-instance-identifier "$DB_ID" --query 'DBInstances[0].DBInstanceIdentifier' --output text 2>/dev/null || true)
  if [[ -n "$DB_EXISTS" && "$DB_EXISTS" != "None" ]]; then
    echo "  Deleting RDS: $DB_ID (this takes ~5 min)"
    aws rds delete-db-instance --db-instance-identifier "$DB_ID" --skip-final-snapshot --delete-automated-backups --no-cli-pager > /dev/null 2>&1 || true
  fi

  # 5. Delete ElastiCache cluster
  REDIS_ID="redis-${SERVICE}-${ENV}"
  REDIS_EXISTS=$(aws elasticache describe-cache-clusters --cache-cluster-id "$REDIS_ID" --query 'CacheClusters[0].CacheClusterId' --output text 2>/dev/null || true)
  if [[ -n "$REDIS_EXISTS" && "$REDIS_EXISTS" != "None" ]]; then
    echo "  Deleting Redis: $REDIS_ID"
    aws elasticache delete-cache-cluster --cache-cluster-id "$REDIS_ID" --no-cli-pager > /dev/null 2>&1 || true
  fi

  # 6. Delete ECS cluster (empty now)
  echo "  Deleting ECS cluster: $CLUSTER"
  aws ecs delete-cluster --cluster "$CLUSTER" --no-cli-pager > /dev/null 2>&1 || true

  DELETED=$((DELETED + 1))
  echo "  ✅ Initiated deletion for $ENV"
done

# Wait for RDS deletions (they're async)
echo ""
echo "============================================================"
echo "Waiting for RDS instances to finish deleting..."
echo "============================================================"
# Count only instances actively deleting — matching all 'pr-' would wait forever
# on open PRs' databases, which are never being torn down here.
ATTEMPTS=0
MAX_ATTEMPTS=120  # 120 * 30s = 60 min max wait
while [[ $ATTEMPTS -lt $MAX_ATTEMPTS ]]; do
  REMAINING=$(aws rds describe-db-instances --query "length(DBInstances[?DBInstanceStatus=='deleting'])" --output text 2>/dev/null || echo "0")
  [[ "$REMAINING" -eq 0 ]] && break
  echo "  ⏳ $REMAINING RDS instances still deleting... ($(( ATTEMPTS * 30 / 60 )) min elapsed)"
  sleep 30
  ATTEMPTS=$((ATTEMPTS + 1))
done

# Now clean up subnet groups + security groups (can't delete while RDS/ALB exist).
echo ""
echo "============================================================"
echo "Cleaning up subnet groups..."
echo "============================================================"
for PR in "${PR_NUMBERS[@]}"; do
  ENV="pr-${PR}"
  aws rds delete-db-subnet-group --db-subnet-group-name "db-sng-${SERVICE}-${ENV}" --no-cli-pager > /dev/null 2>&1 || true
  aws elasticache delete-cache-subnet-group --cache-subnet-group-name "redis-subnet-group-${SERVICE}-${ENV}" --no-cli-pager > /dev/null 2>&1 || true
done

# Security groups: collect every orphan SG up front (name pattern covers all the
# discovered envs), then two phases. Phase 1 strips all rules so inter-SG
# references stop blocking deletion. Phase 2 deletes with a pace of ~0.4s and a
# few passes — EC2's DeleteSecurityGroup is rate-limited, and a tight burst of
# 100+ calls throttles so every one fails while a paced retry succeeds. ENIs from
# a just-deleted RDS/ALB also take a minute to release, so later passes catch
# what the first could not.
echo ""
echo "============================================================"
echo "Cleaning up security groups..."
echo "============================================================"
sg_ids() {
  local list=""
  for PR in "${PR_NUMBERS[@]}"; do
    list="${list} $(aws ec2 describe-security-groups --filters "Name=group-name,Values=*${SERVICE}-pr-${PR}*" --query 'SecurityGroups[*].GroupId' --output text 2>/dev/null | tr '\t' '\n' | grep -v '^$' || true)"
  done
  echo "$list" | tr ' ' '\n' | grep -v '^$' | sort -u
}

# Phase 1 — strip rules.
for SG in $(sg_ids); do
  ING=$(aws ec2 describe-security-groups --group-ids "$SG" --query 'SecurityGroups[0].IpPermissions' --output json 2>/dev/null)
  [[ "$ING" != "[]" && -n "$ING" ]] && aws ec2 revoke-security-group-ingress --group-id "$SG" --ip-permissions "$ING" > /dev/null 2>&1 || true
  EGR=$(aws ec2 describe-security-groups --group-ids "$SG" --query 'SecurityGroups[0].IpPermissionsEgress' --output json 2>/dev/null)
  [[ "$EGR" != "[]" && -n "$EGR" ]] && aws ec2 revoke-security-group-egress --group-id "$SG" --ip-permissions "$EGR" > /dev/null 2>&1 || true
  sleep 0.2
done

# Phase 2 — paced delete, up to 5 passes.
for pass in 1 2 3 4 5; do
  REMAINING_SG=$(sg_ids)
  [[ -z "$REMAINING_SG" ]] && break
  echo "  Pass $pass: $(echo "$REMAINING_SG" | grep -c .) security group(s)"
  for SG in $REMAINING_SG; do
    aws ec2 delete-security-group --group-id "$SG" --no-cli-pager > /dev/null 2>&1 || true
    sleep 0.4
  done
  sleep 3
done

echo ""
echo "============================================================"
echo "DONE — Initiated deletion for $DELETED environments"
echo "============================================================"
{% endraw %}
