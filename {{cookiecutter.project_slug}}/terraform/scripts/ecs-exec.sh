{% raw %}#!/bin/bash

# ECS Exec Script - Connect to running ECS tasks
# Works with Fargate tasks that have enable_execute_command = true
#
# Usage:
#   ./ecs-exec.sh [OPTIONS]
#   ./ecs-exec.sh -s myapp -e development -p default -r us-east-1 -c "/bin/bash"
#
# Options:
#   -s, --service       Service name
#   -e, --environment   Environment (development, staging, production)
#   -p, --profile       AWS profile (default: default)
#   -r, --region        AWS region (default: us-east-1)
#   -c, --command       Command to run (1=bash, 2=sh, 3=django shell, 4=dbshell, or custom)
#   -h, --help          Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SERVICE=""
ENVIRONMENT="development"
AWS_PROFILE="default"
AWS_REGION="us-east-1"
COMMAND_CHOICE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--profile)
            AWS_PROFILE="$2"
            shift 2
            ;;
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        -c|--command)
            COMMAND_CHOICE="$2"
            shift 2
            ;;
        -h|--help)
            echo "ECS Exec Script - Connect to running ECS tasks"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -s, --service       Service name"
            echo "  -e, --environment   Environment (development, staging, production)"
            echo "  -p, --profile       AWS profile (default: default)"
            echo "  -r, --region        AWS region (default: us-east-1)"
            echo "  -c, --command       Command to run:"
            echo "                        1 or 'bash' = /bin/bash"
            echo "                        2 or 'sh' = /bin/sh"
            echo "                        3 or 'django' = python manage.py shell"
            echo "                        4 or 'db' = python manage.py dbshell"
            echo "                        or any custom command"
            echo "  -h, --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 -s myapp -e development"
            echo "  $0 -s myapp -e production -c bash"
            echo "  $0 -s myapp -e staging -c 'python manage.py shell'"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🔧 ECS Exec - Connect to running tasks${NC}"
echo "======================================="

# Get inputs (interactive mode if not provided via CLI)
if [[ -z "$SERVICE" ]]; then
    read -p "Enter service name: " SERVICE
    if [[ -z "$SERVICE" ]]; then
        echo -e "${RED}❌ Service name is required${NC}"
        exit 1
    fi
fi

if [[ -z "$ENVIRONMENT" ]]; then
    read -p "Enter environment (development): " ENVIRONMENT
    ENVIRONMENT=${ENVIRONMENT:-"development"}
fi

if [[ -z "$AWS_PROFILE" ]]; then
    read -p "Enter AWS profile (default): " AWS_PROFILE
    AWS_PROFILE=${AWS_PROFILE:-"default"}
fi

if [[ -z "$AWS_REGION" ]]; then
    read -p "Enter AWS region (us-east-1): " AWS_REGION
    AWS_REGION=${AWS_REGION:-"us-east-1"}
fi

# Set profile and region flags
PROFILE_FLAG=""
if [[ "$AWS_PROFILE" != "default" ]]; then
    PROFILE_FLAG="--profile $AWS_PROFILE"
fi
REGION_FLAG="--region $AWS_REGION"

CLUSTER_NAME="cluster-${SERVICE}-${ENVIRONMENT}"

echo ""
echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Service: $SERVICE"
echo "  Environment: $ENVIRONMENT"
echo "  Cluster: $CLUSTER_NAME"
echo "  AWS Profile: $AWS_PROFILE"
echo "  AWS Region: $AWS_REGION"

# Check if cluster exists
echo ""
echo -e "${BLUE}🔍 Checking cluster...${NC}"
if ! aws ecs describe-clusters --clusters "$CLUSTER_NAME" $PROFILE_FLAG $REGION_FLAG &>/dev/null; then
    echo -e "${RED}❌ Cluster '$CLUSTER_NAME' not found${NC}"
    exit 1
fi

# List available services
echo ""
echo -e "${BLUE}📋 Available services:${NC}"
SERVICES=$(aws ecs list-services --cluster "$CLUSTER_NAME" $PROFILE_FLAG $REGION_FLAG --query 'serviceArns[*]' --output text)

if [[ -z "$SERVICES" ]]; then
    echo -e "${RED}❌ No services found in cluster '$CLUSTER_NAME'${NC}"
    exit 1
fi

# Extract service names and display them
SERVICE_NAMES=()
i=1
for service_arn in $SERVICES; do
    service_name=$(basename "$service_arn")
    SERVICE_NAMES+=("$service_name")
    echo "  $i) $service_name"
    ((i++))
done

# Let user choose service
echo ""
read -p "Select service number (1): " SERVICE_CHOICE
SERVICE_CHOICE=${SERVICE_CHOICE:-1}

