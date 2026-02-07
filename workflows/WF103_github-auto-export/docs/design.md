# WF103 - GitHub Auto-Export Workflow Design

**Version:** 2.0.0 (Orchestration Convention v1.0)
**Purpose:** Export n8n workflows to GitHub with proper versioning and notifications
**Trigger:** Cron (every 15 minutes) + Manual webhook

---

## Orchestration Envelope Compliance

### Input Contract
```json
{
  "meta": {
    "workflow_name": "WF103",
    "workflow_version": "2.0.0",
    "workflow_run_id": "wr_...",
    "idempotency_key": "idem_wf103_export_{timestamp_hash}",
    "trigger_source": "cron|webhook",
    "timestamp_utc": "2026-02-05T...",
    "tenant_id": "system",
    "environment": "prod"
  },
  "payload": {
    "export_mode": "incremental|full",
    "wf_range_min": 0,
    "wf_range_max": 999,
    "force_commit": false
  }
}
```

### Output Contract
```json
{
  "meta_out": {
    "workflow_name": "WF103",
    "workflow_run_id": "wr_...",
    "latency_ms": 2500,
    "success": true
  },
  "result": {
    "status": "ok|noop|failed",
    "summary": "Exported 5 workflows, committed to GitHub",
    "primary_outputs": {
      "workflows_exported": 5,
      "files_changed": 3,
      "git_commit_hash": "abc123...",
      "commit_url": "https://github.com/..."
    }
  },
  "audit": {
    "external_calls": [
      {"service": "n8n_api", "endpoint": "workflows", "latency_ms": 420},
      {"service": "github_api", "endpoint": "contents", "latency_ms": 680}
    ]
  }
}
```

---

## Node Flow (Detailed)

### S0 - Trigger + Envelope
**Node 1: Cron_Export_Schedule**
- Type: Schedule Trigger
- Cron: `*/15 * * * *` (every 15 minutes)
- Optional: Add manual webhook trigger

**Node 1.1: Set_Envelope_Defaults**
- Type: Set
- Sets:
  - `meta.workflow_name = "WF103"`
  - `meta.workflow_run_id = execution.id`
  - `meta.started_at_utc = now()`
  - `core.n8n_base_url = env.N8N_BASE_URL`
  - `core.export_root = "workflows"`
  - `core.wf_prefix = "WF"`

### S1 - Fetch Workflows from n8n
**Node 2: HTTP_n8n_List_Workflows**
- Type: HTTP Request
- Method: GET
- URL: `{n8n_base_url}/api/v1/workflows`
- Auth: HTTP Header (X-N8N-API-KEY)

**Node 3: Code_Filter_WF_Range**
- Type: Code
- Filters workflows matching `WF###` pattern
- Applies range filter (0-999)
- Output: `core.workflows_to_export[]`

**Node 4: IF_No_Workflows_Found**
- Type: IF
- Condition: `workflows_to_export.length === 0`
- TRUE: Return noop
- FALSE: Continue

### S2 - Export Each Workflow
**Node 5: Split_Workflows**
- Type: Split In Batches
- Batch size: 10

**Node 6: HTTP_n8n_Get_Workflow_JSON**
- Type: HTTP Request
- Method: GET
- URL: `{n8n_base_url}/api/v1/workflows/{id}`

**Node 7: Code_Normalize_Workflow_JSON**
- Type: Code
- Strips: `id`, `createdAt`, `updatedAt`, `versionId`
- Formats: Pretty JSON, stable key order
- Filename: `WF###_Name_{id}.json`

**Node 8: Code_Build_GitHub_Payload**
- Type: Code
- Creates GitHub file update payload
- Base64 encodes content
- Sets commit message

### S3 - GitHub Integration
**Node 9: HTTP_GitHub_Get_File**
- Type: HTTP Request
- Method: GET
- URL: `https://api.github.com/repos/{owner}/{repo}/contents/{path}`
- Purpose: Get current SHA for update

**Node 10: HTTP_GitHub_Update_File**
- Type: HTTP Request
- Method: PUT
- URL: `https://api.github.com/repos/{owner}/{repo}/contents/{path}`
- Body:
  ```json
  {
    "message": "n8n export: {workflow_name}",
    "content": "{base64_content}",
    "sha": "{current_sha}",
    "branch": "main"
  }
  ```

**Node 11: Code_Track_Changes**
- Type: Code
- Aggregates changed files
- Builds summary

### S4 - Notification
**Node 12: HTTP_Slack_Notify**
- Type: HTTP Request
- Method: POST
- URL: Slack webhook
- Body: Export summary with commit links

### S5 - Logging + Output
**Node 13: Execute_WF11_Log_Event**
- Type: Execute Workflow
- Workflow: WF11
- Payload: Export event details

**Node 14: Set_Output_Envelope**
- Type: Set
- Builds orchestration output contract

---

## Environment Variables Required

```bash
N8N_BASE_URL=https://valiansystems.app.n8n.cloud
N8N_API_KEY=eyJhbG...
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=Valian-Systems
GITHUB_REPO=Valian-RevOS
GITHUB_BRANCH=main
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
WF_RANGE_MIN=0
WF_RANGE_MAX=999
```

---

## Simplified Version (Day 1 MVP)

For initial implementation, we can simplify to:
1. Fetch workflows from n8n API ✅ (already done)
2. Format and save to local files
3. Use GitHub API to create/update files
4. Log to WF11
5. Return orchestration envelope

Skip for MVP:
- Git command execution (use GitHub API instead)
- Checksum caching
- Advisory locks
- Full Slack integration

---

## Implementation Priority

**Phase 1 (Now):**
- Basic GitHub API integration
- Orchestration envelope
- WF11 logging

**Phase 2 (Later):**
- Full ChatGPT design
- Git commands
- Checksum optimization
- Advanced error handling

---

**Status:** Design Complete, Ready for Implementation
