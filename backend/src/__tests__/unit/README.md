# Test Unitari

Questa cartella contiene tutti i test unitari del progetto, organizzati in sottocartelle per tipo di componente testato.

## Struttura

- `controllers/`: Test per i controller HTTP
- `services/`: Test per i servizi applicativi
- `repositories/`: Test per i repository
- `middleware/`: Test per i middleware
- `utils/`: Test per le utility
- `mock/`: Mock condivisi per i test unitari

## Come eseguire i test

Per eseguire tutti i test unitari:

```bash
npm run test:unit
```

Per eseguire test specifici di un componente:

```bash
# Solo test dei servizi
npm run test:unit -- services

# Solo test dei controller
npm run test:unit -- controllers

# Solo test specifico
npm run test:unit -- product.service
```

## Best Practices

1. **Usa i mock condivisi**: Riutilizza i mock nella cartella `mock/` per mantenere i test consistenti.
2. **Test isolati**: Ogni test unitario dovrebbe essere isolato e non dipendere da componenti esterni.
3. **Organizzazione**: Mantieni la stessa struttura delle sottocartelle che abbiamo nel codice sorgente.
4. **Naming**: Usa `[nome-file].spec.ts` come convenzione per i file di test.
5. **Mocking**: Usa Jest per il mocking delle dipendenze. 