#!/bin/bash

# Test script for rate limiting - checks headers
# Makes 21 requests and checks rate limit headers

echo "🧪 Testing Rate Limiting Headers"
echo "=================================================="
echo "Target: http://localhost:5001/api/auth/me"
echo "Checking for RateLimit-* headers"
echo "=================================================="
echo ""

for i in {1..21}; do
  # Make request and capture headers and status
  RESPONSE=$(curl -s -i http://localhost:5001/api/auth/me)
  STATUS=$(echo "$RESPONSE" | grep "HTTP/" | awk '{print $2}')
  LIMIT=$(echo "$RESPONSE" | grep -i "ratelimit-limit:" | awk '{print $2}' | tr -d '\r')
  REMAINING=$(echo "$RESPONSE" | grep -i "ratelimit-remaining:" | awk '{print $2}' | tr -d '\r')
  
  if [ "$STATUS" = "429" ]; then
    echo "❌ Request $i: Rate limit hit (429)"
    echo "   Headers: Limit=$LIMIT, Remaining=$REMAINING"
    break
  else
    echo "✅ Request $i: Status $STATUS, Remaining=$REMAINING/$LIMIT"
  fi
  
  # Small delay
  sleep 0.05
done

echo ""
echo "=================================================="
