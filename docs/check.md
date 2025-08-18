**** CURSOR NON CAMBIARE QUEESTO FILE !!! *******

CHECKS!!

Workspace ID: cm9hjgq9v00014qk8fsdy4ujv  
Customer ID: test-customer-123  


- fai la build prima di partire e guarda se vanno i test

- un utente se non e' registrato non puo' accedere alla piattaforma e gli verra sempre fuori un link di regstazione ad ogni messaggio ?

- se un utente e' bloccato non c'e' nessuna risposta giusto?

- se un untente ha il flag IschatBotActive (mi sembra si chiami cosi) non risponde e l'operatore dovra rispondere manualmente fino a che non mette a false il flag, giusto?

-se il channel non e' attivo deve ritornare un wip message in lingua dell'utente giusto? abbiamo un test?

- se un utente scrive "Ciao" la risposta del welcome message sara' in italiano e cosi via per Spagnolo inglese e portoghere 

- se un utente cheide la lista dei podotti LLM deve ritorare lista prodotti chuamando la CF relazionata

- se un untente chiede di aggiungere un prodtto al carrello deve funzionare e ritonare il carrello sempre quando si modifica un elemento del carrello

- se un utente chiede di confermarae un ordine si deve apreire un link dove potra cofermare

- se un untete cheide una faq il sistema risponde 

- se un utente scrive una faq in itailano deve poter funzionare anche se il db e' in inglese

- se un utente chiede di cambaire un dato personale si apre un link al profile con il toke n

- se un utente chiede i servizi devi rispodnere con la lista

- se un utente chiede di parlare con un operatore deve rispondere e lanciare la call fucntion

- se un utente vuole vedere l'ultimo ordine deve rispodenre con un link che va alla pagina di dettaglio dell'utlitmo ordine


- se un utente vuole scaricare unu pdf deve avere un link che va alla pagina di dettaglio e trava i bottoni di download (invoice e ddt)

- se un utente vuole seguire la merce deve avere il link de  dettaglio  dell'ordine  dove si potra' cliccare il tracking

- se un utente conferma un ordine si pulisce il carrello dell'LLM ?

- se c'e' un offerta attiva si rispecchia nel prezzo del prodotto?

- se un untente scrive in inglese il prompt risponde in inglese

- se un utente saluta in portoghese risponde in portoghese?

- ci sono dati sensibili secondo te che vanno a openRouter ? 

- ci sono scripts che non vengono usati e dobbiamo cancellare?

- ci sono file temporanei che dobbiamo cancellare ? 


-  nel seed vengono lanciati i comandi per lanciare il generate embedding di faq services, products,documents

-Readme E' aggiornato correttamente ? 

- mi devi controllare se generate embedding si esegue dopo il seed su faq, services, producst,documents 

- non ci sono testi in italiano nel codice vero? se si correggi
- NON CI SONO console.log vero ? 
- c'e' sempre un filtro di workspaceId nella chiamate di find ?

- aggiorna la task list dentro memory bank se c'e' quclsao in sospeso
- non ci deve essere in root package.json o node_modules
- il database e' pulito da campi che non si usano ?
- stato del progetto in percentuale ?
- miglioramenti di FE ? 
- miglioramenti di BE ? 
- Codice inutilizzato da cancellare ?
- non voglio file di backup o temporanei in generale cancellali tutti anche se nascosti


- Puoui vedere se il PRD e' aggiornato ed e' in linea con quello sviluppato ?
- ci sono test in skip da risolvere?
- fa la build il backend e il frontentd ? 
- vanno i test unitari ?
- il prd e' aggoirnato dopo i cambi ?
- swagger e' aggiornato ?
 - memory bank e attiva e mi dice il prossimo passo ?