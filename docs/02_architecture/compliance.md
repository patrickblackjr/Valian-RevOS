# Compliance

See CLAUDE.md Section 16 for the full HIPAA/PCI compliance framework.

## Data Tiers

- **T1 (Public)**: Tenant name, office hours
- **T2 (Operational)**: Appointment status, workflow logs
- **T3 (PHI/PII)**: Patient name, phone, transcripts, memories
- **T4 (Secrets)**: API keys, tokens — NEVER stored in DB or repo
