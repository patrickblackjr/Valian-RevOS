# n8n Workflow Folder Structure

**Purpose:** Organize 120+ RevOS workflows for easy navigation and maintenance

---

## Folder Organization

### 📁 01-Infrastructure
**Workflows that support the entire system**
- WF106 - Schema Auto-Builder
- WF103 - GitHub Auto-Export
- WF11 - Event Logger
- WF200-206 - Project Management

### 📁 02-Brain-Spine (Decision + Memory)
**Core intelligence and memory**
- WF12 - Understanding
- WF13 - Memory Update
- WF14 - Memory Load
- WF15 - Safety/Redaction
- WF49-55 - Learning, Policy, Rollback

### 📁 03-Voice-Calls
**Phone call handling**
- WF16 - Inbound Call Router
- WF17 - Voice Orchestrator
- WF22 - Call Wrap-Up
- WF109 - Identity Resolution

### 📁 04-Messaging (SMS/Email)
**Text and email communication**
- WF24 - SMS Inbound
- WF25 - SMS Outbound
- WF26 - Email Handler
- WF108 - Universal Outbox

### 📁 05-Scheduling
**Appointment management**
- WF18 - Scheduling Workflow
- WF19 - Availability Check
- WF20 - Booking Confirmation
- WF21 - Reminder System

### 📁 06-Intake-Insurance
**Patient intake and insurance**
- WF27 - Intake Form Handler
- WF28 - Insurance Verification
- WF29 - Eligibility Check

### 📁 07-AR-Claims (Phase 2)
**Accounts receivable and claims**
- WF30-36 - Claims tracking, AR automation

### 📁 08-Owner-Control
**Practice owner interfaces**
- WF40 - Owner Command Parser
- WF41 - Command Executor
- WF42 - Alerts
- WF76-78 - Briefings, Transparency

### 📁 09-UI-RBAC
**User interface and permissions**
- WF56-61 - UI endpoints, RBAC

### 📁 10-Testing-Utilities
**Test workflows and utilities**
- Test schemas
- Sample data generators
- Debug helpers

---

## Workflow Naming Convention

```
WF###_Category_Description
```

**Examples:**
- `WF106_Infrastructure_SchemaBuilder`
- `WF17_Voice_Orchestrator`
- `WF18_Scheduling_BookAppointment`

---

## Tags (n8n Cloud)

Use these tags for cross-cutting concerns:
- `#critical` - Core system workflows
- `#phase1` - MVP workflows
- `#phase2` - AR automation
- `#active` - Currently in use
- `#beta` - Testing phase
- `#deprecated` - Old versions

---

## How to Organize in n8n Cloud

1. **Go to Workflows** in left sidebar
2. **Create folders** using the folder icon
3. **Drag workflows** into folders
4. **Add tags** to workflows for filtering

---

## Folder Creation Order

Create these folders first:
1. 01-Infrastructure
2. 02-Brain-Spine
3. 03-Voice-Calls
4. 04-Messaging
5. 05-Scheduling

Others can be added as workflows are built.

---

**Next Steps:**
- Create folders in n8n UI
- Move existing workflows into folders
- Tag all workflows appropriately
