# RevOS: Revenue Operating System for Dental Practices

**Last Updated:** 2026-02-06
**Version:** 1.0 (Day 1 - Foundation)
**Status:** Active Development - Day 1-10 MVP Sprint

---

## 1. System Identity & Purpose

### Mission
Build a mission-critical, multi-tenant Revenue Operating System that creates **operational dependency** - where dental/orthodontic practices cannot function without the system.

### Core Strategy
- **RevOS is infrastructure, not a tool**
- Competitors sell "software" practices can turn off
- We build "infrastructure" practices depend on
- Success metric: "If they turn us off, revenue stops"

### Dual Dependency Model
**Phase 1: Inbound Revenue OS**
- Front-end revenue: Calls → Scheduling → Nurturing → Booking
- Value: "Never miss another call, book 20-30% more new patients"

**Phase 2: AR Automation Layer**
- Back-end revenue: Claims → Collections → Cash
- Value: "Get paid 20-30 days faster, reduce AR aging by 20-40%"

**Result:** Practices cannot turn off either module without losing revenue

---

## 2. Business Model & Market Positioning

### Target Market
**Primary ICP:**
- Dentists, orthodontists, dermatologists
- Practice size: 2-10 providers
- Revenue: $500k-$5M/year
- Current tech stack: ModMed/Dentrix/Eaglesoft (EHR/PMS) + 5-8 point solutions

**Current Pain Points:**
- Losing $50,000-$200,000/year in missed calls
- 15-25% no-show rate on appointments
- 45-90 day insurance claim payment cycles
- 30-40% of revenue uncollected after 90 days
- Staff spending 10-15 hours/week on manual admin tasks

### Pricing Strategy

**Phase 1: Inbound Revenue OS ($1,200-$3,500/month)**

| Tier | Monthly | Setup | What's Included |
|------|---------|-------|-----------------|
| **Essential** | $1,200 | $5,000 | AI phone (24/7), booking, SMS reminders, missed call recovery, Slack alerts. Up to 500 calls/month, 1 location, 1-3 providers |
| **Professional** | $2,500 | $10,000 | Essential + email sequences, intake automation, insurance verification, multi-location (3), owner dashboard. Up to 1,500 calls/month |
| **Enterprise** | $3,500 | $15,000 | Professional + multi-brand, custom integrations, dedicated success manager, unlimited calls, API access |

**Phase 2: AR Automation Layer (+$1,500-$3,000/month)**
- **AR Starter:** +$1,500/month (claims tracking, AI follow-ups, denial triage, patient payment reminders)
- **AR Pro:** +$3,000/month (AR Starter + payment plans, collections cadence, 20% AR reduction guarantee)

**À La Carte Features ($250-$500/month each):**
- Advanced memory system (vector search): $500/month
- Custom reporting: $250/month
- Multilingual support (Spanish): $500/month
- Voice briefings for owner: $250/month
- White-label (remove RevOS branding): $1,000/month

### Primary Offers (Risk Reversal)

**Offer 1: Risk-Free Go-Live Guarantee**
- "We'll set up your AI receptionist in 14 days. If it doesn't book at least 5 appointments in the first month, we'll refund your setup fee AND pay you $1,000."
- Removes all risk, differentiates from competitors, sets high quality bar

**Offer 2: Missed-Call Revenue Recovery**
- "Our AI calls back every missed call within 60 seconds. Practices lose $50,000-$200,000/year in missed calls. We'll recover 70% of that revenue or you don't pay."
- Quantifies problem in dollars, performance-based pricing, easy to measure

### Go-to-Market

**Sales Team Structure:**
- 6-8 reps, each targeting 6-8 deals/month
- Team goal: 50 deals/month (mix of Tier 1, 2, 3)

**Sales Compensation:**
- 10% of first-year recurring revenue (MRR × 12)
- 10% of setup fee
- Example: Tier 2 sale = ($2,500 × 12 × 10%) + ($10,000 × 10%) = **$4,000 commission**
- Expansion commission: 10% of upgrade/Phase 2 add-on ARR
- Retention bonus: 5% bonus if customer stays 12+ months
- Churn penalty: Lose 50% of commission if customer churns within 6 months

**Revenue Targets:**
- Month 1: 50 customers × $2k avg MRR = $115,500 MRR + $475k setup fees = **$590k total revenue**
- Year 1: $1.2M ARR (Phase 1 only, assuming 5% churn)
- Year 2: $18.6M ARR ($13.2M Phase 1 + $5.4M Phase 2 expansion)

### Competitive Positioning

**We Are Infrastructure, Not Software**

| Competitor Type | What They Do | Where They Fall Short |
|----------------|--------------|------------------------|
| **Practice Management Integration** (Hello Patient, Weave, NexHealth, Solutionreach, Adit) | Appointment reminders, confirmations, SMS/email sequences | No live AI answering, no AR automation, templated messages (not truly AI) |
| **AI Call Answering** (Viva AI) | Natural language call handling | Front-end only (no backend AR/claims), no memory system |
| **Analytics & Reporting** (Practice by Numbers) | Financial KPIs, production/collections dashboards | Backwards-looking data, no automation or action |
| **Revenue Cycle Mgmt** (Zentist, eAssist, Assort Health) | Insurance claims tracking, AR collections | No front-end (no calls/scheduling), Phase 2 competitor only |
| **Practice Mgmt Systems** (ModMed, Dentrix, Eaglesoft) | Full EHR/PMS (scheduling, charting, billing) | Not focused on automation or AI, manual processes |

**The Gap RevOS Fills:**
1. **No End-to-End Ownership:** All competitors are point solutions. Nobody owns the ENTIRE revenue cycle from "phone rings" to "cash collected"
2. **No True AI Orchestration:** Most "AI" is just templates. Only Viva AI has real conversational AI, but it's front-end only
3. **No Operational Memory:** Systems don't learn or remember. Every call is treated as new. No patient interaction history beyond EHR clinical notes
4. **Integration Hell:** Practices need 5-8 different tools (ModMed for PMS, Weave for phones, Hello Patient for reminders, eAssist for collections, Practice by Numbers for reporting). Result: Data silos, manual re-entry, $8-12k/month in vendor costs
5. **No Revenue Guarantee:** Competitors charge regardless of results. RevOS is the ONLY solution that guarantees recovered revenue

**RevOS Strategic Advantages:**
- **Single Platform:** Replaces 3-5 existing vendors
- **Better Results:** AI learns and improves, templates don't
- **Risk Reversal:** Guaranteed recovered revenue or we pay them
- **Lower Total Cost:** $2k-3.5k/month vs $8-12k/month for equivalent vendor stack
- **Faster Setup:** 14-day go-live vs 60-90 days for Weave/ModMed integrations
- **The Memory Moat:** Patient behavioral data (preferences, objections, patterns) creates switching cost after 6 months. Competitors have transactional logs, we have behavioral intelligence

---

## 3. Architectural Principles (Non-Negotiable)

### Design Philosophy
- **Reliability > Novelty:** Deterministic systems over "magic"
- **Event-Driven:** Everything is an event in an immutable ledger
- **Workflow-Orchestrated:** n8n as primary business logic engine
- **Database-Centric:** PostgreSQL (Supabase) as system of record
- **Memory-Aware:** Persistent AI memory per lead
- **Multi-Tenant:** Baked in from day one (not bolted on)
- **AI as Operator:** AI assists but doesn't own state or bypass safeguards
- **Idempotency Everywhere:** No silent failures, all actions logged
- **Graceful Degradation:** Workflows continue when AI fails

### AI vs Deterministic Decision Tree

**Use Deterministic Workflows (80% of system):**
- Appointment booking (rules-based availability checking)
- SMS reminders (templated with variable substitution)
- Insurance eligibility (API calls to clearinghouses)
- Billing calculations (math operations)
- Report generation (SQL queries + formatting)
- **Why:** Predictable, debuggable, fast, cheap, reliable

**Use AI Agents (20% of system):**
- Phone conversations (Vapi/Bland for natural language)
- Inbound message triage (intent classification)
- Email reply generation (personalized, context-aware)
- Memory extraction (summarization from transcripts)
- Complex scheduling ("I need Tuesday or Wednesday morning" → structured intent)
- **Why:** Handles ambiguity, natural language, edge cases

**Critical Rule:**
**AI agents NEVER directly write to database.** They return structured JSON → n8n validates → deterministic workflow writes to DB → event logged.

Example flow:
```
AI: {"intent": "book_appointment", "preferred_time": "Monday morning"}
n8n: Check availability (deterministic)
n8n: Book if available, else suggest alternatives
n8n: Write to DB with transaction
n8n: Log event
n8n: Send confirmation
```

---

## 4. Technology Stack

