# RevOS: Revenue Operating System for Dental Practices

**Last Updated:** 2026-02-04
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
| **Voice/Calls** | Vapi.ai (recommended) or Bland.ai | AI phone receptionists with ASR/TTS/LLM integration |
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
- Anon Key: (stored in 1Password - safe to commit)
- Service Role Key: (stored in 1Password - SECRET - never commit)
- DB Password: (stored in 1Password - SECRET)

**N8N CLOUD:**
- Instance URL: https://valiansystems.app.n8n.cloud/
- API Key: (stored in 1Password - SECRET - generate in n8n settings)

**TWILIO:**
- Account SID: (stored in 1Password - SECRET)
- Auth Token: (stored in 1Password - SECRET)
- Phone Number: +1 917 993 5081

**SLACK:**
- Workspace: Valian Systems
- #revos-build channel ID: (TBD)
- #revos-alerts channel ID: (TBD)
- Webhook URL: (stored in 1Password - SECRET)

**VAPI (Day 4 - TBD):**
- API Key: (stored in 1Password - SECRET)
- Assistant ID: (TBD)
- Phone Number ID: (TBD)

**GITHUB:**
- Repo: https://github.com/Valian-Systems/Valian-RevOS/
- PAT: (stored in 1Password - SECRET - for WF103 auto-commits)

**DO NOT put actual secrets in this file or commit to GitHub.**

---

## 12. Current Status & Next Steps

**Last Updated:** 2026-02-04
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

**End of Document**
