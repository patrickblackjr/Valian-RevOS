#!/bin/bash
# RevOS Workflow Deployment Script
# Deploys WF106 and WF103 to n8n Cloud
#
# Prerequisites:
# 1. Get your n8n API key from: https://valiansystems.app.n8n.cloud/settings/api
# 2. Run: export N8N_API_KEY="your-api-key-here"

set -e

N8N_URL="https://valiansystems.app.n8n.cloud"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOWS_DIR="${SCRIPT_DIR}/../workflows"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "RevOS Workflow Deployment"
echo "============================================"
echo ""

# Check for API key
if [ -z "$N8N_API_KEY" ]; then
    echo -e "${RED}ERROR: N8N_API_KEY environment variable not set${NC}"
    echo ""
    echo "Steps to fix:"
    echo "1. Go to https://valiansystems.app.n8n.cloud/settings/api"
    echo "2. Generate an API key"
    echo "3. Run: export N8N_API_KEY='your-api-key-here'"
    echo "4. Re-run this script"
    exit 1
fi

echo -e "${GREEN}✓ API key found${NC}"
echo ""

# Function to create or update a workflow
deploy_workflow() {
    local workflow_file="$1"
    local workflow_name="$2"

    echo "----------------------------------------"
    echo "Deploying: $workflow_name"
    echo "File: $workflow_file"
    echo ""

    # Check if workflow exists by searching
    echo "Checking if workflow exists..."
    existing=$(curl -s "${N8N_URL}/api/v1/workflows" \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        -H "Content-Type: application/json" | \
        jq -r ".data[] | select(.name | contains(\"$workflow_name\")) | .id" | head -1)

    if [ -n "$existing" ] && [ "$existing" != "null" ]; then
        echo -e "${YELLOW}Found existing workflow (ID: $existing), updating...${NC}"

        # Update existing workflow
        response=$(curl -s -X PUT "${N8N_URL}/api/v1/workflows/${existing}" \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            -d @"$workflow_file")

        workflow_id="$existing"
    else
        echo "Creating new workflow..."

        # Create new workflow
        response=$(curl -s -X POST "${N8N_URL}/api/v1/workflows" \
            -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
            -H "Content-Type: application/json" \
            -d @"$workflow_file")

        workflow_id=$(echo "$response" | jq -r '.id')
    fi

    if [ -z "$workflow_id" ] || [ "$workflow_id" == "null" ]; then
        echo -e "${RED}ERROR: Failed to deploy workflow${NC}"
        echo "Response: $response"
        return 1
    fi

    echo -e "${GREEN}✓ Workflow deployed (ID: $workflow_id)${NC}"

    # Activate the workflow
    echo "Activating workflow..."
    activate_response=$(curl -s -X POST "${N8N_URL}/api/v1/workflows/${workflow_id}/activate" \
        -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
        -H "Content-Type: application/json")

    active=$(echo "$activate_response" | jq -r '.active')
    if [ "$active" == "true" ]; then
        echo -e "${GREEN}✓ Workflow activated${NC}"
    else
        echo -e "${YELLOW}⚠ Workflow may need manual activation${NC}"
    fi

    echo ""
}

# Deploy WF106 v3.0 (Schema Builder)
echo "============================================"
echo "STEP 1: Deploy WF106 v3.0 (Schema Builder)"
echo "============================================"
deploy_workflow "${WORKFLOWS_DIR}/WF106_v3_Schema_Builder_FIXED.json" "WF106"

# Deploy WF103 v3.0 (GitHub Auto-Export)
echo "============================================"
echo "STEP 2: Deploy WF103 v3.0 (GitHub Auto-Export)"
echo "============================================"
deploy_workflow "${WORKFLOWS_DIR}/WF103_v3_GitHub_Auto_Export_FIXED.json" "WF103"

echo "============================================"
echo "DEPLOYMENT COMPLETE"
echo "============================================"
echo ""
echo "Webhook URLs (after activation):"
echo "  WF106: ${N8N_URL}/webhook/wf106/schema-builder"
echo "  WF103: ${N8N_URL}/webhook/wf103/trigger (manual trigger)"
echo ""
echo "Next steps:"
echo "1. Go to n8n UI and verify workflows are active"
echo "2. Configure credentials:"
echo "   - WF106: 'Supabase RevOS Production' (Postgres)"
echo "   - WF103: 'n8n API' and 'GitHub API'"
echo "3. Test WF106 with a schema deployment"
echo "4. Verify WF103 cron runs every 15 minutes"
echo ""
