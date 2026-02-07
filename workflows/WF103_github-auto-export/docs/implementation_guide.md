# WF103 v2.0 Implementation Guide

## Overview
This guide provides step-by-step instructions to deploy WF103 v2.0 with GitHub API integration to your n8n instance.

## Prerequisites

### 1. n8n Credentials Setup
You need to configure two credentials in your n8n instance:

#### A. n8n API Credential
1. Go to n8n Settings → API
2. Generate API key if not already done
3. Create credential in n8n:
   - Type: "n8n API"
   - Name: "n8n-cloud-api"
   - API Key: [Your n8n API key]
   - Base URL: https://valiansystems.app.n8n.cloud

#### B. GitHub API Credential
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic) with permissions:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
3. Create credential in n8n:
   - Type: "GitHub API"
   - Name: "github-valian-revos"
   - Access Token: [Your GitHub PAT]
   - User: Valian-Systems
   - Repository: Valian-RevOS

### 2. Repository Setup
Ensure the GitHub repository exists:
- Repository: `Valian-Systems/Valian-RevOS`
- Branch: `main`
- Directory: `workflows/` (will be created automatically)

## Deployment Options

### Option 1: Manual Import (Recommended for First Time)

1. Open n8n cloud instance: https://valiansystems.app.n8n.cloud

2. Navigate to existing WF103 workflow (ID: 4gpdeqt57NKyJY01)

3. Create a backup:
   - Click "..." menu → "Duplicate"
   - Rename to "WF103 - GitHub Auto-Export v1.0 BACKUP"
   - Deactivate the backup

4. Import new workflow:
   - Click "Create new workflow" or open existing WF103
   - Click "..." menu → "Import from file"
   - Select: `/Users/patrick.black/code/Valian/workflows/WF103_v2_definition.json`

5. Configure credentials:
   - Click on "HTTP_n8n_List_Workflows" node
   - Select credential: "n8n-cloud-api"
   - Repeat for "HTTP_n8n_Get_Workflow_JSON" node

   - Click on "HTTP_GitHub_Get_File" node
   - Select credential: "github-valian-revos"
   - Repeat for "HTTP_GitHub_Update_File" node

6. Test the workflow:
   - Click "Execute Workflow" button
   - Check execution log for errors
   - Verify workflows exported to GitHub

7. Activate the workflow:
   - Toggle "Active" switch in top right
   - Workflow will now run every 15 minutes

### Option 2: API Import (Advanced)

Use the provided script to import via n8n API:

```bash
# Set environment variables
export N8N_API_KEY="your-n8n-api-key"
export N8N_BASE_URL="https://valiansystems.app.n8n.cloud"
export WORKFLOW_ID="4gpdeqt57NKyJY01"

# Run import script
bash /Users/patrick.black/code/Valian/workflows/deploy_wf103.sh
```

## Workflow Structure

### Node Flow

1. **Cron_Export_Schedule** (Schedule Trigger)
   - Runs every 15 minutes
   - Initiates workflow execution

2. **Set_Envelope_Defaults** (Set)
   - Sets orchestration envelope metadata
   - Configures workflow parameters
   - Sets GitHub/n8n connection details

3. **HTTP_n8n_List_Workflows** (HTTP Request)
   - Fetches all workflows from n8n API
   - Credential: n8n-cloud-api

4. **Code_Filter_WF_Range** (Code)
   - Filters workflows matching WF### pattern
   - Applies range filter (0-999)
   - Returns list to export

5. **IF_No_Workflows_Found** (IF)
   - Checks if any workflows found
   - Routes to noop or continue

6. **Split_Workflows** (Split Out)
   - Splits workflow array into individual items
   - Each workflow processed separately

7. **HTTP_n8n_Get_Workflow_JSON** (HTTP Request)
   - Fetches full workflow JSON for each workflow
   - Credential: n8n-cloud-api

8. **Code_Normalize_Workflow_JSON** (Code)
   - Removes non-essential fields (id, createdAt, etc.)
   - Formats as pretty JSON
   - Base64 encodes for GitHub API
   - Generates filename: WF###_Name_{id}.json

