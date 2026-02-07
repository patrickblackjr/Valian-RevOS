#!/usr/bin/env node
/**
 * wf_scaffold.js — Workflow Scaffolding Generator
 *
 * Creates a new WF folder from a JSON spec, generating all required files
 * per the authoritative repo structure spec.
 *
 * Usage:
 *   node scripts/wf_scaffold.js --input path/to/wf_spec.json [--allow_overwrite]
 *
 * Input JSON schema:
 *   {
 *     "wf_id": "WF016",
 *     "wf_slug": "inbound-call-router",
 *     "wf_title": "Inbound Call Router",
 *     "wf_summary": "Routes inbound Twilio calls into orchestration",
 *     "nodes": [
 *       {"order": 1, "name": "Webhook_InboundCall", "type": "Webhook", "purpose": "Entry point"}
 *     ],
 *     "dependencies": {"db_tables":["leads"],"other_wfs":["WF011"],"external":["twilio"]}
 *   }
 */

const fs = require('fs');
const path = require('path');

// ─── Constants ────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(REPO_ROOT, 'workflows');
const CATALOG_PATH = path.join(REPO_ROOT, 'docs', '04_specs', 'wf-catalog.md');
const CATALOG_MARKER = '<!-- WF103_SCAFFOLD: New entries are appended above this line -->';
const WF_ID_PATTERN = /^WF\d{3}$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fail(msg) {
  console.error(`\x1b[31mERROR:\x1b[0m ${msg}`);
  process.exit(1);
}

function info(msg) {
  console.log(`\x1b[36mINFO:\x1b[0m ${msg}`);
}

function success(msg) {
  console.log(`\x1b[32mOK:\x1b[0m ${msg}`);
}

function warn(msg) {
  console.log(`\x1b[33mWARN:\x1b[0m ${msg}`);
}

