ricordati:

- LLM del prompt principale decide la funzione da chiamare (per modificarlo correggi prompt_agent.md e lanca npm run update:pront)

- se il main prompt non chiama nessuna call function il codice deve salvae in una variabile la risposta genercia del modello

- inolre se il main prompt non chiama NULLa dobbiamo eseguire searchrag

- se searchRag resistuisce qualcosa
    > passa il risultato al formatter
    > il formatter fa un replace del prompt
    > ritonra il risultato del formatter

se searchRag non restituisce null arra vuoto:
    > ritorniamo all'utente la riposta generica salvata precedentemente



- ricordati che non devi harcodeare nulla nel codice e' LLM che decide chi chiamare e con quali parametri

- togli codice sporco, duplicato voglio la soluzione pulita e che rispetta le regole

- il formatter ricordiamoci che ha il compito di fare il replace e mandare solo la risposta in modo naturale
- il formatter riceve la lingua sconto, workspaceId, customerId, domanda, e risposta del searchRag
- il formatter quando ha la variabile deve fare un replace ovviamente prima di inviarlo al modello

- ricordati che prima di tutto passa dal layer del transalate prima del searchRAg e in questo punto della traduzione i prodotti italiani non li deve tradurre

- controlla quello che fai chiediti se stai facendo le cose giuste se fa la build se stai allicinando controlla quello che hai fatto con test

- rispoetta le regole del cursorsrules da rispettare se hai dubbi chiedi.

- ricordati che LLM ha lo storico e non il formatter

- ricordati di non usare nessuna regex e' llm che capisce cosa lanciare e che parametri passare

- ricordati che deve risponde nella lingua del cliente nel formatter deve esserci rispondi in "variabile della lingua" che viene passata

- anche nel prompt deve eserci la lingua perche' se non passiamo dal RAG DEVE SAPERE CHE LINGUA PARLARE.

- ricordati che devi provafe con mcp log=true update-prompt=true seed =true se necessario, IL LOG true e' necessario perche' nel debug dobbiamo capire cosa passiamo e se lo passiamo correttamente....in principio possiamo dire che se le varabili arrivano giuste al formatter allora ci siamo il passaggio di parametri funziona ...ma poi grazie ai log capiamo dove. perdiamo eventualmente il valore

- cancella log che non servono quando capiamo che la soluziobe funziona, caancella file temporanei e log quando capiamo che la funzione a beene


- non devi mai riavviare i servizi questo e' compito del nodemon installato ogni volta che salva il server si riavvia 

- attualizza il memory bank con qeuste regole.

## 🚨 REGOLE CRITICHE FORMATTER - LEZIONI APPRESE

- **FORMATTER NON DEVE SOVRASCRIVERE**: Il formatter deve PRESERVARE liste, categorie, prodotti specifici. MAI sostituire con risposte generiche.

- **SKIP FORMATTING PER LISTE**: Se la risposta contiene liste di categorie/prodotti (es. "Cheeses & Dairy", "categorie disponibili"), SALTARE language formatting e WhatsApp formatting per preservare i dati.

- **PROMPT DEVE ESSERE COMPLETO**: Ogni funzione che l'utente può richiedere DEVE essere nel prompt_agent.md con trigger chiari. Se manca una funzione, il sistema va in SearchRag generico.

- **CF vs SEARCHRAG**: Se CF viene chiamata con successo, NON chiamare SearchRag. Il flow è: LLM decide → CF esegue → Formatter preserva.

- **DEBUG CON FILE LOG**: Usare `/tmp/formatter-debug.log` per tracciare cosa succede nel formatter. È essenziale per capire dove si perdono i dati.

- **TEMPERATURA 0.0 PER FORMATTER**: Il formatter deve essere deterministico, non creativo. Deve preservare, non inventare.

- **CONFRONTO STRINGHE ROBUSTO**: Usare `.trim().toLowerCase()` per confrontare nomi di funzioni, mai confronti diretti che possono fallire per spazi/maiuscole.