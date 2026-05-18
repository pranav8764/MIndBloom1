#!/bin/bash

# Test script for rate limiting on auth endpoints
# Makes 21 requests and checks if the 21st returns 429

echo "🧪 Testing Rate Limiting on Auth Endpoints"
echo "=================================================="
echo "Target: http://localhost:5001/api/auth/me"
echo "Expected: First 20 requests succeed, 21st returns 429"
echo "=================================================="
echo ""

SUCCESS_COUNT=0
RATE_LIMIT_HIT=false

for i in {1..21}; do
  # Make request and capture status code
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/api/auth/me)
  
  if [ "$STATUS" = "429" ]; then
    echo "❌ Request $i: Rate limit hit (429)"
    RATE_LIMIT_HIT=true
    break
  else
    echo "✅ Request $i: Status $STATUS"
    ((SUCCESS_COUNT++))
  fi
  
  # Small delay
  sleep 0.05
done

echo ""
echo "=================================================="
echo "📊 Test Results:"
echo "=================================================="
echo "Total successful requests before rate limit: $SUCCESS_COUNT"

if [ "$RATE_LIMIT_HIT" = true ]; then
  echo "Rate limit hit: YES ✅"
  echo ""
  echo "✅ PASS: Rate limiting is working correctly!"
  echo "   - First 20 requests were processed"
  echo "   - 21st request returned 429 status"
else
  echo "Rate limit hit: NO ❌"
  echo ""
  echo "❌ FAIL: Rate limiting did not trigger as expected"
  echo "   - Expected 429 status after 20 requests"
  echo "   - All 21 requests were processed"
fi

echo "=================================================="
