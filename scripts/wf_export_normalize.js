#!/usr/bin/env node
/**
 * wf_export_normalize.js — n8n Workflow Export Normalizer
 *
 * Given a directory of raw n8n workflow JSON exports, this script:
 * 1. Canonicalizes JSON (stable key ordering, consistent formatting)
 * 2. Redacts secrets (T4 data: API keys, tokens, passwords)
 * 3. Routes each export to the correct workflows/WF###_<slug>/n8n/ path
 * 4. Computes content hash; only stages changes if hash differs
 * 5. Prints git commands to stage and commit
 *
 * Usage:
 *   node scripts/wf_export_normalize.js --input-dir /path/to/raw/exports
 *   node scripts/wf_export_normalize.js --input-file /path/to/single/export.json
 *
 * The script detects WF### IDs from the workflow name field in the JSON.
 * It expects workflow names to start with "WF###" (e.g., "WF103 GitHub Auto-Export").
 *
 * If the target WF folder doesn't exist, the export is skipped with a warning.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(REPO_ROOT, 'workflows');

// Secret patterns to redact
const SECRET_PATTERNS = [
  // API keys and tokens
  { pattern: /sk-ant-api\d+-[A-Za-z0-9_-]{20,}/g, replacement: '[REDACTED_ANTHROPIC_KEY]' },
  { pattern: /sk-[A-Za-z0-9]{20,}/g, replacement: '[REDACTED_OPENAI_KEY]' },
  { pattern: /ghp_[A-Za-z0-9]{36,}/g, replacement: '[REDACTED_GITHUB_PAT]' },
  { pattern: /gho_[A-Za-z0-9]{36,}/g, replacement: '[REDACTED_GITHUB_OAUTH]' },
  { pattern: /xoxb-[0-9]+-[0-9]+-[A-Za-z0-9]+/g, replacement: '[REDACTED_SLACK_BOT_TOKEN]' },
  { pattern: /xoxp-[0-9]+-[0-9]+-[0-9]+-[a-f0-9]+/g, replacement: '[REDACTED_SLACK_USER_TOKEN]' },
  { pattern: /xapp-[0-9]+-[A-Za-z0-9]+-[0-9]+-[a-f0-9]+/g, replacement: '[REDACTED_SLACK_APP_TOKEN]' },
  { pattern: /AC[a-f0-9]{32}/g, replacement: '[REDACTED_TWILIO_SID]' },
  { pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  // Generic bearer tokens in headers
  { pattern: /"Authorization":\s*"Bearer [^"]+"/g, replacement: '"Authorization": "Bearer [REDACTED]"' },
  { pattern: /"x-api-key":\s*"[^"]+"/gi, replacement: '"x-api-key": "[REDACTED]"' },
  // Supabase service role keys
  { pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, replacement: '[REDACTED_JWT]' },
  // Generic long hex/base64 tokens that look like secrets (50+ chars)
  // Deliberately NOT included — too many false positives. Use secret_scan.js for audit.
];

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

// ─── JSON Canonicalization ────────────────────────────────────────────────────

/**
 * Deep-sort object keys for deterministic JSON output.
 * Arrays are left in their original order (node ordering matters).
 */
function sortKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);

  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = sortKeys(obj[key]);
  }
  return sorted;
}

/**
 * Canonicalize JSON: sorted keys + 2-space indent + trailing newline.
 */
function canonicalize(obj) {
  return JSON.stringify(sortKeys(obj), null, 2) + '\n';
}

// ─── Secret Redaction ─────────────────────────────────────────────────────────

function redactSecrets(jsonString) {
  let result = jsonString;
  let redactionCount = 0;

  for (const { pattern, replacement } of SECRET_PATTERNS) {
    const matches = result.match(pattern);
    if (matches) {
      redactionCount += matches.length;
      result = result.replace(pattern, replacement);
    }
  }

  return { result, redactionCount };
}

// ─── Content Hashing ──────────────────────────────────────────────────────────

function contentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

// ─── WF ID Extraction ─────────────────────────────────────────────────────────

/**
 * Extract WF### ID from the workflow JSON.
 * Checks the "name" field first, then falls back to filename.
 */
function extractWfId(workflow, filename) {
  // Try workflow name field
  if (workflow.name) {
    const match = workflow.name.match(/WF(\d{3})/);
    if (match) return `WF${match[1]}`;
  }

  // Try filename
  const fnMatch = filename.match(/WF(\d{3})/);
  if (fnMatch) return `WF${fnMatch[1]}`;

  return null;
}

/**
 * Find the target WF folder for a given WF ID.
 * Searches for folders matching WF###_*.
 */
function findWfFolder(wfId) {
  if (!fs.existsSync(WORKFLOWS_DIR)) return null;

  const entries = fs.readdirSync(WORKFLOWS_DIR);
  const match = entries.find(e => e.startsWith(`${wfId}_`) && fs.statSync(path.join(WORKFLOWS_DIR, e)).isDirectory());
  return match ? path.join(WORKFLOWS_DIR, match) : null;
}