if [[ "$SERVICE_CHOICE" -lt 1 || "$SERVICE_CHOICE" -gt ${#SERVICE_NAMES[@]} ]]; then
    echo -e "${RED}❌ Invalid service selection${NC}"
    exit 1
fi

SELECTED_SERVICE=${SERVICE_NAMES[$((SERVICE_CHOICE-1))]}
echo -e "${GREEN}✅ Selected: $SELECTED_SERVICE${NC}"

# Get running tasks for the selected service
echo ""
echo -e "${BLUE}🔍 Finding running tasks...${NC}"
TASKS=$(aws ecs list-tasks --cluster "$CLUSTER_NAME" --service-name "$SELECTED_SERVICE" $PROFILE_FLAG $REGION_FLAG --desired-status RUNNING --query 'taskArns[*]' --output text)

if [[ -z "$TASKS" ]]; then
    echo -e "${RED}❌ No running tasks found for service '$SELECTED_SERVICE'${NC}"
    exit 1
fi

# If multiple tasks, let user choose
TASK_ARNS=($TASKS)
if [[ ${#TASK_ARNS[@]} -gt 1 ]]; then
    echo ""
    echo -e "${BLUE}📋 Multiple tasks found:${NC}"
    for i in "${!TASK_ARNS[@]}"; do
        task_id=$(basename "${TASK_ARNS[$i]}")
        echo "  $((i+1))) $task_id"
    done
    
    read -p "Select task number (1): " TASK_CHOICE
    TASK_CHOICE=${TASK_CHOICE:-1}
    
    if [[ "$TASK_CHOICE" -lt 1 || "$TASK_CHOICE" -gt ${#TASK_ARNS[@]} ]]; then
        echo -e "${RED}❌ Invalid task selection${NC}"
        exit 1
    fi
    
    SELECTED_TASK=${TASK_ARNS[$((TASK_CHOICE-1))]}
else
    SELECTED_TASK=${TASK_ARNS[0]}
fi

TASK_ID=$(basename "$SELECTED_TASK")
echo -e "${GREEN}✅ Selected task: $TASK_ID${NC}"

# Get container name from task definition
echo ""
echo -e "${BLUE}🔍 Getting container information...${NC}"
TASK_DEF=$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$SELECTED_TASK" $PROFILE_FLAG $REGION_FLAG --query 'tasks[0].taskDefinitionArn' --output text)
CONTAINER_NAME=$(aws ecs describe-task-definition --task-definition "$TASK_DEF" $PROFILE_FLAG $REGION_FLAG --query 'taskDefinition.containerDefinitions[0].name' --output text)

echo -e "${GREEN}✅ Container: $CONTAINER_NAME${NC}"

# Check if task has exec enabled
echo ""
echo -e "${BLUE}🔍 Checking ECS Exec capability...${NC}"
EXEC_ENABLED=$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$SELECTED_TASK" $PROFILE_FLAG $REGION_FLAG --query 'tasks[0].enableExecuteCommand' --output text)

if [[ "$EXEC_ENABLED" != "True" ]]; then
    echo -e "${YELLOW}⚠️  ECS Exec may not be enabled for this task${NC}"
    echo "   If connection fails, ensure enable_execute_command = true in Terraform"
fi

# Choose command to run
if [[ -z "$COMMAND_CHOICE" ]]; then
    echo ""
    echo -e "${BLUE}🚀 Choose command to run:${NC}"
    echo "  1) /bin/bash (interactive shell)"
    echo "  2) /bin/sh (fallback shell)"
    echo "  3) python manage.py shell (Django shell)"
    echo "  4) python manage.py dbshell (Database shell)"
    echo "  5) Custom command"

    read -p "Select option (1): " COMMAND_CHOICE
    COMMAND_CHOICE=${COMMAND_CHOICE:-1}
fi

# Parse command choice
case $COMMAND_CHOICE in
    1|"bash")
        COMMAND="/bin/bash"
        ;;
    2|"sh")
        COMMAND="/bin/sh"
        ;;
    3|"django"|"shell")
        COMMAND="python manage.py shell"
        ;;
    4|"db"|"dbshell")
        COMMAND="python manage.py dbshell"
        ;;
    5|"custom")
        if [[ -z "$COMMAND" ]]; then
            read -p "Enter custom command: " COMMAND
        fi
        if [[ -z "$COMMAND" ]]; then
            echo -e "${RED}❌ Command cannot be empty${NC}"
            exit 1
        fi
        ;;
    *)
        # Treat as custom command if not a number
        if [[ "$COMMAND_CHOICE" =~ ^[0-9]+$ ]]; then
            echo -e "${RED}❌ Invalid command selection${NC}"
            exit 1
        else
            COMMAND="$COMMAND_CHOICE"
        fi
        ;;
esac

# Connect to the task
echo ""
echo -e "${GREEN}🔗 Connecting to task...${NC}"
echo -e "${YELLOW}📝 Command: $COMMAND${NC}"
echo -e "${YELLOW}📝 Task: $TASK_ID${NC}"
echo -e "${YELLOW}📝 Container: $CONTAINER_NAME${NC}"
echo ""
echo -e "${BLUE}Type 'exit' to disconnect${NC}"
echo "===================="

# Execute the command
aws ecs execute-command \
    --cluster "$CLUSTER_NAME" \
    --task "$TASK_ID" \
    --container "$CONTAINER_NAME" \
    --interactive \
    --command "$COMMAND" \
    $PROFILE_FLAG $REGION_FLAG
{% endraw %}