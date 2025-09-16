{% raw %}#!/bin/bash

# ECS Logs Streaming Script - Real-time log viewing for ECS services
# Streams CloudWatch logs from your ECS containers
#
# Usage:
#   ./stream-logs.sh [OPTIONS]
#   ./stream-logs.sh -s myapp -e development -t a -f "ERROR" -r 1h
#
# Options:
#   -s, --service       Service name
#   -e, --environment   Environment (development, staging, production)
#   -p, --profile       AWS profile (default: default)
#   -r, --region        AWS region (default: us-east-1)
#   -t, --type          Stream type (a=all servers, w=all workers, *=all, or stream number)
#   -f, --filter        Filter pattern (e.g., "ERROR", "user_id=123")
#   -d, --duration      Time range (5m, 15m, 1h, 4h, or custom like "30m")
#   -h, --help          Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
SERVICE=""
ENVIRONMENT="development"
AWS_PROFILE="default"
AWS_REGION="us-east-1"
STREAM_TYPE=""
FILTER_PATTERN=""
TIME_DURATION=""

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
        -t|--type)
            STREAM_TYPE="$2"
            shift 2
            ;;
        -f|--filter)
            FILTER_PATTERN="$2"
            shift 2
            ;;
        -d|--duration)
            TIME_DURATION="$2"
            shift 2
            ;;
        -h|--help)
            echo "ECS Logs Streaming Script - Real-time log viewer"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -s, --service       Service name"
            echo "  -e, --environment   Environment (development, staging, production)"
            echo "  -p, --profile       AWS profile (default: default)"
            echo "  -r, --region        AWS region (default: us-east-1)"
            echo "  -t, --type          Stream type:"
            echo "                        a = All server streams"
            echo "                        w = All worker streams"
            echo "                        * = All streams"
            echo "                        1-N = Specific stream number"
            echo "  -f, --filter        Filter pattern (e.g., 'ERROR', 'user_id=123')"
            echo "  -d, --duration      Time range (5m, 15m, 1h, 4h, or custom like '30m')"
            echo "  -h, --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 -s myapp -e development -t a"
            echo "  $0 -s myapp -e production -t w -f ERROR -d 1h"
            echo "  $0 -s myapp -e staging -t '*' -d 30m"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📋 ECS Logs Streaming - Real-time log viewer${NC}"
echo "============================================="

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

LOG_GROUP="/ecs/${SERVICE}/${ENVIRONMENT}"

echo ""
echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Service: $SERVICE"
echo "  Environment: $ENVIRONMENT"
echo "  Log Group: $LOG_GROUP"
echo "  AWS Profile: $AWS_PROFILE"
echo "  AWS Region: $AWS_REGION"

# Check if log group exists
echo ""
echo -e "${BLUE}🔍 Checking log group...${NC}"
echo -e "${YELLOW}Debug: Looking for log group: $LOG_GROUP${NC}"

# First, list all log groups to see what's available
echo -e "${YELLOW}Debug: Available log groups:${NC}"
aws logs describe-log-groups $PROFILE_FLAG $REGION_FLAG --query 'logGroups[*].logGroupName' --output text | head -10

if ! aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" $PROFILE_FLAG $REGION_FLAG --query 'logGroups[?logGroupName==`'$LOG_GROUP'`]' --output text | grep -q "$LOG_GROUP"; then
    echo -e "${RED}❌ Log group '$LOG_GROUP' not found${NC}"
    echo -e "${YELLOW}💡 Make sure your service is deployed and running${NC}"
    echo -e "${YELLOW}💡 Try running: aws logs describe-log-groups $PROFILE_FLAG $REGION_FLAG --query 'logGroups[*].logGroupName' --output table${NC}"
    exit 1
fi

# Get available log streams
echo ""
echo -e "${BLUE}🔍 Finding log streams...${NC}"
STREAMS=$(aws logs describe-log-streams \
    --log-group-name "$LOG_GROUP" \
    --order-by LastEventTime \
    --descending \
    --max-items 20 \
    $PROFILE_FLAG $REGION_FLAG \
    --query 'logStreams[*].logStreamName' \
    --output text)

if [[ -z "$STREAMS" ]]; then
    echo -e "${RED}❌ No log streams found in '$LOG_GROUP'${NC}"
    echo -e "${YELLOW}💡 Make sure your containers are running and generating logs${NC}"
    exit 1
