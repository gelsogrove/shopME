ricordati:

- LLM del prompt principale decide la funzione da chiamare (per modificarlo correggi prompt_agent.md e lancia npm run update:prompt)

- se il main prompt non chiama nessuna call function il codice deve salvare in una variabile la risposta generica del modello

- inoltre se il main prompt non chiama NULLA dobbiamo eseguire searchrag

- se searchRag restituisce qualcosa
    > passa il risultato al formatter
    > il formatter fa un replace del prompt
    > ritorna il risultato del formatter

se searchRag non restituisce null array vuoto:
    > ritorniamo all'utente la risposta generica salvata precedentemente



- ricordati che non devi hardcodare nulla nel codice e' LLM che decide chi chiamare e con quali parametri

- togli codice sporco, duplicato voglio la soluzione pulita e che rispetta le regole

- il formatter ricordiamoci che ha il compito di fare il replace e mandare solo la risposta in modo naturale
- il formatter riceve la lingua sconto, workspaceId, customerId, domanda, e risposta del searchRag
- il formatter quando ha la variabile deve fare un replace ovviamente prima di inviarlo al modello

- 🚨 FLUSSO CORRETTO: Se NON è stata chiamata nessuna CF → traduci la domanda in inglese e invia SOLO la traduzione a SearchRag. NON cercare prima in lingua originale.

- controlla quello che fai chiediti se stai facendo le cose giuste se fa la build se stai allineando controlla quello che hai fatto con test

- rispetta le regole del cursorsrules da rispettare se hai dubbi chiedi.

- ricordati che LLM ha lo storico e non il formatter

- ricordati di non usare nessuna regex e' llm che capisce cosa lanciare e che parametri passare

- ricordati che deve risponde nella lingua del cliente nel formatter deve esserci rispondi in "variabile della lingua" che viene passata

- anche nel prompt deve esserci la lingua perche' se non passiamo dal RAG DEVE SAPERE CHE LINGUA PARLARE.

- ricordati che devi provare con mcp log=true update-prompt=true seed =true se necessario, IL LOG true e' necessario perche' nel debug dobbiamo capire cosa passiamo e se lo passiamo correttamente....in principio possiamo dire che se le variabili arrivano giuste al formatter allora ci siamo il passaggio di parametri funziona ...ma poi grazie ai log capiamo dove. perdiamo eventualmente il valore

- cancella log che non servono quando capiamo che la soluzione funziona, cancella file temporanei e log quando capiamo che la funzione va bene


- non devi mai riavviare i servizi questo e' compito del nodemon installato ogni volta che salva il server si riavvia 

- attualizza il memory bank con queste regole.

## 🚨 REGOLA CRITICA FAQ MULTILINGUE

- **FLUSSO CORRETTO**: Se NON è stata chiamata nessuna CF → traduci la domanda in inglese e invia SOLO la traduzione a SearchRag
- **NON CERCARE IN LINGUA ORIGINALE**: SearchRag deve ricevere SOLO la traduzione inglese, non la domanda originale
- **FAQ IN INGLESE**: Tutte le FAQ importanti devono esistere in inglese nel seed.ts
- **ESEMPIO**: "chi sei?" → tradotto in "Who are you?" → SearchRag cerca FAQ inglese "Who are you?"
- **DEBUG**: Se il sistema non trova la FAQ corretta, verificare che esista in inglese nel database

## 🚨 REGOLE CRITICHE FORMATTER - LEZIONI APPRESE

- **FORMATTER DEVE ESSERE SEMPLICE**: Il formatter riceve domanda, risposta, lingua. Passa tutto al prompt LLM: "Rispondi in modo naturale all'utente in [lingua]". Ritorna quello che dice l'LLM.

- **NESSUN IF, NESSUNA CONDIZIONE**: Il formatter NON deve avere logica complessa. Nessun controllo su liste, link, o altro. Solo traduzione naturale.

- **FLUSSO PULITO**: 
  1. Riceve: domanda, risposta (con token già sostituiti), lingua
  2. Prompt LLM: "Rispondi naturalmente in [lingua]"  
  3. Ritorna risposta LLM

- **TEMPERATURA 0.0 PER FORMATTER**: Il formatter deve essere deterministico, non creativo. Deve preservare, non inventare.

- **DEBUG CON FILE LOG**: Usare `/tmp/formatter-debug.log` per tracciare cosa succede nel formatter. È essenziale per capire dove si perdono i dati.


-  ✅ AGGIORNATO: "che prodotti avete?" e "che categorie avete?" ora passano per SearchRag + Token Replacement (OPZIONE A) 

