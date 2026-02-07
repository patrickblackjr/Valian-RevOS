# Changelog

All notable changes to the Valian RevOS repository will be documented in this file.

Format: [YYYY-MM-DD] WF### or Component — Description

---

## [2026-02-07] Repository Scaffold

- Created authoritative repo structure per CLAUDE.md spec
- Added `scripts/wf_scaffold.js` — WF folder generator
- Added `scripts/wf_export_normalize.js` — n8n export normalizer + secret redactor
- Added `scripts/repo_validate.js` — repo structure linter
- Added `scripts/secret_scan.js` — secret scanner
- Added GitHub Actions CI for validation + secret scanning
- Created docs scaffold (00–04 sections)
- Created integration scaffolds (Twilio, Slack, OpenAI)
- Created supabase scaffold (migrations, functions, policies, seed)
