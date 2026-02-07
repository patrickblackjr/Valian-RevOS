#!/usr/bin/env node
/**
 * secret_scan.js — Repository Secret Scanner
 *
 * Scans all tracked files for common secret patterns:
 * - API keys (Anthropic, OpenAI, GitHub, Slack, Twilio, Supabase)
 * - Private keys (RSA, EC, DSA, OpenSSH)
 * - Authorization headers with actual tokens
 * - JWT tokens
 * - Generic high-entropy strings in sensitive fields
 *
 * Usage:
 *   node scripts/secret_scan.js [--path <dir>] [--verbose]
 *
 * Exit codes:
 *   0 = no secrets found
 *   1 = secrets detected (prints file + line)
 */

const fs = require('fs');
const path = require('path');

// ─── Constants ────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..');

// Directories and files to skip
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  '.claude',
  '.DS_Store'
]);

const SKIP_FILES = new Set([
  'secret_scan.js',       // Don't flag our own patterns
  'wf_export_normalize.js', // Contains redaction patterns, not real secrets
  'package-lock.json'
]);

// File extensions to scan
const SCAN_EXTENSIONS = new Set([
  '.md', '.json', '.js', '.ts', '.jsx', '.tsx', '.py', '.sh',
  '.sql', '.yaml', '.yml', '.toml', '.env', '.cfg', '.conf',
  '.html', '.css', '.txt', '.xml', '.csv'
]);

