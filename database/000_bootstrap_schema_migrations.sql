-- RevOS Database Bootstrap
-- File: 000_bootstrap_schema_migrations.sql
-- Purpose: Create schema_migrations table to track all future schema changes
-- Run this ONCE in Supabase SQL Editor before running WF106

-- ============================================================================
-- SCHEMA MIGRATIONS TABLE (Bootstrap - Run Manually)
-- ============================================================================

-- This table tracks all database schema changes
-- Every migration applied by WF106 gets logged here
-- Idempotency: WF106 checks this table before applying any migration

CREATE TABLE IF NOT EXISTS public.schema_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL UNIQUE,  -- Migration version (e.g., "001", "002", "003")
    description TEXT NOT NULL,      -- Human-readable description (e.g., "Foundation Schema - 10 core tables")
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),  -- When migration was applied
    applied_by TEXT DEFAULT 'WF106',  -- Which workflow applied it
    checksum TEXT,  -- SHA-256 hash of SQL script for verification
    execution_time_ms INTEGER,  -- How long migration took to run
    status TEXT NOT NULL DEFAULT 'success',  -- success, failed, rolled_back
    error_message TEXT,  -- If status=failed, store error details
    sql_script TEXT  -- The actual SQL that was run (for rollback reference)
);

-- Create index for fast version lookups (WF106 checks "does this version already exist?")
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON public.schema_migrations(version);

-- Create index for chronological queries
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON public.schema_migrations(applied_at DESC);

-- ============================================================================
-- INSERT BOOTSTRAP RECORD (This SQL script itself)
-- ============================================================================

INSERT INTO public.schema_migrations (
    version,
    description,
    applied_at,
    applied_by,
    status,
    sql_script
) VALUES (
    '000',
    'Bootstrap: Create schema_migrations table',
    NOW(),
    'MANUAL',  -- This is run manually, not via WF106
    'success',
    '-- See 000_bootstrap_schema_migrations.sql for full script'
) ON CONFLICT (version) DO NOTHING;  -- Idempotent (safe to run multiple times)

-- ============================================================================
-- VERIFICATION QUERY (Run after this script)
-- ============================================================================

-- SELECT * FROM public.schema_migrations ORDER BY version;
-- Expected result: 1 row with version='000', description='Bootstrap: Create schema_migrations table'

-- ============================================================================
-- END OF BOOTSTRAP
-- ============================================================================