### Core Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | Supabase (managed PostgreSQL) | System of record with Row-Level Security for multi-tenancy |
| **Workflow Engine** | n8n (cloud: valiansystems.app.n8n.cloud) | Primary development environment, 90% of business logic |
| **Voice/Calls** | Vapi.ai (recommended) or Bland.ai or eleven labs | AI phone receptionists with ASR/TTS/LLM integration |
| **SMS** | Twilio (primary) + Telnyx (backup) | Messaging, phone numbers (+1 917 993 5081) |
| **Email** | SendGrid or Resend | Transactional email, nurture sequences |
| **Storage** | Supabase Storage | Call recordings, intake forms, documents |
| **Monitoring** | Sentry + custom health check workflows | Error tracking, uptime monitoring |
| **Version Control** | GitHub (Valian-Systems/Valian-RevOS) | Source of truth for workflows, schemas, docs |
| **Alerts** | Slack (Valian Systems workspace) | Real-time notifications (#revos-build, #revos-alerts) |

### Claude Code Integration (Day 1 Setup)

**n8n MCP Server:**
- Direct connection to n8n instance for workflow management
- 20 tools: 7 documentation + 13 management (create, update, test workflows)
- Configuration: Docker deployment with n8n API credentials
- Enables Claude to generate and deploy workflows directly

**n8n Skills:**
- 7 complementary skills teaching n8n best practices
- Auto-activates on keywords: `{{`, `$json`, "Find a Slack node", etc.
- Reduces workflow build time from 45min → 3min
- Works alongside MCP server (expertise + data access)

**Integration Benefit:** Claude can build, test, and deploy all 120 workflows without manual JSON imports

### Future/Phase 2

| Component | Technology | When |
|-----------|-----------|------|
| **RL System** | Custom Python (FastAPI) | Month 7-9 (after 500 customers) |
| **Analytics** | Metabase or custom dashboards | Month 4-6 |
| **Payments** | Stripe for billing | Month 2-3 |
| **Claims Integration** | Trizetto, Change Healthcare, Availity | Month 7-9 (Phase 2) |

---

## 5. Database Schema Overview

### Multi-Tenant Foundation

**Every table includes:**
- `id` (UUID) - Primary key
- `tenant_id` (UUID) - Foreign key to tenants table
- `created_at` (timestamp) - Record creation time
- `updated_at` (timestamp) - Last modification time
- `deleted_at` (timestamp, nullable) - Soft delete for audit trail

**Row-Level Security (RLS) enforced:**
- Every query automatically filtered by `tenant_id`
- No cross-tenant data leakage possible
- Supabase policies enforce isolation

### Core Tables (18 Essential)

**Tenant & Identity:**
- `tenants` - Practice information, settings, subscription status, phone number
- `users` - Staff members with RBAC (admin, staff, billing, read-only)
- `patients` - Practice's patients (PII: name, DOB, email, phone)
- `patient_contacts` - Normalized phone/email with deduplication

**Event Spine (Immutable Ledger):**
- `events` - Every system action logged (append-only, NEVER updated or deleted)
- `event_metadata` - Flexible JSONB context per event

**Memory System:**
- `memories` - Extracted insights, preferences, objections
- `memory_embeddings` - Vector search for future AI retrieval (Phase 2)
- `conversation_history` - Full transcripts linked to events

**Workflow State:**
- `workflow_executions` - Every n8n run tracked (success, failure, duration)
- `workflow_state` - Long-running process state (e.g., multi-day nurture campaigns)
- `task_queue` - Async job system (retry logic, dead letter queue)

**Scheduling:**
- `appointments` - Bookings, statuses (confirmed, pending, no-show, canceled), outcomes
- `availability_rules` - Provider calendars, blackout dates, buffer times
- `appointment_types` - Service catalog (exam, cleaning, consult, Invisalign, etc.)
- `scheduling_slots` - Pre-generated availability slots with is_available flag
- `providers` - Dentists/hygienists with name, title, schedule

**Communications:**
- `sms_messages` - Sent/received, linked to patients, delivery status
- `email_messages` - Same pattern as SMS
- `phone_calls` - Call metadata, recordings, transcriptions
- `call_sessions` - Individual call tracking (twilio_call_sid, lead_id, outcome)

**Insurance & AR (Phase 2):**
- `insurance_policies` - Patient coverage details
- `insurance_verifications` - Eligibility check results (active/inactive, copay, deductible)
- `claims` - Submission status, aging, denials, resubmission attempts
- `ar_items` - Receivables tracking (invoice date, amount, aging bucket)

**System:**
- `feature_flags` - Per-tenant feature toggles (enable/disable features without code deploy)
- `api_logs` - External API calls for cost tracking (Twilio, Vapi, insurance clearinghouses)
- `error_logs` - Failure tracking with stack traces
- `alerts` - Alert history (booking, missed_call, escalation) with idempotency
- `idempotency_keys` - Prevent duplicate events/alerts (composite key: tenant_id + operation_id)
- `schema_migrations` - Track database schema versions (id, version, applied_at, description)

**Design Principles:**
- JSONB for metadata (not relational data)
- Foreign key constraints enforced at database level
- Indexes on all FKs + common query fields (tenant_id, created_at, lead_id)
- Exclusion constraints to prevent double-booking (scheduling_slots)

---

## 6. Workflow Architecture (120+ Workflows)

### The Four Spines

**🧠 Brain Spine (Decision + Memory)**
- WF11: Immutable event ledger
- WF12-15: Understanding, memory, safety
- WF49-55: Learning, policy, rollback

**📞 Interaction Spine (Voice/SMS/Email)**
- WF16-17: Voice system
- WF24-26: SMS/email
- WF108: Universal outbox (all sends)

**🧾 Operations Spine (Scheduling, Intake, AR, Claims)**
- WF18-36: Appointments, intake, insurance, claims
- WF38-39: Money & attribution

**👤 Owner/Control Spine (UI, Slack, Governance)**
- WF40-42: Owner commands
- WF56-61: UI/RBAC
- WF76-78: Briefings, transparency

### Day 1-10 MVP Sprint Workflows (15 Critical)

**Infrastructure (Day 1):**
- WF106: Schema Auto-Builder (receives JSON blueprint, generates SQL, applies to Supabase)
- WF103: GitHub Auto-Export (exports workflows every 15 min, commits to repo)
- WF200-206: Project Management (Task Tracker, Daily Digest, Sprint Manager, Blocker Alert, Change Log)
- WF11: Event Logger (immutable conversation_events ledger)

**Identity & Calling (Days 2-4):**
- WF109: Identity Resolution (phone → lead_id mapping with normalization)
- WF16: Inbound Call Router (Twilio webhook handler, creates call_session)
- WF17: Voice Orchestrator (Vapi integration, transcript logging)

**Booking & Follow-Up (Days 5-8):**
- WF18: Scheduling Workflow (find slots, create appointments, handle double-booking)
- WF22: Call Wrap-Up (summarize, tag outcome, update lead status)
- WF42: Alerts (Slack notifications for bookings/missed calls/escalations)

### Workflow Execution Chains

**Inbound Call (Happy Path):**
```
WF16 (route) → WF109 (identity) → WF10 (consent check) → WF17 (live AI)
  → WF14 (load memory)
  → WF18 (tools: schedule)
  → WF22 (wrap-up)
  → WF11 (log event)
  → WF13 (update memory)
  → WF42 (send alert)
```

**Owner Command:**
```
WF40 (Slack/UI input) → WF58 (RBAC check)
  → WF77 (parse intent)
  → WF41 (execute)
  → WF11 (log)
  → WF42 (confirm to owner)
```

---

## 7. Legal Boundaries & Compliance

### What RevOS IS (Legally Safe)

**"Operational Automation Software for Healthcare Practices"**

RevOS automates **operational tasks** that staff currently perform manually:
- Answering phones
- Booking appointments
- Sending reminders
- Following up on missed calls
- Collecting patient intake forms
- Tracking insurance eligibility
- Reminding patients about outstanding balances

**Legal Classification:** Business software / workflow automation tool
**Regulatory Status:** Does NOT fall under medical device regulations (FDA), financial services (FINRA), or practice of medicine statutes

### What RevOS IS NOT (Legally Prohibited)

**NOT Medical Software:**
- We do NOT make clinical decisions
- We do NOT provide medical advice
- We do NOT interpret lab results or images
- We do NOT replace a doctor's judgment
- We do NOT alter treatment plans

**NOT Financial Software:**
- We do NOT custody patient funds
- We do NOT process credit card payments directly (Stripe does)
- We do NOT make lending decisions
- We do NOT hold deposits or escrow

**NOT Practice of Medicine:**
- We do NOT diagnose conditions
- We do NOT prescribe treatments
- We do NOT create doctor-patient relationships
- Our AI says: "Only a doctor can diagnose or treat medical conditions. I'm here to help schedule your appointment."

### Critical Guardrails (Hardcoded into System)

**1. AI Conversation Boundaries:**
- If patient asks medical question → "I'm not qualified to answer that. Let me schedule you with Dr. [Name] who can help."
- If patient reports emergency symptoms → "Please hang up and call 911. This is an emergency."
- If patient requests prescription refill → "Only the doctor can approve that. I'll make a note for Dr. [Name] to call you back."
- If patient asks about bill/payment plan → "I can help you with questions, but only Dr. [Name] can approve payment arrangements."

**2. Data Handling:**
- **Patient Memory ≠ Medical Records**
  - We store: "Patient prefers morning appointments," "Patient mentioned fear of needles," "Patient asked about Invisalign pricing"
  - We do NOT store: Clinical notes, diagnoses, treatment plans, prescriptions
- **Read Access Only to EHR/PMS:**
  - We READ from ModMed/Dentrix for context (upcoming appointments, patient name)
  - We WRITE BACK only: New appointments, updated contact info
  - We do NOT write to clinical notes or treatment plans
- **HIPAA Compliance:**
  - All data encrypted at rest (Supabase default AES-256)
  - TLS 1.3 for all API traffic
  - Business Associate Agreements (BAAs) with: Supabase, Twilio, Vapi, any AI providers processing transcripts
  - Audit logs for all PHI access (via WF11 event spine)
  - No data shared across tenants (RLS enforced)

**3. Positioning in Marketing & Sales:**
- **Good:** "RevOS automates your front desk operations"
- **Bad:** "RevOS replaces your receptionist" (implies employment/labor law issues)
- **Good:** "AI-powered scheduling and reminders"
- **Bad:** "AI that makes medical decisions"
- **Good:** "Operational software that reduces administrative burden"
- **Bad:** "Medical software" or "clinical tool"

### Contractual Protections

**Customer Agreement Includes:**
1. **Scope Limitation Clause:**
   - "RevOS is operational automation software. Customer is solely responsible for all clinical, financial, and medical decisions. RevOS does not practice medicine, provide medical advice, or make clinical determinations."

2. **Integration Clause:**
   - "RevOS integrates with Customer's existing EHR/PMS for operational efficiency. Customer maintains sole ownership and control of all clinical data. RevOS acts as a read-only integration except for scheduling updates."

3. **Liability Cap:**
   - "RevOS liability is capped at fees paid in the prior 12 months. RevOS is not liable for medical malpractice, HIPAA violations caused by Customer's misconfiguration, or clinical outcomes."

4. **HIPAA Business Associate Agreement (BAA):**
   - Required by law when handling PHI
   - Supabase, Twilio, Vapi all offer standard BAAs
   - RevOS signs BAA with each customer

### Risk Mitigation Checklist (Before Launch)

- [ ] Legal review of Terms of Service by healthcare attorney
- [ ] BAA templates signed with all infrastructure providers (Supabase, Twilio, Vapi)
- [ ] AI prompt includes medical disclaimer ("I cannot provide medical advice")
- [ ] System hardcoded to reject clinical questions (escalate to human)
- [ ] Privacy policy compliant with HIPAA, CCPA, GDPR
- [ ] Insurance: General liability ($2M), Errors & Omissions ($2M), Cyber liability ($1M)
- [ ] Annual security audit (penetration testing, vulnerability assessment)
- [ ] Quarterly legal review of new features (does this cross into medical/financial territory?)
- [ ] Incident response plan (data breach, HIPAA violation, patient complaint)
- [ ] Staff training on HIPAA, patient privacy, scope limitations

---

## 8. Front-End Platform: The 3 Critical Pages

### Page 1: TODAY (Revenue Protection Dashboard)

**Purpose:** Real-time visibility into revenue-generating activities

**What It Shows:**
- **Call Activity (Last 24 Hours):**
  - Total inbound calls: 47
  - Answered by AI: 45 (95.7%)
  - Missed calls: 2 (both called back within 60 sec)
  - Appointments booked: 12
  - Questions answered: 18
  - Escalated to staff: 3

- **Appointment Status (Today + Next 7 Days):**
  - Today: 18 appointments (2 confirmed, 3 pending, 1 no-show)
  - Tomorrow: 22 appointments (15 confirmed, 5 pending, 2 rescheduled)
  - This Week: 94 total appointments
  - Projected Revenue (This Week): $42,300

- **Revenue Alerts:**
  - 🟢 **Protected Revenue:** $8,400 (3 appointments booked in last hour)
  - 🟡 **At-Risk Revenue:** $2,100 (1 unconfirmed appointment tomorrow)
  - 🔴 **Lost Revenue:** $700 (1 no-show today, not rebooked yet)

- **Active Tasks:**
  - 2 missed calls to return (AI couldn't reach patient, needs human follow-up)
  - 1 complex insurance question (escalated from AI)
  - 3 intake forms incomplete (patient started but didn't finish)

**Why This Page Matters:**
- Quantifies RevOS value in dollars ("We protected $8,400 in revenue today")
- Creates urgency ("Fix these 2 at-risk appointments NOW")
- Builds dependency ("I check this every morning before seeing patients")

---

### Page 2: RULES (Control & Configuration)

**Purpose:** Practice owner controls AI behavior without needing to code

**What It Contains:**

**A. Conversation Rules:**
- **Greeting Script:** "Hi, thanks for calling [Practice Name]! I'm [AI Name], how can I help you?"
  - Editable text box (owner can customize)
  - Preview button (hear AI say it in different voices)
- **Office Hours:** Monday-Friday 9am-5pm, Saturday 9am-1pm, Closed Sundays
  - Drag-and-drop time picker
  - After-hours message: "We're currently closed. Would you like to schedule an appointment?"
- **Booking Rules:**
  - Same-day appointments: Allowed / Not Allowed (toggle)
  - New patient appointments: Require deposit / No deposit required
  - Buffer time between appointments: 10 minutes (dropdown)
  - Maximum appointments per day per provider: 20 (slider)
- **Escalation Rules:**
  - If patient mentions: "emergency," "severe pain," "bleeding" → Transfer to staff immediately
  - If AI can't answer after 3 attempts → Offer callback
  - If patient requests specific person → Transfer or take message

**B. Memory Settings:**
- What AI should remember:
  - ✅ Appointment preferences (time of day, provider)
  - ✅ Communication preferences (text vs call)
  - ✅ Service interests (mentioned Invisalign, whitening, etc.)
  - ❌ Medical conditions (we do NOT store clinical data)
- Memory retention: Keep for 2 years / Until patient opts out (toggle)

**C. Integrations:**
- **Calendar:** Google Calendar (connected ✅) | Outlook (not connected)
- **Phone:** Twilio +1 917 993 5081 (active)
- **Practice Management:** ModMed (connected ✅)
  - Sync frequency: Every 5 minutes (dropdown)
  - Sync direction: Read appointments, Write new bookings (checkboxes)
- **Slack:** #revos-alerts (connected ✅)
  - Notify on: New bookings, Missed calls, Escalations (checkboxes)

**D. AI Personality:**
- Voice: Female / Male (toggle)
- Tone: Professional / Friendly / Warm (slider)
- Speaking speed: Normal / Slower / Faster (dropdown)
- Accent: General American / Southern / British (dropdown - future feature)

**Why This Page Matters:**
- Gives owner control ("I can change how the AI sounds in 30 seconds")
- Prevents "black box" fear ("I know exactly what the AI will and won't do")
- Enables customization ("AI reflects my practice's brand")

---

### Page 3: MEMORY (The Moat)

**Purpose:** Show owner the AI's "knowledge" of patients - the competitive moat

**What It Shows:**

**A. Patient Memory Dashboard:**
- Search bar: "Type patient name or phone number"
- Example: Search "Sarah Johnson" → Pull up her memory profile:

**Sarah Johnson** | +1 555-0123 | Patient since March 2025
- **Appointment History:**
  - 3 appointments booked via AI (all confirmed, 0 no-shows)
  - Prefers: Tuesday afternoons, Dr. Chen
  - Last appointment: Cleaning on 4/15/2025
  - Next appointment: 6-month checkup on 10/15/2025 (already confirmed)

- **Communication Preferences:**
  - Prefers: Text reminders (said "I don't answer calls during work")
  - Best time to reach: After 5pm
  - Response rate: 95% (responds to texts within 1 hour)

- **Service Interests:**
  - Asked about Invisalign pricing on 3/12/2025
  - Mentioned sensitivity to cold (3/12/2025 call)
  - Referred by: Friend (mentioned "My friend Lisa recommended you")

- **Objections/Concerns:**
  - Worried about cost (asked "Do you have payment plans?" on 3/12/2025)
  - Insurance: Delta Dental (verified eligible on 3/10/2025)

- **AI Notes:**
  - "Patient is friendly and easy to schedule. Always confirms promptly."
  - "Mentioned she has 2 kids - might be interested in family packages."

**B. Memory Insights (Aggregate Data):**
- **Total Patients with Memory:** 1,247
- **Average Memory Depth:** 4.2 interactions per patient
- **Most Common Preferences:**
  - 67% prefer text over call
  - 43% prefer morning appointments (8-11am)
  - 31% ask about payment plans (opportunity for financing offer)
- **Top Service Interests:**
  - Invisalign: 18% of patients asked
  - Teeth whitening: 24% of patients asked
  - Implants: 9% of patients asked

**C. Memory-Driven Actions:**
- **Proactive Outreach Ideas** (AI-generated):
  - "147 patients asked about Invisalign → Run Invisalign promo campaign?"
  - "83 patients prefer Saturday appointments → Add Saturday availability?"
  - "52 patients mentioned payment plans → Offer financing options?"

**Why This Page Matters:**
- **The Moat:** Competitors don't have this data
  - Weave/Hello Patient: Transactional logs ("call received, reminder sent")
  - RevOS: Behavioral insights ("patient prefers Dr. Chen, worries about cost, interested in Invisalign")
- **Switching Cost:** After 6 months, RevOS knows 500+ patients intimately
  - Practice can't switch to competitor without losing this intelligence
  - "The AI knows my patients better than my front desk staff"
- **Revenue Opportunities:** Memory reveals upsell opportunities
  - "18% asked about Invisalign → that's $200k in potential revenue"

**Tech Stack (Dashboard):**
- MVP: Retool for Today + Rules pages (Days 21-25)
- Memory page: Custom build with Next.js (Days 26-30)
- Production: Next.js + Tailwind + Supabase (fully custom, white-labelable)

---

## 9. Phase 1 vs Phase 2 Product Roadmap

### Why Phase 1 MUST Come First (0-500 Customers)

**Phase 1: Inbound Revenue OS ($2k/month)**

**Timeline:** Day 1-90 (3 months to full Phase 1 feature set)

**What It Solves:**
- Missed calls = lost revenue (practices lose $50k-$200k/year)
- Manual scheduling = wasted staff time (5-10 hours/week)
- No-shows = lost production (15-25% of appointments)
- Inconsistent follow-up = leaky funnel

**Core Features:**
- AI phone answering (24/7, never misses a call)
- Intelligent appointment booking (checks availability, handles rescheduling)
- SMS/email confirmations and reminders (3-day, 1-day, 2-hour)
- Intake form automation (eliminate clipboards)
- Missed call recovery (AI calls back within 60 seconds)
- Owner dashboard: Today (revenue protection), Rules (control), Memory (the moat)
- Slack alerts for bookings, missed calls, escalations

**Value Proposition:**
- "Never miss another call. Book 20-30% more new patients."
- Immediate ROI: Saves 10 hours/week staff time + books 5-10 extra appointments/month
- Payback period: 2-3 months

**Why Build This First:**
1. **Fastest Path to Revenue:** Practices see value in Week 1 (first call booked)
2. **Simplest to Sell:** Problem is obvious ("You're missing calls right now"), solution is clear ("AI answers every call")
3. **Lowest Technical Risk:** Voice AI (Vapi) is mature, scheduling logic is deterministic
4. **Builds the Foundation:** Event logging, memory system, identity resolution all needed for Phase 2
5. **Creates Lock-In:** Once AI is answering calls, practices cannot turn it off without losing revenue

---

### Why Phase 2 Waits Until 500+ Customers

**Phase 2: AR Automation Layer ($1.5k-$3k/month additional)**

**Timeline:** Month 7-9 (after 500 customers, 6-9 months total from Day 1)

**What It Solves:**
- Slow insurance claim payments (45-90 day cycles)
- High claim denial rates (10-15% of claims denied)
- Aging accounts receivable (30-40% of revenue uncollected after 90 days)
- Manual collections = staff burnout

**Core Features:**
- Insurance eligibility verification (real-time API checks)
- Claims tracking and aging (sync with clearinghouse)
- AI claim follow-ups (calls insurance companies on Day 30, 45, 60)
- Denial triage (auto-resubmit with corrections or escalate to billing staff)
- Patient AR outreach (friendly payment reminders via SMS/email)
- Payment plan manager (installment agreements)
- Collections cadence (escalating reminders, final notices)
- Revenue reconciliation (track dollars from appointment → payment)

**Value Proposition:**
- "Get paid 20-30 days faster. Reduce AR aging by 20-40%."
- Expanded moat: Now RevOS owns BOTH revenue generation (Phase 1) and revenue collection (Phase 2)
- Higher ARPU: $2k → $3.5k-$5k/month per customer

**Why Wait Until 500 Customers:**
1. **Technical Complexity:** Claims automation requires:
   - Clearinghouse integrations (Trizetto, Change Healthcare, Availity)
   - Insurance company phone trees (AI needs to navigate IVR systems)
   - Denial code interpretation (230+ denial reason codes)
   - Payment posting back to PMS
   - Significantly harder than Phase 1

2. **Sales Complexity:** Harder to sell
   - Problem is less visible ("AR aging is bad" vs "you just missed a call right now")
   - Longer sales cycle (CFO/billing manager involved, not just doctor/office manager)
   - Requires trust (they won't let you touch their money until Phase 1 proves you're reliable)

3. **Resource Intensity:**
   - Phase 1: 90% n8n workflows, 10% custom code
   - Phase 2: 60% n8n workflows, 40% custom code (claims API integrations, denial logic)
   - Need specialized developer (healthcare billing experience)
   - Need compliance expertise (HIPAA, claims regulations)

4. **Market Validation:**
   - Phase 1 proves we can deliver operational automation
   - 500 customers = $1M MRR = proof we can scale
   - Only THEN raise capital or hire team for Phase 2 complexity

5. **Competitive Moat:**
   - Phase 1 alone is defensible (memory system, AI quality)
   - Phase 2 creates **dual dependency** (they can't turn off either module)
   - Competitors like Zentist/eAssist only do Phase 2 → we'll own entire cycle

### The Sequencing Logic (Non-Negotiable)

| Milestone | Action | Why |
|-----------|--------|-----|
| **Day 1-10** | Build Phase 1 MVP (AI receptionist) | Get to beta customers fast |
| **Day 11-90** | Expand Phase 1 features (SMS, email, intake, dashboard) | Build complete Inbound Revenue OS |
| **Customers 1-100** | Validate Phase 1, gather usage data, refine memory system | Learn what works, fix what breaks |
| **Customers 100-500** | Scale Phase 1, build sales team (6-8 reps), hit $1M MRR | Prove business model, establish market position |
| **Month 4-6** | Design Phase 2 (AR Automation), hire specialized developer | Only start when Phase 1 is rock-solid |
| **Month 7-9** | Build Phase 2 MVP (claims tracking, AI follow-ups, patient AR) | Expand to back-end revenue cycle |
| **Customers 500-1,000** | Upsell Phase 2 to existing base (30-50% attach rate expected) | Dual dependency = 95%+ retention |
| **Month 10-12** | Scale Phase 2, raise Series A ($5-10M) on $2-3M ARR | Become category leader in dental revenue infrastructure |

---

## 10. Security & Monitoring

### HIPAA Considerations
- PHI in database encrypted at rest (Supabase default AES-256)
- TLS 1.3 for all API traffic
- Audit logs for all PHI access (via WF11 event spine)
- Business Associate Agreements (BAAs) with: Supabase, Twilio, Vapi/Bland, any AI providers processing transcripts

### Multi-Tenant Isolation
- Row-Level Security (RLS) policies in Supabase
- Every query automatically filtered by `tenant_id`
- No cross-tenant data leakage possible
- API keys scoped per tenant

### Authentication & Authorization
- Staff login: Supabase Auth (email/password + MFA)
- Patient identity: Phone number + SMS verification
- RBAC via WF58: Admin, Staff, Billing, Read-Only

### Monitoring & Reliability

**Health Checks:**
- Every 5 minutes: Ping critical workflows
- Alert if >5 errors/hour in any workflow
- Alert if >10% failure rate
- Alert if external API down (Twilio, Vapi, etc.)

**Alerting Channels:**
- PagerDuty for critical (system down)
- Slack for warnings (elevated errors)
- Email digest for daily summaries

**Backup Strategy:**
- Database: Supabase automatic hourly backups (7-day retention)
- Workflows: Daily Git export via WF103
- Credentials: Encrypted in 1Password/Vault

**Graceful Degradation:**
- If Vapi down → voicemail + SMS callback queue
- If Twilio rate limited → Telnyx fallback
- If AI intent unclear → human review queue
- If external API slow → cache last known good value

---

## 11. Credentials Reference

**RevOS Production Credentials (Non-Sensitive Info)**

**SUPABASE:**
- Project URL: https://vjnvddebjrrcgrapuhvn.supabase.co
- Project ID: vjnvddebjrrcgrapuhvn
- DB Host: db.vjnvddebjrrcgrapuhvn.supabase.co
- DB Port: 6543
- Anon Key: sb_publishable_GSei-8rGkFUJ-sbXmJWquw_3Cci2aNu
- Service Role Key: (stored in 1Password - SECRET - never commit)
- DB Password: (stored in 1Password - SECRET)

**N8N CLOUD:**
- Instance URL: https://valiansystems.app.n8n.cloud/
- API Key: (stored in 1Password - SECRET)

**TWILIO:**
- Account SID: (stored in 1Password - SECRET)
- Auth Token: (stored in 1Password - SECRET)
- Phone Number: +1 917 993 5081

**SLACK:**
- Workspace: Valian Systems
- #revos-build channel ID: C0ADXPPPHK2
- #revos-alerts channel ID: C0AD73LFHE0
- #revos-alerts Webhook: (stored in 1Password - SECRET)
- #revos-build Webhook: (stored in 1Password - SECRET)
- Slack App: RevOS
- Bot Token: (stored in 1Password - SECRET)
- Signing Secret: (stored in 1Password - SECRET)
- Team ID: T0A30GW2Y10

**OPENAI:**
- API Key: (stored in 1Password - SECRET)
- Used for: Whisper voice transcription in WF42

**VAPI (Day 4 - TBD):**
- API Key: (stored in 1Password - SECRET)
- Assistant ID: (TBD)
- Phone Number ID: (TBD)

**GITHUB:**
- Repo: https://github.com/Valian-Systems/Valian-RevOS/
- PAT: (stored in 1Password - SECRET)

**DO NOT put actual secrets in this file or commit to GitHub.**

---

## 12. Current Status & Next Steps

**Last Updated:** 2026-02-06
**Current Phase:** Day 1 - Foundation & Automation Infrastructure

**Completed:**
- ✅ All accounts created (Supabase, n8n, Twilio, Slack, GitHub)
- ✅ Credentials stored in password manager
- ✅ Plan approved with full strategic context
- ✅ claude.md created (this file)

**Next Steps (Today):**
1. Set up Claude Code integration (n8n MCP server + Skills) - **USER ACTION REQUIRED**
2. Create `schema_migrations` bootstrap table in Supabase
3. Build WF106 Schema Builder workflow
4. Deploy foundation schema (10 tables) via WF106
5. Build WF103 GitHub Auto-Export workflow
6. Build WF200-206 Project Management workflows
7. Build WF11 Event Logger workflow
8. Verify: All workflows committed to GitHub, first daily digest received

**Day 1 Goal:**
- By end of day: Supabase with 12 tables, n8n with 8 workflows, GitHub auto-syncing every 15 minutes, Slack receiving daily digests

---

## 13. Critical Success Factors

**What Will Make or Break This:**

1. **Database Design (Get This Right First)**
   - Multi-tenancy MUST be baked in (can't be bolted on)
   - 2 weeks with architect recommended, but proceeding solo with careful validation

2. **Workflow Naming & Organization**
   - Convention: WF-[CATEGORY]-[NUMBER] (e.g., WF-SMS-024)
   - Every workflow has description node in n8n
   - workflow-registry.json auto-generated by WF103

3. **Event Logging (Your Moat)**
   - Log EVERYTHING: Calls, SMS, clicks, API calls, errors
   - Immutable ledger (append-only `events` table)
   - Value: Audit trail + analytics + debugging + RL training data

4. **Incremental Validation**
   - Build 5, test with real customer, iterate
   - Each phase has "can we sell this?" moment
   - Better: 30 rock-solid workflows than 120 buggy ones

5. **Operational Excellence > Features**
   - Reliability first, then add features
   - Retention depends on "it just works"
   - RevOS is infrastructure, not a toy

---

## 14. Day 1-10 Detailed Execution Guide

### THE FULL PICTURE

Day 1 isn't just about database and workflows. It's about building the entire operating system that runs this project. By end of Day 1, you should have:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REVOS BUILD INFRASTRUCTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHEMA LAYER                 WORKFLOW LAYER              VERSION CONTROL   │
│  ────────────                 ──────────────              ───────────────   │
│  WF106 Schema Builder         n8n Instance                WF103 GitHub Sync │
│  Supabase Postgres            Workflow Library            Auto-commit       │
│  Migration Ledger             Credential Store            Branch Management │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PROJECT MANAGEMENT           COMMUNICATION               MONITORING        │
│  ──────────────────           ─────────────               ──────────────    │
│  WF200 Task Tracker           WF201 Daily Digest          WF204 Health Check│
│  WF202 Sprint Manager         Slack #revos-build          WF205 Error Alert │
│  Notion/Supabase Tasks        Email Summaries             Uptime Monitoring │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DOCUMENTATION                AI COORDINATION             AUDIT             │
│  ─────────────                ───────────────             ─────             │
│  WF104 Auto-Doc Generator     Claude Context Sync         WF206 Change Log  │
│  README auto-update           Conversation Memory         Decision Ledger   │
│  API docs from schema         Task Handoff State          Time Tracking     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Day 1 Automation Workflows (Complete List)

**Infrastructure Tier (Must Have)**

| WF# | Name | Purpose | Priority |
|-----|------|---------|----------|
| WF106 | Schema Auto-Builder | Claude sends blueprint → Supabase builds tables | CRITICAL |
| WF103 | GitHub Auto-Export | All workflows auto-commit to repo | CRITICAL |
| WF11 | Event Logger | Core audit trail for everything | CRITICAL |

**Project Management Tier (Should Have)**

| WF# | Name | Purpose | Priority |
|-----|------|---------|----------|
| WF200 | Task Tracker | Internal todo list with status, owner, due dates | HIGH |
| WF201 | Daily Digest | End-of-day summary sent to Slack/email | HIGH |
| WF202 | Sprint Manager | 10-day sprint with milestones, burndown tracking | HIGH |
| WF203 | Blocker Alert | If a task is stuck >4 hours, alert immediately | MEDIUM |

**Documentation Tier (Nice to Have Day 1)**

| WF# | Name | Purpose | Priority |
|-----|------|---------|----------|
| WF206 | Change Log | Daily log of what changed (schema, workflows, code) | MEDIUM |

**Monitoring Tier (Can Add Day 2)**

| WF# | Name | Purpose | Priority |
|-----|------|---------|----------|
| WF204 | Health Check | Verify all systems running (n8n, Supabase, Twilio) | MEDIUM |
| WF205 | Error Alert | Any workflow failure → immediate Slack alert | MEDIUM |

### WF200 — Task Tracker

**What It Does:**
A simple but complete task management system that lives in Supabase and is operated through n8n. Claude can create tasks, you can update them, and everything syncs to a Slack channel.

**Database Schema (deployed via WF106):**

```sql
-- Build tasks
CREATE TABLE build_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Task identity
    title           TEXT NOT NULL,
    description     TEXT,
    task_type       TEXT NOT NULL DEFAULT 'task'
                    CHECK (task_type IN ('task', 'bug', 'feature', 'research', 'review')),

    -- Hierarchy
    parent_task_id  UUID REFERENCES build_tasks(id),  -- subtasks
    sprint_day      INT CHECK (sprint_day BETWEEN 1 AND 10),  -- which day of the 10-day sprint

    -- Assignment
    owner           TEXT NOT NULL DEFAULT 'claude',  -- 'claude', 'robert', 'system'

    -- Status
    status          TEXT NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo', 'in_progress', 'blocked', 'in_review', 'done', 'cancelled')),
    blocked_reason  TEXT,  -- why it's blocked (if status = 'blocked')

    -- Priority
    priority        TEXT NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('critical', 'high', 'medium', 'low')),

    -- Timing
    estimated_hours DECIMAL(4,1),
    actual_hours    DECIMAL(4,1),
    due_date        DATE,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,

    -- Dependencies
    depends_on      UUID[],  -- array of task IDs that must complete first

    -- Metadata
    tags            TEXT[],  -- ['database', 'workflow', 'voice', etc.]
    notes           TEXT,

    -- Audit
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      TEXT NOT NULL DEFAULT 'claude'
);

CREATE INDEX idx_tasks_status ON build_tasks(status);
CREATE INDEX idx_tasks_sprint_day ON build_tasks(sprint_day);
CREATE INDEX idx_tasks_owner ON build_tasks(owner);
CREATE INDEX idx_tasks_priority ON build_tasks(priority, status);
```

**How It Works:**

Claude creates tasks:
```json
{
  "action": "create_task",
  "task": {
    "title": "Build WF109 Identity Resolution",
    "description": "Workflow that maps phone number to lead_id, creates if missing",
    "task_type": "feature",
    "sprint_day": 2,
    "owner": "claude",
    "priority": "high",
    "estimated_hours": 2,
    "depends_on": ["<WF11_task_id>"],
    "tags": ["workflow", "identity", "mvp"]
  }
}
```

You update status via Slack:
```
/task done WF109
/task blocked WF17 "waiting for Vapi API key"
/task review WF18
```

Or Claude updates via WF200:
```json
{
  "action": "update_task",
  "task_id": "...",
  "status": "done",
  "actual_hours": 1.5,
  "completed_at": "2026-02-04T18:30:00Z"
}
```

**Views You Get:**

Sprint Board (by day):
```
DAY 1                    DAY 2                    DAY 3
─────                    ─────                    ─────
✅ WF106 Schema Builder  🔄 WF109 Identity        ⬜ WF16 Call Router
✅ WF103 GitHub Export   ⬜ Test identity flow    ⬜ Twilio config
🔄 WF11 Event Logger     ⬜ Edge case handling    ⬜ Test inbound calls
⬜ WF200 Task Tracker
⬜ WF201 Daily Digest
```

Burndown:
```
Day 1: 8 tasks planned, 5 done, 2 in progress, 1 blocked
Day 2: 4 tasks planned, 0 done (not started)
```

### WF201 — Daily Digest

**What It Does:**
Every day at a scheduled time (e.g., 6 PM your timezone), WF201 runs and sends you a summary of everything that happened that day.

**The Digest Includes:**
```
═══════════════════════════════════════════════════════════════
REVOS BUILD — DAILY DIGEST — DAY 1 (Feb 4, 2026)
═══════════════════════════════════════════════════════════════

📊 SPRINT STATUS
   Day 1 of 10 | 5 of 8 tasks complete | On track ✅

✅ COMPLETED TODAY
   • WF106 Schema Auto-Builder deployed
   • WF103 GitHub Auto-Export deployed
   • Foundation schema (10 tables) created via WF106
   • Demo tenant seeded
   • WF11 Event Logger deployed and tested

🔄 IN PROGRESS
   • WF200 Task Tracker — 80% complete, finishing task creation API
   • WF201 Daily Digest — this workflow, testing now

🚫 BLOCKED
   • None

📝 SCHEMA CHANGES
   • Migration 001_foundation_schema applied
   • Tables created: tenants, leads, call_sessions, conversation_events,
     appointments, scheduling_slots, providers, alerts, idempotency_keys,
     schema_migrations

🔀 GITHUB COMMITS
   • 3 commits to main branch
   • Files: WF106.json, WF103.json, WF011.json, 001_foundation_schema.sql

⏰ TIME TRACKED
   • Claude: 4.5 hours
   • Robert: 2 hours (setup, credential config, testing)
   • Total: 6.5 hours

📅 TOMORROW (DAY 2)
   • WF109 Identity Resolution
   • Test: new caller → new lead
   • Test: returning caller → same lead
   • Edge case handling

⚠️ RISKS / NOTES
   • None identified

═══════════════════════════════════════════════════════════════
```

**Delivery Options:**
- **Slack** — posts to #revos-build channel
- **Email** — sends to your email
- **Both** — Slack for quick view, email for archive

**Trigger Options:**
- **Scheduled** — runs at 6 PM daily automatically
- **On-demand** — you type /digest in Slack and it runs immediately
- **On sprint day complete** — when all tasks for a day are done

### WF202 — Sprint Manager

**What It Does:**
Manages the 10-day sprint lifecycle:
1. Loads the day's tasks when the day starts
2. Tracks progress throughout the day
3. Detects if we're falling behind
4. Adjusts the plan if needed

**Sprint Configuration:**
```json
{
  "sprint": {
    "name": "MVP Sprint 1",
    "start_date": "2026-02-04",
    "end_date": "2026-02-13",
    "days": 10,
    "working_hours_per_day": 4,
    "goals": [
      "Inbound call → AI answers → books appointment → alerts owner",
      "Every call logged in conversation_events",
      "Demo video recorded"
    ]
  },
  "milestones": [
    {"day": 1, "name": "Infrastructure Complete", "tasks": ["WF106", "WF103", "WF11"]},
    {"day": 3, "name": "Calls Hit System", "tasks": ["WF16", "WF109", "Twilio"]},
    {"day": 6, "name": "End-to-End Booking", "tasks": ["WF17", "WF18", "Integration"]},
    {"day": 10, "name": "Demo Ready", "tasks": ["Hardening", "Recording", "Lock"]}
  ]
}
```

**Daily Sprint Check (runs at 9 AM):**
```
═══════════════════════════════════════════════════════════════
SPRINT CHECK — DAY 2 START
═══════════════════════════════════════════════════════════════

📍 WHERE WE ARE
   Day 2 of 10 | MVP Sprint 1

📋 TODAY'S TASKS
   1. [ ] WF109 Identity Resolution (owner: claude, est: 2h)
   2. [ ] Test new caller flow (owner: robert, est: 0.5h)
   3. [ ] Test returning caller flow (owner: robert, est: 0.5h)
   4. [ ] Edge case handling (owner: claude, est: 1h)

⚡ DEPENDENCIES
   • WF109 depends on WF11 ✅ (complete)

🎯 TODAY'S GOAL
   "When a phone number comes in, we can identify or create the lead"

📊 SPRINT HEALTH
   Velocity: on track
   Burndown: 5/40 tasks complete (12.5%)
   Expected: 8/40 by end of Day 1 → we're slightly ahead ✅

═══════════════════════════════════════════════════════════════
```

**Falling Behind Detection:**
If by noon, less than 50% of the day's tasks are started:
```
⚠️ SPRINT ALERT — DAY 2

Progress check (12:00 PM):
- 0 of 4 tasks started
- Expected: at least 2 tasks in progress by now

Possible causes:
- Blocker not reported?
- Scope creep?
- Waiting on something?

Action needed: Update task status or report blocker
```

### WF203 — Blocker Alert

**What It Does:**
If any task has status = 'blocked' for more than 4 hours without resolution, WF203 sends an immediate alert.

```
🚨 BLOCKER ALERT

Task: WF17 Voice Orchestrator
Blocked for: 4 hours 23 minutes
Reason: "Waiting for Vapi API key"
Owner: Claude

This is blocking:
- WF18 Scheduling integration
- WF22 Call Wrap-Up
- Day 4, 5, 6 tasks

Suggested action:
- Robert: Check Vapi account for API key
- If no key available, consider switching to Retell
```

### WF206 — Change Log

**What It Does:**
Automatically logs every change across the system into a single audit table. You can query "what changed yesterday?" and get a complete answer.

**Change Types Tracked:**
```sql
CREATE TABLE change_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- What changed
    change_type     TEXT NOT NULL
                    CHECK (change_type IN (
                        'schema_migration',    -- WF106 ran
                        'workflow_created',    -- new workflow in n8n
                        'workflow_updated',    -- existing workflow modified
                        'workflow_deleted',    -- workflow removed
                        'github_commit',       -- WF103 pushed to GitHub
                        'task_created',        -- new build task
                        'task_status_change',  -- task moved status
                        'config_change',       -- credentials, settings changed
                        'error',               -- something failed
                        'manual_intervention'  -- Robert did something manually
                    )),

    -- Details
    entity_type     TEXT,  -- 'workflow', 'table', 'task', 'credential'
    entity_id       TEXT,  -- WF106, leads, task-uuid, etc.
    entity_name     TEXT,  -- human readable

    -- What happened
    description     TEXT NOT NULL,
    details         JSONB,  -- full payload of the change

    -- Who/what made the change
    actor           TEXT NOT NULL,  -- 'claude', 'robert', 'wf106', 'wf103', 'system'

    -- Timing
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_changelog_type ON change_log(change_type, occurred_at DESC);
CREATE INDEX idx_changelog_date ON change_log(occurred_at DESC);
CREATE INDEX idx_changelog_actor ON change_log(actor);
```

**Example Entries:**

| occurred_at | change_type | entity_name | description | actor |
|-------------|-------------|-------------|-------------|-------|
| 10:15 AM | schema_migration | 001_foundation | Created 10 tables, 15 indexes | wf106 |
| 10:32 AM | workflow_created | WF011 | Event Logger deployed | claude |
| 10:33 AM | github_commit | main | Added WF011_event_logger.json | wf103 |
| 11:45 AM | task_status_change | WF106 task | Status: in_progress → done | claude |
| 2:30 PM | error | WF103 | GitHub push failed: auth error | wf103 |
| 2:35 PM | manual_intervention | GitHub credential | Robert updated PAT token | robert |
| 2:36 PM | github_commit | main | Retry successful after credential fix | wf103 |

### Day 1 Execution Blocks (Final)

**Block A: Accounts + Credentials (1 hour)**
- Supabase, n8n, Twilio, Slack, GitHub accounts
- All credentials in password manager
- All credentials added to n8n

**Block B: Claude ↔ n8n Connection (30 min – 1 hour)**
- n8n MCP skill uploaded
- Connection tested
- Or: manual import fallback confirmed

**Block C: WF106 Schema Builder (1.5 hours)**
- WF106 deployed
- schema_migrations table created
- Foundation schema deployed via WF106
- Demo tenant seeded

**Block D: WF103 GitHub Sync (1 hour)**
- WF103 deployed
- Connected to GitHub repo
- Test workflow auto-committed
- Running on 15-minute schedule

**Block E: Project Management (2 hours)**
- build_tasks table created via WF106
- change_log table created via WF106
- WF200 Task Tracker deployed
- WF201 Daily Digest deployed
- WF202 Sprint Manager deployed
- WF203 Blocker Alert deployed
- WF206 Change Log deployed
- Sprint 1 tasks loaded

**Block F: WF11 + Verification (1 hour)**
- WF11 Event Logger deployed
- Test event written successfully
- Idempotency verified
- All workflows auto-committed to GitHub
- Daily digest sent (first one!)

**TOTAL: 7–9 hours**

### Day 1 Deliverables Checklist

**In Supabase:**
- 10 product tables (foundation schema)
- 2 infrastructure tables (build_tasks, change_log)
- 1 system table (schema_migrations)
- Demo tenant with provider and scheduling slots
- Test events in conversation_events

**In n8n:**
- WF106 Schema Auto-Builder
- WF103 GitHub Auto-Export
- WF200 Task Tracker
- WF201 Daily Digest
- WF202 Sprint Manager
- WF203 Blocker Alert
- WF206 Change Log
- WF11 Event Logger

**In GitHub:**
- All SQL migrations
- All workflow JSON files
- Documentation files
- Automatically updated

**In Slack:**
- #revos-build channel receiving: Task updates, Blocker alerts, Daily digests, Error notifications

### Daily Rhythm After Day 1

```
9:00 AM  — Sprint Check arrives (WF202)
           "Here's what's planned for today"
           You review, adjust priorities if needed

DURING DAY — Claude builds
             You test
             Tasks update automatically
             Changes log automatically
             GitHub commits automatically

             If blocked → alert within 4 hours (WF203)
             If error → immediate Slack (WF205)

6:00 PM  — Daily Digest arrives (WF201)
           "Here's what happened today"
           "Here's what's planned tomorrow"
           You review, flag any concerns

OVERNIGHT — System is quiet
            Scheduled exports run
            Health checks run (future)
```

### Order of Operations for Day 1

This is the exact sequence Claude will follow:
1. Create schema_migrations table (manual SQL, one time bootstrap)
2. Deploy WF106 (Schema Builder)
3. Use WF106 to create: build_tasks, change_log tables
4. Use WF106 to create: foundation schema (10 product tables)
5. Use WF106 to seed: demo tenant
6. Deploy WF103 (GitHub Sync)
7. Deploy WF200 (Task Tracker)
8. Deploy WF201 (Daily Digest)
9. Deploy WF202 (Sprint Manager)
10. Deploy WF203 (Blocker Alert)
11. Deploy WF206 (Change Log)
12. Deploy WF11 (Event Logger)
13. Load Sprint 1 tasks into build_tasks
14. Run first Daily Digest (confirms everything works)
15. Verify all workflows committed to GitHub

If any step fails, we stop, diagnose, fix, then continue. No moving forward with broken infrastructure.

---

### Day 2 — Identity Resolution (WF109)

**GOAL:** By end of day: when a phone number comes in, the system either finds the existing lead or creates a new one. Every resolution is logged.

**What You Do:**
1. Import the WF109 workflow JSON into n8n
2. **Test Case 1 — New caller:**
   - Trigger WF109 with phone: "+15551234567", tenant_id: "00000000-0000-0000-0000-000000000001"
   - Check Supabase → leads table → new row should exist
   - Check conversation_events → "identity.resolved" event with payload showing "created: true"
3. **Test Case 2 — Returning caller:**
   - Trigger WF109 again with the SAME phone number
   - Check leads table → still only ONE row (not duplicated)
   - Check conversation_events → new "identity.resolved" event with "created: false"
4. **Test Case 3 — Different tenant isolation:**
   - If you create a second test tenant, the same phone number should create a separate lead

**What Claude Builds:**
- WF109 Identity Resolution n8n workflow JSON
- Test payloads for all three test cases
- Supabase function for upsert-or-find lead (if needed)

**Verify Before Moving On:**
- [ ] New phone → new lead created
- [ ] Same phone → same lead returned (no duplicate)
- [ ] Every resolution logged in conversation_events
- [ ] lead_id is returned and usable by downstream workflows

---

### Day 3 — Inbound Call Router (WF16) + Twilio Configuration

**GOAL:** By end of day: when someone calls your Twilio number, n8n receives the webhook, creates a call_session, resolves identity, and logs everything. The call itself won't have AI yet — that's Day 4.

**What You Do:**

**Morning: Twilio Configuration**
1. Log into Twilio Console (https://console.twilio.com)
2. Go to Phone Numbers → Manage → Active Numbers → click your number
3. Under "Voice Configuration":
   - "A Call Comes In": Webhook
   - URL: your n8n webhook URL for WF16 (I'll provide the exact path)
   - HTTP Method: POST
4. Under "Call Status Changes":
   - URL: your n8n webhook URL for call status updates
5. Save

**Afternoon: Test Real Calls**
1. Import WF16 workflow JSON into n8n
2. Make sure WF16's webhook is active in n8n (it shows a "listening" URL)
3. Call your Twilio number from your personal phone
4. Check n8n → WF16 should have executed
5. Check Supabase: call_sessions → new row, leads → new/existing row, conversation_events → "call.inbound" event

**Also Today: Update Demo Tenant**
```sql
UPDATE tenants
SET phone_number = '+1XXXXXXXXXX'  -- your Twilio number
WHERE id = '00000000-0000-0000-0000-000000000001';
```

**What Claude Builds:**
- WF16 Inbound Call Router n8n workflow JSON
- Twilio webhook payload documentation
- TwiML response for Day 3 (simple "please hold" or "thank you for calling")
- Call status webhook handler

**Verify Before Moving On:**
- [ ] Calling Twilio number → n8n WF16 fires
- [ ] call_session created with correct twilio_call_sid
- [ ] Lead resolved (WF109 called successfully)
- [ ] Events logged (call.inbound, identity.resolved)
- [ ] Tenant phone_number updated

---

### Day 4 — Voice Orchestrator Skeleton (WF17)

**GOAL:** By end of day: when someone calls, the AI answers with the practice greeting and can hold a basic conversation. No booking yet — just talk.

**What You Do:**

**Morning: Voice Provider Setup**
1. Choose your voice AI provider (Vapi, Retell, or direct build)
2. Configure the provider:
   - Connect it to your Twilio number
   - Set up the AI assistant with the system prompt
   - Configure ASR (speech-to-text) settings
   - Configure TTS (text-to-speech) voice selection
3. The provider handles the real-time voice loop:
   - Caller speaks → ASR → text
   - Text → AI brain → response text
   - Response text → TTS → speech back to caller

**Afternoon: Integration + Testing**
1. Import WF17 workflow JSON into n8n
2. Connect WF17 to the voice provider's webhook/API
3. Test call flow:
   - Call your number
   - AI should answer: "Hi, thanks for calling Bright Smile Dental! How can I help you today?"
   - Say: "I'd like to book an appointment" → AI should acknowledge (but NOT actually book yet)
   - Say: "What are your hours?" → AI should answer from tenant config
4. Check that every utterance is logged via WF11

**What Claude Builds:**
- WF17 Voice Orchestrator n8n workflow JSON
- Voice AI system prompt (personality, rules, boundaries)
- Intent classification prompt
- Integration guide for chosen voice provider

**Verify Before Moving On:**
- [ ] Call → AI answers with practice greeting
- [ ] AI can hold basic conversation (greet, answer hours, handle "I don't know")
- [ ] Every utterance logged in conversation_events
- [ ] Intent is detected and logged
- [ ] Call ends cleanly (no infinite loops, no crashes)

---

### Day 5 — Scheduling Logic (WF18)

**GOAL:** By end of day: the scheduling workflow can find available slots, create appointments, and mark slots as booked. Not connected to voice yet — tested independently.

**What You Do:**
1. Import WF18 workflow JSON into n8n
2. **Test Case 1 — Happy path booking:**
   - Input: tenant_id, lead_id, provider_id, requested date ("tomorrow")
   - WF18 finds next available slot → creates appointment → marks slot as booked → logs booking.created event
   - Returns confirmation: "Dr. Chen, tomorrow at 2:00 PM"
3. **Test Case 2 — No availability:**
   - Book all slots for a given day (or use a day with no slots)
   - WF18 should return: "No availability on that day, would another day work?"
4. **Test Case 3 — Double-booking prevention:**
   - Try to book the same slot twice
   - PostgreSQL exclusion constraint should block it
   - WF18 should handle the error gracefully

**What Claude Builds:**
- WF18 Scheduling n8n workflow JSON
- Slot-finding SQL query (next available for provider + tenant)
- Appointment creation with idempotency protection
- Error handling for no-availability and double-booking scenarios

**Verify Before Moving On:**
- [ ] Available slot found and returned correctly
- [ ] Appointment created in database
- [ ] Slot marked as unavailable
- [ ] Double-booking blocked by database constraint
- [ ] No-availability handled gracefully (no crash)
- [ ] All actions logged in conversation_events

---

### Day 6 — Connect Voice to Booking (WF17 → WF18)

**GOAL:** By end of day: the end-to-end happy path works. Call → AI answers → caller says "book appointment" → AI finds slot → confirms → books. This is your core demo.

**What You Do:**
1. Update WF17 to call WF18 when booking intent is detected
2. Update the voice AI prompt to handle the booking conversation:
   - "When would you like to come in?"
   - "I have an opening tomorrow at 2 PM with Dr. Chen. Would that work?"
   - "Great, you're all set for tomorrow at 2 PM. We'll see you then!"
3. Test the full flow — call your number:
   - AI greets you → You say: "I'd like to book a cleaning" → AI asks when → You say: "Tomorrow afternoon" → AI offers a specific slot → You confirm → AI confirms back
4. Do this 5 times with slight variations:
   - "Book an appointment"
   - "I need to see the dentist"
   - "Can I come in this week?"
   - "Do you have anything tomorrow?"
   - "I need a cleaning"
5. Check Supabase after each call: appointment exists, slot marked as booked, full conversation logged, call_session has outcome = "appointment_booked"

**What Claude Builds:**
- Updated WF17 with WF18 integration
- Updated voice prompt with booking conversation flow
- Booking confirmation message templates
- Fallback handling (caller says something unexpected during booking)

**Verify Before Moving On:**
- [ ] End-to-end: call → book → confirmed (minimum 3 successful test calls)
- [ ] AI handles "when would you like to come in?" naturally
- [ ] AI reads back the correct date/time
- [ ] Appointment exists in database after call
- [ ] Conversation fully logged
- [ ] No crashes on unexpected caller input

---

### Day 7 — Call Wrap-Up (WF22)

**GOAL:** By end of day: every call gets a clean summary, outcome tag, and the lead's status is updated automatically.

**What You Do:**
1. Import WF22 workflow JSON into n8n
2. WF22 should trigger automatically when a call ends
3. What WF22 does:
   - Reads all conversation_events for the call_session
   - Generates a 2–3 sentence summary using AI
   - Tags the outcome (appointment_booked, caller_hung_up, question_answered, etc.)
   - Updates call_session with outcome + summary
   - Updates lead status (new → appointment_set, etc.)
   - Logs wrapup.completed event
4. Test by making 3–4 calls with different outcomes:
   - Call and book an appointment → outcome: appointment_booked
   - Call and ask a question but don't book → outcome: question_answered
   - Call and hang up quickly → outcome: caller_hung_up
5. Check Supabase: call_sessions have outcome populated, leads show updated statuses, conversation_events has wrapup.completed events

**What Claude Builds:**
- WF22 Call Wrap-Up n8n workflow JSON
- Summary generation prompt (concise, factual, no hallucination)
- Outcome classification logic (deterministic rules first, AI backup)
- Lead status transition map (what status changes are valid)

**Verify Before Moving On:**
- [ ] Every completed call has a summary
- [ ] Outcomes are tagged correctly
- [ ] Lead statuses update correctly
- [ ] Summaries are factual (no invented information)
- [ ] All wrap-up actions logged in conversation_events

---

### Day 8 — Alerts (WF42)

**GOAL:** By end of day: every booking and missed call triggers a Slack notification. Practice owners see value instantly.

**What You Do:**
1. Import WF42 workflow JSON into n8n
2. Add your Slack webhook credential in n8n
3. WF42 should trigger automatically after WF22 completes
4. Test — make a call and book:
   - After the call ends, within 30 seconds your #revos-alerts Slack channel should show:
   ```
   ✅ Appointment Booked
   Patient: John Smith (or "New Patient")
   Time: Tomorrow, 2:00 PM
   Provider: Dr. Sarah Chen
   Summary: Caller requested a cleaning appointment...
   ```
5. Test — miss a call:
   ```
   ⚠️ Missed Call
   From: +15551234567 (New Patient)
   Time: Just now
   Action needed: Follow up recommended
   ```
6. Verify no duplicate alerts: each call should produce exactly ONE alert. Check alerts table — each has a unique idempotency_key.

**What Claude Builds:**
- WF42 Alerts n8n workflow JSON
- Slack message templates (booking + missed call)
- Alert deduplication logic
- Alert routing rules

**Verify Before Moving On:**
- [ ] Booking → Slack alert appears in < 60 seconds
- [ ] Missed call → Slack alert appears
- [ ] No duplicate alerts
- [ ] Alerts logged in alerts table
- [ ] Alert events logged in conversation_events

---

### Day 9 — Hardening + Edge Cases

**GOAL:** By end of day: the system handles weird inputs, network issues, and unexpected caller behavior without crashing.

**What You Do:**

Edge case testing (you make these calls):
- Call and say nothing (silence for 10 seconds)
- Call and speak in a language other than English
- Call and say something completely unrelated ("What's the weather?")
- Call and immediately hang up (1–2 seconds)
- Call and ask to book, then change your mind mid-booking
- Call twice rapidly (within 30 seconds of each other)
- Call from a blocked/unknown number if possible

For each edge case, check:
- Did the system crash? (Check n8n execution history)
- Was the call logged? (Check conversation_events)
- Was the outcome tagged correctly? (Check call_sessions)
- Did it send an appropriate alert? (Check Slack)

Latency check:
- Time the AI's response after you finish speaking
- Target: < 2 seconds for first response
- If it's slow, we optimize

**What Claude Builds:**
- Error handling improvements based on edge case results
- Retry logic for WF11 (event logging must never fail silently)
- Timeout handling for WF17 (what if ASR takes too long)
- Graceful degradation prompt ("I'm having trouble hearing you, could you repeat that?")
- Unknown intent handler ("I'd be happy to help with scheduling. Would you like to book an appointment?")

**Verify Before Moving On:**
- [ ] Zero crashes from edge case testing
- [ ] Every call (even weird ones) produces a log entry
- [ ] AI handles silence, gibberish, and off-topic gracefully
- [ ] Rapid successive calls don't cause race conditions
- [ ] Response latency is acceptable (< 2–3 seconds)

---

### Day 10 — Demo Day

**GOAL:** By end of day: you have a recorded demo you can send to prospects, a working live system, and a clear pitch.

**What You Do:**

**Morning: Demo Prep**
1. Review the demo script (Claude provides this)
2. Practice the demo call 3 times:
   - Call as "Sarah, a new patient looking for a cleaning"
   - Call as "Mike, wanting to know about availability this week"
   - Call as a missed call (ring and hang up, show Slack alert)
3. Set up screen recording:
   - Record your phone screen (showing the dial + call)
   - Record Slack on your computer (showing alerts appear in real-time)
   - Record Supabase dashboard (showing data appear after calls)
4. Do a dry run recording — watch it back — fix any awkward pauses

**Afternoon: Record Final Demo**
Record the final demo (3–5 minutes total):
1. Intro: "This is RevOS. Watch what happens when a patient calls."
2. Call 1: New patient books appointment (show Slack alert)
3. Call 2: Quick question about hours (show it handles non-booking calls)
4. Call 3: Missed call recovery alert in Slack
5. Outro: "Every call is logged, every booking is confirmed, nothing falls through the cracks."

**Evening: Lock + Document**
- Export all n8n workflows as JSON → commit to GitHub
- Take a snapshot of your Supabase schema
- Update build-log.md with Day 10 status

**What Claude Builds:**
- Demo call script (exact words for demo scenarios)
- Demo recording checklist
- Landing page copy aligned to MVP capabilities
- Pilot outreach email template (for contacting first 5–10 practices)
- n8n workflow export script for GitHub
- MVP completion audit checklist

**MVP Is Complete When:**
- [ ] Inbound call → AI answers → books appointment → alerts owner
- [ ] Works 5+ times in a row without failure
- [ ] Every call logged in conversation_events
- [ ] Every booking creates an appointment row
- [ ] Every booking/missed call triggers Slack alert
- [ ] Demo video recorded and ready to share
- [ ] All code in GitHub
- [ ] You can explain to a dentist what this does in 30 seconds

---

### Daily Time Commitment

| Day | Estimated Hours | Difficulty | What Makes It Hard |
|-----|----------------|------------|-------------------|
| 1 | 3–4 hours | Low | Just setup and running SQL |
| 2 | 2–3 hours | Low | Importing + testing one workflow |
| 3 | 3–4 hours | Medium | Twilio config can be fiddly |
| 4 | 4–6 hours | High | Voice provider setup is the hardest day |
| 5 | 3–4 hours | Medium | Logic-heavy but self-contained |
| 6 | 4–5 hours | High | Integration testing, many things can break |
| 7 | 2–3 hours | Medium | Straightforward if Days 4–6 are solid |
| 8 | 2–3 hours | Low | Slack is simple |
| 9 | 3–5 hours | Medium | Depends on how many bugs surface |
| 10 | 3–4 hours | Low | Mostly rehearsal and recording |

**Total: ~30–40 hours across 10 days (3–4 hours/day average)**

### Credentials Reference

*See Section 11 for full credentials reference.*

Store all credentials in a password manager (1Password, Bitwarden, etc.), NOT in a Google Doc or text file.

### What Happens After Day 10

**Days 11–20: MVP+ Sprint (SMS + Email)**
- WF24 (Inbound SMS)
- WF25 (Outbound SMS sequences)
- WF26 (Email sequences)
- WF108 (Universal Outbox)
- WF23 (Missed call recovery via SMS)
- WF10 (Full consent management)

**Days 21–30: V1 Sprint (Sellable Product)**
- WF19 (Intake)
- WF29/WF30 (Availability rules)
- WF39 (Revenue attribution)
- WF44 (Funnel metrics)
- WF57 (Owner dashboard data feeds)

Each sprint follows the same pattern:
1. Claude designs the schema migration
2. You run it in Supabase
3. Claude builds the workflow JSON
4. You import and test
5. We verify together
6. Commit to GitHub

### Rules for the Entire Build

1. **Never skip a verification step.** If something fails, we fix it before moving on.
2. **Commit to GitHub every day.** Even if it's just SQL files and workflow exports.
3. **If you're stuck for more than 30 minutes, ask Claude.** Don't guess.
4. **No scope creep.** If it's not on today's list, it waits.
5. **Test with real calls, not just mock data.** The demo must work on a real phone.
6. **Keep credentials in a password manager.** Not in Slack, not in docs, not in chat.

---

## 15. Live Status & Schedule (Bot-Managed)

> This section is automatically updated by the RevOS Slack bot via the `update:` command.
> Do not edit manually — the bot manages content between the markers below.

<!-- BOT-EDITABLE-START -->
**Last Updated:** 2026-02-06T22:00Z by RevOS Bot

**Build Progress (Day 1-10 MVP Sprint):**
- [x] WF106 v5.0 — Schema Auto-Builder (Day 1)
- [x] WF103 v5.0 — GitHub Auto-Export (Day 1)
- [x] WF11 v2.0 — Event Logger (Day 1)
- [x] WF201 v1.1 — Build Digest (Day 1)
- [x] WF42 v3.3.4 — Slack Command Handler with backtick-safe update detection (Day 1)
- [ ] WF200 — Task Tracker (Day 1)
- [ ] WF202 — Sprint Manager (Day 1)
- [ ] WF203 — Blocker Alert (Day 1)
- [ ] WF204/205 — Monitoring (Day 1)
- [ ] WF206 — Change Log (Day 1)
- [ ] WF109 — Identity Resolution (Day 2)
  - **Security:** Ensure phone numbers are normalized and securely stored. Implement rate limiting to prevent abuse.
  - **Infrastructure:** Use consistent hashing for lead identification and ensure logging for all identity resolution attempts.
  - *Ensure Idempotency*: Use idempotency keys to prevent duplicate lead creation when resolving identities.
  - *Audit Logging*: Log each identity resolution attempt in `workflow_audit_log` for traceability.
  - **Additional Recommendations:** 
    - Ensure robust data normalization to prevent duplicate entries.
    - Validate phone number formats across tenants to maintain consistency.
  - **Alerting and Monitoring:** Implement more robust health checks. Consider using tools like PagerDuty for critical alerts and Sentry for error tracking.
  - **Data Integrity and Idempotency:** Ensure the `idempotency_keys` table is actively used to prevent duplicate processing.
  - **Security Enhancements:** Enforce Row-Level Security (RLS) policies on all tables storing sensitive data.
- [ ] WF16 — Inbound Call Router (Day 3)
  - **Security:** Implement failover mechanisms to ensure call routing continuity.
  - *Concurrency Handling*: Implement rate limiting to manage simultaneous inbound calls.
  - **Additional Recommendations:**
    - Implement failover mechanisms to ensure call routing continuity.
  - **Alerting and Monitoring:** Set up alerts for high latency or error rates to catch issues early.
  - **Data Integrity and Idempotency:** Ensure the `idempotency_keys` table is actively used to prevent duplicate processing.
  - **Security Enhancements:** Rotate API keys and credentials regularly.
- [ ] WF17 — Voice Orchestrator (Day 4)
  - **Infrastructure:** Focus on setting up the voice provider and ensuring ASR/TTS configurations are correct.
  - **Alerting and Monitoring:** Implement more robust health checks. Consider using tools like PagerDuty for critical alerts and Sentry for error tracking.
  - **Data Integrity and Idempotency:** Ensure the `idempotency_keys` table is actively used to prevent duplicate processing.
  - **Security Enhancements:** Enforce Row-Level Security (RLS) policies on all tables storing sensitive data.
- [ ] WF18 — Scheduling Workflow (Day 5)
  - **Infrastructure:** Ensure robust data validation and error handling for scheduling conflicts.
- [ ] WF22 — Call Wrap-Up (Day 7)
  - **Audit Logging:** Ensure all workflows log events to the `workflow_audit_log` for traceability.

**Current Phase:** Day 1 — Infrastructure & Project Management

**Next Milestone:** Complete WF200-206, then proceed to Day 2 (WF109)

**Schedule Notes:**
- Day 1 infrastructure workflows complete (WF106, WF103, WF11)
- Day 1 project management workflows in progress (WF200-206)
- No blockers currently

**Immediate Plan:**
1. **WF200 Task Tracker**: Essential for managing tasks, tracking progress, and ensuring accountability.
2. **WF202 Sprint Manager**: Helps manage the sprint lifecycle, track milestones, and adjust plans as needed.
3. **WF203 Blocker Alert**: Alerts when tasks are blocked, enabling quick resolution.
4. **WF204/205 Monitoring**: Ensures system health and error tracking.
5. **WF206 Change Log**: Logs changes for auditability and transparency.
6. **WF109 Identity Resolution**: Critical for mapping phone numbers to lead IDs, foundation for subsequent workflows.
7. **WF16 Inbound Call Router**: Essential for integrating voice functions.
8. **WF17 Voice Orchestrator**: Integrate the voice AI with the system.
9. **WF18 Scheduling Workflow**: Handle booking logic with robust data validation.
10. **WF22 Call Wrap-Up**: Summarize calls and update lead statuses.
<!-- BOT-EDITABLE-END -->

---

**End of Document**
