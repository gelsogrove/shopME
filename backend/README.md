# Backend

L'API backend del progetto L'Altra Italia Shop.

## Prerequisiti

- Node.js >= 16
- npm o yarn
- PostgreSQL

## Installazione e setup

1. **Installare le dipendenze**

```bash
npm install
```

2. **Configurare le variabili d'ambiente**

Crea un file `.env` basandoti sul file `.env.example` fornito.

3. **Avviare il database con Prisma**

```bash
npx prisma migrate dev
```

4. **Avviare il server in modalità sviluppo**

```bash
npm run dev
```

## Tecnologie utilizzate

- Express.js
- Prisma ORM
- TypeScript
- JWT per l'autenticazione

## Struttura del progetto

Il backend segue il pattern architetturale Domain-Driven Design (DDD):

- `src/domain`: Entità, repository interfaces e value objects
- `src/application`: Servizi applicativi
- `src/infrastructure`: Implementazioni concrete (repository, database)
- `src/interfaces`: Controllers, routes, middlewares, DTOs (interfaccia utente)
- `src/utils`: Funzioni di utilità

## Test

### Test Unitari

Per eseguire i test unitari:

```bash
npm run test:unit
```

I test unitari sono organizzati nelle seguenti cartelle:
- `src/__tests__/unit/services`: Test per i servizi applicativi (5 test)
- `src/__tests__/unit/controllers`: Test per i controller HTTP (4 test)
- `src/__tests__/unit/middleware`: Test per i middleware (1 test)
- `src/__tests__/unit/utils`: Test per le utility (1 test)
- `src/__tests__/unit/repositories`: Test per i repository (pianificati)
- `src/__tests__/unit/mock`: Mock condivisi per i test unitari (4 file)

### Test di Integrazione

Per eseguire i test di integrazione:

```bash
npm run test:integration
```

I test di integrazione verificano il funzionamento corretto delle API interagendo direttamente con gli endpoint HTTP. Questi test sono progettati per verificare il corretto funzionamento delle integrazioni tra i vari componenti del sistema.

I test di integrazione sono organizzati per area funzionale:
- `src/__tests__/integration/auth.spec.ts`: Test di autenticazione (login, registrazione, sessioni)
- Altri test di integrazione pianificati per prodotti, categorie, offerte, ecc.

#### Configurazione dei test di integrazione

I test di integrazione richiedono:
- Un file `.env.test` con le configurazioni per l'ambiente di test
- Un database di test separato (configurato in `.env.test`)

#### Esempi di test implementati

- **Auth**: Test di login, registrazione e gestione delle sessioni utente
- Pianificati ma non ancora implementati:
  - **Prodotti**: Creazione, aggiornamento ed eliminazione dei prodotti
  - **Ordini**: Flusso completo di creazione e gestione degli ordini

## Licenza

Proprietario - Tutti i diritti riservati 