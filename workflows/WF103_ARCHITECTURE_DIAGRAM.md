# WF103 v2.0 Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WF103 - GitHub Auto-Export v2.0                 │
│                    Orchestrated Workflow Export System                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│   Schedule Trigger  │  Every 15 minutes
│   (Cron: */15)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Set Envelope        │  Orchestration metadata
│ Defaults            │  • workflow_name, run_id, timestamp
│                     │  • GitHub config (owner, repo, branch)
│                     │  • n8n config (base_url, api_key)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL API CALLS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐           ┌──────────────────┐                    │
│  │ HTTP Request    │           │  n8n Cloud API   │                    │
│  │ n8n List        ├──────────►│  /api/v1/        │                    │
│  │ Workflows       │◄──────────┤  workflows       │                    │
│  └────────┬────────┘           └──────────────────┘                    │
│           │                                                              │
└───────────┼──────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Code: Filter        │  Regex: ^WF(\d+)
│ WF### Range         │  Range: 0-999
│                     │  Output: workflows_to_export[]
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ IF: No Workflows    │
│ Found?              │
└──────┬──────┬───────┘
       │      │
   YES │      │ NO
       │      │
       ▼      ▼
  ┌─────┐  ┌──────────────────┐
  │Noop │  │ Split Workflows  │  Process individually
  │     │  │ (Split Out)      │
  └──┬──┘  └────────┬─────────┘
     │              │
     │              ▼
     │     ┌─────────────────────────────────────────────────────────┐
     │     │           FOR EACH WORKFLOW                             │
     │     ├─────────────────────────────────────────────────────────┤
     │     │                                                          │
     │     │  ┌─────────────────┐      ┌──────────────────┐         │
     │     │  │ HTTP Request    │      │  n8n Cloud API   │         │
     │     │  │ Get Full        ├─────►│  /workflows/{id} │         │
     │     │  │ Workflow JSON   │◄─────┤                  │         │
     │     │  └────────┬────────┘      └──────────────────┘         │
     │     │           │                                              │
     │     │           ▼                                              │
     │     │  ┌─────────────────┐                                    │
     │     │  │ Code: Normalize │  • Strip non-essential fields     │
     │     │  │ Workflow JSON   │  • Format as pretty JSON          │
     │     │  │                 │  • Base64 encode                  │
     │     │  │                 │  • Generate filename              │
     │     │  │                 │    WF###_Name_{id}.json           │
     │     │  └────────┬────────┘                                    │
     │     │           │                                              │
     │     │           ▼                                              │
     │     │  ┌─────────────────┐      ┌──────────────────┐         │
     │     │  │ HTTP Request    │      │  GitHub API      │         │
     │     │  │ GitHub Get      ├─────►│  GET /contents   │         │
     │     │  │ File SHA        │◄─────┤  (get current    │         │
     │     │  │                 │      │   file SHA)      │         │
     │     │  └────────┬────────┘      └──────────────────┘         │
     │     │           │                                              │
     │     │           ▼                                              │
     │     │  ┌─────────────────┐      ┌──────────────────┐         │
     │     │  │ HTTP Request    │      │  GitHub API      │         │
     │     │  │ GitHub Update   ├─────►│  PUT /contents   │         │
     │     │  │ File            │◄─────┤  (create/update  │         │
     │     │  │                 │      │   with base64)   │         │
     │     │  └────────┬────────┘      └──────────────────┘         │
     │     │           │                                              │
     │     │           ▼                                              │
     │     │  ┌─────────────────┐                                    │
     │     │  │ Set: GitHub     │  Extract commit SHA, URL          │
     │     │  │ Result          │                                    │
     │     │  └────────┬────────┘                                    │
     │     │           │                                              │
     │     └───────────┼──────────────────────────────────────────────┘
     │                 │
     │                 ▼
     │        ┌─────────────────┐
     │        │ Aggregate       │  Combine all workflow results
     │        │ Results         │
     │        └────────┬────────┘
     │                 │
     └─────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Code: Set       │  Build orchestration output:
              │ Output Envelope │  • meta_out (run_id, latency, success)
              │                 │  • result (status, summary, outputs)
              │                 │  • audit (external_calls[])
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Respond to      │  (Disabled - only for webhook)
              │ Webhook         │
              └─────────────────┘
```

---

## Data Flow

### Input Envelope (Start)
```json
{
  "meta": {
    "workflow_name": "WF103",
    "workflow_run_id": "exec_abc123",
    "timestamp_utc": "2026-02-05T01:30:00Z",
    "tenant_id": "system",
    "environment": "prod"
  },
  "payload": {
    "export_mode": "incremental",
    "wf_range_min": 0,
    "wf_range_max": 999
  }
}
```

### Processing Pipeline
```
n8n API Response
  ↓
