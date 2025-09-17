ricordati:

- LLM decide la funzione da chiamare
- se non chiama niente parte salva la risposta dell LLM e chiama searchrag
- se searchrag non ha risultati ritorna la risposta dell LLM
- se searchrag ha risultati ritorna il risultato del formatter che ha ricevuto dal searchrag
- non devi harcodeare nulla
- i prodotti italiani non si traducono in inglese (mettiamolo nel prompt_agent)
- togl codice sporco
- non devi hardcodare nulla ma nulla ma nulla e' LLM che decide
- il formatter manda solo la risposta in modo naturale
- il formatter riceve la lingua sconto, workspaceId, customerId, domanda, e risposta del searchRag
- il searchRAg quando ha la variabile deve fare un replace ovviamente prima di inviarlo al modello
- ricordati che prima di tutto passa dal layer del transalate pria del searchRAg ma i prodotti italiani non li deve tradurre
- controlla quello che fai chiediti se stai facendo le cose giuste 
- attualizza il memory bank
- rispoetta le regole del cursorsrules se hai dubbi chiedi.