// ─── Argument Parsing ─────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { inputDir: null, inputFile: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input-dir' && args[i + 1]) {
      result.inputDir = args[++i];
    } else if (args[i] === '--input-file' && args[i + 1]) {
      result.inputFile = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage:
  node scripts/wf_export_normalize.js --input-dir /path/to/raw/exports
  node scripts/wf_export_normalize.js --input-file /path/to/single/export.json

Options:
  --input-dir <dir>     Directory containing raw n8n export JSON files
  --input-file <file>   Single n8n export JSON file
  --help, -h            Show this help message
`);
      process.exit(0);
    }
  }

  if (!result.inputDir && !result.inputFile) {
    fail('Must specify --input-dir or --input-file.\nRun with --help for usage.');
  }

  return result;
}

// ─── Process Single Export ────────────────────────────────────────────────────

function processExport(filePath) {
  const filename = path.basename(filePath);
  info(`Processing: ${filename}`);

  // Read and parse
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    warn(`  Cannot read file: ${e.message}`);
    return { status: 'error', file: filename, reason: e.message };
  }

  let workflow;
  try {
    workflow = JSON.parse(raw);
  } catch (e) {
    warn(`  Invalid JSON: ${e.message}`);
    return { status: 'error', file: filename, reason: `Invalid JSON: ${e.message}` };
  }

  // Extract WF ID
  const wfId = extractWfId(workflow, filename);
  if (!wfId) {
    warn(`  Cannot determine WF ID from name or filename`);
    return { status: 'skipped', file: filename, reason: 'No WF### ID found' };
  }

  // Find target folder
  const wfFolder = findWfFolder(wfId);
  if (!wfFolder) {
    warn(`  No folder found for ${wfId}. Scaffold it first: node scripts/wf_scaffold.js`);
    return { status: 'skipped', file: filename, reason: `No folder for ${wfId}` };
  }

  // Canonicalize
  const canonical = canonicalize(workflow);

  // Redact secrets
  const { result: redacted, redactionCount } = redactSecrets(canonical);
  if (redactionCount > 0) {
    info(`  Redacted ${redactionCount} secret(s)`);
  }

  // Compute hash and compare with existing
  const targetPath = path.join(wfFolder, 'n8n', `${wfId}.json`);
  const newHash = contentHash(redacted);

  if (fs.existsSync(targetPath)) {
    const existing = fs.readFileSync(targetPath, 'utf8');
    const existingHash = contentHash(existing);

    if (newHash === existingHash) {
      info(`  No changes (hash: ${newHash})`);
      return { status: 'unchanged', file: filename, wfId, hash: newHash };
    }
    info(`  Content changed: ${existingHash} → ${newHash}`);
  } else {
    info(`  New export (hash: ${newHash})`);
  }

  // Ensure n8n/ directory exists
  const n8nDir = path.join(wfFolder, 'n8n');
  if (!fs.existsSync(n8nDir)) {
    fs.mkdirSync(n8nDir, { recursive: true });
  }

  // Write
  fs.writeFileSync(targetPath, redacted, 'utf8');
  success(`  Written to: ${path.relative(REPO_ROOT, targetPath)}`);

  return {
    status: 'written',
    file: filename,
    wfId,
    target: path.relative(REPO_ROOT, targetPath),
    hash: newHash,
    redactions: redactionCount
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();

  // Collect input files
  let inputFiles = [];

  if (args.inputFile) {
    const p = path.resolve(args.inputFile);
    if (!fs.existsSync(p)) fail(`File not found: ${p}`);
    inputFiles.push(p);
  }

  if (args.inputDir) {
    const dir = path.resolve(args.inputDir);
    if (!fs.existsSync(dir)) fail(`Directory not found: ${dir}`);

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(dir, f));

    if (files.length === 0) {
      warn(`No .json files found in ${dir}`);
      process.exit(0);
    }

    inputFiles.push(...files);
  }

  info(`Found ${inputFiles.length} export file(s) to process\n`);

  // Process each
  const results = inputFiles.map(processExport);
  console.log('');

  // Summary
  const written = results.filter(r => r.status === 'written');
  const unchanged = results.filter(r => r.status === 'unchanged');
  const skipped = results.filter(r => r.status === 'skipped');
  const errors = results.filter(r => r.status === 'error');

  console.log('\x1b[1m═══ Summary ═══\x1b[0m');
  console.log(`  Written:   ${written.length}`);
  console.log(`  Unchanged: ${unchanged.length}`);
  console.log(`  Skipped:   ${skipped.length}`);
  console.log(`  Errors:    ${errors.length}`);
  console.log('');

  if (skipped.length > 0) {
    console.log('\x1b[33mSkipped:\x1b[0m');
    skipped.forEach(r => console.log(`  - ${r.file}: ${r.reason}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('\x1b[31mErrors:\x1b[0m');
    errors.forEach(r => console.log(`  - ${r.file}: ${r.reason}`));
    console.log('');
  }

  // Git commands
  if (written.length > 0) {
    console.log('\x1b[1m\x1b[33mGit commands to stage changes:\x1b[0m');
    written.forEach(r => console.log(`  git add ${r.target}`));
    console.log(`  git commit -m "WF103: normalize exports (${written.map(r => r.wfId).join(', ')})"`);
    console.log('');
  }

  // Exit with error if any errors
  if (errors.length > 0) process.exit(1);
}

main();
