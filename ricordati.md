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