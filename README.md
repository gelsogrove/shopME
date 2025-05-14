# Italian Products Shop

Full Stack E-commerce application for Italian products.

## Technologies

This project uses the following technologies:

### Backend

- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Docker
- JWT Authentication
- Domain-Driven Design (DDD) Architecture

### Frontend

- React
- Next.js
- TypeScript
- TailwindCSS
- Shadcn UI
- Redux Toolkit

## Project Structure

```
/
├── backend/         # Backend API (Node.js, Express, Prisma)
├── frontend/        # Frontend application (React, Next.js)
├── docs/            # Documentation
├── scripts/         # Utility scripts
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd shop

# Install backend dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Development Environment

```bash
# Start PostgreSQL using Docker
docker-compose up -d postgres

# Run backend in development mode
cd backend
npm run dev

# Run frontend in development mode
cd frontend
npm run dev
```

## Test

Il progetto utilizza Jest e Mocha per i test. Per eseguire i test:

```bash
cd backend

# Eseguire tutti i test (unitari e di integrazione)
npm run test

# Eseguire solo i test unitari
npm run test:unit

# Eseguire solo i test di integrazione
npm run test:integration

# Eseguire i test con coverage
npm run test:coverage
```

I test coprono:
- Servizi backend
- Controller API
- Logica di business
- Validazioni
- Integrazione con il database
- Flussi di lavoro end-to-end (integrazione)

### Test di integrazione disponibili:

- **Auth Integration Tests**: Verifica le funzionalità di login, registrazione e autenticazione 
- **User Integration Tests**: Verifica le operazioni CRUD sugli utenti
- **Workspace Integration Tests**: Verifica le operazioni CRUD sui workspace

## API Documentation

API documentation is available at:

- Development: http://localhost:3001/api-docs
- Production: https://api.italianproducts.com/api-docs

## Deployment

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## License

This project is licensed under the MIT License.