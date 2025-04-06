# ShopMe - WhatsApp E-commerce Platform

## Overview

ShopMe è una piattaforma e-commerce basata su WhatsApp che permette di vendere prodotti italiani DOP, IGP e DOCG attraverso un'interfaccia conversazionale.

## Architecture

The project is structured as a monorepo using Turborepo, which provides several benefits:

- **Unified Development Experience**: All code lives in a single repository, making it easier to manage dependencies, share code, and maintain consistency.
- **Optimized Build System**: Turborepo provides intelligent build caching and parallel execution of tasks.
- **Workspace Management**: Using npm workspaces for efficient package management across packages.
- **Standardized Tooling**: Shared configurations for TypeScript, ESLint, and other tools.

```
shop/
├── backend/           # Node.js API with Prisma
│   ├── src/          # Backend source code
│   ├── prisma/       # Database schema and migrations
│   └── package.json  # Backend-specific dependencies
├── frontend/         # Next.js web application
│   ├── src/         # Frontend source code
│   ├── public/      # Static assets
│   └── package.json # Frontend-specific dependencies
├── package.json     # Root package.json with workspaces
├── turbo.json      # Turborepo configuration
└── docker-compose.yml
```

### Build System

Turborepo manages our build pipeline with:

- Parallel task execution
- Remote caching
- Incremental builds
- Dependency graph optimization

### Workspace Dependencies

```json
{
  "workspaces": ["backend", "frontend"]
}
```

## Requisiti

- Node.js (v18 o superiore)
- Docker e Docker Compose
- PostgreSQL (fornito via Docker)

## Quick Start

```bash
# 1. Posizionati nella root del progetto
cd shop

# 2. Installa tutte le dipendenze (questo comando installerà tutto per backend e frontend)
npm install

# 3. Setup del database
npm run prestart          # Avvia il database
npm run db:reset         # Reset del database
npm run db:seed         # Popolamento dati

# 4. Avvia l'applicazione in una delle seguenti modalità:

# Modalità Development Standard
npm run dev

# Modalità Development con MCP (per sviluppo)
npm run dev:mcp
```

## Modalità di Avvio

### 1. Modalità Development Standard

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 2. Modalità Development con MCP

```bash
npm run dev:mcp
```

- Frontend con MCP attivo
- Backend: http://localhost:3001

### 3. Comandi Database

```bash
npm run db:reset     # Reset completo del database
npm run db:seed      # Popolamento dati di esempio
npm run db:studio    # Apri Prisma Studio (http://localhost:5555)
```

### 4. Gestione Docker

```bash
npm run prestart     # Avvia i container
npm run stop        # Ferma i container
npm run stop:all    # Ferma e rimuove i container e volumi
```

## Struttura del Progetto

```
shop/
├── backend/         # Server Node.js con Prisma
├── frontend/        # Applicazione Next.js
├── package.json     # Package.json principale con i workspaces
└── docker-compose.yml
```

## Gestione Dipendenze

Il progetto usa una struttura monorepo con npm workspaces, quindi:

✅ CORRETTO:

```bash
# Nella root del progetto (cartella shop)
npm install    # Questo installa tutte le dipendenze per backend e frontend
```

❌ NON NECESSARIO:

```bash
# NON serve eseguire npm install nelle sottocartelle
cd backend && npm install    # Non necessario
cd frontend && npm install   # Non necessario
```

## Comandi Disponibili

Tutti i comandi vanno eseguiti dalla root del progetto:

### Sviluppo

```bash
npm run dev          # Avvia in modalità standard
npm run dev:mcp      # Avvia con MCP per sviluppo
npm run build        # Build di frontend e backend
npm run lint         # Lint di frontend e backend
npm run test         # Test di frontend e backend
```

### Database

```bash
# Avvia il database
npm run prestart

# Reset e seed (dalla cartella backend)
cd backend
npx prisma migrate reset --force
npx prisma db seed

# Visualizza il database
cd backend
npx prisma studio
```

### Docker

```bash
npm run prestart     # Avvia i container Docker
npm run stop        # Ferma i container
npm run stop:all    # Ferma i container e rimuove i volumi
```

## Troubleshooting

Se incontri problemi:

1. **Il database non si connette**

```bash
npm run stop:all
npm run prestart
npm run db:reset
```

2. **Errori di dipendenze**

```bash
# Dalla root del progetto (shop)
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
npm install
```

3. **Errori di Prisma**

```bash
cd backend
npx prisma generate
```

4. **Errori con MCP**

```bash
# Ferma tutti i processi
npm run stop:all

# Riavvia in modalità MCP
npm run dev:mcp
```

## Note Importanti

- Il database gira sulla porta 5434 per evitare conflitti con eventuali istanze PostgreSQL locali
- Prisma Studio è accessibile su http://localhost:5555
- Il frontend è accessibile su http://localhost:3000
- Il backend è accessibile su http://localhost:3001

## Porte Utilizzate

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: http://localhost:5434
- Prisma Studio: http://localhost:5555

## Task Completati

### TASK-001: Setup Docker environment ✅

- Configurato docker-compose con PostgreSQL, Redis e Adminer
- Impostati volumi per la persistenza dei dati
- Configurate variabili d'ambiente

### TASK-002: Configure Prisma ORM ✅

- Schema Prisma completo con tutti i modelli
- Relazioni e enumerazioni configurate
- Migrazione iniziale creata e applicata
- Client Prisma generato

### TASK-003: Create initial seed script ✅

- Script di seed creato con:
  - Admin user (admin@shop.me)
  - Workspace demo
  - 5 categorie (Elettronica, Abbigliamento, Casa, Sport, Libri)
  - 10 prodotti demo (2 per categoria)

## Credenziali Demo

### Admin User

- Email: admin@shop.me
- Password: admin123

### Database

- Host: localhost
- Porta: 5434
- Database: shop_db
- Username: postgres
- Password: postgres

### Redis

- Host: localhost
- Porta: 6380
- Password: redis_secure_password

## Configurazione Ambiente

1. Copia il file di esempio delle variabili d'ambiente:

```bash
cp .env.example .env
```

2. Configura le variabili d'ambiente nel file `.env`:

### Credenziali Demo

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/shop_db"
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL="redis://:redis_secure_password@localhost:6380"
REDIS_PASSWORD=redis_secure_password

# Admin User
# Email: admin@shop.me
# Password: admin123
```

### Porte dei Servizi

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5434
- Redis: localhost:6380
- Adminer: http://localhost:8080
- Prisma Studio: http://localhost:5555
