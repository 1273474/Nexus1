#!/bin/bash

# Base URL
API_URL="http://localhost:4000"

# 1. Login as Manager
echo "Logging in as Manager..."
curl -s -c cookies.txt -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@nexus.com", "password": "manager"}' > login_response.json

cat login_response.json
echo ""

# 2. Assign Shipment
echo "Assigning Shipment..."
curl -s -b cookies.txt -X POST "$API_URL/shipments/assign" \
  -H "Content-Type: application/json" \
  -d '{"shipmentId": "shipment-123", "driverId": "driver-123"}' > assign_response.json

cat assign_response.json
echo ""