// Secret patterns with names for clear error messages
const SECRET_RULES = [
  {
    name: 'Anthropic API Key',
    pattern: /sk-ant-api\d+-[A-Za-z0-9_-]{20,}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'OpenAI API Key',
    pattern: /sk-[A-Za-z0-9]{40,}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /ghp_[A-Za-z0-9]{36,}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'GitHub OAuth Token',
    pattern: /gho_[A-Za-z0-9]{36,}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'GitHub App Token',
    pattern: /ghs_[A-Za-z0-9]{36,}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Slack Bot Token',
    pattern: /xoxb-[0-9]+-[0-9]+-[A-Za-z0-9]+/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Slack User Token',
    pattern: /xoxp-[0-9]+-[0-9]+-[0-9]+-[a-f0-9]+/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Slack App Token',
    pattern: /xapp-[0-9]+-[A-Za-z0-9]+-[0-9]+-[a-f0-9]+/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Twilio Account SID',
    pattern: /AC[a-f0-9]{32}/g,
    severity: 'HIGH'
  },
  {
    name: 'Twilio Auth Token (in context)',
    // Only flag if it looks like it's in a config/assignment context
    pattern: /(?:auth_token|authToken|TWILIO_AUTH_TOKEN)['":\s]*=?\s*['"]([a-f0-9]{32})['"]/gi,
    severity: 'CRITICAL'
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'CRITICAL'
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL'
  },
  {
    name: 'Supabase Service Role Key (JWT)',
    // Service role keys start with eyJ and are long
    pattern: /(?:service_role|SERVICE_ROLE|serviceRoleKey|service_role_key)['":\s]*=?\s*['"]?(eyJ[A-Za-z0-9_-]{100,})['"]/gi,
    severity: 'CRITICAL'
  },
  {
    name: 'Generic Bearer Token in Header',
    // Actual bearer tokens (not placeholders/redacted)
    pattern: /["']?Authorization["']?\s*[:=]\s*["']Bearer\s+(?!(\[REDACTED\]|<|{|\$))[A-Za-z0-9._-]{20,}["']/gi,
    severity: 'HIGH'
  },
  {
    name: 'Password in Connection String',
    pattern: /(?:postgres|mysql|mongodb|redis):\/\/[^:]+:([^@\s]{8,})@/g,
    severity: 'CRITICAL',
    exclude: /\[PASSWORD\]|\[REDACTED\]|<YOUR_|PASSWORD_HERE|PLACEHOLDER/i
  },
  {
    name: 'Hardcoded Password Assignment',
    pattern: /(?:password|passwd|pwd|secret)['":\s]*=\s*['"][^'"]{8,}['"]/gi,
    severity: 'HIGH',
    // Exclude common non-secrets
    exclude: /placeholder|example|changeme|password123|test|mock|dummy|sample|xxx|TODO/i
  }
];

// Files that are allowed to reference secrets by name (but not contain actual values)
const ALLOWLIST_FILES = new Set([
  'CLAUDE.md'  // Contains credential references (names only, not values... ideally)
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

let findingCount = 0;

function finding(severity, rule, file, line, lineNum, match) {
  findingCount++;
  const relPath = path.relative(REPO_ROOT, file);
  const severityColor = severity === 'CRITICAL' ? '\x1b[31m' : '\x1b[33m';
  console.log(`${severityColor}[${severity}]\x1b[0m ${rule}`);
  console.log(`  File: ${relPath}:${lineNum}`);
  // Show a snippet with the match masked
  const masked = line.replace(match, `\x1b[41m${match.slice(0, 8)}...REDACTED\x1b[0m`);
  console.log(`  Line: ${masked.trim().slice(0, 120)}`);
  console.log('');
}

// ─── File Walker ──────────────────────────────────────────────────────────────

function walkDir(dir) {
  const results = [];

  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;

    const fullPath = path.join(dir, entry);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (stat.isFile()) {
      if (SKIP_FILES.has(entry)) continue;

      const ext = path.extname(entry).toLowerCase();
      // Scan files with known extensions OR no extension (could be configs)
      if (SCAN_EXTENSIONS.has(ext) || ext === '') {
        results.push(fullPath);
      }
    }
  }

  return results;
}

// ─── Scanner ──────────────────────────────────────────────────────────────────

function scanFile(filePath) {
  const filename = path.basename(filePath);
  const isAllowlisted = ALLOWLIST_FILES.has(filename);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }

  // Skip binary files
  if (content.includes('\0')) return;

  const lines = content.split('\n');

  for (const rule of SECRET_RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Reset regex state
      rule.pattern.lastIndex = 0;

      let match;
      while ((match = rule.pattern.exec(line)) !== null) {
        const matchStr = match[0];

        // Check exclude pattern
        if (rule.exclude && rule.exclude.test(matchStr)) continue;

        // Skip redacted values
        if (matchStr.includes('[REDACTED') || matchStr.includes('REDACTED]')) continue;

        // For allowlisted files, only flag CRITICAL severity
        if (isAllowlisted && rule.severity !== 'CRITICAL') continue;

        // Skip if line is clearly a comment explaining the format
        const trimmed = line.trim();
        if (trimmed.startsWith('//') && trimmed.includes('example')) continue;
        if (trimmed.startsWith('#') && trimmed.includes('example')) continue;

        finding(rule.severity, rule.name, filePath, line, i + 1, matchStr);
      }
    }
  }
}

// ─── Argument Parsing ─────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { scanPath: REPO_ROOT, verbose: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--path' && args[i + 1]) {
      result.scanPath = path.resolve(args[++i]);
    } else if (args[i] === '--verbose') {
      result.verbose = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node scripts/secret_scan.js [--path <dir>] [--verbose]

Options:
  --path <dir>   Directory to scan (default: repo root)
  --verbose      Show files being scanned
  --help, -h     Show this help message
`);
      process.exit(0);
    }
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs();

  console.log('\x1b[1m╔═══════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m║      Valian Secret Scanner            ║\x1b[0m');
  console.log('\x1b[1m╚═══════════════════════════════════════╝\x1b[0m\n');

  const files = walkDir(args.scanPath);
  console.log(`Scanning ${files.length} files...\n`);

  for (const file of files) {
    if (args.verbose) {
      console.log(`  Scanning: ${path.relative(REPO_ROOT, file)}`);
    }
    scanFile(file);
  }

  // Summary
  console.log('\x1b[1m═══ Results ═══\x1b[0m');
  console.log(`  Files scanned: ${files.length}`);
  console.log(`  Secrets found: ${findingCount}`);

  if (findingCount > 0) {
    console.log(`\n\x1b[31m✗ SECRET SCAN FAILED — ${findingCount} secret(s) detected\x1b[0m`);
    console.log('  Remove or redact secrets before committing.');
    process.exit(1);
  } else {
    console.log(`\n\x1b[32m✓ No secrets detected\x1b[0m`);
    process.exit(0);
  }
}

main();