function padOrder(n) {
  return String(n).padStart(2, '0');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function mkdirSafe(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// ─── Argument Parsing ─────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { input: null, allowOverwrite: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) {
      result.input = args[++i];
    } else if (args[i] === '--allow_overwrite') {
      const next = args[i + 1];
      if (next === 'true' || next === undefined || next?.startsWith('--')) {
        result.allowOverwrite = true;
        if (next === 'true') i++;
      } else if (next === 'false') {
        result.allowOverwrite = false;
        i++;
      }
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node scripts/wf_scaffold.js --input <spec.json> [--allow_overwrite]

Options:
  --input <file>        Path to WF spec JSON file (required)
  --allow_overwrite     Allow overwriting existing WF folder (default: false)
  --help, -h            Show this help message
`);
      process.exit(0);
    }
  }

  if (!result.input) {
    fail('Missing required argument: --input <spec.json>\nRun with --help for usage.');
  }

  return result;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateSpec(spec) {
  const errors = [];

  if (!spec.wf_id || !WF_ID_PATTERN.test(spec.wf_id)) {
    errors.push(`wf_id must match ^WF\\d{3}$ (got: "${spec.wf_id || ''}")`);
  }

  if (!spec.wf_slug || typeof spec.wf_slug !== 'string' || spec.wf_slug.trim() === '') {
    errors.push('wf_slug is required and must be a non-empty string');
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(spec.wf_slug)) {
    errors.push(`wf_slug must be kebab-case (got: "${spec.wf_slug}")`);
  }

  if (!spec.wf_title || typeof spec.wf_title !== 'string') {
    errors.push('wf_title is required');
  }

  if (!spec.wf_summary || typeof spec.wf_summary !== 'string') {
    errors.push('wf_summary is required');
  }

  if (!Array.isArray(spec.nodes) || spec.nodes.length === 0) {
    errors.push('nodes must be a non-empty array');
  } else {
    spec.nodes.forEach((node, i) => {
      if (!node.order || typeof node.order !== 'number') {
        errors.push(`nodes[${i}].order must be a number`);
      }
      if (!node.name || typeof node.name !== 'string') {
        errors.push(`nodes[${i}].name is required`);
      }
      if (!node.type || typeof node.type !== 'string') {
        errors.push(`nodes[${i}].type is required`);
      }
      if (!node.purpose || typeof node.purpose !== 'string') {
        errors.push(`nodes[${i}].purpose is required`);
      }
    });
  }

  if (spec.dependencies) {
    if (spec.dependencies.db_tables && !Array.isArray(spec.dependencies.db_tables)) {
      errors.push('dependencies.db_tables must be an array');
    }
    if (spec.dependencies.other_wfs && !Array.isArray(spec.dependencies.other_wfs)) {
      errors.push('dependencies.other_wfs must be an array');
    }
    if (spec.dependencies.external && !Array.isArray(spec.dependencies.external)) {
      errors.push('dependencies.external must be an array');
    }
  }

  return errors;
}

// ─── Template Generators ──────────────────────────────────────────────────────

function genReadme(spec) {
  const deps = spec.dependencies || {};
  const dbTables = (deps.db_tables || []).map(t => `- \`${t}\``).join('\n') || '- None';
  const otherWfs = (deps.other_wfs || []).map(w => `- ${w}`).join('\n') || '- None';
  const external = (deps.external || []).map(e => `- ${e}`).join('\n') || '- None';

  const nodeList = spec.nodes
    .sort((a, b) => a.order - b.order)
    .map(n => `| ${padOrder(n.order)} | ${n.name} | ${n.type} | ${n.purpose} |`)
    .join('\n');

  return `# ${spec.wf_id} — ${spec.wf_title}

## Summary

${spec.wf_summary}

## Owner

Builder

## Status

Draft

## Trigger

<!-- Describe the trigger: Webhook, Cron, Execute Workflow, Manual, etc. -->
TBD

## Inputs

<!-- Exact JSON schema fields, required vs optional -->

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| \`tenant_id\` | string (UUID) | Yes | Tenant identifier |
| <!-- add fields --> | | | |

## Outputs

<!-- Exact JSON schema fields -->

| Field | Type | Description |
|-------|------|-------------|
| \`status\` | string | ok \\| noop \\| blocked \\| retry \\| failed |
| \`summary\` | string | Human-readable result |
| <!-- add fields --> | | |

## Happy Path

<!-- Describe the successful execution flow step by step -->

1. TBD

## Failure Modes

| # | Failure | Detection | Resolution |
|---|---------|-----------|------------|
| 1 | <!-- failure --> | <!-- how detected --> | <!-- how to fix --> |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

## Dependencies

### DB Tables
${dbTables}

### Other Workflows
${otherWfs}

### External Services
${external}

## Idempotency & Locks

<!-- Describe idempotency key format and any locking mechanisms -->
Key format: \`idem:{tenant_id}:${spec.wf_id.toLowerCase()}:{trigger_id}:{payload_hash}\`

## Nodes

| Order | Node | Type | Purpose |
|-------|------|------|---------|
${nodeList}

## Test Cases

| File | Intent |
|------|--------|
| \`tests/sample_payloads/happy_path.json\` | Successful execution |
| <!-- add more --> | |
`;
}

function genChangelog(spec) {
  return `# ${spec.wf_id} — ${spec.wf_title} Changelog

## [${today()}] v0.1.0

- Initial scaffold created
- ${spec.nodes.length} nodes defined
- Test payloads: happy_path
`;
}

