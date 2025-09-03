- dovrebbe mandare una mail
- formattazione
  Order status ?

dobbiamo fare una nuova CF , stato dell'ordine
facendo questa domanda andiamo nel DB cerchiamo di capire lo stato dell'ordine e ritorniamo la risposta se non e' definito il numero prenduamo di default utlimo ordine se e' definito prendiamo quello definito dall'utente
facciamo un CF che va nel DB cerca l'ordine trova la stato e lo ritorna
insieme a link dell'ordine
http://localhost:3000/orders-public/20009?token=e5f3eba4e9f27d0e2e1b7e123804626d7a1035baf2fca1886e6562d9798c6733

dobbiamo in maniera quirurgica aggionrae e agigungere una calling function
GetStatusOrder(orderCOde)
correggere il propmt
sistemare la calling function settings
fare la funzione che entra nel DB trova l'ordine e ritorna lo stato
aggiungiamo anche un altro statp che e' delivered and pay e lo mettiamo nel seed
e nel FE nella tendina dei pagamenti
