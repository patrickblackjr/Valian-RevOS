# Security

See CLAUDE.md Sections 10, 16 for security and HIPAA compliance.

## Key Principles

- PHI encrypted at rest (Supabase AES-256)
- TLS 1.3 for all API traffic
- RLS enforced on all tenant-scoped tables
- Audit logs for all PHI access via WF11
- BAAs required with all PHI-handling vendors
- No secrets in this repository (enforced by CI)
