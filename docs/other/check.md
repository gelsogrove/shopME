****CURSOR NON CAMBIARE QUEESTO FILE !!! *******

Workspace ID: cm9hjgq9v00014qk8fsdy4ujv  
Customer ID: test-customer-123  
backend folder: /Users/gelso/workspace/AI/shop/backend
frontend folder: /Users/gelso/workspace/AI/shop/frontend
Script folder:  /Users/gelso/workspace/AI/shop/scripts
n8n folder: /Users/gelso/workspace/AI/shop/n8n
PRD: /Users/gelso/workspace/AI/shop/docs/PRD.md
docs: /Users/gelso/workspace/AI/shop/docs
task: /Users/gelso/workspace/AI/shop/docs/memory-bank/tasks.md

 

********REPORT FORMAT********

fai un file con le domande e risposte dopo la ricerca


********STAR********

- [x] 1 fai la build prima di partire e guarda se vanno i test dopo npm run seed e guarda se le migrazioni sono attualizzate

********CHECKS********

- [ ] 2 un utente se non e' registrato non puo' accedere alla piattaforma e gli verra sempre fuori un link di regstazione ad ogni messaggio ? (controll nel codice)

- [ ] 3 se un utente e' bloccato non c'e' nessuna risposta giusto? (controll nel codice)

- [ ] 4 se un untente ha il flag IschatBotActive (mi sembra si chiami cosi) non risponde e l'operatore dovra rispondere manualmente fino a che non mette a false il flag, giusto? (controll nel codice)

- [ ] 5 Se il channel non e' attivo deve ritornare un wip message in lingua dell'utente giusto? abbiamo un test? (controll nel codice)

- [ ] 6 se un utente scrive "Ciao" la risposta del welcome message sara' in italiano e cosi via per Spagnolo inglese e portoghere  (controll nel codice)

- [ ] 7 se un utente cheide la lista dei podotti LLM deve ritorare lista prodotti chuamando la CF relazionata (controll nel codice)

- [ ] 8 se un untente chiede di aggiungere un prodtto al carrello deve funzionare e ritonare il carrello sempre quando si modifica un elemento del carrello (controll nel codice)


- [ ] 8.1 se un untente e' bloccato vengono ignorati i messaggi e non salvati nello storioc?


- [ ] mi puoi garantire che questa pagina
http://localhost:3000/orders-public?token=32f2bda9d9a530ed0496f926a60aa75e2c0a8bcf4ad9bec367813068961a7530
puo' vedre gli ordini solo di un utente? e non veda ordini di altri utenti ?



- 9 controlla se i link che vengono generati hanno una corrispondeza con la route 

- [ ] 10 se un utente chiede di confermarae un ordine si deve apreire un link dove potra cofermare (controll nel codice)

- [ ] 11 se un untete cheide una faq il sistema risponde  (controll nel codice)

- [ ] 12 se un utente scrive una faq in itailano deve poter funzionare anche se il db e' in inglese (controll nel codice)

- [ ] 13 se un utente chiede di cambaire un dato personale si apre un link al profile con il token (controll nel codice)

- [ ] 14 se un utente chiede i servizi devi rispodnere con la lista 

- [ ] 15 se un utente chiede di parlare con un operatore deve rispondere e lanciare la call fucntion

- [ ] 16 se un utente vuole vedere l'ultimo ordine deve rispodenre con un link che va alla pagina di dettaglio dell'utlitmo ordine


- [ ] 17 se un utente vuole scaricare unu pdf deve avere un link che va alla pagina di dettaglio e trava i bottoni di download (invoice e ddt)

- [ ] 18 se un utente vuole seguire la merce deve avere il link de  dettaglio  dell'ordine  dove si potra' cliccare il tracking

- [ ] 19 se un utente conferma un ordine si pulisce il carrello dell'LLM ?

- [ ] 20 se c'e' un offerta attiva si rispecchia nel prezzo del prodotto?

- [ ] 21 se un untente scrive in inglese il prompt risponde in inglese

- [ ] 22 se un utente saluta in portoghese risponde in portoghese?

- [ ] 23 ci sono dati sensibili secondo te che vanno a openRouter ? 

- [ ] 24 ci sono scripts che non vengono usati e dobbiamo cancellare?

- [ ] 25 ci sono file temporanei che dobbiamo cancellare ? 

- [ ] 26 nel seed vengono lanciati i comandi per lanciare il generate embedding di faq services, products,documents

- [ ] 27 Readme E' aggiornato correttamente ? 

- [ ] 28 mi devi controllare se generate embedding si esegue dopo il seed su faq, services, producst,documents 

- [ ] 29 mi devi controllare se generate embedding si esegue quando c'e' un cambio di dati dentro faq, products,service,offers?

- [ ] 30 NON ci sono testi in italiano nel codice vero? se si correggi

- [ ] 31 NON CI SONO console.log vero ? 

- [ ] 32 c'e' sempre un filtro di workspaceId nella chiamate di find ?

- [ ] 33 aggiorna la task list dentro memory bank se c'e' quclsao in sospeso

- [ ] 34 non ci deve essere in root package.json o cartella node_modules

