#!/bin/bash
# Script to restart N8N so workflow changes take effect

cd "$(dirname "$0")/.."
echo "Restarting N8N container..."

if command -v docker-compose &> /dev/null; then
  echo "Using docker-compose..."
  docker-compose restart n8n
elif command -v docker &> /dev/null; then
  echo "Using docker command..."
  docker restart shopme_n8n
else
  echo "Error: Neither docker-compose nor docker commands found"
  exit 1
fi

echo "N8N restart completed. Wait a few moments for the service to fully initialize."
echo "Once ready, test the ordering flow again with a message like 'voglio 4 mozzarelle'"
