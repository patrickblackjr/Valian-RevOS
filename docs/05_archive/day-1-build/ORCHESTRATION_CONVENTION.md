# Orchestration Convention v1.0

**Status:** Required for Every Workflow
**Effective Date:** 2026-02-05
**Version:** 1.0.0

---

## Overview

Every RevOS workflow MUST follow this standard to ensure:
- ✅ Zero duplicate actions
- ✅ Perfect traceability
- ✅ Debuggability at scale
- ✅ Clean RL training data
- ✅ Enterprise trust
- ✅ Easy incident response

---

## 1. Universal Envelope (Input Contract)

Every workflow MUST accept a top-level object with these fields:

### A) meta (required)
```json
{
  "workflow_name": "WF17_RealTime_Voice_Orchestrator",
  "workflow_version": "1.0.0",
  "workflow_run_id": "wr_01H...",
  "parent_run_id": "wr_01H...",
  "root_run_id": "wr_01H...",
  "idempotency_key": "idem_tenant_lead_msghash",
  "trigger_source": "voice|sms|email|ui|cron|webhook",
  "trigger_id": "call_id|sms_id|email_id|job_id",
  "timestamp_utc": "2026-02-03T21:17:00Z",
  "tenant_id": "t_...",
  "location_id": "loc_...",
  "environment": "prod|staging",
  "policy_version": "pol_...",
  "feature_flags_version": "ff_...",
  "privacy_mode": "standard|phi_minimized",
  "correlation_id": "corr_..."
}
```

### B) subject (who the workflow is about)
```json
{
  "patient_id": "p_...",
  "lead_id": "l_...",
  "conversation_id": "c_...",
  "staff_user_id": "u_...",
  "owner_user_id": "u_..."
}
```

### C) payload (workflow-specific inputs)
```json
{
  // WF-specific data
}
```

### D) context (optional but recommended)
```json
{
  "tenant_ruleset_json": {},
  "feature_flags": {},
  "context_pack": {},
  "evidence_pack_ref": "evp_...",
  "recent_events_ref": "rev_..."
}
```

---

## 2. Mandatory Output Contract

Every workflow MUST return:

### A) meta_out (required)
```json
{
  "workflow_name": "WF17_RealTime_Voice_Orchestrator",
  "workflow_version": "1.0.0",
  "workflow_run_id": "wr_01H...",
  "root_run_id": "wr_01H...",
  "idempotency_key": "idem_...",
  "started_at_utc": "2026-02-03T21:17:00Z",
  "ended_at_utc": "2026-02-03T21:17:02Z",
  "latency_ms": 2040,
  "success": true,
  "failure_stage": null,
  "failure_reason": null,
  "outputs_hash": "sha256_...",
  "inputs_hash": "sha256_...",
  "retry_count": 0
}
```

### B) result (required)
```json
{
  "status": "ok|noop|blocked|retry|failed",
  "summary": "human-readable one-liner",
  "primary_outputs": {},
  "next_actions": [
    {
      "action": "CALL_WORKFLOW",
      "workflow": "WF18_Schedule",
      "payload": {},
      "priority": "high|normal|low",
      "run_after_utc": null
    }
  ]
}
```

### C) audit (required)
```json
{
  "phi_touched": true,
  "consent_checked": true,
  "consent_result": "allow|deny",
  "disclaimer_used": true,
  "data_written": [
    {"table": "call_logs", "record_id": "cl_..."},
    {"table": "events", "record_id": "ev_..."}
  ],
  "external_calls": [
    {"service": "twilio", "endpoint": "calls", "latency_ms": 420, "success": true},
    {"service": "pms_adapter", "endpoint": "appointment.book", "latency_ms": 680, "success": true}
  ]
}
```

---

## 3. Idempotency Rule (Non-Negotiable)

### What It Means
If the same input hits the workflow twice, it MUST NOT:
- Send two texts
- Book two appointments
- Charge twice
- Write duplicate tasks

### How To Enforce
Before doing any side-effect:
1. Call `Idempotency_Check(idempotency_key)`
2. If already processed: return `status=noop` with reference to prior result

### Idempotency Key Format
```
idem:{tenant_id}:{workflow_name}:{trigger_id}:{payload_hash}
```
Where `payload_hash = sha256(stable_json(payload))`

✅ **Guarantees "exactly-once behavior" on top of at-least-once webhooks**

---

## 4. Side-Effects Must Be Logged

Every workflow that:
- Sends a message
- Writes to PMS
- Creates a task
- Collects a payment
- Changes a policy

MUST write a row to `events` table via **WF11** or directly.

### Minimum Event Fields
- event_id
- workflow_run_id
- tenant_id
- subject ids
- event_type
- direction
- payload_ref
- timestamp

---

## 5. Error & Retry Standard

Every workflow MUST classify failures:

### A) Retryable Errors
- Network errors
- Vendor downtime
- 429 rate limits

**Action:**
- Return `status=retry`
- Set `next_actions` with exponential backoff
- Increment `retry_count`

### B) Terminal Errors
- Invalid input
- Consent denied
- Configuration missing
- Policy violation

**Action:**
- Return `status=failed|blocked`
- Create escalation task (WF21/WF42) if needed

✅ **Prevents silent failures**

---

## 6. Latency Budget Standard

Each workflow defines `latency_budget_ms`. If exceeded:
- Record `latency_breach=true`
- Trigger WF71 (fallback) for real-time channels
- Send internal alert if repeated

### Suggested Budgets
- **Voice real-time:** <1500-2500ms per turn
- **SMS response:** <3-8s
- **UI actions:** <2-5s
- **Batch jobs:** No strict budget (but track)

---

## 7. Privacy Modes (HIPAA-Safe)

Every workflow MUST respect `meta.privacy_mode`:
- **standard:** Full functionality
- **phi_minimized:** Store only necessary data; aggressive redaction; limit replay

Enforced by:
- WF15 Redactor
- WF84 Compliance Sentinel
- WF54 Dataset Curation

---

## 8. Workflow Naming + Versioning

All workflows MUST be named:
```
WF##_Short_Description
```

All MUST maintain:
- `workflow_version`
- `policy_version` (if decisioning involved)

Any change that affects outputs MUST bump version.

---

## Practical n8n Implementation Pattern

Every workflow begins with these nodes (conceptually):

1. **Node A:** Validate_Envelope (assert required meta fields)
2. **Node B:** Compute_Payload_Hash
3. **Node C:** Idempotency_Check
4. **Node D:** Load_Tenant_Entitlements (WF06)
5. **Node E:** Consent_Check (WF10) if outbound
6. **Node F:** Execute_Workflow_Core_Logic
7. **Node G:** Log_Event (WF11)
8. **Node H:** Build_Standard_Output

---

## Minimum Required Output Fields Checklist

Every workflow MUST output:
- ✅ `meta_out.workflow_run_id`
- ✅ `meta_out.root_run_id`
- ✅ `meta_out.idempotency_key`
- ✅ `meta_out.latency_ms`
- ✅ `meta_out.success`
- ✅ `meta_out.failure_reason` (if not success)
- ✅ `result.status`
- ✅ `result.next_actions[]` (even if empty)
- ✅ `audit.external_calls[]` (even if empty)

---

## Why This Matters

This convention delivers:
- ✅ Zero duplicate actions
- ✅ Perfect traceability
- ✅ Debuggability at scale
- ✅ Clean RL training data
- ✅ Enterprise trust
- ✅ Easy incident response

---

**Version History:**
- v1.0.0 (2026-02-05): Initial release
