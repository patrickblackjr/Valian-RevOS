#!/bin/bash

# WF106 v2.0 Test Script
# Purpose: Automated testing for Schema Auto-Builder workflow
# Usage: ./test_wf106_v2.sh [webhook_url]
# Example: ./test_wf106_v2.sh https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="${1:-}"
TEST_RESULTS_FILE="wf106_test_results_$(date +%Y%m%d_%H%M%S).log"

# Helper functions
print_header() {
    echo -e "\n${BLUE}================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if webhook URL provided
if [ -z "$WEBHOOK_URL" ]; then
    print_error "Webhook URL not provided"
    echo "Usage: $0 <webhook_url>"
    echo "Example: $0 https://valiansystems.app.n8n.cloud/webhook/wf106-schema-builder-v2"
    exit 1
fi

# Validate URL format
if [[ ! "$WEBHOOK_URL" =~ ^https?:// ]]; then
    print_error "Invalid webhook URL format. Must start with http:// or https://"
    exit 1
fi

print_header "WF106 v2.0 Test Suite"
print_info "Webhook URL: $WEBHOOK_URL"
print_info "Results will be logged to: $TEST_RESULTS_FILE"
echo ""

# Initialize results log
echo "WF106 v2.0 Test Results - $(date)" > "$TEST_RESULTS_FILE"
echo "Webhook URL: $WEBHOOK_URL" >> "$TEST_RESULTS_FILE"
echo "======================================" >> "$TEST_RESULTS_FILE"
echo "" >> "$TEST_RESULTS_FILE"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=7

# Function to run a test
run_test() {
    local test_name="$1"
    local payload="$2"
    local expected_status="$3"
    local expected_result_status="$4"

    print_info "Running: $test_name"

    # Make request
    response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$payload")

    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n1)
    # Extract body (everything except last line)
    body=$(echo "$response" | head -n-1)

    # Log to file
    echo "TEST: $test_name" >> "$TEST_RESULTS_FILE"
    echo "Expected HTTP: $expected_status, Got: $http_code" >> "$TEST_RESULTS_FILE"
    echo "Response Body:" >> "$TEST_RESULTS_FILE"
    echo "$body" | jq '.' >> "$TEST_RESULTS_FILE" 2>/dev/null || echo "$body" >> "$TEST_RESULTS_FILE"
    echo "" >> "$TEST_RESULTS_FILE"

    # Check HTTP status
    if [ "$http_code" != "$expected_status" ]; then
        print_error "$test_name - HTTP status mismatch (expected $expected_status, got $http_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi

    # Check result status if provided
    if [ -n "$expected_result_status" ]; then
        result_status=$(echo "$body" | jq -r '.result.status' 2>/dev/null || echo "")
        if [ "$result_status" != "$expected_result_status" ]; then
            print_error "$test_name - Result status mismatch (expected $expected_result_status, got $result_status)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    fi

    print_success "$test_name - PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
}

# TEST 1: Minimal Input (Default Envelope)
print_header "TEST 1: Minimal Input (Default Envelope)"
TEST1_PAYLOAD='{
  "payload": {
    "schema_version": "test_001",
    "description": "Foundation Schema - Test Tenant Table",
    "tables": [
      {
        "name": "tenants",
        "columns": [
          {"name": "name", "type": "TEXT", "not_null": true},
          {"name": "status", "type": "TEXT", "not_null": true, "default": "active"}
        ],
        "indexes": [
          {"name": "idx_tenants_status", "columns": ["status"]}
        ]
      }
    ]
  }
}'
run_test "TEST 1: Minimal Input" "$TEST1_PAYLOAD" "200" "applied"

# TEST 2: Full Orchestration Envelope
print_header "TEST 2: Full Orchestration Envelope"
TEST2_PAYLOAD='{
  "meta": {
    "workflow_name": "WF106",
    "workflow_version": "2.0.0",
    "workflow_run_id": "wr_test_12345",
    "idempotency_key": "idem_wf106_test_002",
    "trigger_source": "webhook",
    "timestamp_utc": "2026-02-05T10:00:00.000Z",
    "tenant_id": "t_demo_practice_001",
    "environment": "prod"
  },
  "subject": {
    "tenant_id": "t_demo_practice_001"
  },
  "payload": {
    "schema_version": "test_002",
    "description": "Extended Schema - Add users table",
    "force_apply": false,
    "tables": [
      {
        "name": "users",
        "columns": [
          {"name": "email", "type": "TEXT", "not_null": true, "unique": true},
          {"name": "role", "type": "TEXT", "not_null": true, "default": "staff"}
        ]
      }
    ]
  },
  "context": {
    "actor_id": "user_admin_001",
    "validation_profile": "safe"
  }
}'
run_test "TEST 2: Full Envelope" "$TEST2_PAYLOAD" "200" "applied"