fi

# Parse and categorize streams
echo ""
echo -e "${BLUE}📋 Available log streams:${NC}"

SERVER_STREAMS=()
WORKER_STREAMS=()
OTHER_STREAMS=()

i=1
for stream in $STREAMS; do
    if [[ "$stream" =~ server- ]]; then
        SERVER_STREAMS+=("$stream")
        echo -e "  ${GREEN}$i) [SERVER] $stream${NC}"
    elif [[ "$stream" =~ worker- ]]; then
        WORKER_STREAMS+=("$stream")
        worker_type=$(echo "$stream" | sed 's/.*worker-\([^/]*\).*/\1/')
        echo -e "  ${PURPLE}$i) [WORKER-$worker_type] $stream${NC}"
    else
        OTHER_STREAMS+=("$stream")
        echo -e "  ${CYAN}$i) [OTHER] $stream${NC}"
    fi
    ((i++))
done

ALL_STREAMS=("${SERVER_STREAMS[@]}" "${WORKER_STREAMS[@]}" "${OTHER_STREAMS[@]}")

# Add options for multiple streams
echo ""
echo -e "${YELLOW}📋 Streaming options:${NC}"
echo -e "  ${BLUE}a) All server streams${NC}"
echo -e "  ${PURPLE}w) All worker streams${NC}"
echo -e "  ${CYAN}*) All streams${NC}"
echo -e "  ${GREEN}1-${#ALL_STREAMS[@]}) Specific stream${NC}"

# Get user choice
if [[ -z "$STREAM_TYPE" ]]; then
    echo ""
    read -p "Select option (a): " STREAM_TYPE
    STREAM_TYPE=${STREAM_TYPE:-"a"}
fi

