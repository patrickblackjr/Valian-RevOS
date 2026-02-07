# WF201 — 12 hour Dev Sprint update Changelog

## [2026-02-07] v1.4.0

- Fixed cron schedule: changed `0 0 14,2` → `0 0 9,21` to fire at 9AM/9PM EST (was 2AM/2PM)
- Added "Build Day X of 10" counter with EST-aware date math
- Added DST safety comment (valid through March 7, 2026)
- All 10 tests passed

## [2026-02-07] v1.3.0

- Renamed from "Build Digest" to "12 hour Dev Sprint update"
- Updated Slack header to "REVOS DEV SPRINT UPDATE"
- Fixed HTTP_Slack_Build `sendBody: false` → `true` (Slack 400 invalid_payload)
- Fixed duplicate tasks: added `DISTINCT ON (title)` to PG_Tasks_Active query
- Fixed `completed_at IS NULL` on 6 completed tasks (data quality fix)

## [2026-02-07] v0.1.0

- Initial scaffold created
- 4 nodes defined
- Test payloads: happy_path