Filter WF###
  ↓
For Each Workflow:
  Get Full JSON → Normalize → GitHub Get SHA → GitHub Update
  ↓
Aggregate Results
```

### Output Envelope (End)
```json
{
  "meta_out": {
    "workflow_name": "WF103",
    "workflow_run_id": "exec_abc123",
    "latency_ms": 2500,
    "success": true
  },
  "result": {
    "status": "ok",
    "summary": "Exported 8 workflows, committed 8 files to GitHub",
    "primary_outputs": {
      "workflows_exported": 8,
      "files_changed": 8,
      "git_commit_url": "https://github.com/..."
    }
  },
  "audit": {
    "external_calls": [
      {"service": "n8n_api", "endpoint": "workflows", "latency_ms": 750},
      {"service": "github_api", "endpoint": "contents", "latency_ms": 1750}
    ]
  }
}
```

---

## External Dependencies

### n8n Cloud API
```
Endpoint: https://valiansystems.app.n8n.cloud/api/v1
Auth: X-N8N-API-KEY header
Calls:
  - GET /workflows → List all workflows
  - GET /workflows/{id} → Get workflow details
```

### GitHub API
```
Endpoint: https://api.github.com
Auth: Bearer {Personal Access Token}
Repository: Valian-Systems/Valian-RevOS
Branch: main
Calls:
  - GET /repos/{owner}/{repo}/contents/{path}?ref={branch}
    → Get current file SHA
  - PUT /repos/{owner}/{repo}/contents/{path}
    → Create or update file (Base64 encoded)
```

---

## Workflow Pattern Recognition

### Filter Logic
```javascript
// Regex pattern
const wfRegex = /^WF(\d+)/;

// Example matches:
"WF103 - GitHub Auto-Export" → Match (WF103)
"WF106 - Schema Builder" → Match (WF106)
"WF200 - Task Tracker" → Match (WF200)
"Test Workflow" → No match (skip)
"workflow-demo" → No match (skip)

// Range filter
wfNumber >= 0 && wfNumber <= 999
```

### Filename Generation
```javascript
// Input: "WF103 - GitHub Auto-Export v2.0"
// Workflow ID: "4gpdeqt57NKyJY01"

// Output: "WF103_GitHub_Auto_Export_4gpdeqt57NKyJY01.json"

Pattern:
  WF{number}_{sanitized_name}_{workflow_id}.json
```

---

## GitHub File Structure

```
Valian-RevOS/
├── workflows/
│   ├── WF103_GitHub_Auto_Export_4gpdeqt57NKyJY01.json
│   ├── WF106_Schema_Builder_{id}.json
│   ├── WF200_Task_Tracker_{id}.json
│   ├── WF201_Daily_Digest_{id}.json
│   ├── WF202_Sprint_Manager_{id}.json
│   ├── WF203_Blocker_Alert_{id}.json
│   ├── WF204_Change_Log_{id}.json
│   ├── WF205_Version_Tagger_{id}.json
│   └── WF206_Workflow_Validator_{id}.json
├── schema/
│   └── (future)
├── docs/
│   └── (future)
└── README.md
```

### Commit History
```
commit abc123... (2026-02-05 01:45:00)
Author: github-token-user
  n8n export: WF206 - Workflow Validator

commit def456... (2026-02-05 01:45:00)
Author: github-token-user
  n8n export: WF205 - Version Tagger

commit ghi789... (2026-02-05 01:45:00)
Author: github-token-user
  n8n export: WF204 - Change Log

[... all workflows exported in same run ...]
```

---

## Error Handling Flow

```
                    ┌─────────────────┐
                    │  Any Node       │
                    └────────┬────────┘
                             │
                        ┌────▼────┐
                        │ Success?│
                        └────┬────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   YES               NO
                    │                 │
                    ▼                 ▼
            ┌───────────┐      ┌──────────────┐
            │ Continue  │      │ Error Caught │
            │ Pipeline  │      │ by n8n       │
            └───────────┘      └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ Execution    │
                               │ Marked Failed│
                               │ (Red)        │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ Check        │
                               │ Execution    │
                               │ Logs         │
                               └──────────────┘

Common Errors:
┌────────────────┬─────────────────┬──────────────────────┐
│ Error          │ HTTP Code       │ Solution             │
├────────────────┼─────────────────┼──────────────────────┤
│ n8n Auth       │ 401             │ Check API key        │
│ GitHub Auth    │ 401/403         │ Check PAT & scopes   │
│ Repo Not Found │ 404             │ Verify repo exists   │
│ SHA Mismatch   │ 422             │ Re-run workflow      │
│ Rate Limit     │ 429             │ Wait, retry later    │
│ Network        │ 500/502/503     │ Retry, check status  │
└────────────────┴─────────────────┴──────────────────────┘
```

---

## Performance Characteristics

### Expected Latency Breakdown
```
Total: ~2500ms for 8 workflows

