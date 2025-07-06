===============================================================================
SISTEMA CHECK - DOMANDE DI VERIFICA TECNICA
===============================================================================

>> A. COMPILAZIONE E SERVIZI

[ ] A1. Il backend compila senza errori con `npm run build`?
[ ] A2. Il frontend (Vite) builda correttamente con `npm run build`?
[ ] A3. Tutti i container Docker sono UP e healthy?

>> B. FUNZIONAMENTO FLUSSI

[ ] B1. Utente NON registrato riceve messaggio welcome con link?
[ ] B2. Utente registrato attiva POST a N8N e riceve risposta?
[ ] B3. I saluti multilingue (ciao, hola, hello, hi, buongiorno) sono riconosciuti?

>> C. DATABASE E CONFIG

[ ] C1. La tabella `Customers` ha campo `phone` funzionante?
[ ] C2. Il campo `url` di `Workspace` è valorizzato correttamente?
[ ] C3. `welcomeMessages` in `Workspace` è configurato e valido?

>> D. N8N INTEGRAZIONE

[ ] D1. Il POST a N8N avviene SOLO per utenti registrati?
[ ] D2. La risposta N8N viene salvata nello storico?
[ ] D3. L’URL del webhook N8N è preso dinamicamente da `workspace.n8nWorkflowUrl`?

>> E. WHATSAPP WEBHOOK

[ ] E1. Il webhook WhatsApp `/api/whatsapp/webhook` è attivo e risponde?
[ ] E2. Il webhook riceve i messaggi correttamente da WhatsApp?
[ ] E3. Viene generato un token di sessione all'arrivo di un messaggio?

>> F. TEST DEI FLUSSI

[ ] F1. POST curl a `http://localhost:5678/webhook-test/webhook-start` con payload funziona?
[ ] F2. Payload usato è uguale a: `docs/webhook-payload-example.json`?
[ ] F3. La risposta N8N viene visualizzata nel frontend (se attivo)?

>> G. PROMPT E SESSIONE

[ ] G1. Esiste sempre **uno solo** prompt attivo nel sistema?
[ ] G2. I vecchi prompt vengono **rimossi** prima di importare uno nuovo?
[ ] G3. L’agente usa il prompt corretto in sessione?

>> H. LOGICA E SICUREZZA

[ ] H1. JWT viene generato correttamente e validato da middleware?
[ ] H2. Ogni query filtra per `workspaceId` (isolamento)?
[ ] H3. I rate limit API sono configurati (es. 1000/10min)?
[ ] H4. Il backend API `GET /api/health` risponde con AUTH REQUIRED?

>> I. WORKFLOW N8N

[ ] I1. Il workflow "ShopMe WhatsApp Workflow" è importato e attivo?  e si chiama cosi?
[ ] I2. Il webhook `webhook-start` risponde con "OK flusso completato"?
[ ] I3. Le credenziali OpenRouter e Backend Basic Auth sono configurate?

===============================================================================
