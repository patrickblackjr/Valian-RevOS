# WF011 — Test Notes

## Test Assumptions

- Tenant `00000000-0000-0000-0000-000000000001` exists in Supabase
- All referenced tables exist and have required columns
- n8n credentials are configured

## How to Replay

1. Open WF011 in n8n
2. Use "Test workflow" with the sample payload JSON
3. Compare output against expected output JSON

## Test Cases

| Case | Payload | Expected | Intent |
|------|---------|----------|--------|
| happy_path | `sample_payloads/happy_path.json` | `expected_outputs/happy_path.json` | Successful execution |
