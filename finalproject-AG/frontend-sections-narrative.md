# ShopMe Frontend - Descrizione Dettagliata delle Sezioni

## Autenticazione

Quando l'utente accede all'applicazione, viene accolto dalla **pagina di login** dove può inserire le proprie credenziali. Questa pagina presenta un form semplice ma robusto che verifica l'autenticità delle credenziali e gestisce eventuali errori in modo chiaro. Una volta autenticato, l'utente viene guidato alla **pagina di selezione del workspace**, dove può scegliere tra i vari ambienti di lavoro a cui ha accesso. Questa funzionalità è particolarmente utile per utenti che gestiscono più negozi o business separati sulla piattaforma. La selezione viene memorizzata nella sessione, permettendo una navigazione fluida all'interno del workspace scelto.

## Dashboard e Chat History

Il cuore dell'applicazione è la **Chat History**, che funge anche da pagina principale dopo il login. Qui l'utente può visualizzare tutte le conversazioni WhatsApp con i clienti, organizzate in modo intuitivo con la lista delle chat a sinistra e i messaggi della chat selezionata a destra. L'interfaccia permette di cercare facilmente tra le conversazioni e filtrare i messaggi per cliente specifico. L'area di input per rispondere è posizionata in basso, simulando l'esperienza familiare delle app di messaggistica. Un particolare accento è posto sui messaggi generati dall'IA, che vengono evidenziati per distinguerli dalle risposte manuali. La vecchia pagina **Dashboard** ora reindirizza automaticamente alla Chat History, semplificando il flusso di navigazione.

## Gestione Prodotti

La sezione **Prodotti** permette agli amministratori di gestire l'intero catalogo in modo efficiente. I prodotti vengono presentati in una tabella ricca di funzionalità, con possibilità di filtrare per categoria e stato, oltre a una ricerca rapida per nome. Per ogni prodotto è possibile visualizzare e modificare dettagli come prezzo, disponibilità e immagini (al momento implementate con placeholder). La gestione delle **Categorie** è accessibile sia dalla sezione prodotti che da una pagina dedicata, dove gli utenti possono organizzare il catalogo in gruppi logici, facilitando la navigazione da parte dei clienti WhatsApp.

## Gestione Clienti e Ordini

La sezione **Clienti** offre una panoramica completa di tutti i contatti WhatsApp che hanno interagito con il business. Per ogni cliente è possibile visualizzare le informazioni di contatto, lo storico degli ordini e accedere direttamente alla chat. Gli amministratori possono aggiungere note specifiche e gestire preferenze personalizzate per ogni cliente. La pagina **Ordini** presenta invece lo storico completo delle transazioni, con un sistema di filtri per stato (pendente, confermato, spedito, consegnato) e una visualizzazione dettagliata che include prodotti, quantità e prezzi. Da qui è possibile anche scaricare le fatture (funzionalità al momento simulata) e seguire la timeline dello stato dell'ordine.

## Gestione Contenuti

Questa sezione include diverse funzionalità per gestire i contenuti dell'esperienza cliente. La pagina **Servizi** permette di creare e modificare i servizi offerti, a cui possono essere associati vari prodotti. La sezione **Prompts** è particolarmente innovativa, permettendo di gestire i template di risposta per l'AI che assiste i clienti su WhatsApp. Gli amministratori possono creare prompt specifici associati a determinati numeri di telefono, personalizzando così l'esperienza cliente. Infine, la pagina **Offerte** consente di creare campagne promozionali mirate, selezionando prodotti specifici e programmando l'invio di messaggi a segmenti definiti di clientela.

## Impostazioni

Le **Impostazioni Generali** fungono da hub centrale per la configurazione del workspace, dove è possibile impostare parametri dell'API WhatsApp, webhook, orari operativi e messaggi automatici. Questo pannello di controllo è completato da sezioni specializzate: i **Tipi di Canale** permettono di configurare le diverse piattaforme di messaggistica supportate oltre a WhatsApp, mentre la sezione **Lingue** consente la gestione delle lingue disponibili per l'interfaccia e le comunicazioni con i clienti. Infine, la gestione **Utenti** offre strumenti per amministrare gli account del team, assegnando ruoli e permessi specifici per garantire il livello appropriato di accesso a ciascun membro.

## Componenti e Architettura

A livello architetturale, l'applicazione è costruita attorno a un sistema di componenti altamente riutilizzabili. Il **Layout** definisce la struttura generale con una sidebar per la navigazione e un'intestazione che mostra informazioni sull'utente e sul workspace attivo. I **Componenti UI** rappresentano i blocchi di costruzione di base dell'interfaccia, implementati con shadcn/ui e personalizzati secondo le esigenze dell'applicazione. I **Componenti Condivisi** come DataTable e FormDialog vengono utilizzati consistentemente in tutta l'applicazione, garantendo un'esperienza utente coerente e riducendo la duplicazione del codice.

Per quanto riguarda le funzionalità trasversali, il **Routing** è gestito centralmente in App.tsx, con protezione delle rotte per utenti non autenticati e una struttura nidificata che riflette l'organizzazione logica dell'applicazione. La **Gestione dello Stato** utilizza principalmente React hooks per lo stato locale e Context API per lo stato globale, adottando un approccio pragmatico che favorisce i componenti stateless dove possibile. Infine, l'interfaccia visiva si basa su **TailwindCSS** per lo styling, con un design system coerente che supporta temi light/dark e si adatta a diverse dimensioni di schermo grazie a un approccio mobile-first.
