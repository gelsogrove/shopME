ricordati:

- LLM del prompt principale decide la funzione da chiamare (per modificarlo correggi prompt_agent.md e lancia npm run update:prompt)

- se il main prompt non chiama nessuna call function il codice deve salvare in una variabile la risposta generica del modello

- inoltre se il main prompt non chiama NULLA dobbiamo eseguire searchrag

- se searchRag restituisce qualcosa passa il risultato al formatter
    > il formatter fa un replace delle variabili prima di darlo a OPENROUTER
  > il formatter riceve la lingua sconto, workspaceId, customerId, domanda, e risposta del searchRag
    > struttura del formatter molto semplice traduce la lingua, e poco piu' nessun if nessuna cosa strada ...sara llm che decidera' come stamprae i dati che gli arrivano ..noi dobbiamom mettere lungua conto e fargli capire che deve fare lda riposta...


se searchRag non restituisce null array vuoto:
    > ritorniamo all'utente la risposta generica salvata precedentemente


- ricordati che non devi hardcodare nulla nel codice e' LLM che decide chi chiamare e con quali parametri

- togli codice sporco, duplicato voglio la soluzione pulita e che rispetta le regole

- il formatter ricordiamoci che ha il compito di fare il replace e mandare solo la risposta in modo naturale

- il formatter quando ha la variabile deve fare un replace ovviamente prima di inviarlo al modello

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


- il FORMATTER riceve domanda dati, lingua, cusomerID etc..ec..e non deve far altro che rispondere in lngua...in maniera naturale


- se la CF funziona, NON DEVE passare per traduzione e SearchRag! 

- traduzione layer deve tradurre bene dammi e dove e' perche' altrimenti e' confuso deve aver un prompt specifico che dice di usare give me or show me or where is nei momenti giusti 

🚨 **LEZIONI CRITICHE DEBUG CF:**

- **REGOLA DEBUG MCP**: Il MCP client con log=true può mostrare log VECCHI dal file /tmp/shopme-server.log invece dei log attuali. Per debug accurato usa SEMPRE curl diretto al webhook per vedere la risposta reale.

- **REGOLA NOMI CF**: I nomi delle CF nell'array availableFunctions devono corrispondere ESATTAMENTE a quelli nel prompt_agent.md. Usa PascalCase (es: "SearchSpecificProduct" NON "search_specific_product").

- **REGOLA PROMPT SYNC**: Dopo modifiche al prompt_agent.md, SEMPRE verificare che npm run update:prompt abbia sincronizzato correttamente il database controllando la lunghezza del prompt nel DB vs file.

- **REGOLA TEST DIRETTO**: Per verificare che una CF funzioni, usa curl diretto al webhook invece del MCP client. La risposta JSON mostra esattamente quale CF viene chiamata nel campo "functionCalls".

- **REGOLA LOG INGANNEVOLI**: Se vedi log che sembrano vecchi (con timestamp passati) durante il debug, NON fidarti. Il sistema potrebbe funzionare correttamente ma mostrare cache di log precedenti.

- **REGOLA INVESTIGAZIONE**: Prima di modificare codice, SEMPRE verificare che il problema sia reale testando con curl diretto. Non basarti solo sui log del MCP client che possono essere fuorvianti. 