# TEST 3: Idempotency Check (Re-apply Same Schema)
print_header "TEST 3: Idempotency Check (Re-apply Same Schema)"
print_info "Re-applying TEST 1 payload to verify idempotency..."
sleep 1
run_test "TEST 3: Idempotency" "$TEST1_PAYLOAD" "200" "noop"

# TEST 4: Validation Failure (Missing Version)
print_header "TEST 4: Validation Failure (Missing Version)"
TEST4_PAYLOAD='{
  "payload": {
    "description": "Invalid Schema - Missing Version",
    "tables": [
      {"name": "test_table", "columns": []}
    ]
  }
}'
run_test "TEST 4: Missing Version" "$TEST4_PAYLOAD" "400" "blocked"

# TEST 5: Validation Failure (Empty Tables)
print_header "TEST 5: Validation Failure (Empty Tables)"
TEST5_PAYLOAD='{
  "payload": {
    "schema_version": "test_999",
    "description": "Invalid Schema - No Tables",
    "tables": []
  }
}'
run_test "TEST 5: Empty Tables" "$TEST5_PAYLOAD" "400" "blocked"

# TEST 6: Complex Multi-Table Schema
print_header "TEST 6: Complex Multi-Table Schema (3 Tables)"
TEST6_PAYLOAD='{
  "payload": {
    "schema_version": "test_003",
    "description": "Complex Schema - 3 Tables",
    "tables": [
      {
        "name": "patients",
        "columns": [
          {"name": "first_name", "type": "TEXT", "not_null": true},
          {"name": "last_name", "type": "TEXT", "not_null": true},
          {"name": "phone", "type": "TEXT"}
        ],
        "indexes": [
          {"name": "idx_patients_phone", "columns": ["phone"]}
        ]
      },
      {
        "name": "appointments",
        "columns": [
          {"name": "patient_id", "type": "UUID", "not_null": true},
          {"name": "scheduled_at", "type": "TIMESTAMPTZ", "not_null": true},
          {"name": "status", "type": "TEXT", "not_null": true, "default": "pending"}
        ],
        "indexes": [
          {"name": "idx_appointments_scheduled", "columns": ["scheduled_at"]}
        ]
      },
      {
        "name": "events",
        "columns": [
          {"name": "event_type", "type": "TEXT", "not_null": true},
          {"name": "event_data", "type": "JSONB", "not_null": true}
        ]
      }
    ]
  }
}'
run_test "TEST 6: Complex Schema" "$TEST6_PAYLOAD" "200" "applied"

# TEST 7: Column Name Normalization
print_header "TEST 7: Column Name Normalization"
TEST7_PAYLOAD='{
  "payload": {
    "schema_version": "test_004",
    "description": "Test Schema - Column Normalization",
    "tables": [
      {
        "name": "TestTable",
        "columns": [
          {"name": "FirstName", "type": "TEXT"},
          {"name": "last-name", "type": "TEXT"},
          {"name": "Email Address", "type": "TEXT"}
        ]
      }
    ]
  }
}'
run_test "TEST 7: Normalization" "$TEST7_PAYLOAD" "200" "applied"

# Summary
print_header "TEST SUMMARY"
echo ""
print_info "Total Tests: $TOTAL_TESTS"
print_success "Passed: $TESTS_PASSED"
if [ $TESTS_FAILED -gt 0 ]; then
    print_error "Failed: $TESTS_FAILED"
else
    print_info "Failed: $TESTS_FAILED"
fi

echo ""
echo "======================================" >> "$TEST_RESULTS_FILE"
echo "SUMMARY:" >> "$TEST_RESULTS_FILE"
echo "Total Tests: $TOTAL_TESTS" >> "$TEST_RESULTS_FILE"
echo "Passed: $TESTS_PASSED" >> "$TEST_RESULTS_FILE"
echo "Failed: $TESTS_FAILED" >> "$TEST_RESULTS_FILE"

print_info "Full results logged to: $TEST_RESULTS_FILE"

# Exit with appropriate code
if [ $TESTS_FAILED -gt 0 ]; then
    print_error "Some tests failed. Check $TEST_RESULTS_FILE for details."
    exit 1
else
    print_success "All tests passed!"
    exit 0
fi
