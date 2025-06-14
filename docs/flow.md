CONFIGURAZIONZDE DELLA CHATNPT

PROMPT 
TEMPERATURA
TOKEN
MODELLO ARRIVANO DALLA TABELLA AGENT CONFIGURATION e' dimanimoc !



API LIMIT e  Spam Detection HAS BEEN REACHED?
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

                    - chat libera tra Utente e RAG

    NO :  
        IL CANALE E' ATTIVO? (activeChatbot flag) se non è attivo, passa il controllo all'operatore manuale
        IL CANALE E' IN WIP? messaggio di wip in lingua del cliente 
        - e' passato piu' di 2 ore dall'ulitma chat scrivigli Bentornata {NOME UTENTE}
        - Chat libera tra utente e RAG
        - QUANDO L'UTENTE CHIEDE DI FINALIZZARE L'ORDINE: LINK CON TOKEN ALLA PAGINA DI CHECKOUT PER COMPLETARE L'ACQUISTO

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
    │ SALUTO?     │  │ >2 ORE ULTIMA   │ ──YES─> 👋 BENTORNATO {NOME}
    │ Ciao/Hello  │  │ CONVERSAZIONE?  │
    └─────────────┘  └─────────────────┘
         |YES              |NO
         v                 v
    ┌─────────────┐  ┌─────────────────┐
    │ 🎉 WELCOME  │  │ 🤖 CHAT LIBERA  │
    │ + REG LINK  │  │ UTENTE + RAG    │
    └─────────────┘  └─────────────────┘
         |                 
         v                 
    ┌─────────────┐   
    │ 🔗 TOKEN +  │   
    │ REGISTRA    │          
    └─────────────┘   
         |                 
         v                 
    ┌─────────────┐   
    │ 🤖 CHAT     │   
    │ LIBERA RAG  │  
    └─────────────┘   
```

## 🔑 LEGENDA
- 🚨 = SPAM DETECTION
- 🚫 = AUTO-BLACKLIST
- ❌ = STOP/BLOCCO
- 👨‍💼 = CONTROLLO OPERATORE
- ⚠️ = MESSAGGIO AUTOMATICO
- 🎉 = MESSAGGIO BENVENUTO
- 🤖 = ELABORAZIONE AI/RAG
- 🔗 = LINK CON TOKEN
- 🛒 = FINALIZZAZIONE ORDINE/CHECKOUT
- 💬 = CONVERSAZIONE NORMALE

## 💬 ESEMPI DI DIALOGO

### 📱 SCENARIO 1: NUOVO UTENTE - PRIMO CONTATTO

**👤 Cliente (nuovo)**: "Ciao"

**🤖 Sistema**: 
- ✅ API Limit OK
- ✅ Canale Attivo 
- ✅ Chatbot Attivo
- ✅ Non in Blacklist
- ✅ Non in WIP
- ✅ Nuovo Utente → Saluto rilevato

**🎉 ShopMe**: "Ciao! Benvenuto in L'Altra Italia! Per assicurarti un buon servizio e garantire la tua privacy, ti chiedo di inserire qui i tuoi dati: 

🔗 [Registrati qui](https://shopme.com/register/token_abc123)

Questo link è sicuro e scade tra 1 ora."

---

### 📱 SCENARIO 2: UTENTE REGISTRATO - CHAT NORMALE

**👤 Cliente (registrato)**: "Che vini avete?"

**🤖 Sistema**: 
- ✅ API Limit OK
- ✅ Canale Attivo
- ✅ Chatbot Attivo  
- ✅ Non in Blacklist
- ✅ Non in WIP
- ✅ Utente Esistente → Chat Libera RAG

**🤖 ShopMe**: "Ciao Marco! Abbiamo una selezione di vini siciliani eccezionali:

🍷 **Nero d'Avola Riserva 2019** - €24.90
Un rosso corposo con note di frutti rossi maturi

🍷 **Grillo Bio 2022** - €18.50  
Bianco fresco e minerale, perfetto per pesce

🍷 **Etna Rosso DOC** - €32.00
Dal vulcano, elegante e complesso

Quale ti incuriosisce di più?"

---

### 📱 SCENARIO 3: FINALIZZAZIONE ORDINE

**👤 Cliente**: "Voglio ordinare il Nero d'Avola"

**🤖 Sistema**: 
- ✅ Riconosce richiesta di finalizzazione ordine
- 🛒 Genera link checkout con token

**🤖 ShopMe**: "Perfetto! Il Nero d'Avola Riserva 2019 è un'ottima scelta! 

Per completare il tuo ordine in sicurezza:

🛒 [Finalizza Ordine](https://shopme.com/checkout/token_xyz789)

Qui potrai:
- Confermare quantità
- Scegliere spedizione  
- Inserire pagamento
- Ricevere fattura

Il link è sicuro e scade tra 1 ora."

---

### 📱 SCENARIO 4: CONTROLLO OPERATORE

**👤 Cliente**: "Ho un problema con il mio ordine"

**🤖 Sistema**:
- ✅ API Limit OK
- ✅ Canale Attivo
- ❌ Chatbot Disattivato (operatore ha preso controllo)
- 💾 Messaggio salvato in history
- 🚫 Nessuna risposta AI

**👨‍💼 Operatore**: "Ciao! Sono Sara del customer service. Mi dispiace per il problema. Puoi dirmi il numero del tuo ordine così posso aiutarti subito?"

---

### 📱 SCENARIO 5: SPAM DETECTION - AUTO-BLACKLIST

**👤 Cliente (spammer)**: Invia 10 messaggi in 30 secondi:
"Ciao" "Hello" "Hola" "Info" "Prezzi" "Vini" "Ordine" "Help" "Aiuto" "Prodotti"

**🤖 Sistema**:
- ✅ API Limit OK
- 🚨 **SPAM DETECTED**: 10 messaggi in 30 secondi
- 🚫 **AUTO-BLACKLIST**: 
  - Customer.isBlacklisted = true
  - Phone aggiunto a workspace.blocklist
- ❌ **STOP DIALOGO**: Nessuna risposta inviata
- 📝 **AUDIT LOG**: "AUTO-BLACKLIST: +1234567890 in workspace-123 - Reason: AUTO_SPAM"

**🤖 ShopMe**: *(Nessuna risposta - utente bloccato silenziosamente)*

---

### 📱 SCENARIO 6: UTENTE IN BLACKLIST

**👤 Cliente (blacklisted)**: "Ciao"

**🤖 Sistema**:
- ✅ API Limit OK  
- ✅ Canale Attivo
- ✅ Chatbot Attivo
- ❌ Utente in Blacklist
- 🚫 BLOCCA CONVERSAZIONE

**🤖 ShopMe**: [Nessuna risposta - dialogo bloccato]

---

### 📱 SCENARIO 6: CANALE IN WIP

**👤 Cliente**: "Buongiorno"

**🤖 Sistema**:
- ✅ API Limit OK
- ✅ Canale Attivo  
- ✅ Chatbot Attivo
- ✅ Non in Blacklist
- ❌ Canale in WIP

**⚠️ ShopMe**: "We are currently updating our system. Please try again in a few minutes. Thank you for your patience!"

---

### 📱 SCENARIO 7: API LIMIT RAGGIUNTO

**👤 Cliente**: "Ciao"

**🤖 Sistema**:
- ❌ API LIMIT RAGGIUNTO
- 🚫 STOP DIALOGO

**🤖 ShopMe**: [Nessuna risposta - limite API raggiunto]