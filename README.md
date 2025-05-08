# L'Altra Italia Shop

## Overview

L'Altra Italia Shop è una piattaforma e-commerce completa per la vendita di prodotti italiani autentici, con integrazione WhatsApp per assistenza clienti tramite chatbot AI. Il sistema è progettato con un'architettura moderna e scalabile, utilizzando Domain-Driven Design (DDD) per il backend e un'interfaccia utente reattiva per il frontend. Il frontend è sviluppato con **Vite** per un'esperienza di sviluppo veloce e moderna.

## Tecnologie

### Frontend
- **React 18** con **TypeScript**
- **Vite** per bundling e sviluppo (l'applicazione frontend utilizza Vite come dev server e build tool)
- **React Router** per la navigazione
- **TailwindCSS** per lo styling
- **Shadcn/UI** per componenti UI
- **React Query** per la gestione dello stato e le chiamate API
- **React Hook Form** per la gestione dei form

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
   http://localhost:3001/api/docs
   ```

La documentazione Swagger permette di:
- Visualizzare tutti gli endpoint disponibili
- Testare le API direttamente dall'interfaccia
- Vedere i modelli di dati e i parametri richiesti
- Eseguire richieste di prova con autenticazione

### Estendere la Documentazione Swagger

Attualmente, solo alcune API (principalmente quelle relative ai workspace) sono documentate con Swagger. Per aggiungere documentazione per altre API:

1. Aggiungi commenti JSDoc con tag Swagger ai controller o alle route:

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Ottiene la lista dei prodotti
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista dei prodotti
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
```

2. Definisci i modelli di dati nel file `src/config/swagger.ts`:

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 */
```

3. Riavvia il server per applicare le modifiche.

## Autenticazione

L'applicazione utilizza l'autenticazione JWT. Le credenziali predefinite per l'accesso sono:

- Email: admin@shopme.com
- Password: admin123
