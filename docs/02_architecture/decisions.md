# Architecture Decision Records

All significant architecture decisions are recorded here.

## ADR-001: Monorepo Structure (2026-02-07)

**Decision**: Single monorepo with workflows as first-class artifacts.
**Rationale**: Simplifies CI, enables cross-workflow validation, single source of truth.
**Status**: Accepted

## ADR-002: n8n as Primary Workflow Engine (2026-02-04)

**Decision**: Use n8n Cloud for 90% of business logic.
**Rationale**: Visual workflow builder, deterministic execution, rapid iteration.
**Status**: Accepted

## ADR-003: Supabase as System of Record (2026-02-04)

**Decision**: Supabase (managed PostgreSQL) with RLS for multi-tenancy.
**Rationale**: Built-in RLS, real-time subscriptions, managed infrastructure.
**Status**: Accepted
