CONFIGURAZIONE DELLA CHATGPT

PROMPT 
TEMPERATURA
TOKEN
MODELLO ARRIVANO DALLA TABELLA AGENT CONFIGURATION e' dinamico !

## 🧠 **ANDREA'S TWO-LLM ARCHITECTURE (SINGLE RESPONSIBILITY)**

### **🔍 LLM 1: RAG PROCESSOR**
**RESPONSABILITÀ**: Analizzare e organizzare dati grezzi dal database
- **INPUT**: Lista grezza (10 prodotti, 4 FAQ, 2 servizi, etc.)
- **COMPITO**: Filtrare, analizzare relevanza, organizzare informazioni
- **OUTPUT**: JSON strutturato con dati più rilevanti
- **TEMPERATURA**: 0.3 (bassa per analisi precisa)

### **🎨 LLM 2: FORMATTER**
**RESPONSABILITÀ**: Creare risposta conversazionale per l'utente
- **INPUT**: Dati processati da LLM 1 + storico conversazione + agent config
- **COMPITO**: Formattare risposta naturale, personalizzata, linguaggio corretto
- **OUTPUT**: Risposta finale conversazionale per WhatsApp
- **TEMPERATURA**: 0.7 (alta per creatività conversazionale)

### **🔄 FLUSSO COMPLETO (DUE LLM)**

```
📝 DOMANDA UTENTE: "avete mozzarelle? quanto costa la spedizione?"
         |
         v
    ┌─────────────────┐
    │ 🔍 RAG SEARCH   │ ──> Cerca in database:
    │ (Database Only) │     • product_chunks + products table
    │                 │     • faq_chunks + faq table  
    │                 │     • service_chunks + services table
    │                 │     • document_chunks + documents table
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 📊 RAW RESULTS  │ ──> Lista grezza di 10+ elementi:
    │ (Unprocessed)   │     • 5 prodotti con similarity scores
    │                 │     • 3 FAQ con similarity scores
    │                 │     • 2 servizi con similarity scores
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 🧠 LLM 1:       │ ──> Analizza e filtra dati grezzi:
    │ RAG PROCESSOR   │     • Seleziona più rilevanti per query
    │ (T=0.3, Focus)  │     • Organizza in JSON strutturato
    │                 │     • Rimuove duplicati/irrilevanti
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 📋 PROCESSED    │ ──> Dati organizzati e filtrati:
    │ DATA (Clean)    │     • 2 mozzarelle più rilevanti
    │                 │     • 1 FAQ spedizione pertinente
    │                 │     • Informazioni essenziali
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 🎨 LLM 2:       │ ──> Crea risposta conversazionale:
    │ FORMATTER       │     • Usa dati processati da LLM 1
    │ (T=0.7, Creative) │  • Aggiunge storico conversazione
    │                 │     • Applica stile agente dal DB
    │                 │     • Risponde in lingua cliente
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 💬 RISPOSTA     │ ──> "Ciao! 🧀 Abbiamo 2 mozzarelle:
    │ FINALE          │     • Mozzarella di Bufala DOP €8.50
    │ (Conversational)│     • Mozzarella Classica €6.90
    │                 │     Spedizione €4.99, gratis sopra €50.
    │                 │     Quale preferisci? 😊"
    └─────────────────┘
```

API LIMIT e Spam Detection HAS BEEN REACHED?
arriva un messaggio 

🚨 SPAM DETECTION: 10+ messaggi in 30 secondi? → AUTO-BLACKLIST + STOP DIALOGO

IL canale non e' attivo stop dialogo
l'utente ha activeChatbot flag a false? , se non è true stop dialogo, l'operatore puo' scrivere all'utente viene salvato nell'history ma non l'AI non risponde fino che l'operatore non rilascia il controllo all'AI

E' un utente in blacklist? non rispondere blocca il dialogo