function genNodeMap(spec) {
  const nodes = spec.nodes.sort((a, b) => a.order - b.order);
  const nodeList = nodes
    .map(n => `| ${padOrder(n.order)} | [${n.name}](${padOrder(n.order)}_${n.name}.md) | ${n.type} | ${n.purpose} |`)
    .join('\n');

  const routingLines = nodes.map((n, i) => {
    const next = nodes[i + 1];
    return next
      ? `${padOrder(n.order)}_${n.name} → ${padOrder(next.order)}_${next.name}`
      : `${padOrder(n.order)}_${n.name} → (end)`;
  });

  return `# ${spec.wf_id} — Node Map

## Node List

| Order | Node | Type | Purpose |
|-------|------|------|---------|
${nodeList}

## Routing

\`\`\`
${routingLines.join('\n')}
\`\`\`

## Notes

<!-- Add routing notes, branch conditions, etc. -->
`;
}

function genNodeIndex(spec) {
  const nodes = spec.nodes.sort((a, b) => a.order - b.order).map(n => ({
    order: n.order,
    name: n.name,
    type: n.type,
    purpose: n.purpose,
    doc_file: `${padOrder(n.order)}_${n.name}.md`
  }));

  return JSON.stringify({
    wf_id: spec.wf_id,
    wf_title: spec.wf_title,
    generated_at: new Date().toISOString(),
    node_count: nodes.length,
    nodes
  }, null, 2) + '\n';
}

function genNodeDoc(spec, node) {
  return `# Node ${padOrder(node.order)} — ${node.name}

## Type

${node.type}

## Purpose

${node.purpose}

## Upstream

<!-- Which node(s) feed into this node -->
TBD

## Downstream

<!-- Which node(s) this connects to -->
TBD

## Inputs (exact)

<!-- List fields read from $json and $items() -->

| Field | Type | Required | Source |
|-------|------|----------|--------|
| <!-- field --> | | | |

## Configuration (exact)

<!-- Key UI settings: URL, method, headers, auth, expressions, code, etc. -->

TBD

## Logic (human explanation)

<!-- Explain what it does and why, in bullets -->

- TBD

## Outputs (exact)

<!-- Fields produced or modified -->

| Field | Type | Description |
|-------|------|-------------|
| <!-- field --> | | |

## Failure Modes & Debugging

| What Breaks | How to Detect | What to Check |
|-------------|---------------|---------------|
| <!-- failure --> | | |
`;
}

function genHappyPathPayload(spec) {
  const payload = {
    _description: `Happy path test payload for ${spec.wf_id} — ${spec.wf_title}`,
    _generated: new Date().toISOString(),
    tenant_id: '00000000-0000-0000-0000-000000000001'
  };
  return JSON.stringify(payload, null, 2) + '\n';
}

function genHappyPathExpected(spec) {
  const expected = {
    _description: `Expected output for happy path of ${spec.wf_id} — ${spec.wf_title}`,
    _generated: new Date().toISOString(),
    status: 'ok',
    summary: 'TBD — fill in expected result'
  };
  return JSON.stringify(expected, null, 2) + '\n';
}

function genTestNotes(spec) {
  return `# ${spec.wf_id} — Test Notes

## Test Assumptions

- Tenant \`00000000-0000-0000-0000-000000000001\` exists in Supabase
- All referenced tables exist and have required columns
- n8n credentials are configured

## How to Replay

1. Open ${spec.wf_id} in n8n
2. Use "Test workflow" with the sample payload JSON
3. Compare output against expected output JSON

## Test Cases

| Case | Payload | Expected | Intent |
|------|---------|----------|--------|
| happy_path | \`sample_payloads/happy_path.json\` | \`expected_outputs/happy_path.json\` | Successful execution |
`;
}

function genMetaJson(spec) {
  return JSON.stringify({
    wf_id: spec.wf_id,
    wf_slug: spec.wf_slug,
    wf_title: spec.wf_title,
    wf_summary: spec.wf_summary,
    version: '0.1.0',
    status: 'Draft',
    owner: 'Builder',
    created_at: new Date().toISOString(),
    node_count: spec.nodes.length,
    dependencies: spec.dependencies || {},
    has_tests: true
  }, null, 2) + '\n';
}

// ─── Catalog Update ───────────────────────────────────────────────────────────

