#!/bin/bash

# Ottieni i valori dal file .env
source /Users/gelso/workspace/AI/shop/.env

# Estrai parametri dal DATABASE_URL
# Formato: postgresql://username:password@hostname:port/database

# Estrai l'hostname (localhost nel tuo caso)
PGHOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')

# Estrai la porta (5434 nel tuo caso)
PGPORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Estrai il nome del database (shop_db nel tuo caso)
PGDATABASE=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)$/\1/p')

# Estrai l'username (postgres nel tuo caso)
PGUSER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\).*/\1/p')

# Estrai la password (postgres nel tuo caso)
PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\).*/\1/p')

# Esporta le variabili
export PGHOST
export PGPORT
export PGDATABASE
export PGUSER
export PGPASSWORD

# Debug
echo "Configurazione PostgreSQL:"
echo "PGHOST=$PGHOST"
echo "PGPORT=$PGPORT"
echo "PGDATABASE=$PGDATABASE"
echo "PGUSER=$PGUSER"
echo "PGPASSWORD=****"

# Esegui l'MCP
npx @model-context-protocol/postgresql-mcp --verbose
