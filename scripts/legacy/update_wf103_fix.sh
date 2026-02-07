#!/bin/bash
# Update WF103 with URL Expression Fix
#
# The key fix: n8n_Get_Workflow node URL expression changed from:
#   $('Set_Envelope_Defaults').item.json.core.n8n_base_url (single item reference - BROKEN)
# to:
#   $json.config.n8n_base_url (current item - CORRECT)
#
# Usage:
#   export N8N_API_KEY="your-api-key"
#   ./update_wf103_fix.sh
#
# Get your API key from: https://valiansystems.app.n8n.cloud/settings/api

set -e

N8N_URL="https://valiansystems.app.n8n.cloud"
WORKFLOW_ID="n8V5Gr98IZif05dv"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_FILE="${SCRIPT_DIR}/../workflows/WF103_v3_GitHub_Auto_Export_FIXED_URL.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "WF103 URL Expression Fix Deployment"
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

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo -e "${RED}ERROR: Workflow file not found: $WORKFLOW_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}API key found${NC}"
echo "Workflow ID: $WORKFLOW_ID"
echo "Workflow File: $WORKFLOW_FILE"
echo ""

# Get current workflow to confirm it exists
echo "Fetching current workflow..."
current=$(curl -s "${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Content-Type: application/json")

current_name=$(echo "$current" | jq -r '.name')
if [ "$current_name" == "null" ] || [ -z "$current_name" ]; then
    echo -e "${RED}ERROR: Could not fetch workflow ${WORKFLOW_ID}${NC}"
    echo "Response: $current"
    exit 1
fi

echo "Current workflow name: $current_name"
echo ""

# Update the workflow
echo "Updating workflow with fixed URL expression..."
response=$(curl -s -X PUT "${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Content-Type: application/json" \
    -d @"$WORKFLOW_FILE")

updated_name=$(echo "$response" | jq -r '.name')
if [ "$updated_name" == "null" ] || [ -z "$updated_name" ]; then
    echo -e "${RED}ERROR: Failed to update workflow${NC}"
    echo "Response: $response"
    exit 1
fi

echo -e "${GREEN}Workflow updated: $updated_name${NC}"
echo ""

# Activate the workflow
echo "Activating workflow..."
activate_response=$(curl -s -X POST "${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}/activate" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Content-Type: application/json")

active=$(echo "$activate_response" | jq -r '.active')
if [ "$active" == "true" ]; then
    echo -e "${GREEN}Workflow activated successfully${NC}"
else
    echo -e "${YELLOW}Note: Workflow may need manual activation in the UI${NC}"
fi

echo ""

# Verify the fix by fetching the updated workflow
echo "Verifying the URL expression fix..."
updated=$(curl -s "${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}" \
    -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
    -H "Content-Type: application/json")

# Check the n8n_Get_Workflow node URL expression
get_workflow_url=$(echo "$updated" | jq -r '.nodes[] | select(.name == "n8n_Get_Workflow") | .parameters.url')

if [[ "$get_workflow_url" == *'$json.config.n8n_base_url'* ]]; then
    echo -e "${GREEN}URL expression fix verified!${NC}"
    echo "n8n_Get_Workflow URL: $get_workflow_url"
else
    echo -e "${YELLOW}Warning: Could not verify URL expression fix${NC}"
    echo "n8n_Get_Workflow URL: $get_workflow_url"
fi

echo ""
echo "============================================"
echo "UPDATE COMPLETE"
echo "============================================"
echo ""
echo "The fix changes the n8n_Get_Workflow node URL from:"
echo "  BROKEN:  \$('Set_Envelope_Defaults').item.json.core.n8n_base_url"
echo "  FIXED:   \$json.config.n8n_base_url"
echo ""
echo "This ensures each split item uses its own config object"
echo "instead of trying to reference the original single envelope item."
echo ""
