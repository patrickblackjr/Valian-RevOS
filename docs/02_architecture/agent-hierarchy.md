# Agent Hierarchy

## AI Decision Tree (CLAUDE.md Section 3)

- **80% Deterministic Workflows**: Booking, reminders, eligibility, billing, reports
- **20% AI Agents**: Phone conversations, intent classification, email generation, memory extraction

**Critical Rule**: AI agents NEVER directly write to database. They return structured JSON which n8n validates and writes.
