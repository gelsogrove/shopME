## TASK !
 


- [] dobbiamo fare un cambio anche se chiede dove sta la merce
 dobbiamo dare all'utente la url dell'utlimo ordine dove dentro trovera il link per andare al tracking 

quindi al posto di ;
https://www.dhl.com/global-en/home/tracking/tracking-express.html?tracking-id=1234567890

vogliamo questo 
http://localhost:3000/orders-public/20002?phone=%2B34666777888
con token di sicurezza

attenzione che questa pagina sempre deve aver eil token di sicurezza ora veco che funziona anche senza token quindi l'applicaazione al clicl deve passare il token





Per quanto riguarda il documento DDT, puoi scaricarlo dal dettaglio dell'ordine tramite il link che ti ho fornito in precedenza per l'ordine specifico. Vuoi che ti invii di nuovo il link per il dettaglio dell'ordine?




- [] se un utente chiede di vedere il  suo indirizzo di consegna o di fatturazione o  chiede di modificare il suo indirizzo o cheide di modificare la mail o il numero di telefno o qualsiasi dato personale... dobbiamo creare una pagina che contiene una form dove l'utente puo' vedere e modificare i suoi dati personalo , questa pagina avra' un token di 1 ora e dobbiamo modificare il prompt_agente ovviamente..... possiamo evitare secodno me di passare da N8N perche' e' solo un link che dobbiamo restituire un link con token  e numero di telefono e workspaceId.
questo num di telefono  fara attonere il customerId come abbaimao gia' fatto in altre sessioni.... e da qui possiamo fare la form per editare i dati, sei un esperto in UI/UX devi fare un bel lavoro e tienei la stessa grafica che hai usato per new client /list orders / manage addresses. 
i dati che devi poter mettere sono tutti tranne i boolean e il campo note, questa pagina avra' anche un link agli ordini effettuati e lo rimandiamoa alla pagina listato e dalla pagina listato ci sara' un bottone per editare i dati personali che andra' alla form

- [] come mai quando faccio il seed non vedo gli aggiornamenti del JSON di n8n ? non lo importi ? ovviamente se lo importi lo devi anche eseguire quindi e' una scelta la tua di non permettere l'aggiornamento dopo il seed? chiedo? ma se hai possibilita di far si che al seed si carichi tutto senza interruzioni di N8N come login compiazioni o attive fallo pure sarebbe ottimo per me perche' attualmente e' un po' un collo di bottiglia perche' gli agenti AI devono aspettare il mio intervento per provare


- [] voglio essere certo che dopo un cambio di prodotto o di services o di un nuovo documento o di una nuova faq o di un edit di una faq venga rigenerato in background aggiornamento del embedding....vorrei un test 



Acceptance criteria 
- utente scrive voglio cambiare la mia mail e viene passato il link
- utente scrive voglio cambiare il telefono  e viene passato il link
- utente scrive voglio cambiare indirizzo  e viene passato il link
- la form deve prendere i dati personali e visualizzarli
- la form deve avere le sue giuste validazioni 
- ogni chiamata API deve avere phonenumber workspaceId customerID e token valido per un ora.
- Test di funzionamento


- [] GLI ORDNI NON VANNO prima di far partire qualsiasi task ne parliamo

- [ ] Clear Cart State After Order (Hidden System Message)
  - In N8N, post-success hidden system message (delay ~5s) to clear cart memory; invisible to end user.


- [] LE MAIL NON VANNO dobbiamo capiro isnieme e' fuori dal codice mi sa inogni modo non so se quando si fa un ordine arriva una mail


- [] aggiorniamo il Readme.md mettendo un overview e i comandi per lanciarlo



- [] http://localhost:3000/workspace-selection quando c'e' un nuovo channel di default e' type shop dobbiamo cancellae la possi jlita di mettere restaurant o Hotel solo nasconodere questi elementi in Front end la parte di BE rimae invariata


- [] lista dammi ttti i prodotti disponibili dovrebbe essere piu' bella graficamente organizzata meglio ordinati per categoria
non so categoria e poi a capo codice prodotto prezzo



- [] vorrei verificare che le offerte funzionano vorrei fare un analisi iniziale
capire se funziona, ragionare sul risultato che dovremmo ottenere e vedere se lo otteniamo
ovvimente metti in memoria leggi il PRD


- per una migrazoine verso whatsappp dobbiamo fare un analisi ovviamente avremmo un webhook di whatsapp e poi magarei la formattazione non funzionaerebbe e poi ci sarebbero delle configurazioni dobbiamo fare un analisi un file whatsapp.md dentro docs dove spieghiamo come dall'attuale versione arriviamo a farlo andare con whatsapp dal token all webhook
oppure capire coem dal numero di telefono tiriamo fupir worspaceId e customerId


