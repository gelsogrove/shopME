===============================================================================
SISTEMA CHECK - DOMANDE DI VERIFICA TECNICA
===============================================================================

QUESTO FILE NON SI DEVE MODIFICARE!!! quello che farai e' fare una copia e mettere
check , di done o errore con eventuali note in caso di errore
IN CASO DI ERRORI INTERROMPI IL CHECK !!!
se trovi un errore blocca il processo di check !!!



>> A. COMPILAZIONE E SERVIZI

[ ] A1. Il backend compila senza errori con `npm run build`?
[ ] A2. Il frontend (Vite) builda correttamente con `npm run build`?
[ ] A3. `npm run seed` funziona ?
[ ] A4. Tutti i container Docker sono UP e healthy?

>> B. FUNZIONAMENTO FLUSSI

[ ] B1. Utente NON registrato riceve messaggio welcome con link?
[ ] B3. I saluti multilingue (ciao, hola, hello, hi, buongiorno) sono riconosciuti e ritorna il messagggio di welcome message?
[ ] D1. Il POST a N8N avviene SOLO per utenti registrati?
[ ] D2. La risposta N8N viene salvata nello storico?
[ ] D3. L’URL del webhook N8N è preso dinamicamente da `workspace.n8nWorkflowUrl`?
[ ] E1. Il webhook WhatsApp `/api/whatsapp/webhook` è attivo e risponde? 
[ ] E2. Il webhook riceve i messaggi correttamente da WhatsApp?
[ ] E3. Viene generato un token di sessione all'arrivo di un messaggio?

>> F. TEST DEI FLUSSI

[ ] F1. POST curl a `http://localhost:5678/webhook-test/webhook-start` con payload funziona?
[ ] F2. Payload usato è uguale a: `n8n/webhook-payload-example.json`?
[ ] F3. La risposta N8N viene visualizzata nel frontend (se attivo)?

 
>> H. LOGICA E SICUREZZA

[ ] H1. token viene generato correttamente e validato da middleware?
[ ] H2. Ogni query filtra per `workspaceId` (isolamento)?
[ ] H3. I rate limit API sono configurati (es. 1000/10min)?
 
[ ] nel seed vengono lanciati i comandi per lanciare il generate embedding di faq services, products,documents


[ ] esiste un mcp che dopo il embedding dei prodotti cerca il vero prodotto cerca i prezzo la qta lo sconto e ritorna la risposta?

[ ] il seed prevede degli ordini gia' effettuati ?
[ ] ci sono file che non venongo usati e possiamo cancellari ? per esempio gil script
[ ] cursor rules sono rispettate ?
[ ] IL backenbd e il Frontend hanno un buon livello di programmazione e dividono bene in cartelle le varie responsabilita?
 
[ ] le CF ricevono tutte il token ? 
[ ] il seed crea il file pdf dentro /uploads/document?

[ ] Vedi criticita? bug ? 
[ ] lint funziona sia di BE che di FE?
[ ] I log possiamo cacellarli se ci sono
[ ] Readme E' aggiornato correttamente ?
[ ] il package in root voglio solo che abbia npm run dev di FE e di BE voglio che abbia il comando per lanciare il seed voglio che abbia il comando per lanciare il docker voglio che abbia uno script che cancella e killa tutte le porte che utilizza questa app

[ ] Readme E' aggiornato correttamente ?
[ ] il package in root voglio solo che abbia npm run dev di FE e di BE voglio che abbia il comando per lanciare il seed voglio che abbia il comando per lanciare il docker voglio che abbia uno script che cancella e killa tutte le porte che utilizza questa app
[ ] devi aggiungere dei task ? nuovi dentro il il file task list?
[ ] quando lanciamo il seed cancelliamo tutti i flussi prima di importare il nuovo prensente dentro la cartella  /Users/gelso/workspace/AI/shop/n8n/shopme-whatsapp-workflow.json
[ ] Puoi aggioranre la checklist per veedere se e' da aggiornare?
[ ] Puoui vedere se il PRD e' aggiornato con test, codice , e task list?
[ ] mi devi controllare se generate embedding si esegue dopo il seed su faq, services, producst,documents
[ ] mi devi controllare che le credenziali dentro n8n siano importate correttamente
[ ] se l'operatore prende il controllo LLM non deve piu rispondere viene fatto questo controllo dentro n8n o nel codice ?
 [ ] controllq che prd e task-list siano sempre allineati