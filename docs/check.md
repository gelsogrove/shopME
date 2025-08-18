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

crea un report check_report.md copiando questa struttura e mettendo icone dentro [] oer capire cosa e' andato bene o male e quello male metti commento. o se c'e' una domanda rispondi con commento ma us questo formato! te lo dico prima peche' non lo fai mai... 


********STAR********

- [ ] fai la build prima di partire e guarda se vanno i test dopo npm run seed

********CHECKS********

- [ ] un utente se non e' registrato non puo' accedere alla piattaforma e gli verra sempre fuori un link di regstazione ad ogni messaggio ? (controll nel codice)

- [ ] se un utente e' bloccato non c'e' nessuna risposta giusto? (controll nel codice)

- [ ] se un untente ha il flag IschatBotActive (mi sembra si chiami cosi) non risponde e l'operatore dovra rispondere manualmente fino a che non mette a false il flag, giusto? (controll nel codice)

- [ ] Se il channel non e' attivo deve ritornare un wip message in lingua dell'utente giusto? abbiamo un test? (controll nel codice)

- [ ] se un utente scrive "Ciao" la risposta del welcome message sara' in italiano e cosi via per Spagnolo inglese e portoghere  (controll nel codice)

- [ ] se un utente cheide la lista dei podotti LLM deve ritorare lista prodotti chuamando la CF relazionata (controll nel codice)

- [ ] se un untente chiede di aggiungere un prodtto al carrello deve funzionare e ritonare il carrello sempre quando si modifica un elemento del carrello (controll nel codice)

- [ ] se un utente chiede di confermarae un ordine si deve apreire un link dove potra cofermare (controll nel codice)

- [ ] se un untete cheide una faq il sistema risponde  (controll nel codice)

- [ ] se un utente scrive una faq in itailano deve poter funzionare anche se il db e' in inglese (controll nel codice)

- [ ] se un utente chiede di cambaire un dato personale si apre un link al profile con il token (controll nel codice)

- [ ] se un utente chiede i servizi devi rispodnere con la lista 

- [ ] se un utente chiede di parlare con un operatore deve rispondere e lanciare la call fucntion

- [ ] se un utente vuole vedere l'ultimo ordine deve rispodenre con un link che va alla pagina di dettaglio dell'utlitmo ordine


- [ ] se un utente vuole scaricare unu pdf deve avere un link che va alla pagina di dettaglio e trava i bottoni di download (invoice e ddt)

- [ ]se un utente vuole seguire la merce deve avere il link de  dettaglio  dell'ordine  dove si potra' cliccare il tracking

- [ ] se un utente conferma un ordine si pulisce il carrello dell'LLM ?

- [ ] se c'e' un offerta attiva si rispecchia nel prezzo del prodotto?

- [ ] se un untente scrive in inglese il prompt risponde in inglese

- [ ] se un utente saluta in portoghese risponde in portoghese?

- [ ] ci sono dati sensibili secondo te che vanno a openRouter ? 

- [ ] ci sono scripts che non vengono usati e dobbiamo cancellare?

- [ ] ci sono file temporanei che dobbiamo cancellare ? 

- [ ]  nel seed vengono lanciati i comandi per lanciare il generate embedding di faq services, products,documents

- [ ] Readme E' aggiornato correttamente ? 

- [ ] mi devi controllare se generate embedding si esegue dopo il seed su faq, services, producst,documents 

- [ ] NON ci sono testi in italiano nel codice vero? se si correggi

- [ ] NON CI SONO console.log vero ? 

- [ ] c'e' sempre un filtro di workspaceId nella chiamate di find ?

- [ ] aggiorna la task list dentro memory bank se c'e' quclsao in sospeso

- [ ] non ci deve essere in root package.json o cartella node_modules

- [ ] il database e' pulito da campi che non si usano ?

- [ ] Miglioramenti di FE non so unificare, documentare, migliroare, cambiare? 

- [ ] Miglioramenti di BE non so unificare, documentare, migliroare, cambiare? 

- [ ] Codice inutilizzato da cancellare o codice duplicato ?

- [ ] non voglio file di backup o temporanei in generale cancellali tutti anche se nascosti


- [ ] Puoui vedere se il PRD e' aggiornato ed e' in linea con quello sviluppato ?

- [ ] Ci sono test in skip da risolvere?

- [ ] Da la build il backend e il frontentd ? 

- [ ] Vanno i test unitari ?

- [ ] Il PRD e' aggoirnato dopo i cambi che hai fatto ?

- [ ]  Il PRD e' ben organizzato ci sono ripetizioni ? e' ben raggruppato? modifica se vuoi ma non cancellare parti importanti e' molto importante non avere sorprese qui sistemare senza perdere nulla in maniera chirurgica! usa la logica la testa..
se hai dubbi chiedi.

- [ ] swagger e' aggiornato ?

- [ ] di harcodeato cosa hai fammi la lista voglio vedere se torna tutto,sicuramente avfai llm della covversione da storico ad array prodotti...c'e' altro ? devo aveflo sotto controllo


- [ ] C'e' un test che mi assicura che la parte dell'ordine va bene?

- [ ] memory bank e attiva e mi dice il prossimo passo ?


- [ ] Stato del progetto in percentuale ?

- [ ] cosa ne pensi del prompt_agent ?

- [ ] Prossimi task?