9. **HTTP_GitHub_Get_File** (HTTP Request)
   - Attempts to get existing file from GitHub
   - Gets current SHA for update
   - Credential: github-valian-revos

10. **HTTP_GitHub_Update_File** (HTTP Request)
    - Creates or updates file in GitHub
    - Includes commit message: "n8n export: {workflow_name}"
    - Credential: github-valian-revos

11. **Set_GitHub_Result** (Set)
    - Extracts commit SHA and URL
    - Prepares result data

12. **Aggregate_Results** (Aggregate)
    - Combines all individual workflow results
    - Prepares for final summary

13. **Set_Output_Envelope** (Code)
    - Builds orchestration output contract
    - Calculates metrics (latency, success count)
    - Returns standardized response

14. **Respond** (Respond to Webhook) - DISABLED
    - Only used if webhook trigger added
    - Returns JSON response

## Testing

### Manual Test
1. Open workflow in n8n
2. Click "Execute Workflow"
3. Watch execution progress
4. Check results:
   - Should see "ok" status
   - Should see workflows_exported count
   - Should see commit URLs

### Verify GitHub
1. Go to: https://github.com/Valian-Systems/Valian-RevOS/tree/main/workflows
2. Check for exported workflow files
3. Check commit history for "n8n export: WF###" messages

### Monitor Scheduled Runs
1. After activation, wait 15 minutes
2. Check Executions tab in n8n
3. Should see automatic executions every 15 minutes
4. All should show green (success)

## Troubleshooting

### Error: "unauthorized" from n8n API
- Check n8n API credential is configured
- Verify API key is correct and not expired
- Ensure API key has workflow read permissions

### Error: "unauthorized" from GitHub API
- Check GitHub credential is configured
- Verify Personal Access Token is correct
- Ensure token has `repo` scope
- Check token hasn't expired

### Error: "404 Not Found" from GitHub
- Verify repository exists: Valian-Systems/Valian-RevOS
- Check branch is correct: main
- Ensure GitHub token has access to the repository

### Error: "422 Unprocessable Entity" from GitHub
- SHA mismatch - file was updated externally
- Re-run workflow to get latest SHA
- Check if GitHub rate limit exceeded

### No workflows exported
- Check filter logic in Code_Filter_WF_Range
- Verify workflows match WF### pattern
- Check wf_range_min/max values

### Workflow fails on specific workflow
- Check workflow JSON format
- Verify workflow isn't corrupted in n8n
- Check for special characters in workflow name

## Monitoring

### What to Monitor
- Execution success rate (should be >95%)
- Latency (should be <30 seconds for 10 workflows)
- GitHub commit history (should see regular commits)
- Error logs in n8n executions

### Expected Behavior
- Runs every 15 minutes automatically
- Exports all WF### workflows (currently WF103, WF106, WF200-206)
- Creates/updates files in GitHub workflows/ directory
- No errors under normal operation

## Next Steps

After successful deployment:

1. **Add WF11 Integration** (when WF11 exists)
   - Add Execute Workflow node before Set_Output_Envelope
   - Log export events to WF11 event ledger

2. **Add Slack Notifications** (optional)
   - Add HTTP Request node after Set_Output_Envelope
   - Send summary to #revos-alerts channel
   - Only notify on errors or large exports

3. **Optimize Performance**
   - Add checksum caching to skip unchanged workflows
   - Implement batch commits (single commit for all changes)
   - Add retry logic for failed GitHub API calls

4. **Expand Export Scope**
   - Export credentials (encrypted)
   - Export environment variables
   - Export workflow execution history

## Rollback Plan

If WF103 v2.0 has issues:

1. Deactivate WF103 v2.0
2. Activate WF103 v1.0 BACKUP
3. Report issue with execution logs
4. Fix and re-deploy

## Support

For issues or questions:
- Check n8n execution logs first
- Review this implementation guide
- Check WF103_DESIGN.md for architecture details
- GitHub Issues: https://github.com/Valian-Systems/Valian-RevOS/issues

---

**Version:** 2.0.0
**Last Updated:** 2026-02-05
**Status:** Ready for Deployment