┌─────────────────────────────────────┐
│ List n8n Workflows        ~500ms    │
│ Filter WF###              ~10ms     │
├─────────────────────────────────────┤
│ Per Workflow (×8):                  │
│   Get Full JSON           ~150ms    │
│   Normalize               ~5ms      │
│   GitHub Get SHA          ~100ms    │
│   GitHub Update           ~200ms    │
│   ────────────────────────          │
│   Subtotal per WF:        ~455ms    │
│   Total for 8 WFs:        ~1840ms   │
├─────────────────────────────────────┤
│ Aggregate Results         ~10ms     │
│ Set Output Envelope       ~5ms      │
├─────────────────────────────────────┤
│ TOTAL:                    ~2365ms   │
└─────────────────────────────────────┘

Note: Actual latency varies based on:
  - n8n cloud API response time
  - GitHub API response time
  - Network conditions
  - Workflow complexity/size
```

### Resource Usage
```
┌─────────────────┬──────────────┬───────────────┐
│ Resource        │ Per Execution│ Per Day       │
├─────────────────┼──────────────┼───────────────┤
│ n8n Executions  │ 1            │ 96            │
│ n8n API Calls   │ 9 (1+8)      │ 864           │
│ GitHub API      │ 16 (8×2)     │ 1,536         │
│ Data Transfer   │ ~50 KB       │ ~4.8 MB       │
│ Execution Time  │ ~2.5 sec     │ ~4 min total  │
└─────────────────┴──────────────┴───────────────┘

Rate Limits:
  - n8n Cloud: No published limit (monitor usage)
  - GitHub API: 5,000 requests/hour (authenticated)
  - Current usage: 1,536/day = 64/hour (1.3% of limit)
```

---

## Orchestration Envelope Contract

### Purpose
Standardize communication between workflows in RevOS ecosystem.

### Input Contract (Request)
```json
{
  "meta": {
    "workflow_name": "string (WF###)",
    "workflow_version": "string (semver)",
    "workflow_run_id": "string (execution ID)",
    "idempotency_key": "string (unique per logical operation)",
    "trigger_source": "string (cron|webhook|manual|workflow)",
    "timestamp_utc": "ISO 8601 datetime",
    "tenant_id": "string (system|tenant-uuid)",
    "environment": "string (dev|staging|prod)"
  },
  "payload": {
    // Workflow-specific input parameters
  }
}
```

### Output Contract (Response)
```json
{
  "meta_out": {
    "workflow_name": "string (echo input)",
    "workflow_run_id": "string (echo input)",
    "latency_ms": "number (execution duration)",
    "success": "boolean",
    "inputs_hash": "string (optional checksum)",
    "outputs_hash": "string (optional checksum)"
  },
  "result": {
    "status": "string (ok|noop|failed)",
    "summary": "string (human-readable description)",
    "primary_outputs": {
      // Workflow-specific output data
    }
  },
  "audit": {
    "external_calls": [
      {
        "service": "string (n8n_api|github_api|...)",
        "endpoint": "string (workflows|contents|...)",
        "latency_ms": "number"
      }
    ]
  }
}
```

### Benefits
1. **Consistency:** All workflows use same structure
2. **Observability:** Latency and external calls tracked
3. **Debugging:** Clear success/failure indicators
4. **Idempotency:** Keys prevent duplicate operations
5. **Audit Trail:** Full history of external interactions

---

## Integration Points

### Current (v2.0)
```
WF103 → n8n Cloud API (workflows)
WF103 → GitHub API (repository)
```

### Future (v2.1+)
```
WF103 → WF11 (event logging)
WF103 → Slack (notifications)
WF103 → Supabase (execution tracking)
WF103 ← WF200-206 (workflow registry updates)
```

---

## Comparison: v1.0 vs v2.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Trigger** | Manual | Cron (every 15 min) |
| **GitHub Integration** | Git commands | GitHub API |
| **Orchestration Envelope** | ❌ No | ✅ Yes |
| **Error Handling** | Basic | Comprehensive |
| **Filename Pattern** | Inconsistent | Standardized WF###_Name_{id}.json |
| **JSON Normalization** | Partial | Complete (strips id, timestamps) |
| **Cloud Compatible** | ❌ No (needs git CLI) | ✅ Yes (pure API) |
| **Output Contract** | None | Standardized envelope |
| **Audit Trail** | ❌ No | ✅ External calls tracked |
| **Idempotency** | ❌ No | ✅ Yes (via envelope) |
| **Documentation** | README only | 7 comprehensive docs |

---

**Version:** 2.0.0
**Last Updated:** 2026-02-05
**Status:** Production Ready
