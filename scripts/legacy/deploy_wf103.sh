#!/bin/bash
set -e

# WF103 v2.0 Deployment Script
# Deploys GitHub Auto-Export workflow to n8n cloud instance

echo "========================================="
echo "WF103 v2.0 Deployment Script"
echo "========================================="
echo ""

# Check required environment variables
if [ -z "$N8N_API_KEY" ]; then
    echo "ERROR: N8N_API_KEY environment variable not set"
    echo "Please set it with: export N8N_API_KEY='your-api-key'"
    exit 1
fi

if [ -z "$N8N_BASE_URL" ]; then
    N8N_BASE_URL="https://valiansystems.app.n8n.cloud"
    echo "Using default N8N_BASE_URL: $N8N_BASE_URL"
fi

if [ -z "$WORKFLOW_ID" ]; then
    WORKFLOW_ID="4gpdeqt57NKyJY01"
    echo "Using default WORKFLOW_ID: $WORKFLOW_ID"
fi

# Set workflow file path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_FILE="$SCRIPT_DIR/WF103_v2_definition.json"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "ERROR: Workflow definition file not found: $WORKFLOW_FILE"
    exit 1
fi

echo ""
echo "Configuration:"
echo "  N8N URL: $N8N_BASE_URL"
echo "  Workflow ID: $WORKFLOW_ID"
echo "  Workflow File: $WORKFLOW_FILE"
echo ""

# Function to check n8n API connectivity
check_n8n_api() {
    echo "Checking n8n API connectivity..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "accept: application/json" \
        "$N8N_BASE_URL/api/v1/workflows")

    if [ "$response" != "200" ]; then
        echo "ERROR: Cannot connect to n8n API (HTTP $response)"
        echo "Please check your N8N_API_KEY and N8N_BASE_URL"
        exit 1
    fi
    echo "✓ n8n API connection successful"
}

# Function to backup existing workflow
backup_workflow() {
    echo ""
    echo "Backing up existing workflow..."

    # Get existing workflow
    existing=$(curl -s \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "accept: application/json" \
        "$N8N_BASE_URL/api/v1/workflows/$WORKFLOW_ID")

    if [ -z "$existing" ] || [ "$existing" = "null" ]; then
        echo "WARNING: Existing workflow not found, skipping backup"
        return
    fi

    # Save backup
    backup_file="$SCRIPT_DIR/WF103_backup_$(date +%Y%m%d_%H%M%S).json"
    echo "$existing" | jq '.' > "$backup_file"
    echo "✓ Backup saved to: $backup_file"
}

# Function to update workflow
update_workflow() {
    echo ""
    echo "Updating workflow $WORKFLOW_ID..."

    # Read workflow definition
    workflow_json=$(cat "$WORKFLOW_FILE")

    # Update workflow via API
    response=$(curl -s -w "\n%{http_code}" \
        -X PUT \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -H "accept: application/json" \
        -d "$workflow_json" \
        "$N8N_BASE_URL/api/v1/workflows/$WORKFLOW_ID")

    # Split response and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" != "200" ]; then
        echo "ERROR: Failed to update workflow (HTTP $http_code)"
        echo "Response: $body"
        exit 1
    fi

    echo "✓ Workflow updated successfully"

    # Parse and display workflow info
    workflow_name=$(echo "$body" | jq -r '.name')
    workflow_nodes=$(echo "$body" | jq '.nodes | length')
    echo "  Name: $workflow_name"
    echo "  Nodes: $workflow_nodes"
}

# Function to test workflow
test_workflow() {
    echo ""
    read -p "Do you want to test the workflow now? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping test"
        return
    fi

    echo "Testing workflow..."
    echo "NOTE: Manual test requires opening n8n UI"
    echo "  URL: $N8N_BASE_URL/workflow/$WORKFLOW_ID"
    echo "  Click 'Execute Workflow' button to test"
}

# Function to activate workflow
activate_workflow() {
    echo ""
    read -p "Do you want to activate the workflow? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping activation"
        return
    fi

    echo "Activating workflow..."

    # Get current workflow state
    current=$(curl -s \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "accept: application/json" \
        "$N8N_BASE_URL/api/v1/workflows/$WORKFLOW_ID")

    # Update with active: true
    updated=$(echo "$current" | jq '.active = true')

    response=$(curl -s -w "\n%{http_code}" \
        -X PUT \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -H "accept: application/json" \
        -d "$updated" \
        "$N8N_BASE_URL/api/v1/workflows/$WORKFLOW_ID")

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" != "200" ]; then
        echo "ERROR: Failed to activate workflow (HTTP $http_code)"
        exit 1
    fi

    echo "✓ Workflow activated successfully"
    echo "  Will run every 15 minutes automatically"
}

# Main execution
main() {
    check_n8n_api
    backup_workflow
    update_workflow
    test_workflow
    activate_workflow

    echo ""
    echo "========================================="
    echo "Deployment Complete!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Verify workflow in n8n: $N8N_BASE_URL/workflow/$WORKFLOW_ID"
    echo "2. Check executions tab for automatic runs"
    echo "3. Verify GitHub exports: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows"
    echo ""
    echo "For troubleshooting, see: $SCRIPT_DIR/WF103_IMPLEMENTATION_GUIDE.md"
    echo ""
}

# Run main function
main
