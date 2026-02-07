#!/usr/bin/env node
/**
 * repo_validate.js — Repository Structure Linter
 *
 * Validates the Valian repo structure against the authoritative spec:
 * - Folder naming conventions (WF###_<slug>)
 * - Required files in each WF folder
 * - README sections
 * - Node doc naming and count
 * - Test payload pairing (sample + expected)
 * - Catalog consistency (every WF folder registered in wf-catalog.md)
 * - No exports outside allowed n8n/ paths
 *
 * Usage:
 *   node scripts/repo_validate.js [--fix] [--wf WF016]
 *
 * Exit codes:
 *   0 = all checks pass
 *   1 = validation errors found
 */

const fs = require('fs');
const path = require('path');

// ─── Constants ────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(REPO_ROOT, 'workflows');
const CATALOG_PATH = path.join(REPO_ROOT, 'docs', '04_specs', 'wf-catalog.md');

const WF_FOLDER_PATTERN = /^WF(\d{3})_([a-z0-9]+(-[a-z0-9]+)*)$/;
const WF_ID_PATTERN = /^WF\d{3}$/;
const NODE_DOC_PATTERN = /^(\d{2})_(.+)\.md$/;

const REQUIRED_WF_FILES = [
  'README.md',
  'changelog.md',
  'wf.meta.json',
  'nodes/00_map.md',
  'nodes/node_index.json',
  'tests/notes.md'
];

const REQUIRED_README_SECTIONS = [
  'Summary',
  'Status',
  'Trigger',
  'Inputs',
  'Outputs',
  'Happy Path',
  'Failure Modes',
  'Dependencies',
  'Test Cases'
];

const REQUIRED_TOP_LEVEL = [
  'docs',
  'workflows',
  'supabase',
  'services',
  'integrations',
  'scripts',
  '.github'
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

let errorCount = 0;
let warnCount = 0;

function error(msg) {
  errorCount++;
  console.log(`  \x1b[31mERROR\x1b[0m ${msg}`);
}

function warn(msg) {
  warnCount++;
  console.log(`  \x1b[33mWARN\x1b[0m  ${msg}`);
}

function ok(msg) {
  console.log(`  \x1b[32mOK\x1b[0m    ${msg}`);
}

function section(msg) {
  console.log(`\n\x1b[1m── ${msg} ──\x1b[0m`);
}

// ─── Argument Parsing ─────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { wf: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--wf' && args[i + 1]) {
      result.wf = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node scripts/repo_validate.js [--wf WF016]

Options:
  --wf <id>    Validate only this workflow (e.g., WF016)
  --help, -h   Show this help message
`);
      process.exit(0);
    }
  }

  return result;
}

// ─── Validators ───────────────────────────────────────────────────────────────

function validateTopLevel() {
  section('Top-Level Structure');

  for (const dir of REQUIRED_TOP_LEVEL) {
    const p = path.join(REPO_ROOT, dir);
    if (fs.existsSync(p)) {
      ok(`${dir}/ exists`);
    } else {
      error(`Missing required top-level directory: ${dir}/`);
    }
  }

  // Check for required root files
  for (const file of ['README.md', 'CHANGELOG.md']) {
    const p = path.join(REPO_ROOT, file);
    if (fs.existsSync(p)) {
      ok(`${file} exists`);
    } else {
      warn(`Missing recommended root file: ${file}`);
    }
  }
}

function validateDocsStructure() {
  section('Docs Structure');

  const requiredDocs = [
    'docs/00_start-here/00_overview.md',
    'docs/04_specs/wf-catalog.md',
    'docs/04_specs/naming-standards.md'
  ];

  for (const doc of requiredDocs) {
    const p = path.join(REPO_ROOT, doc);
    if (fs.existsSync(p)) {
      ok(doc);
    } else {
      error(`Missing required doc: ${doc}`);
    }
  }
}

function getWfFolders(filterWfId) {
  if (!fs.existsSync(WORKFLOWS_DIR)) return [];

  let entries = fs.readdirSync(WORKFLOWS_DIR);

  // Filter to directories only
  entries = entries.filter(e => {
    const p = path.join(WORKFLOWS_DIR, e);
    return fs.statSync(p).isDirectory();
  });

  // Optionally filter to a specific WF
  if (filterWfId) {
    entries = entries.filter(e => e.startsWith(`${filterWfId}_`));
  }

  return entries;
}

function validateWfFolderNaming(folders) {
  section('Workflow Folder Naming');

  if (folders.length === 0) {
    warn('No workflow folders found in workflows/');
    return;
  }

  for (const folder of folders) {
    if (WF_FOLDER_PATTERN.test(folder)) {
      ok(`workflows/${folder}/`);
    } else {
      // Check if it's a file (not a folder) or just bad naming
      const p = path.join(WORKFLOWS_DIR, folder);
      if (fs.statSync(p).isDirectory()) {
        error(`Bad folder name: workflows/${folder}/ — must match WF###_<kebab-slug>`);
      }
    }
  }
}

