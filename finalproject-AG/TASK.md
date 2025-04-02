# 📋 TASK LIST - SHOPME PROJECT

## 2️⃣ Componenti Base (Fondamentali)

- [ ] MainLayout
  - Header con Settings menu e profilo
  - Sidebar con menu principale
  - Container principale
- [ ] Breadcrumbs
  - Componente riutilizzabile
  - Gestione numero telefono e routing
- [ ] ListComponent
  - Search bar
  - Add button
  - Table layout
  - Delete confirmation

## 3️⃣ Autenticazione e Workspace

- [ ] Login Page
  - Form (username/password)
  - Layout diviso con immagine
  - Gestione autenticazione base
- [ ] Workspace
  - Card numeri telefono
  - Form aggiunta numero
  - Layout senza sidebar

## 4️⃣ Dashboard e Sezioni Principali

- [ ] Dashboard Home
  - 4 card statistiche (prima riga)
  - 3 card top items (seconda riga)
  - Recent Orders table
  - Recent Chats cards
- [ ] Products Section
  - List view
  - Add form
  - Edit form
- [ ] Orders Section
  - List view
  - Order details
  - Invoice download
- [ ] Prompts Section
  - List view
  - Add/Edit forms
  - View mode
- [ ] Services Section
  - List view
  - Add/Edit forms

## 5️⃣ Settings Pages

- [ ] Users Management
  - List view
  - Add/Edit forms
  - Table con Phone, Name, Surname, Company, Active
- [ ] Categories Management
  - List view
  - Add/Edit/Delete
  - Table con ID, Title
- [ ] Languages Management
  - List view
  - Add/Edit/Delete
  - Default language handling
- [ ] Channel Settings
  - Dati generali form
  - OpenRouter configuration
  - Debug mode

## 6️⃣ Funzionalità Trasversali

- [ ] Dark Mode
- [ ] Gestione errori
- [ ] Loading states
- [ ] Form validations
- [ ] API integration setup
- [ ] Responsive design
- [ ] Accessibility features

## 7️⃣ Testing e Ottimizzazione

- [ ] Unit testing componenti base
- [ ] Integration testing
- [ ] Performance optimization
- [ ] Browser compatibility
- [ ] Code cleanup
  - Rimozione componenti inutilizzati
  - Rimozione file .js legacy
  - Pulizia cartelle vuote

## 📝 Note Importanti

1. Ogni componente deve seguire esattamente le specifiche UI.md
2. Tutti i testi devono essere in inglese
3. Mantenere coerenza in:
   - Stili e colori
   - Icone e loro utilizzo
   - Spaziature e layout
   - Nomenclatura componenti
4. Implementare correttamente la struttura URL:

```
├── /login
├── /workspace
│ ├── +3465656556
│ └── +3461234567
├── /dashboard/:phoneNumber
│ ├── /products
│ ├── /orders
│ ├── /prompts
│ └── /services
└── /settings
  ├── /users
  ├── /category
  ├── /languages
  └── /channel
```

## ⚠️ Requisiti Critici

- Compilazione corretta con MCP browser tool
- Implementazione esatta come da specifiche UI.md
- Nessun componente o funzionalità extra non richiesta
- Tutti i componenti devono essere TypeScript
- Accessibilità implementata correttamente
