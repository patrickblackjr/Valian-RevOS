# WF103 & WF106 - Orchestration Convention Gap Analysis

**Date:** 2026-02-05
**Convention Version:** 1.0.0
**Status:** Both workflows need significant updates

---

## Quick Summary

| Requirement | WF103 | WF106 |
|-------------|-------|-------|
| **Input: meta fields** | 7/16 | 6/16 |
| **Input: idempotency_key** | ❌ MISSING | ❌ MISSING |
| **Output: meta_out fields** | 3/12 | 4/12 |
| **Output: audit section** | ❌ MISSING | ✅ Present |
| **Output: next_actions[]** | ❌ MISSING | ❌ MISSING |
| **Idempotency Check** | ❌ Not implemented | ✅ Implemented |
| **Event Logging (WF11)** | ❌ Not called | ❌ Not called |

---

## WF103: GitHub Auto-Export - Gap Analysis

### Input Contract (Set_Envelope_Defaults)

**Present:**
- ✅ `meta.workflow_name` = "WF103"
- ✅ `meta.workflow_version` = "3.0.0"
- ✅ `meta.workflow_run_id` = `$execution.id`
- ✅ `meta.trigger_source` = "cron"
- ✅ `meta.timestamp_utc` = `$now.toISO()`
- ✅ `meta.tenant_id` = "system"
- ✅ `meta.environment` = "prod"

**Missing (MUST ADD):**
- ❌ `meta.parent_run_id` - null for root workflow
- ❌ `meta.root_run_id` - same as workflow_run_id for root
- ❌ `meta.idempotency_key` - **CRITICAL** - format: `idem:system:WF103:{execution_id}:{payload_hash}`
- ❌ `meta.trigger_id` - execution ID or webhook request ID
- ❌ `meta.location_id` - null for system workflows
- ❌ `meta.policy_version` - null for infrastructure
- ❌ `meta.feature_flags_version` - null or skip
- ❌ `meta.privacy_mode` - "standard"
- ❌ `meta.correlation_id` - same as workflow_run_id for root

### Output Contract (Output_Envelope)

**Present:**
- ✅ `meta_out.workflow_name` = "WF103"
- ✅ `meta_out.latency_ms`
- ✅ `meta_out.success`
- ✅ `result.status` = "ok"
- ✅ `result.summary`
- ✅ `result.primary_outputs`

**Missing (MUST ADD):**
- ❌ `meta_out.workflow_version`
- ❌ `meta_out.workflow_run_id`
- ❌ `meta_out.root_run_id`
- ❌ `meta_out.idempotency_key`
- ❌ `meta_out.started_at_utc`
- ❌ `meta_out.ended_at_utc`
- ❌ `meta_out.failure_stage` (null on success)
- ❌ `meta_out.failure_reason` (null on success)
- ❌ `meta_out.outputs_hash` - sha256 of outputs
- ❌ `meta_out.inputs_hash` - sha256 of inputs
- ❌ `meta_out.retry_count` = 0
- ❌ `result.next_actions[]` = [] (even if empty)
- ❌ `audit` section **COMPLETELY MISSING**

### Missing Audit Section (MUST ADD)
```json
{
  "audit": {
    "phi_touched": false,
    "consent_checked": false,
    "consent_result": null,
    "disclaimer_used": false,
    "data_written": [],
    "external_calls": [
      {"service": "n8n", "endpoint": "workflows", "latency_ms": X, "success": true},
      {"service": "github", "endpoint": "contents", "latency_ms": X, "success": true}
    ]
  }
}
```

### Idempotency (CRITICAL - NOT IMPLEMENTED)

WF103 currently has NO idempotency check. Per convention:
- Before writing to GitHub, should check `idempotency_keys` table
- If same content already exported in this run, skip
- Current behavior: May re-commit identical content (wastes API calls)

**Required Node:** Add "Idempotency_Check" node before GitHub_Update_File

---

## WF106: Schema Auto-Builder - Gap Analysis

### Input Contract

**Present:**
- ✅ `meta.workflow_name`
- ✅ `meta.workflow_version`
- ✅ `meta.workflow_run_id`
- ✅ `meta.trigger_source`
- ✅ `meta.timestamp_utc`
- ✅ `meta.environment`

**Missing (MUST ADD):**
- ❌ `meta.parent_run_id`
- ❌ `meta.root_run_id`
- ❌ `meta.idempotency_key`
- ❌ `meta.trigger_id`
- ❌ `meta.tenant_id` (should accept from caller)
- ❌ `meta.location_id`
- ❌ `meta.policy_version`
- ❌ `meta.feature_flags_version`
- ❌ `meta.privacy_mode`
- ❌ `meta.correlation_id`

### Output Contract

**WF106 is BETTER - already has audit section:**
```json
{
  "meta_out": { ... },
  "result": { "status": "applied|noop|blocked", ... },
  "audit": {
    "phi_touched": false,
    "data_written": [...],
    "external_calls": [...]
  }
}
```

**Still Missing:**
- ❌ `meta_out.workflow_version`
- ❌ `meta_out.root_run_id`
- ❌ `meta_out.idempotency_key`
- ❌ `meta_out.started_at_utc` / `ended_at_utc`
- ❌ `meta_out.failure_stage` / `failure_reason`
- ❌ `meta_out.outputs_hash` / `inputs_hash`
- ❌ `meta_out.retry_count`
- ❌ `result.next_actions[]`

### Idempotency (IMPLEMENTED via schema_migrations)

✅ WF106 does have idempotency - checks `schema_migrations` table for version
- If version already applied: returns `status: "noop"`
- This is correct behavior!

---

## Priority Fixes

### HIGH PRIORITY (Breaks Convention)

1. **Add idempotency_key to both workflows**
   - Format: `idem:{tenant_id}:{workflow_name}:{trigger_id}:{payload_hash}`
   - WF103: Check before GitHub write
   - WF106: Already implemented via schema_migrations ✅

2. **Add audit section to WF103**
   - Track external_calls to n8n API and GitHub API
   - Set phi_touched = false

3. **Add next_actions[] to both outputs**
   - Even if empty: `"next_actions": []`

### MEDIUM PRIORITY (Completeness)

4. **Add missing meta fields to Set_Envelope_Defaults**
   - parent_run_id, root_run_id, correlation_id (all = workflow_run_id for root)
   - privacy_mode = "standard"

5. **Add missing meta_out fields to Output_Envelope**
   - workflow_version, workflow_run_id, root_run_id
   - started_at_utc, ended_at_utc
   - failure_stage, failure_reason (null on success)

6. **Add hash fields**
   - inputs_hash, outputs_hash (sha256 for traceability)

### LOW PRIORITY (Nice to Have)

7. **Call WF11 Event Logger**
   - Log workflow execution as event
   - Currently neither workflow calls WF11

8. **Retry logic**
   - Add retry_count tracking
   - Classify errors as retryable vs terminal

---

## Recommended Node Structure (Per Convention)

Both workflows should follow this pattern:

```
1. Trigger (Webhook/Cron)
2. Validate_Envelope (assert required meta fields)
3. Compute_Payload_Hash (for idempotency)
4. Idempotency_Check (query idempotency_keys table)
5. [Workflow-specific logic]
6. Log_Event (call WF11)
7. Build_Standard_Output (full meta_out + result + audit)
```

---

## Next Steps

1. Update Set_Envelope_Defaults with all required meta fields
2. Update Output_Envelope with full meta_out + result + audit
3. Add Idempotency_Check node to WF103 (WF106 already has it)
4. Add optional WF11 event logging
5. Deploy and test both workflows

**Estimated Effort:** 2-3 hours per workflow