function validateWfRequiredFiles(folder) {
  const wfDir = path.join(WORKFLOWS_DIR, folder);

  for (const reqFile of REQUIRED_WF_FILES) {
    const p = path.join(wfDir, reqFile);
    if (fs.existsSync(p)) {
      ok(`${reqFile}`);
    } else {
      error(`Missing: workflows/${folder}/${reqFile}`);
    }
  }

  // Check for at least one test payload
  const payloadDir = path.join(wfDir, 'tests', 'sample_payloads');
  const expectedDir = path.join(wfDir, 'tests', 'expected_outputs');

  if (fs.existsSync(payloadDir)) {
    const payloads = fs.readdirSync(payloadDir).filter(f => f.endsWith('.json'));
    if (payloads.length === 0) {
      error('No test payloads in tests/sample_payloads/');
    } else {
      const hasHappy = payloads.includes('happy_path.json');
      if (!hasHappy) {
        error('Missing required: tests/sample_payloads/happy_path.json');
      } else {
        ok('tests/sample_payloads/happy_path.json');
      }
    }
  } else {
    error('Missing directory: tests/sample_payloads/');
  }

  if (fs.existsSync(expectedDir)) {
    const expected = fs.readdirSync(expectedDir).filter(f => f.endsWith('.json'));
    if (expected.length === 0) {
      error('No expected outputs in tests/expected_outputs/');
    } else {
      const hasHappy = expected.includes('happy_path.json');
      if (!hasHappy) {
        error('Missing required: tests/expected_outputs/happy_path.json');
      } else {
        ok('tests/expected_outputs/happy_path.json');
      }
    }
  } else {
    error('Missing directory: tests/expected_outputs/');
  }
}

function validateTestPairing(folder) {
  const wfDir = path.join(WORKFLOWS_DIR, folder);
  const payloadDir = path.join(wfDir, 'tests', 'sample_payloads');
  const expectedDir = path.join(wfDir, 'tests', 'expected_outputs');

  if (!fs.existsSync(payloadDir) || !fs.existsSync(expectedDir)) return;

  const payloads = fs.readdirSync(payloadDir).filter(f => f.endsWith('.json'));
  const expected = fs.readdirSync(expectedDir).filter(f => f.endsWith('.json'));

  // Every payload should have a matching expected output
  for (const payload of payloads) {
    if (expected.includes(payload)) {
      ok(`Test pair: ${payload}`);
    } else {
      warn(`Payload without expected output: ${payload}`);
    }
  }

  // Every expected output should have a matching payload
  for (const exp of expected) {
    if (!payloads.includes(exp)) {
      warn(`Expected output without payload: ${exp}`);
    }
  }
}

function validateReadmeSections(folder) {
  const readmePath = path.join(WORKFLOWS_DIR, folder, 'README.md');
  if (!fs.existsSync(readmePath)) return;

  const content = fs.readFileSync(readmePath, 'utf8');

  for (const section of REQUIRED_README_SECTIONS) {
    // Match ## Section or # Section
    const pattern = new RegExp(`^#{1,3}\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
    if (pattern.test(content)) {
      ok(`README section: ${section}`);
    } else {
      error(`Missing README section: ## ${section}`);
    }
  }
}

function validateNodeDocs(folder) {
  const nodesDir = path.join(WORKFLOWS_DIR, folder, 'nodes');
  if (!fs.existsSync(nodesDir)) return;

  const files = fs.readdirSync(nodesDir);
  const nodeDocs = files.filter(f => NODE_DOC_PATTERN.test(f));
  const indexPath = path.join(nodesDir, 'node_index.json');

  // Validate node_index.json consistency
  if (fs.existsSync(indexPath)) {
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      if (index.nodes && Array.isArray(index.nodes)) {
        const expectedDocs = index.nodes.map(n => n.doc_file);

        for (const expectedDoc of expectedDocs) {
          if (files.includes(expectedDoc)) {
            ok(`Node doc: ${expectedDoc}`);
          } else {
            error(`Node doc missing: nodes/${expectedDoc} (listed in node_index.json)`);
          }
        }

        // Check for orphan docs not in index
        for (const doc of nodeDocs) {
          if (!expectedDocs.includes(doc)) {
            warn(`Node doc not in index: nodes/${doc}`);
          }
        }
      }
    } catch (e) {
      error(`Invalid node_index.json: ${e.message}`);
    }
  }

  // Validate node doc naming
  for (const doc of nodeDocs) {
    const match = doc.match(NODE_DOC_PATTERN);
    if (match) {
      const order = parseInt(match[1], 10);
      if (order === 0) {
        // 00 is reserved for map
        if (doc !== '00_map.md') {
          error(`Node doc 00 prefix is reserved for 00_map.md: ${doc}`);
        }
      }
    }
  }
}