function updateCatalog(spec) {
  if (!fs.existsSync(CATALOG_PATH)) {
    warn(`Catalog not found at ${CATALOG_PATH} — creating it`);
    mkdirSafe(path.dirname(CATALOG_PATH));
    writeFile(CATALOG_PATH, `# Workflow Catalog

All registered workflows in the RevOS system.

---

${CATALOG_MARKER}
`);
  }

  let catalog = fs.readFileSync(CATALOG_PATH, 'utf8');
  const folderName = `${spec.wf_id}_${spec.wf_slug}`;
  const deps = spec.dependencies || {};
  const depList = [
    ...(deps.external || []),
    ...(deps.db_tables || []).map(t => `Supabase (${t})`),
    ...(deps.other_wfs || [])
  ].join(', ') || 'None';

  // Check if entry already exists
  const entryPattern = new RegExp(`^## ${spec.wf_id} —`, 'm');
  if (entryPattern.test(catalog)) {
    // Replace existing entry
    const entryStart = catalog.search(entryPattern);
    const nextEntry = catalog.indexOf('\n## WF', entryStart + 1);
    const entryEnd = nextEntry !== -1 ? nextEntry : catalog.indexOf(CATALOG_MARKER);

    const newEntry = `## ${spec.wf_id} — ${spec.wf_slug} (Draft)

**Summary**: ${spec.wf_summary}
**Folder**: \`workflows/${folderName}/\`
**Depends**: ${depList}

---

`;
    catalog = catalog.slice(0, entryStart) + newEntry + catalog.slice(entryEnd);
    info(`Updated existing catalog entry for ${spec.wf_id}`);
  } else {
    // Append before marker
    const markerIdx = catalog.indexOf(CATALOG_MARKER);
    if (markerIdx === -1) {
      catalog += `\n---\n\n## ${spec.wf_id} — ${spec.wf_slug} (Draft)

**Summary**: ${spec.wf_summary}
**Folder**: \`workflows/${folderName}/\`
**Depends**: ${depList}

---

${CATALOG_MARKER}
`;
    } else {
      const newEntry = `## ${spec.wf_id} — ${spec.wf_slug} (Draft)

**Summary**: ${spec.wf_summary}
**Folder**: \`workflows/${folderName}/\`
**Depends**: ${depList}

---

`;
      catalog = catalog.slice(0, markerIdx) + newEntry + catalog.slice(markerIdx);
    }
    info(`Added new catalog entry for ${spec.wf_id}`);
  }

  writeFile(CATALOG_PATH, catalog);
  return CATALOG_PATH;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();

  // Load and parse spec
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    fail(`Input file not found: ${inputPath}`);
  }

  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch (e) {
    fail(`Failed to parse JSON: ${e.message}`);
  }

  // Validate
  const errors = validateSpec(spec);
  if (errors.length > 0) {
    console.error(`\x1b[31mValidation failed (${errors.length} errors):\x1b[0m`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Check folder existence
  const folderName = `${spec.wf_id}_${spec.wf_slug}`;
  const wfDir = path.join(WORKFLOWS_DIR, folderName);

  if (fs.existsSync(wfDir) && !args.allowOverwrite) {
    fail(`Folder already exists: ${wfDir}\nUse --allow_overwrite to overwrite.`);
  }

  info(`Scaffolding ${spec.wf_id} — ${spec.wf_title}`);
  info(`Target: workflows/${folderName}/`);

  const pathsCreated = [];
  const filesCreated = [];
  const filesUpdated = [];

  // Create directories
  const dirs = [
    wfDir,
    path.join(wfDir, 'n8n'),
    path.join(wfDir, 'nodes'),
    path.join(wfDir, 'tests', 'sample_payloads'),
    path.join(wfDir, 'tests', 'expected_outputs')
  ];

  dirs.forEach(d => {
    mkdirSafe(d);
    pathsCreated.push(path.relative(REPO_ROOT, d));
  });

  // Generate files
  const files = [
    [path.join(wfDir, 'README.md'), genReadme(spec)],
    [path.join(wfDir, 'changelog.md'), genChangelog(spec)],
    [path.join(wfDir, 'wf.meta.json'), genMetaJson(spec)],
    [path.join(wfDir, 'nodes', '00_map.md'), genNodeMap(spec)],
    [path.join(wfDir, 'nodes', 'node_index.json'), genNodeIndex(spec)],
    [path.join(wfDir, 'tests', 'sample_payloads', 'happy_path.json'), genHappyPathPayload(spec)],
    [path.join(wfDir, 'tests', 'expected_outputs', 'happy_path.json'), genHappyPathExpected(spec)],
    [path.join(wfDir, 'tests', 'notes.md'), genTestNotes(spec)]
  ];

  // Node docs
  spec.nodes.sort((a, b) => a.order - b.order).forEach(node => {
    const filename = `${padOrder(node.order)}_${node.name}.md`;
    files.push([path.join(wfDir, 'nodes', filename), genNodeDoc(spec, node)]);
  });

  files.forEach(([filePath, content]) => {
    writeFile(filePath, content);
    filesCreated.push(path.relative(REPO_ROOT, filePath));
  });

  // Update catalog
  const catalogUpdated = updateCatalog(spec);
  filesUpdated.push(path.relative(REPO_ROOT, catalogUpdated));

  // ─── Output ───────────────────────────────────────────────────────────

  console.log('');
  success(`Scaffold complete for ${spec.wf_id} — ${spec.wf_title}`);
  console.log('');

  console.log('\x1b[1mPaths created:\x1b[0m');
  pathsCreated.forEach(p => console.log(`  + ${p}/`));
  console.log('');

  console.log('\x1b[1mFiles created:\x1b[0m');
  filesCreated.forEach(f => console.log(`  + ${f}`));
  console.log('');

  console.log('\x1b[1mFiles updated:\x1b[0m');
  filesUpdated.forEach(f => console.log(`  ~ ${f}`));
  console.log('');

  // Next steps checklist
  const branch = `${spec.wf_id.toLowerCase()}-${spec.wf_slug}`;
  console.log('\x1b[1m\x1b[33mNext Steps:\x1b[0m');
  console.log(`  [ ] Create branch: git checkout -b ${branch}`);
  console.log(`  [ ] Export n8n workflow JSON into workflows/${folderName}/n8n/${spec.wf_id}.json`);
  console.log(`  [ ] Fill node docs for Node 01–${padOrder(spec.nodes.length)} first`);
  console.log(`  [ ] Add happy_path sample payload with real data`);
  console.log(`  [ ] Add expected output for happy_path`);
  console.log(`  [ ] Commit with message: ${spec.wf_id}: scaffold + docs`);
  console.log(`  [ ] Run: node scripts/repo_validate.js`);
  console.log(`  [ ] Open PR, link issue, include test instructions`);
  console.log('');

  // Machine-readable output
  const output = {
    paths_created: pathsCreated,
    files_created: filesCreated,
    files_updated: filesUpdated,
    next_steps: [
      `Create branch: git checkout -b ${branch}`,
      `Export n8n workflow JSON into workflows/${folderName}/n8n/${spec.wf_id}.json`,
      `Fill node docs for Node 01–${padOrder(spec.nodes.length)}`,
      'Add happy_path sample payload with real data',
      'Add expected output for happy_path',
      `Commit with message: ${spec.wf_id}: scaffold + docs`,
      'Run: node scripts/repo_validate.js',
      'Open PR, link issue, include test instructions'
    ]
  };

  // Write output JSON for programmatic use
  const outputPath = path.join(wfDir, '.scaffold_output.json');
  writeFile(outputPath, JSON.stringify(output, null, 2) + '\n');
}

main();
