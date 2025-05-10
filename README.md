# L'Altra Italia Shop

## Overview

L'Altra Italia Shop è una piattaforma e-commerce completa per la vendita di prodotti italiani autentici, con integrazione WhatsApp per assistenza clienti tramite chatbot AI. Il sistema è progettato con un'architettura moderna e scalabile, utilizzando Domain-Driven Design (DDD) per il backend e un'interfaccia utente reattiva per il frontend. Il frontend è sviluppato con **Vite** per un'esperienza di sviluppo veloce e moderna.

## Tecnologie

### Frontend

The frontend architecture leverages modern technologies and patterns to create a fast, maintainable, and user-friendly experience:

- **React 18** with **TypeScript** for type-safe component development
- **Vite** as the build tool and development server, providing:
  - Lightning-fast Hot Module Replacement (HMR)
  - Optimized build process with code splitting
  - Built-in API proxy configuration for seamless backend integration
- **Tailwind CSS** for utility-first styling that enables rapid UI development
- **Shadcn/UI** for high-quality, accessible, and customizable UI components
- **React Router** for declarative routing and navigation
- **React Query** for efficient server state management and API integration
- **React Hook Form** with Zod for type-safe form validation

The UI design is inspired by the Bolt.new design system, providing a clean, modern interface with consistent styling and components. The frontend architecture follows best practices:

- Component isolation with clear separation of concerns
- Type safety throughout the application
- Responsive design for all device sizes
- Accessibility compliance
- Performance optimization

### Backend
- **Node.js** con **TypeScript**
- **Express.js** per il server HTTP
- **Prisma ORM** per la gestione del database
- **PostgreSQL** per il database
- **JWT** per l'autenticazione
- **OpenAI API** per l'integrazione con l'AI
- **WhatsApp Business API** per la messaggistica
- **Swagger** per la documentazione delle API
- **Jest e Mocha** per i test

## Struttura del Progetto

```
shop/
├── backend/         # Server Node.js/Express con Prisma
├── frontend/        # Applicazione React con Vite
└── docker-compose.yml  # Configurazione Docker
```

## Comandi

### Frontend

```bash
# Navigare nella directory frontend
cd frontend

# Installare le dipendenze
npm install

# Avviare il server di sviluppo
npm run start

# Compilare per produzione
npm run build
```

### Backend

```bash
# Navigare nella directory backend
cd backend

# Installare le dipendenze
npm install

# Avviare il server di sviluppo
npm run start

# Avviare il server in modalità produzione
npm run start:prod

# Eseguire le migrazioni del database
npm run prisma:migrate

# Popolare il database con dati iniziali
npm run db:seed

# Aprire Prisma Studio (UI per il database)
npm run db:studio

# Eseguire i test
npm run test

# Eseguire i test unitari
npm run test:unit

# Eseguire i test con coverage
npm run test:coverage
```

### Docker

```bash
# Avviare PostgreSQL e altri servizi
docker-compose up -d

# Fermare i servizi
docker-compose down

# Visualizzare i log
docker-compose logs -f
```

## Configurazione del Database

Il progetto utilizza PostgreSQL tramite Docker. La configurazione è definita nel file `docker-compose.yml`:

```yaml
version: '3'
services:
  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=shop
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Variabili d'Ambiente

Creare un file `.env` nella directory `backend` con le seguenti variabili:

```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shop?schema=public"

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# Server
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## Sviluppo

1. Avviare il database PostgreSQL con Docker:
   ```bash
   docker-compose up -d
   ```

2. Avviare il backend:
   ```bash
   cd backend
   npm install
   npm run prisma:migrate
   npm run db:seed
   npm run start
   ```

3. Avviare il frontend:
   ```bash
   cd frontend
   npm install
   npm run start
   ```

4. Accedere all'applicazione:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API (Vite Proxy): http://localhost:3000/api
   - Prisma Studio: http://localhost:5555 (dopo aver eseguito `npm run db:studio`)
   - Swagger API Documentation: http://localhost:3001/api/docs

## Test

Il progetto utilizza Jest e Mocha per i test. Per eseguire i test:

```bash
cd backend

# Eseguire tutti i test
npm run test

# Eseguire solo i test unitari
npm run test:unit

# Eseguire i test con coverage
npm run test:coverage
```

I test coprono:
- Servizi backend
- Controller API
- Logica di business
- Validazioni
- Integrazione con il database

## Swagger API Documentation

Il backend include una documentazione interattiva delle API tramite Swagger UI. Per accedervi:

1. Assicurati che il backend sia in esecuzione:
   ```bash
   cd backend
   npm run start
   ```

2. Apri il browser e vai a:
   ```