# Scripts Documentation - ShopMe Project

## Overview
This document lists the essential scripts currently available in the `/scripts` folder and what they do.

---

## N8N

- n8n_auto-activate-import.sh
  - Imports and activates the WhatsApp workflow in N8N using admin credentials.
  - Cleans up existing workflows and verifies activation.

---

## System

- start-all-simple.sh
  - Starts core services for local development (backend/frontend/db as configured in the project).

---

## Database & RAG

- generate-embeddings.sh
  - Processes documents to generate embeddings for the RAG system.

---

## Finance

- fix-payment-status.sh
  - Fixes payment status inconsistencies in the database.

---

## Usage

- N8N workflow setup: ./scripts/n8n_auto-activate-import.sh
- Start local services: ./scripts/start-all-simple.sh
- Generate embeddings: ./scripts/generate-embeddings.sh
- Fix payments: ./scripts/fix-payment-status.sh

---

Last updated: 2025-08-11
Maintainer: Andrea
