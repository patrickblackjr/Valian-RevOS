# n8n Export/Import Runbook

## Exporting a Workflow

1. In n8n, open the workflow
2. Click the three-dot menu → Download
3. Save the JSON file
4. Run: `node scripts/wf_export_normalize.js --input-dir /path/to/downloads`
5. The script will canonicalize, redact secrets, and place the file in the correct `workflows/WF###_<slug>/n8n/` directory

## Importing a Workflow

1. In n8n, click "Add workflow" → Import from File
2. Select `workflows/WF###_<slug>/n8n/WF###.json`
3. Verify credentials are attached (they are NOT stored in the export)
4. Activate the workflow
