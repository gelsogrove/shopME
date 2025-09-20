ricordati:

- LLM del prompt principale decide la funzione da chiamare (per modificarlo correggi prompt_agent.md e lancia npm run update:prompt)

- Se il main prompt non chiama nessuna call function:

  1. il codice DEVE salvare in una variabile la risposta generica del modello (genericReply).
  2. poi eseguire SearchRag usando domanda, workspaceId, customerId e languageUser.
  3. se SearchRag restituisce risultati -> passare il risultato al Formatter.
     - Il Formatter fa SOLO replace delle variabili (includere lingua), e restituisce il testo finale in modo naturale.
     - Il Formatter NON deve eseguire logica, branching o usare regex; deve solo "rispondere nella lingua del cliente".
  4. se SearchRag non restituisce risultati (array vuoto) -> ritorniamo al'utente la genericReply salvata precedentemente.

- NON hardcodare nulla: è l'LLM che decide quale funzione chiamare e con quali parametri.
- I nomi delle CF devono corrispondere ESATTAMENTE a quelli in prompt_agent.md (PascalCase).
- Durante il debug usare SEMPRE curl diretto al webhook per verificare le functionCalls reali; il client MCP con log=true può mostrare log vecchi.
- Il layer di traduzione (se presente) deve essere chiaramente separato e usato solo quando necessario; il prompt deve sempre contenere languageUser.
- Pulisci log/temporanei una volta che la soluzione è verificata.

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

-Ho applicato la regola "token-first" richiesta: quando i risultati da RAG contengono uno o più elementi con i token speciali [LIST_ALL_PRODUCTS], [LIST_SERVICES], [LIST_CATEGORIES], [LIST_OFFERS], il servizio interno /api/internal/rag-search ora restituisce solo quegli elementi e scarta tutti gli altri. Se non ci sono token, il comportamento resta invariato.

🚨 **LEZIONI CRITICHE DEBUG CF:**

- **REGOLA DEBUG MCP**: Il MCP client con log=true può mostrare log VECCHI dal file /tmp/shopme-server.log invece dei log attuali. Per debug accurato usa SEMPRE curl diretto al webhook per vedere la risposta reale.

- **REGOLA NOMI CF**: I nomi delle CF nell'array availableFunctions devono corrispondere ESATTAMENTE a quelli nel prompt_agent.md. Usa PascalCase (es: "SearchSpecificProduct" NON "search_specific_product").

- **REGOLA PROMPT SYNC**: Dopo modifiche al prompt_agent.md, SEMPRE verificare che npm run update:prompt abbia sincronizzato correttamente il database controllando la lunghezza del prompt nel DB vs file.

- **REGOLA TEST DIRETTO**: Per verificare che una CF funzioni, usa curl diretto al webhook invece del MCP client. La risposta JSON mostra esattamente quale CF viene chiamata nel campo "functionCalls".

- **REGOLA LOG INGANNEVOLI**: Se vedi log che sembrano vecchi (con timestamp passati) durante il debug, NON fidarti. Il sistema potrebbe funzionare correttamente ma mostrare cache di log precedenti.

- **REGOLA INVESTIGAZIONE**: Prima di modificare codice, SEMPRE verificare che il problema sia reale testando con curl diretto. Non basarti solo sui log del MCP client che possono essere fuorvianti.

PULIRE IL CODICE DA quello che non serve e non viene invocato da nessuno.

- **REGOLA LOG INGANNEVOLI**: Se vedi log che sembrano vecchi (con timestamp passati) durante il debug, NON fidarti. Il sistema potrebbe funzionare correttamente ma mostrare cache di log precedenti.

- **REGOLA INVESTIGAZIONE**: Prima di modificare codice, SEMPRE verificare che il problema sia reale testando con curl diretto. Non basarti solo sui log del MCP client che possono essere fuorvianti.

PULIRE IL CODICE DA quello che non serve e non viene invocato da nessuno.

- Verifica rapida chiamata CF:

  1. Se nei log/webhook vedi un campo `functionCalls` con un oggetto che ha `"name": "GetLinkOrderByCode"` (o altro nome CF esatto) e `result.data.success === true` → la CF è stata chiamata con successo (sì).
  2. Per debug affidabile usa sempre `curl` diretto al webhook e controlla la risposta JSON (campo `functionCalls` e `result`), non fidarti solo dei log MCP client che potrebbero essere cache.
  3. Se `functionCalls` è vuoto o non presente → la LLM non ha chiamato alcuna CF (no); in questo caso il flusso deve salvare `genericReply` ed eseguire SearchRag come da regole.

- Verifica rapida il CF di replace:
  - Se nei log del formatter appaiono:
    - "Token replacement completed" e
    - "Final response" con il link completo,
      allora la CF di replace ha funzionato correttamente (NON è il problema).
  - Se il link è troncato solo nei log ma nel webhook/result.json è presente correttamente → problema di logging/troncamento, non del replace.
  - Sempre confermare con `curl` diretto al webhook controllando `functionCalls` e `result.data.link`.