- [ ] 35 il database e' pulito da campi che non si usano ?

- [ ] 26vMiglioramenti di FE non so unificare, documentare, migliroare, cambiare? 

- [ ] 37 Miglioramenti di BE non so unificare, documentare, migliroare, cambiare? 

- [ ] 38 Codice inutilizzato da cancellare o codice duplicato ?

- [ ] 39 non voglio file di backup o temporanei in generale cancellali tutti anche se nascosti


- [ ] 40 Puoui vedere se il PRD e' aggiornato ed e' in linea con quello sviluppato ?

- [ ] 41 Ci sono test in skip da risolvere?

- [x] 42 Da la build il backend e il frontentd ? 

- [x] 43 Vanno i test unitari ?

- [ ] 44 Il PRD e' aggoirnato dopo i cambi che hai fatto ?

- [ ]  45 Il PRD e' ben organizzato ci sono ripetizioni ? e' ben raggruppato? modifica se vuoi ma non cancellare parti importanti e' molto importante non avere sorprese qui sistemare senza perdere nulla in maniera chirurgica! usa la logica la testa..
se hai dubbi chiedi.

- [ ] 46 swagger e' aggiornato ?

- [ ] 47 di harcodeato cos' hai? fammi la lista voglio vedere se torna tutto,sicuramente avfai llm della covversione da storico ad array prodotti...c'e' altro ? devo aveflo sotto controllo


- [ ] 48 C'e' un test che mi assicura che la parte dell'ordine va bene?

- [ ] 49 memory bank e attiva e mi dice il prossimo passo ?

- [ ] 50 USAGE VIENE CALCOLATO ? DOVE VIENE MOSTRATO? PREZZO? (CONTROLLA CODICE)

- 51 IL SEED IMPORTA CORRETTAMENTE IL FILE /Users/gelso/workspace/AI/shop/n8n/workflows/shopme-whatsapp-workflow.json


- 52 contorlla che non ci siano variabili non utilizzate dentro il .env di be e di fe

- 53 controlla che il .env.example sia aggiornato

- [ ] 54 Stato del progetto in percentuale ?

- [ ] 55 cosa ne pensi del prompt_agent ?

- [ ] 56 ci sono ancora testi in italiano toglii 

- [ ] 57 Prossimi task o bug in ordine di priorita?

********TOKEN-ONLY SYSTEM CHECKS********

- [ ] 58 TOKEN-ONLY SYSTEM: Tutti i link pubblici usano solo token parameter? (orders-public, customer-profile, checkout)
- [ ] 59 TOKEN-ONLY SYSTEM: Frontend non fa più controlli su phone/workspaceId mancanti?
- [ ] 60 TOKEN-ONLY SYSTEM: Backend estrae correttamente customerId, phone, workspaceId dal token?
- [ ] 61 TOKEN-ONLY SYSTEM: N8N genera link token-only corretti per orders, profile, checkout?
- [ ] 62 TOKEN-ONLY SYSTEM: Prompt_agent istruisce LLM per generare link token-only?
- [ ] 63 TOKEN-ONLY SYSTEM: Token reuse funziona (1 token per user per type, aggiornato solo se scaduto)?
- [ ] 64 TOKEN-ONLY SYSTEM: Workspace isolation automatica tramite token validation?
- [ ] 65 TOKEN-ONLY SYSTEM: Link generation functions (GetOrdersListLink, GetCustomerProfileLink, confirmOrderFromConversation) producono URL token-only?
- [ ] 66 TOKEN-ONLY SYSTEM: Middleware link-corrector non aggiunge più parametri phone?
- [ ] 67 TOKEN-ONLY SYSTEM: API endpoints (/api/orders-public, /api/customer-profile, /api/checkout) accettano solo token?
- [ ] 68 TOKEN-ONLY SYSTEM: Frontend hooks (useTokenValidation, useCheckoutTokenValidation) sono token-only?
- [ ] 69 TOKEN-ONLY SYSTEM: Database schema SecureToken ha constraint unique (customerId, type, workspaceId)?
- [ ] 70 TOKEN-ONLY SYSTEM: Test integration e unit test verificano token-only approach?
- [ ] 71 TOKEN-ONLY SYSTEM: PRD e memory-bank documentano correttamente il sistema token-only?
- [ ] 72 TOKEN-ONLY SYSTEM: Script verify-token-only-system.sh funziona correttamente?
- [ ] 73 TOKEN-ONLY SYSTEM: Tutti i link generati sono nel formato corretto (/orders-public?token=..., /customer-profile?token=..., /checkout?token=...)?
- [ ] 74 TOKEN-ONLY SYSTEM: LLM non inventa più link ma usa solo quelli generati dalle calling functions?
- [ ] 75 TOKEN-ONLY SYSTEM: Sistema è "congelato" e funzionante per deployment?

- [ ] 76 LLM TRANSLATION RULE: Nel prompt_agent.md esiste la regola "PRIMA DI CHIAMARE RagSearch(), se la domanda dell'utente è in italiano o spagnolo, TRADUCI AUTOMATICAMENTE la query in inglese" (linea 374-376)?
 