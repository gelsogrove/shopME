# ShopMe Frontend - Sezioni Implementate

## Autenticazione

### Login Page

- **Percorso**: `/login`
- **File**: `frontend/src/pages/LoginPage.tsx`
- **Funzionalità**:
  - Form di login con email e password
  - Validazione degli input
  - Gestione errori di autenticazione
  - Reindirizzamento alla dashboard dopo login
  - Memorizzazione del token JWT in localStorage

### Selezione Workspace

- **Percorso**: `/workspace-selection`
- **File**: `frontend/src/pages/WorkspaceSelectionPage.tsx`
- **Funzionalità**:
  - Visualizzazione dei workspace disponibili per l'utente
  - Selezione del workspace attivo
  - Memorizzazione dell'ID workspace in sessionStorage
  - Reindirizzamento alla dashboard del workspace selezionato

## Dashboard

### Chat History (Pagina principale)

- **Percorso**: `/chat`
- **File**: `frontend/src/pages/ChatPage.tsx`
- **Funzionalità**:
  - Visualizzazione della lista di chat con clienti
  - Ricerca delle chat per nome cliente
  - Visualizzazione dei messaggi nella chat selezionata
  - Filtro dei messaggi per cliente
  - Area di input per rispondere ai messaggi
  - Indicatori di stato dei messaggi (letto/non letto)
  - Evidenziazione messaggi generati dall'IA

### Dashboard

- **Percorso**: `/dashboard` (reindirizzato a `/chat`)
- **File**: `frontend/src/pages/DashboardPage.tsx`
- **Funzionalità**:
  - Reindirizzamento automatico alla pagina Chat History

## Gestione Prodotti

### Prodotti

- **Percorso**: `/products`
- **File**: `frontend/src/pages/ProductsPage.tsx`
- **Funzionalità**:
  - Visualizzazione elenco prodotti in formato tabella
  - Filtro prodotti per categoria e stato
  - Ricerca prodotti per nome
  - Aggiunta, modifica ed eliminazione prodotti
  - Form di modifica prodotto con campi validati
  - Caricamento immagini prodotto (mockup con placeholder)
  - Gestione dello stato del prodotto (attivo/inattivo)
  - Visualizzazione prezzo e disponibilità

### Categorie

- **Percorso**: `/categories` e `/products/categories`
- **File**: `frontend/src/pages/products/CategoriesPage.tsx`
- **Funzionalità**:
  - Gestione delle categorie di prodotti
  - Aggiunta, modifica ed eliminazione categorie
  - Visualizzazione prodotti associati a ciascuna categoria
  - Ordinamento categorie
  - Form di modifica con validazione

## Gestione Clienti e Ordini

### Clienti

- **Percorso**: `/clients`
- **File**: `frontend/src/pages/ClientsPage.tsx`
- **Funzionalità**:
  - Elenco dei clienti con informazioni di contatto
  - Ricerca clienti per nome e numero di telefono
  - Visualizzazione stato cliente (attivo/inattivo)
  - Accesso rapido alla chat con il cliente
  - Visualizzazione storico ordini del cliente
  - Form per aggiunta e modifica dettagli cliente
  - Gestione preferenze e note cliente

### Ordini

- **Percorso**: `/orders`
- **File**: `frontend/src/pages/OrdersPage.tsx`
- **Funzionalità**:
  - Visualizzazione elenco ordini con filtri per stato
  - Dettaglio ordine con prodotti, quantità e prezzi
  - Gestione stato ordine (pendente, confermato, spedito, consegnato)
  - Download fattura (mockup)
  - Visualizzazione informazioni di pagamento
  - Timeline dello stato dell'ordine
  - Note e commenti sull'ordine

## Gestione Contenuti

### Servizi

- **Percorso**: `/services`
- **File**: `frontend/src/pages/ServicesPage.tsx`
- **Funzionalità**:
  - Gestione dei servizi offerti
  - Aggiunta, modifica ed eliminazione servizi
  - Associazione prodotti ai servizi
  - Gestione disponibilità e prezzi base
  - Form di modifica con validazione