IL CANALE E' IN WIP? messaggio di wip in inglese e blocca il dialogo

 e'  un nuovo utente?
    SI : 
        E' un utente in blacklist?
            SI: NO ANSWER
            NO : Ha scritto Hola? Ciao? Hello/Hi,
                 -Rispondi CON IL WELCOME MESSSAGE IN LINEA (E' DENTRO SETTINGS)
                  Ciao per assicurarti un buon servizio e assicurarti la privacy ti chiedo di inserire qui i tuoi dati : LINK DI REGISTRAZIONE CON TOKEN
                    - una volta messaggio inviato webhook al whatsapp con scritto Ciao {NOME UTENTE} registrazione andata a buon fine come ti posso aiutare oggi ?

                    - chat libera tra Utente e RAG → TWO-LLM PROCESSING → risposta discorsiva

    NO :  
        E' REGISTRATO? 
            NO: CONTINUA A MANDARE IL WELCOME MESSAGE CON LINK DI REGISTRAZIONE (non passa al RAG finché non si registra)
            SI: 
                IL CANALE E' ATTIVO? (activeChatbot flag) se non è attivo, passa il controllo all'operatore manuale
                IL CANALE E' IN WIP? messaggio di wip in lingua del cliente 
                - e' passato piu' di 2 ore dall'ulitma chat scrivigli Bentornata {NOME UTENTE}
                - Chat libera tra utente e RAG → TWO-LLM PROCESSING → risposta discorsiva
                - QUANDO L'UTENTE CHIEDE DI FINALIZZARE L'ORDINE: LINK CON TOKEN ALLA PAGINA DI CHECKOUT PER COMPLETARE L'ACQUISTO

## 🎯 **VANTAGGI TWO-LLM ARCHITECTURE**

### **🔧 SINGLE RESPONSIBILITY BENEFITS:**

1. **LLM 1 (Processor)**: Focalizzato solo su analisi dati
   - Temperature bassa (0.3) per precision
   - Nessuna creatività, solo logica
   - Output JSON strutturato e prevedibile

2. **LLM 2 (Formatter)**: Focalizzato solo su conversazione
   - Temperature alta (0.7) per naturalezza
   - Creatività conversazionale
   - Stile personalizzato per cliente

### **📊 QUALITY IMPROVEMENTS:**

- **Meno allucinazioni**: LLM 1 filtra solo dati reali
- **Risposte più accurate**: Separazione logica vs creatività
- **Performance migliore**: Ogni LLM ottimizzato per il suo compito
- **Debug più facile**: Errori isolati per responsabilità

### **🔄 COST EFFICIENCY:**

- **LLM 1**: Pochi token, focus su struttura
- **LLM 2**: Più token solo per creatività necessaria
- **Totale**: Spesso meno costoso di un singolo LLM sovraccarico

## 📊 SCHEMA ASCII DEL FLOW

```
📱 MESSAGGIO WHATSAPP
         |
         v
    ┌─────────────────┐
    │ 🚨 SPAM CHECK   │ ──YES─> 🚫 AUTO-BLACKLIST + STOP
    │ 10+ msg/30sec?  │         (customer + workspace)
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ CANALE ATTIVO?  │ ──NO──> ❌ STOP DIALOGO
    │ (isActive)      │
    └─────────────────┘
         |YES
         v
    ┌─────────────────┐
    │ CHATBOT ATTIVO? │ ──NO──> 👨‍💼 CONTROLLO OPERATORE
    │ (activeChatbot) │         (salva msg, no AI response)
    └─────────────────┘
         |YES
         v
    ┌─────────────────┐
    │ USER BLACKLIST? │ ──YES─> ❌ BLOCCA CONVERSAZIONE
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ CANALE IN WIP?  │ ──YES─> ⚠️ MESSAGGIO WIP
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ NUOVO UTENTE?   │
    └─────────────────┘
         |              |
       YES|              |NO
         v              v
    ┌─────────────┐  ┌─────────────────┐
    │ SALUTO?     │  │ E' REGISTRATO?  │
    │ Ciao/Hello  │  └─────────────────┘
    └─────────────┘         |        |
         |YES              NO|        |YES
         v                   v        v
    ┌─────────────┐  ┌─────────────┐ ┌─────────────────┐
    │ 🎉 WELCOME  │  │ 🎉 WELCOME  │ │ >2 ORE ULTIMA   │ ──YES─> 👋 BENTORNATO {NOME}
    │ + REG LINK  │  │ + REG LINK  │ │ CONVERSAZIONE?  │
    └─────────────┘  └─────────────┘ └─────────────────┘
         |                 |              |NO
         v                 v              v
    ┌─────────────┐  ┌─────────────┐ ┌─────────────────┐
    │ 🔗 TOKEN +  │  │ ⏳ ATTENDI  │ │ 🤖 RAG SEARCH + │
    │ REGISTRA    │  │ REGISTRA    │ │ 🎨 LLM FORMATTER│
    └─────────────┘  └─────────────┘ └─────────────────┘
         |                              |
         v                              v
    ┌─────────────┐                ┌─────────────────┐
    │ 🤖 RAG +    │                │ 💬 RISPOSTA     │
    │ 🎨 FORMATTER│                │ DISCORSIVA      │
    └─────────────┘                └─────────────────┘
         |
         v
    ┌─────────────┐   
    │ 💬 RISPOSTA │   
    │ DISCORSIVA  │  
    └─────────────┘   
```

## 🔑 LEGENDA
- 🚨 = SPAM DETECTION
- 🚫 = AUTO-BLACKLIST
- ❌ = STOP/BLOCCO
- 👨‍💼 = CONTROLLO OPERATORE
- ⚠️ = MESSAGGIO AUTOMATICO
- 🎉 = MESSAGGIO BENVENUTO
- 🤖 = ELABORAZIONE RAG
- 🎨 = LLM FORMATTER (per risposta discorsiva)
- ⏳ = ATTENDI REGISTRAZIONE (continua welcome message)
- 🔗 = LINK CON TOKEN
- 🛒 = FINALIZZAZIONE ORDINE/CHECKOUT
- 💬 = CONVERSAZIONE FORMATTATA

## 🔄 PROCESSO RAG UNIFICATO (NUOVO!)

```