-  assicurati che le variabili vengano sostituite dalla giusta funzione
[LIST_ALL_PRODUCTS]	GetAllProducts()	FAQ con "che prodotti avete?"	✅ CORRETTO
[LIST_CATEGORIES]	GetAllCategories()	FAQ con "che categorie avete?"	✅ CORRETTO
[LIST_SERVICES]	GetAllServices()	FAQ con "che servizi avete?"	✅ CORRETTO
[USER_DISCOUNT]	GetCustomerDiscount()	Sempre quando presente	✅ CORRETTO
[CART_LINK]	ReplaceLinkWithToken()	FAQ con link carrello	✅ CORRETTO
[PROFILE_LINK]	ReplaceLinkWithToken()	FAQ con link profilo	✅ CORRETTO
[ORDERS_LINK]	ReplaceLinkWithToken()	FAQ con link ordini	✅ CORRETTO
[CHECKOUT_LINK]	ReplaceLinkWithToken()	FAQ con link checkout	✅ CORRETTO

## 🚨 REGOLE CRITICHE TRADUZIONE - LEZIONI APPRESE

- **NO HARDCODED TRADUZIONI**: Mai hardcodare traduzioni nel codice. L'LLM e il Formatter sono già capaci di tradurre dinamicamente.

- **TRADUZIONE AUTOMATICA**: Lasciare che l'LLM nel Formatter gestisca le traduzioni automaticamente. Non creare dizionari hardcoded.

- **LINGUA DINAMICA**: Le funzioni CF devono accettare parametro `language` ma lasciare la traduzione al Formatter.

- **FORMATTER TRADUCE**: Il `FormatterService.applyLanguageFormatting` è già configurato per tradurre automaticamente in base alla lingua dell'utente.

- **APPROCCIO PULITO**: Le CF restituiscono dati in inglese, il Formatter li traduce dinamicamente. Più flessibile e manutenibile.

## 🚨 REGOLE CRITICHE PROMPT - LEZIONI APPRESE

- **PROMPT DEVE ESSERE PRECISO**: "che prodotti avete?" deve chiamare `GetAllProducts`, "che categorie avete?" deve chiamare `GetAllCategories`. Mai confondere i trigger.

- **LOGICA DECISIONE CORRETTA**: Nel prompt_agent.md la logica deve essere:
  1. Operatore → ContactOperator
  2. Tracking → GetShipmentTrackingLink  
  3. "che categorie" → GetAllCategories
  4. "che prodotti" → GetAllProducts
  5. Nome specifico → SearchSpecificProduct
  6. Categoria generica → GetProductsByCategory

- **AGGIORNAMENTO PROMPT OBBLIGATORIO**: Dopo ogni modifica al prompt_agent.md, SEMPRE eseguire `npm run update:prompt` per sincronizzare il database.

## 🚨 REGOLE CRITICHE LISTE - LEZIONI APPRESE

- **FORMATTER NON DEVE TRADURRE LISTE**: Quando il Formatter rileva liste (•, -, **), deve SALTARE la formattazione per preservare i dati.



- **SKIP FORMATTING PER PRESERVARE**: Se ci sono liste, saltare `applyLanguageFormatting` e `applyWhatsAppFormatting` per evitare che l'LLM sostituisca le liste con risposte generiche.


- **PRESERVARE SEMPRE I DATI**: Mai sostituire liste specifiche (categorie, prodotti) con risposte generiche come "Abbiamo tanti prodotti disponibili".


- esempi di come chiamare LLM
{
  "user": "Mario Rossi",
  "message": "che prodotti avete?",
  "log": true,
  "exitFirstMessage": true
}

- per aggiornare gli embedding devi solo fare npm run seed

## 🚨 LEZIONI APPRESE - DEBUGGING OPZIONE A

- **RISPETTARE LA TABELLA TOKEN**: Ogni token ([LIST_ALL_PRODUCTS], [LINK_CART_WITH_TOKEN], etc.) ha UNA SOLA funzione responsabile. Non creare doppie gestioni.

- **SEARCHRAG SOLO TRADUZIONE**: Il flusso corretto cerca SOLO in traduzione inglese, non in lingua originale.

## 🚨 LEZIONE CRITICA - FAQ MANCANTI = LLM INVENTA

- **PROBLEMA**: Se manca una FAQ per una domanda comune (es. "che offerte avete?"), il sistema va in LLM fallback che **INVENTA** risposte invece di usare dati reali dal database.

- **SINTOMO**: L'utente chiede "che offerte avete?" e il sistema risponde con informazioni inventate invece di usare i token corretti ([LIST_OFFERS]).

- **SOLUZIONE**: 
  1. Identificare domande comuni mancanti
  2. Aggiungere FAQ con token appropriati nel seed.ts
  3. Verificare che esistano le funzioni per gestire i token
  4. Rigenerare embeddings con npm run seed

- **REGOLA**: Mai permettere che l'LLM inventi dati quando esistono token e funzioni per recuperarli dal database. Ogni domanda comune DEVE avere una FAQ dedicata.