### Prompts

- **Percorso**: `/settings/prompts`
- **File**: `frontend/src/pages/PromptsPage.tsx`
- **Funzionalità**:
  - Gestione dei template di prompt per l'IA
  - Creazione e modifica prompt
  - Associazione prompt a numeri di telefono specifici
  - Editor di testo per il contenuto del prompt
  - Attivazione/disattivazione prompt
  - Test prompt (mockup)

### Offerte

- **Percorso**: `/offers`
- **File**: `frontend/src/pages/OffersPage.tsx`
- **Funzionalità**:
  - Gestione delle offerte e promozioni
  - Creazione campagne con selezione prodotti
  - Programmazione invio messaggi promozionali
  - Selezione target clienti
  - Monitoraggio risultati campagne (mockup)
  - Editor messaggio promozionale

## Impostazioni

### Impostazioni Generali

- **Percorso**: `/settings`
- **File**: `frontend/src/pages/SettingsPage.tsx`
- **Funzionalità**:
  - Impostazioni generali del workspace
  - Configurazione WhatsApp API
  - Gestione webhook
  - Orari operativi
  - Messaggi automatici
  - Impostazioni di notifica
  - Preferenze di sistema

### Tipi di Canale

- **Percorso**: `/settings/channel-types`
- **File**: `frontend/src/pages/settings/ChannelTypesPage.tsx`
- **Funzionalità**:
  - Configurazione dei diversi canali di comunicazione
  - Attivazione/disattivazione canali
  - Configurazione API per ciascun canale
  - Impostazioni specifiche per WhatsApp, Telegram, etc.

### Lingue

- **Percorso**: `/settings/languages`
- **File**: `frontend/src/pages/settings/LanguagesPage.tsx`
- **Funzionalità**:
  - Gestione delle lingue supportate
  - Attivazione/disattivazione lingue
  - Impostazione lingua predefinita
  - Associazione lingua a clienti

### Utenti

- **Percorso**: `/settings/users`
- **File**: `frontend/src/pages/settings/UsersPage.tsx`
- **Funzionalità**:
  - Gestione degli utenti del sistema
  - Assegnazione ruoli e permessi
  - Invito nuovi utenti
  - Attivazione/disattivazione account
  - Reimpostazione password

## Componenti Condivisi

### Layout

- **File**: `frontend/src/components/layout/`
- **Componenti**:
  - `Layout.tsx`: Layout principale dell'applicazione
  - `Sidebar.tsx`: Menu di navigazione laterale
  - `Header.tsx`: Intestazione con informazioni utente e workspace

### UI Components

- **File**: `frontend/src/components/ui/`
- **Componenti**:
  - Componenti base UI (button, input, card, etc.)
  - Componenti shadcn/ui personalizzati
  - Temi e stili applicazione
  - Componenti di form e input

### Componenti Condivisi

- **File**: `frontend/src/components/shared/`
- **Componenti**:
  - `DataTable.tsx`: Tabella dati riutilizzabile con ordinamento e filtri
  - `FormDialog.tsx`: Dialog per form di creazione/modifica
  - `PageHeader.tsx`: Intestazione standardizzata per le pagine
  - `StatusBadge.tsx`: Badge per visualizzare stati
  - `ProductSheet.tsx`: Slide-out panel per dettagli prodotto
  - `ServiceSheet.tsx`: Slide-out panel per dettagli servizio

## Funzionalità Trasversali

### Routing

- **File**: `frontend/src/App.tsx`
- **Funzionalità**:
  - Definizione delle rotte dell'applicazione
  - Protezione rotte con autenticazione
  - Reindirizzamenti
  - Nesting delle rotte per sezioni annidate

### Gestione Stato

- **Approccio**:
  - Utilizzo di React hooks (useState, useEffect)
  - Context API per stato globale
  - Gestione locale dello stato per componenti
  - Approccio stateless dove possibile

### Stili e Temi

- **Tecnologie**:
  - TailwindCSS per styling
  - Tema light/dark
  - Classi utility personalizzate
  - Componenti shadcn/ui
  - Design system coerente