function validateNoStrayExports() {
  section('Stray Export Check');

  // Walk the repo looking for .json files that look like n8n exports outside allowed paths
  const allowedDirs = new Set();

  if (fs.existsSync(WORKFLOWS_DIR)) {
    const wfFolders = fs.readdirSync(WORKFLOWS_DIR).filter(e =>
      fs.statSync(path.join(WORKFLOWS_DIR, e)).isDirectory()
    );

    for (const folder of wfFolders) {
      const n8nDir = path.join(WORKFLOWS_DIR, folder, 'n8n');
      allowedDirs.add(n8nDir);
    }
  }

  // Check common places where stray exports might land
  const checkDirs = [REPO_ROOT, WORKFLOWS_DIR];

  for (const dir of checkDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (!fs.statSync(filePath).isFile()) continue;

      // Check if it looks like an n8n workflow export
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        if (parsed.nodes && parsed.connections && (parsed.name || parsed.id)) {
          // This looks like an n8n export
          const parentDir = path.dirname(filePath);
          if (!allowedDirs.has(parentDir)) {
            error(`Stray n8n export: ${path.relative(REPO_ROOT, filePath)} — move to workflows/WF###_<slug>/n8n/`);
          }
        }
      } catch {
        // Not JSON or not parseable — skip
      }
    }
  }

  ok('Stray export check complete');
}

function validateCatalogConsistency(validFolders) {
  section('Catalog Consistency');

  if (!fs.existsSync(CATALOG_PATH)) {
    error(`Catalog missing: ${path.relative(REPO_ROOT, CATALOG_PATH)}`);
    return;
  }

  const catalog = fs.readFileSync(CATALOG_PATH, 'utf8');

  for (const folder of validFolders) {
    const match = folder.match(WF_FOLDER_PATTERN);
    if (!match) continue;

    const wfId = `WF${match[1]}`;
    const pattern = new RegExp(`^## ${wfId} —`, 'm');
    if (pattern.test(catalog)) {
      ok(`${wfId} in catalog`);
    } else {
      error(`${wfId} not found in wf-catalog.md`);
    }
  }
}

function validateMetaJson(folder) {
  const metaPath = path.join(WORKFLOWS_DIR, folder, 'wf.meta.json');
  if (!fs.existsSync(metaPath)) return;

  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const match = folder.match(WF_FOLDER_PATTERN);
    if (!match) return;

    const expectedWfId = `WF${match[1]}`;
    if (meta.wf_id !== expectedWfId) {
      error(`wf.meta.json wf_id mismatch: expected ${expectedWfId}, got ${meta.wf_id}`);
    } else {
      ok('wf.meta.json wf_id matches folder');
    }

    if (!meta.version) warn('wf.meta.json missing version');
    if (!meta.status) warn('wf.meta.json missing status');
  } catch (e) {
    error(`Invalid wf.meta.json: ${e.message}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();

  console.log('\x1b[1m╔═══════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m║   Valian Repo Structure Validator     ║\x1b[0m');
  console.log('\x1b[1m╚═══════════════════════════════════════╝\x1b[0m');

  // Top-level checks (skip if filtering to one WF)
  if (!args.wf) {
    validateTopLevel();
    validateDocsStructure();
  }

  // Get WF folders
  const allFolders = getWfFolders(args.wf);
  const validFolders = allFolders.filter(f => WF_FOLDER_PATTERN.test(f));

  if (!args.wf) {
    validateWfFolderNaming(allFolders);
  }

  // Per-WF validation
  for (const folder of validFolders) {
    section(`Workflow: ${folder}`);
    validateWfRequiredFiles(folder);
    validateReadmeSections(folder);
    validateNodeDocs(folder);
    validateTestPairing(folder);
    validateMetaJson(folder);
  }

  // Cross-cutting checks
  if (!args.wf) {
    validateNoStrayExports();
    validateCatalogConsistency(validFolders);
  }

  // Summary
  console.log('\n\x1b[1m═══ Results ═══\x1b[0m');
  console.log(`  Errors:   ${errorCount}`);
  console.log(`  Warnings: ${warnCount}`);
  console.log(`  WF folders validated: ${validFolders.length}`);

  if (errorCount > 0) {
    console.log(`\n\x1b[31m✗ Validation FAILED with ${errorCount} error(s)\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\n\x1b[32m✓ Validation PASSED\x1b[0m`);
    process.exit(0);
  }
}

main();
