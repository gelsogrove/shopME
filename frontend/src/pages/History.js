import { Search, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

const History = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChat, setSelectedChat] = useState(null)

  const chats = [
    {
      id: 1,
      customer: "Mark Ross",
      phone: "+39 333 444 5555",
      lastMessage: "I need help with my order #ORD-2023001",
      timestamp: "10 min ago",
      status: "new",
      orderDetails: {
        orderId: "ORD-2023001",
        date: "2024-03-31",
        status: "Shipped",
        total: 58.95,
        items: [
          {
            id: 1,
            name: "Parmigiano Reggiano DOP 24 mesi",
            quantity: 1,
            weight: "1kg",
            price: 29.9,
          },
          {
            id: 2,
            name: "Prosciutto di Parma DOP",
            quantity: 1,
            weight: "200g",
            price: 14.9,
          },
          {
            id: 3,
            name: "Mortadella Bologna IGP",
            quantity: 1,
            weight: "200g",
            price: 8.9,
          },
          {
            id: 4,
            name: "Squacquerone di Romagna DOP",
            quantity: 1,
            weight: "250g",
            price: 6.9,
          },
          {
            id: 5,
            name: "Piadina Romagnola IGP",
            quantity: 1,
            weight: "5pz",
            price: 4.9,
          },
        ],
        shippingAddress: {
          street: "Via Roma 123",
          city: "Milano",
          zipCode: "20121",
          province: "MI",
          country: "Italy",
        },
        discounts: [
          {
            code: "BENVENUTO10",
            amount: 6.55,
          },
        ],
        shipping: {
          method: "Standard",
          cost: 0,
          trackingNumber: "TR123456789IT",
        },
      },
      messages: [
        {
          id: 1,
          type: "user",
          message:
            "Buongiorno, ho bisogno di aiuto con il mio ordine #ORD-2023001",
          timestamp: "2024-03-31T10:30:00",
        },
        {
          id: 2,
          type: "bot",
          message:
            "Buongiorno! Ho trovato il suo ordine #ORD-2023001. Vedo che è stato spedito ieri. Come posso aiutarla?",
          timestamp: "2024-03-31T10:30:05",
        },
        {
          id: 3,
          type: "user",
          message: "Quando arriverà la consegna?",
          timestamp: "2024-03-31T10:30:30",
        },
        {
          id: 4,
          type: "bot",
          message:
            "Secondo le informazioni di tracking, la consegna è prevista per domani tra le 10:00 e le 12:00. Desidera che le invii il link per il tracking?",
          timestamp: "2024-03-31T10:30:35",
        },
        {
          id: 5,
          type: "user",
          message: "Sì, grazie",
          timestamp: "2024-03-31T10:31:00",
        },
        {
          id: 6,
          type: "bot",
          message:
            "Ecco il link per il tracking: https://tracking.example.com/ORD-2023001. Può utilizzarlo per monitorare la sua consegna in tempo reale.",
          timestamp: "2024-03-31T10:31:05",
        },
        {
          id: 7,
          type: "user",
          message:
            "Grazie! Ho un'altra domanda - posso modificare l'indirizzo di consegna?",
          timestamp: "2024-03-31T10:35:00",
        },
        {
          id: 8,
          type: "bot",
          message:
            "Poiché l'ordine è già stato spedito, non possiamo modificare l'indirizzo di consegna. Tuttavia, può contattare direttamente il corriere utilizzando il link di tracking che le ho fornito per organizzare una consegna alternativa.",
          timestamp: "2024-03-31T10:35:05",
        },
        {
          id: 9,
          type: "user",
          message: "Ok, lo farò. Grazie del supporto!",
          timestamp: "2024-03-31T10:36:00",
        },
        {
          id: 10,
          type: "bot",
          message: "Posso aiutarla con qualcos'altro?",
          timestamp: "2024-03-31T10:36:05",
        },
        {
          id: 11,
          type: "user",
          message:
            "Sì, vorrei sapere se è possibile aggiungere un altro prodotto all'ordine",
          timestamp: "2024-03-31T10:36:30",
        },
        {
          id: 12,
          type: "bot",
          message:
            "Mi dispiace, ma non è possibile modificare un ordine già spedito. Dovrebbe effettuare un nuovo ordine per prodotti aggiuntivi. Posso aiutarla con questo?",
          timestamp: "2024-03-31T10:36:35",
        },
        {
          id: 13,
          type: "user",
          message:
            "Capisco. Quali sono i tempi di consegna per un nuovo ordine?",
          timestamp: "2024-03-31T10:37:00",
        },
        {
          id: 14,
          type: "bot",
          message:
            "Per i nuovi ordini, la consegna standard richiede 2-3 giorni lavorativi. Abbiamo anche l'opzione di consegna express in 24 ore con un costo aggiuntivo. Quale preferisce?",
          timestamp: "2024-03-31T10:37:05",
        },
        {
          id: 15,
          type: "user",
          message:
            "Preferirei la consegna standard. Quanto costa la spedizione?",
          timestamp: "2024-03-31T10:37:30",
        },
        {
          id: 16,
          type: "bot",
          message:
            "La spedizione standard è gratuita per ordini superiori a €50. Per ordini di importo inferiore, il costo è di €4,99.",
          timestamp: "2024-03-31T10:37:35",
        },
        {
          id: 17,
          type: "user",
          message: "Perfetto, procederò con un nuovo ordine allora",
          timestamp: "2024-03-31T10:38:00",
        },
        {
          id: 18,
          type: "bot",
          message:
            "Ottimo! Se ha bisogno di aiuto durante il processo di acquisto, non esiti a chiedere. Vuole che le mostri i prodotti più popolari della nostra categoria?",
          timestamp: "2024-03-31T10:38:05",
        },
        {
          id: 19,
          type: "user",
          message: "Sì, mi interesserebbe vedere le offerte del giorno",
          timestamp: "2024-03-31T10:38:30",
        },
        {
          id: 20,
          type: "bot",
          message:
            "Ecco le nostre migliori offerte di oggi:\n\n1. Parmigiano Reggiano DOP 24 mesi - 20% di sconto\n2. Prosciutto di Parma DOP - 15% di sconto\n3. Olio Extra Vergine di Oliva Toscano - 25% di sconto\n\nQuesti prodotti sono molto richiesti e le scorte sono limitate. Desidera procedere con l'acquisto di uno di questi?",
          timestamp: "2024-03-31T10:38:35",
        },
        {
          id: 21,
          type: "user",
          message: "Il Parmigiano mi interessa. Che formato avete disponibile?",
          timestamp: "2024-03-31T10:39:00",
        },
        {
          id: 22,
          type: "bot",
          message:
            "Per il Parmigiano Reggiano DOP 24 mesi abbiamo disponibili i seguenti formati:\n\n1. 250g - €8,90\n2. 500g - €16,90\n3. 1kg - €29,90\n\nTutti i prezzi indicati sono già scontati del 20%. Quale formato preferisce?",
          timestamp: "2024-03-31T10:39:05",
        },
        {
          id: 23,
          type: "user",
          message:
            "Prendo quello da 1kg. Come viene confezionato per la spedizione?",
          timestamp: "2024-03-31T10:39:30",
        },
        {
          id: 24,
          type: "bot",
          message:
            "Il Parmigiano viene confezionato sottovuoto e spedito in una scatola termica con elementi refrigeranti per mantenere la temperatura ottimale durante il trasporto. La confezione garantisce la perfetta conservazione del prodotto per almeno 15 giorni.",
          timestamp: "2024-03-31T10:39:35",
        },
        {
          id: 25,
          type: "user",
          message: "Ottimo, allora procedo con l'ordine",
          timestamp: "2024-03-31T10:40:00",
        },
        {
          id: 26,
          type: "bot",
          message:
            "Perfetto! Le ricordo che può utilizzare il codice BENVENUTO10 per un ulteriore sconto del 10% sul suo primo ordine. Ha bisogno di aiuto con la procedura di acquisto?",
          timestamp: "2024-03-31T10:40:05",
        },
        {
          id: 27,
          type: "user",
          message: "Sì, vorrei sapere come inserire il codice sconto",
          timestamp: "2024-03-31T10:40:30",
        },
        {
          id: 28,
          type: "bot",
          message:
            "Durante il checkout, troverà un campo 'Codice Sconto' sotto il riepilogo dell'ordine. Inserisca BENVENUTO10 e clicchi su 'Applica' per ottenere lo sconto del 10%.",
          timestamp: "2024-03-31T10:40:35",
        },
        {
          id: 29,
          type: "user",
          message:
            "Grazie. Vorrei anche aggiungere del Prosciutto di Parma. Che tagli avete disponibili?",
          timestamp: "2024-03-31T10:41:00",
        },
        {
          id: 30,
          type: "bot",
          message:
            "Per il Prosciutto di Parma DOP abbiamo diverse opzioni:\n\n1. Affettato in vaschetta da 100g - €7,90\n2. Affettato in vaschetta da 200g - €14,90\n3. Trancio da 500g - €32,90\n4. Trancio da 1kg - €59,90\n\nTutti i prezzi indicati sono già scontati del 15%. Il prosciutto viene affettato al momento e confezionato sottovuoto per mantenere la massima freschezza.",
          timestamp: "2024-03-31T10:41:05",
        },
        {
          id: 31,
          type: "user",
          message:
            "Prendo la vaschetta da 200g. Come viene mantenuta la catena del freddo durante la spedizione?",
          timestamp: "2024-03-31T10:41:30",
        },
        {
          id: 32,
          type: "bot",
          message:
            "Utilizziamo speciali contenitori isotermici con elementi refrigeranti professionali che mantengono una temperatura costante tra 0° e 4°C per 48 ore. Monitoriamo la temperatura durante tutto il trasporto e garantiamo la consegna entro 24 ore per mantenere la massima qualità dei prodotti.",
          timestamp: "2024-03-31T10:41:35",
        },
        {
          id: 33,
          type: "user",
          message: "Ottimo. Avete anche della Mortadella Bologna IGP?",
          timestamp: "2024-03-31T10:42:00",
        },
        {
          id: 34,
          type: "bot",
          message:
            "Sì, abbiamo la Mortadella Bologna IGP disponibile in questi formati:\n\n1. Affettato in vaschetta da 100g - €4,90\n2. Affettato in vaschetta da 200g - €8,90\n3. Trancio da 500g - €19,90\n\nLa nostra Mortadella è prodotta secondo la ricetta tradizionale, con pistacchi di Bronte DOP. Desidera aggiungerne al suo ordine?",
          timestamp: "2024-03-31T10:42:05",
        },
        {
          id: 35,
          type: "user",
          message:
            "Sì, prendo una vaschetta da 200g. Avete un minimo d'ordine per la spedizione gratuita?",
          timestamp: "2024-03-31T10:42:30",
        },
        {
          id: 36,
          type: "bot",
          message:
            "La spedizione è gratuita per ordini superiori a €50. Al momento il suo carrello contiene:\n\n1. Parmigiano Reggiano DOP 24 mesi 1kg - €29,90\n2. Prosciutto di Parma DOP 200g - €14,90\n3. Mortadella Bologna IGP 200g - €8,90\n\nTotale: €53,70\n\nQuindi ha già diritto alla spedizione gratuita! Con il codice BENVENUTO10 risparmierà ulteriori €5,37.",
          timestamp: "2024-03-31T10:42:35",
        },
        {
          id: 37,
          type: "user",
          message:
            "Perfetto! Mi consigliate altri prodotti tipici da abbinare?",
          timestamp: "2024-03-31T10:43:00",
        },
        {
          id: 38,
          type: "bot",
          message:
            "Assolutamente! Per completare la sua selezione di eccellenze italiane, le suggeriamo:\n\n1. Aceto Balsamico di Modena DOP invecchiato 12 anni - €24,90\n2. Squacquerone di Romagna DOP 250g - €6,90\n3. Piadina Romagnola IGP (confezione da 5pz) - €4,90\n4. Olive Ascolane del Piceno DOP 300g - €7,90\n\nIn particolare, lo Squacquerone e la Piadina sono un abbinamento tradizionale molto apprezzato!",
          timestamp: "2024-03-31T10:43:05",
        },
        {
          id: 39,
          type: "user",
          message:
            "Aggiungo lo Squacquerone e la Piadina. Come viene confezionato lo Squacquerone per il trasporto?",
          timestamp: "2024-03-31T10:43:30",
        },
        {
          id: 40,
          type: "bot",
          message:
            "Lo Squacquerone viene confezionato in una vaschetta sigillata e termosaldata, poi inserito nel contenitore isotermico con gli altri prodotti freschi. La sua consistenza e freschezza sono garantite per 5 giorni dalla consegna, se conservato in frigorifero a temperatura tra 0° e 4°C.",
          timestamp: "2024-03-31T10:43:35",
        },
        {
          id: 41,
          type: "user",
          message:
            "Bene, direi che ho completato il mio ordine. Posso procedere con il pagamento?",
          timestamp: "2024-03-31T10:44:00",
        },
        {
          id: 42,
          type: "bot",
          message:
            "Certamente! Riepilogo del suo ordine:\n\n1. Parmigiano Reggiano DOP 24 mesi 1kg - €29,90\n2. Prosciutto di Parma DOP 200g - €14,90\n3. Mortadella Bologna IGP 200g - €8,90\n4. Squacquerone di Romagna DOP 250g - €6,90\n5. Piadina Romagnola IGP (5pz) - €4,90\n\nSubtotale: €65,50\nSconto BENVENUTO10: -€6,55\nSpedizione: GRATUITA\n\nTotale finale: €58,95\n\nPuò procedere al checkout cliccando sul pulsante 'Procedi all'acquisto' nel carrello. Accettiamo tutte le principali carte di credito, PayPal e bonifico bancario.",
          timestamp: "2024-03-31T10:44:05",
        },
        {
          id: 43,
          type: "user",
          message: "Vorrei pagare con PayPal. È possibile?",
          timestamp: "2024-03-31T10:44:30",
        },
        {
          id: 44,
          type: "bot",
          message:
            "Sì, accettiamo PayPal! È uno dei metodi di pagamento più utilizzati dai nostri clienti. Durante il checkout, dopo aver inserito l'indirizzo di consegna, potrà selezionare PayPal come metodo di pagamento e verrà reindirizzato al sito sicuro di PayPal per completare la transazione.",
          timestamp: "2024-03-31T10:44:35",
        },
        {
          id: 45,
          type: "user",
          message:
            "Ok, procedo con l'ordine. In quanto tempo riceverò la conferma?",
          timestamp: "2024-03-31T10:45:00",
        },
        {
          id: 46,
          type: "bot",
          message:
            "Riceverà immediatamente una email di conferma dell'ordine con il numero di riferimento. Una seconda email le sarà inviata non appena il suo ordine verrà preso in carico dal nostro magazzino (generalmente entro 1 ora durante l'orario lavorativo). Infine, riceverà una terza email con il tracking number quando l'ordine verrà affidato al corriere.",
          timestamp: "2024-03-31T10:45:05",
        },
        {
          id: 47,
          type: "user",
          message: "Perfetto, grazie mille per l'assistenza!",
          timestamp: "2024-03-31T10:45:30",
        },
        {
          id: 48,
          type: "bot",
          message:
            "È stato un piacere aiutarla! Se ha bisogno di assistenza durante o dopo l'acquisto, non esiti a contattarci. Le auguro una buona giornata e buon appetito con i nostri prodotti! 😊",
          timestamp: "2024-03-31T10:45:35",
        },
        {
          id: 49,
          type: "user",
          message:
            "Un'ultima domanda: fate anche vendita all'ingrosso per ristoranti?",
          timestamp: "2024-03-31T10:46:00",
        },
        {
          id: 50,
          type: "bot",
          message:
            "Sì, abbiamo un servizio dedicato ai professionisti della ristorazione con listini specifici, quantità maggiori e condizioni commerciali personalizzate. Se interessato, posso metterla in contatto con il nostro ufficio commerciale HoReCa che le fornirà tutte le informazioni necessarie e un listino dedicato. Desidera essere contattato?",
          timestamp: "2024-03-31T10:46:05",
        },
        {
          id: 51,
          type: "user",
          message:
            "Sì, sarei interessato. Potete chiamarmi in orario di ufficio al numero che ho registrato?",
          timestamp: "2024-03-31T10:46:30",
        },
        {
          id: 52,
          type: "bot",
          message:
            "Ho inoltrato la sua richiesta all'ufficio commerciale HoReCa. Un nostro responsabile la contatterà domani tra le 9:00 e le 18:00 al numero registrato. Nel frattempo, le invierò via email il nostro catalogo prodotti per il canale HoReCa così potrà dare un'occhiata alla nostra offerta completa.",
          timestamp: "2024-03-31T10:46:35",
        },
        {
          id: 53,
          type: "user",
          message: "Grazie mille per la disponibilità!",
          timestamp: "2024-03-31T10:47:00",
        },
        {
          id: 54,
          type: "bot",
          message:
            "Grazie a lei! Il catalogo HoReCa è stato appena inviato alla sua email. Se ha altre domande, siamo sempre a sua disposizione. Buona giornata!",
          timestamp: "2024-03-31T10:47:05",
        },
        {
          id: 55,
          type: "user",
          message: "Buona giornata anche a voi!",
          timestamp: "2024-03-31T10:47:30",
        },
        {
          id: 56,
          type: "bot",
          message: "🙏 Arrivederci!",
          timestamp: "2024-03-31T10:47:35",
        },
      ],
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      phone: "+39 333 666 7777",
      lastMessage: "When will my order arrive?",
      timestamp: "25 min ago",
      status: "read",
      orderDetails: {
        orderId: "ORD-2023002",
        date: "2024-03-31",
        status: "Processing",
        total: 89.6,
        items: [
          {
            id: 1,
            name: "Parmigiano Reggiano DOP 24 mesi",
            quantity: 2,
            weight: "500g",
            price: 16.9,
          },
          {
            id: 2,
            name: "Aceto Balsamico di Modena DOP",
            quantity: 1,
            weight: "250ml",
            price: 24.9,
          },
          {
            id: 3,
            name: "Olive Ascolane del Piceno DOP",
            quantity: 2,
            weight: "300g",
            price: 15.8,
          },
        ],
        shippingAddress: {
          street: "Via Garibaldi 45",
          city: "Roma",
          zipCode: "00153",
          province: "RM",
          country: "Italy",
        },
        discounts: [],
        shipping: {
          method: "Express",
          cost: 9.9,
          trackingNumber: "TR987654321IT",
        },
      },
      messages: [
        {
          id: 1,
          type: "user",
          message: "When will my order arrive?",
          timestamp: "2024-03-31T10:05:00",
        },
        {
          id: 2,
          type: "bot",
          message:
            "Your order #ORD-2023002 is scheduled for delivery tomorrow between 9 AM and 11 AM.",
          timestamp: "2024-03-31T10:05:05",
        },
      ],
    },
    // Add more chat history items here...
  ]

  const filteredChats = chats.filter(
    (chat) =>
      chat.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.phone.includes(searchTerm) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chat History
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                to={`/orders/${chat.orderDetails.orderId}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                      {chat.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.customer}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {chat.timestamp}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      Order: {chat.orderDetails.orderId} - {chat.lastMessage}
                    </p>
                    {chat.status === "new" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Right-side sliding panel for chat details */}
      <div
        className={`fixed inset-y-0 right-0 w-2/3 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          selectedChat ? "translate-x-0" : "translate-x-full"
        } overflow-hidden`}
      >
        {selectedChat && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                        {selectedChat.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {selectedChat.customer}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedChat.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Order Details Section */}
              {selectedChat.orderDetails && (
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Order Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Order ID
                          </p>
                          <Link
                            to={`/orders/${selectedChat.orderDetails.orderId}`}
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {selectedChat.orderDetails.orderId}
                          </Link>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Date
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedChat.orderDetails.date}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Status
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedChat.orderDetails.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            Tracking
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedChat.orderDetails.shipping.trackingNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Shipping Address
                      </h4>
                      <div className="text-sm text-gray-900 dark:text-white">
                        <p>
                          {selectedChat.orderDetails.shippingAddress.street}
                        </p>
                        <p>
                          {selectedChat.orderDetails.shippingAddress.zipCode}{" "}
                          {selectedChat.orderDetails.shippingAddress.city}{" "}
                          {selectedChat.orderDetails.shippingAddress.province}
                        </p>
                        <p>
                          {selectedChat.orderDetails.shippingAddress.country}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Order Items
                      </h4>
                      <div className="space-y-4">
                        {selectedChat.orderDetails.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-start text-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                {item.quantity}x - {item.weight}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              €{item.price.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-500 dark:text-gray-400">
                            Subtotal
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            €{selectedChat.orderDetails.total.toFixed(2)}
                          </p>
                        </div>
                        {selectedChat.orderDetails.discounts.map(
                          (discount, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <p className="text-gray-500 dark:text-gray-400">
                                Discount ({discount.code})
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                -€{discount.amount.toFixed(2)}
                              </p>
                            </div>
                          )
                        )}
                        <div className="flex justify-between text-sm">
                          <p className="text-gray-500 dark:text-gray-400">
                            Shipping
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedChat.orderDetails.shipping.cost === 0
                              ? "Free"
                              : `€${selectedChat.orderDetails.shipping.cost.toFixed(
                                  2
                                )}`}
                          </p>
                        </div>
                        <div className="flex justify-between text-base font-medium pt-2 border-t dark:border-gray-700">
                          <p className="text-gray-900 dark:text-white">Total</p>
                          <p className="text-gray-900 dark:text-white">
                            €
                            {(
                              selectedChat.orderDetails.total -
                              selectedChat.orderDetails.discounts.reduce(
                                (acc, discount) => acc + discount.amount,
                                0
                              ) +
                              selectedChat.orderDetails.shipping.cost
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages Section */}
              <div className="p-6 space-y-6">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <span className="text-xs mt-1 block opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default History