SELECTED_STREAMS=()
case $STREAM_TYPE in
    "a"|"A")
        SELECTED_STREAMS=("${SERVER_STREAMS[@]}")
        echo -e "${GREEN}✅ Streaming all server logs${NC}"
        ;;
    "w"|"W")
        SELECTED_STREAMS=("${WORKER_STREAMS[@]}")
        echo -e "${GREEN}✅ Streaming all worker logs${NC}"
        ;;
    "*")
        SELECTED_STREAMS=("${ALL_STREAMS[@]}")
        echo -e "${GREEN}✅ Streaming all logs${NC}"
        ;;
    *)
        if [[ "$STREAM_TYPE" =~ ^[0-9]+$ ]] && [[ "$STREAM_TYPE" -ge 1 ]] && [[ "$STREAM_TYPE" -le ${#ALL_STREAMS[@]} ]]; then
            SELECTED_STREAMS=("${ALL_STREAMS[$((STREAM_TYPE-1))]}")
            echo -e "${GREEN}✅ Streaming: ${ALL_STREAMS[$((STREAM_TYPE-1))]}${NC}"
        else
            echo -e "${RED}❌ Invalid selection${NC}"
            exit 1
        fi
        ;;
esac

if [[ ${#SELECTED_STREAMS[@]} -eq 0 ]]; then
    echo -e "${RED}❌ No streams selected${NC}"
    exit 1
fi

# Get time range
if [[ -z "$TIME_DURATION" ]]; then
    echo ""
    echo -e "${BLUE}⏰ Time range options:${NC}"
    echo "  1) Last 5 minutes"
    echo "  2) Last 15 minutes" 
    echo "  3) Last 1 hour"
    echo "  4) Last 4 hours"
    echo "  5) Custom (enter duration like '30m', '2h')"

    read -p "Select time range (1): " TIME_CHOICE
    TIME_CHOICE=${TIME_CHOICE:-1}

    case $TIME_CHOICE in
        1)
            START_TIME="5m"
            ;;
        2)
            START_TIME="15m"
            ;;
        3)
            START_TIME="1h"
            ;;
        4)
            START_TIME="4h"
            ;;
        5)
            read -p "Enter duration (e.g., '30m', '2h'): " START_TIME
            if [[ ! "$START_TIME" =~ ^[0-9]+[mh]$ ]]; then
                echo -e "${RED}❌ Invalid duration format. Use '30m' or '2h'${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid time range selection${NC}"
            exit 1
            ;;
    esac
else
    START_TIME="$TIME_DURATION"
    if [[ ! "$START_TIME" =~ ^[0-9]+[mh]$ ]]; then
        echo -e "${RED}❌ Invalid duration format. Use '30m' or '2h'${NC}"
        exit 1
    fi
fi

# Optional: Filter patterns
if [[ -z "$FILTER_PATTERN" ]]; then
    echo ""
    read -p "Enter filter pattern (optional, e.g., 'ERROR', 'user_id=123'): " FILTER_PATTERN
fi

# Build filter command
FILTER_CMD="aws logs filter-log-events --log-group-name \"$LOG_GROUP\" --start-time \$(date -d \"$START_TIME ago\" +%s)000 $PROFILE_FLAG $REGION_FLAG"

if [[ -n "$FILTER_PATTERN" ]]; then
    FILTER_CMD="$FILTER_CMD --filter-pattern \"$FILTER_PATTERN\""
fi

# Add log streams
if [[ ${#SELECTED_STREAMS[@]} -lt ${#ALL_STREAMS[@]} ]]; then
    STREAM_NAMES=$(IFS=','; echo "${SELECTED_STREAMS[*]}")
    FILTER_CMD="$FILTER_CMD --log-stream-names $STREAM_NAMES"
fi

# Start streaming
echo ""
echo -e "${GREEN}🚀 Starting log stream...${NC}"
echo -e "${YELLOW}📝 Log Group: $LOG_GROUP${NC}"
echo -e "${YELLOW}📝 Streams: ${#SELECTED_STREAMS[@]} selected${NC}"
echo -e "${YELLOW}📝 Time Range: Last $START_TIME${NC}"
if [[ -n "$FILTER_PATTERN" ]]; then
    echo -e "${YELLOW}📝 Filter: $FILTER_PATTERN${NC}"
fi
echo ""
echo -e "${BLUE}Press Ctrl+C to stop streaming${NC}"
echo "===================="

# Function to format log output
format_log_line() {
    local line="$1"
    local timestamp=$(echo "$line" | jq -r '.timestamp // empty' 2>/dev/null)
    local message=$(echo "$line" | jq -r '.message // empty' 2>/dev/null)
    local stream=$(echo "$line" | jq -r '.logStreamName // empty' 2>/dev/null)
    
    if [[ -n "$timestamp" && -n "$message" ]]; then
        # Convert timestamp to readable format
        local formatted_time=$(date -d "@$((timestamp/1000))" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "$timestamp")
        
        # Color code by stream type
        local stream_color=""
        if [[ "$stream" =~ ecs/server- ]]; then
            stream_color="${GREEN}"
        elif [[ "$stream" =~ worker- ]]; then
            stream_color="${PURPLE}"
        else
            stream_color="${CYAN}"
        fi
        
        # Extract stream identifier (last part after /)
        local stream_short=$(basename "$stream")
        
        echo -e "${BLUE}[$formatted_time]${NC} ${stream_color}[$stream_short]${NC} $message"
    else
        echo "$line"
    fi
}

# Stream logs with continuous updates
LAST_SEEN=""
while true; do
    # Get logs with pagination token if available
    CMD="$FILTER_CMD --output json"
    if [[ -n "$LAST_SEEN" ]]; then
        CMD="$CMD --next-token $LAST_SEEN"
    fi
    
    # Execute and parse response
    RESPONSE=$(eval "$CMD" 2>/dev/null || echo '{"events":[],"nextToken":null}')
    
    # Extract events and next token
    EVENTS=$(echo "$RESPONSE" | jq -r '.events[]? // empty' 2>/dev/null)
    NEXT_TOKEN=$(echo "$RESPONSE" | jq -r '.nextToken // empty' 2>/dev/null)
    
    # Display new events
    if [[ -n "$EVENTS" ]]; then
        while IFS= read -r event; do
            if [[ -n "$event" ]]; then
                format_log_line "$event"
            fi
        done <<< "$EVENTS"
    fi
    
    # Update pagination token
    if [[ -n "$NEXT_TOKEN" && "$NEXT_TOKEN" != "null" ]]; then
        LAST_SEEN="$NEXT_TOKEN"
    fi
    
    # Wait before next poll
    sleep 2
done
{% endraw %}