# 🧪 TEST CASES - SHOPME WHATSAPP BOT

## ⏱️ **IMPORTANTE - TIMING:**
**SLEEP DI 5 SECONDI** tra una chiamata e l'altra per evitare il blocco dell'utente.

## 👤 **UTENTI DI TEST:**
### 🇮🇹 **ITALIANO:**
- **Mario Rossi** (`+390212345678`) con parametri:
  - `log=true`
  - `seed=true` (quando necessario)
  - `exitFirstMessage=true` (quando necessario)

### 🇬🇧 **INGLESE:**
- **John Smith** (`+441234567890`) con parametri:
  - `log=true`
  - `exitFirstMessage=true` (quando necessario)

### 🇪🇸 **SPAGNOLO:**
- **Maria Garcia** (`+34912345678`) con parametri:
  - `log=true`
  - `exitFirstMessage=true` (quando necessario)

## 🔧 **AGGIORNAMENTO PROMPT:**
Se modifichi `prompt_agent.md`:
1. **Modifica** il file `docs/other/prompt_agent.md`
2. **Esegui** `npm run prompt:update` per aggiornare il DB
3. **Verifica** che le modifiche siano attive

## ⚠️ **OPENROUTER RATE LIMITS:**
Se superiamo i limiti durante i test:
1. **TI AVVISO IMMEDIATAMENTE** 🚨
2. **MI FERMO** e aspetto istruzioni
3. **AGGIORNO IL REPORT** con lo stato attuale

## 🌍 **TEST MULTILINGUA:**
Dopo i test in italiano, provare in **inglese** e **spagnolo**:

### 🇮🇹 **ITALIANO - Mario Rossi:**
- Numero: `+390212345678`
- Comandi: `chi sei`, `dammi lista ordini`, `mostrami carrello`

### 🇬🇧 **INGLESE - John Smith:**
- Numero: `+441234567890`
- Comandi: `who are you`, `give me orders list`, `show me cart`

### 🇪🇸 **SPAGNOLO - Maria Garcia:**
- Numero: `+34912345678`
- Comandi: `quién eres`, `dame lista de pedidos`, `muéstrame carrito`

## 📋 Tabella Test Cases Organizzata e Pulita

### 🎯 **CATEGORIA 1: INFORMAZIONI UTENTE E SISTEMA**
| # | Comando | Risultato Atteso | CF da Chiamare |
|---|---------|------------------|----------------|
| 1 | `chi sei` | Presentazione del bot | `GENERIC` |
| 1b | `who are you` | Presentazione del bot | `GENERIC` |
| 1c | `quién eres` | Presentazione del bot | `GENERIC` |

## 🚨 **TEST BLOCCATO AL PRIMO FALLIMENTO**

### ❌ **TEST 2 FALLITO - "aggiungi al carrello un prosecco"**
- **Risultato**: `SearchRag_product` invece di `add_to_cart`
- **Problema**: LLM non riconosce le Cloud Functions
- **Status**: BLOCCATO - Analisi in corso

### 🛒 **CATEGORIA 2: GESTIONE CARRELLO**
| # | Comando | Risultato Atteso | CF da Chiamare |
|---|---------|------------------|----------------|
| 2 | `aggiungi al carrello un prosecco` | Aggiunge al carrello automaticamente | `SearchRag` (cart-aware) |
| 3 | `aggiungi al carrello una mozzarella` | **Mostra 2 prodotti** per scelta utente | `SearchRag` (cart-aware) |
| 4 | `fammi vedere il carrello` | Mostra carrello + LINK | `confirmOrderFromConversation` |
| 4b | `show me cart` | Mostra carrello + LINK | `confirmOrderFromConversation` |
| 4c | `muéstrame carrito` | Mostra carrello + LINK | `confirmOrderFromConversation` |
| 5 | `mostrami carrello` | Mostra carrello + LINK | `confirmOrderFromConversation` |
| 5b | `mostra carrello` | Mostra carrello + LINK | `confirmOrderFromConversation` |
| 6 | `confermo carrello` | Conferma ordine + LINK | `confirmOrderFromConversation` |
| 7 | `procedi con l'ordine` | Conferma ordine | `confirmOrderFromConversation` |
| 7b | `procedo con l'ordine` | Conferma ordine | `confirmOrderFromConversation` |
| 8 | `cancella il prosecco` | Carrello vuoto | `add_to_cart` (qty=0) |
| 9 | `modifica quantità prosecco a 3` | Aggiorna quantità | `add_to_cart` |
| 10 | `cambia quantità mozzarella a 2` | Aggiorna quantità | `add_to_cart` |

### 📦 **CATEGORIA 3: GESTIONE ORDINI E TRACKING**
| # | Comando | Risultato Atteso | CF da Chiamare |
|---|---------|------------------|----------------|
| 11 | `dammi link ordini` | Link agli ordini | `GetOrdersListLink` |
| 11b | `give me orders list` | Link agli ordini | `GetOrdersListLink` |
| 11c | `dame lista de pedidos` | Link agli ordini | `GetOrdersListLink` |
| 12 | `quando arriva il mio ordine` | Link tracking DHL | `GetShipmentTrackingLink` |
| 13 | `dove è il mio ordine?` | Link tracking DHL | `GetShipmentTrackingLink` |
| 13b | `dove il mio ordine` | Link tracking DHL | `GetShipmentTrackingLink` |
| 14 | `dammi fattura dell'ultimo ordine` | Link fattura | `GetOrdersListLink` |
| 14b | `dammi l'ultimo ordine` | Link ordini | `GetOrdersListLink` |

### 🛍️ **CATEGORIA 4: CATALOGO PRODOTTI E SERVIZI**
| # | Comando | Risultato Atteso | CF da Chiamare |
|---|---------|------------------|----------------|
| 15 | `che prodotti avete` | Lista categorie con icone e conteggio | `GetAllProducts` |
| 15b | `dammi tutti i prodotti che vendete` | Lista categorie con icone e conteggio | `GetAllProducts` |
| 15c | `cosa vendete` | Lista categorie con icone e conteggio | `GetAllProducts` |
| 16 | `che categorie hai di prodotti` | Lista categorie con icone e conteggio | `GetAllCategories` |
| 16b | `che categorie avete` | Lista categorie con icone e conteggio | `GetAllCategories` |
| 17 | `Formaggi e Latticini` | Lista prodotti della categoria formaggi | `GetProductsByCategory` |
| 17b | `formaggi` | Lista prodotti della categoria formaggi | `GetProductsByCategory` |
| 17c | `le spezie` | Lista prodotti della categoria spezie | `GetProductsByCategory` |
| 18 | `hai la mozzarella di bufala` | Ricerca mozzarella di bufala | `SearchRag` |
| 18b | `avete il parmigiano` | Ricerca parmigiano | `SearchRag` |
| 19 | `che servizi offrite` | Lista servizi (2) | `GetServices` |
| 19b | `che servizi avete` | Lista servizi (2) | `GetServices` |
| 20 | `che offerte avete` | Lista offerte attive | `GetActiveOffers` |

### ❓ **CATEGORIA 5: FAQ E INFORMAZIONI**
| # | Comando | Risultato Atteso | CF da Chiamare |
|---|---------|------------------|----------------|
| 21 | `come pago` | FAQ pagamenti | `SearchRag` |
| 21b | `come gestite la catena del freddo` | Risposta in italiano | `SearchRag` |
| 21c | `quanto ci vuole per la consegna` | Info tempi consegna | `SearchRag` |
| 21d | `politica di reso` | Info resi | `SearchRag` |

### 👤 **CATEGORIA 6: GESTIONE PROFILO E SUPPORTO**
| # | Comando | Risultato Atteso | CF da Chiamare |
|---|---------|------------------|----------------|
| 22 | `voglio modificare il mio indirizzo di fatturazione` | Link profilo | `GetCustomerProfileLink` |
| 23 | `voglio parlare con un operatore` | Contatto operatore | `ContactOperator` |

## 🔍 **ANALISI E STATISTICHE**

### ✅ **RISULTATI:**
- **Totale test cases**: 34 (puliti, no duplicati)
- **Categorie**: 6 (Utente, Carrello, Ordini, Catalogo, FAQ, Profilo)
- **Lingue**: Italiano, Inglese, Spagnolo

### ⚠️ **PROBLEMI CRITICI DA RISOLVERE:**
1. **#4**: `aggiungi al carrello una mozzarella` - ✅ **RISOLTO**: Mostra 2 prodotti per scelta utente
2. **#9**: `cancella il prosecco` - ✅ **RISOLTO**: Usa `add_to_cart` con qty=0

### 🎯 **PRIORITÀ:**
1. **ALTA**: ✅ **COMPLETATA** - Disambiguazione prodotti funziona
2. **MEDIA**: ✅ **COMPLETATA** - Cancellazione carrello con add_to_cart qty=0

## 📊 **MAPPATURA CF COMPLETA:**
- `GetUserInfo`: 0 casi
- `add_to_cart`: 3 casi (solo per modifiche quantità)
- `confirmOrderFromConversation`: 9 casi
- `SearchRag`: 8 casi (cart-aware + ricerca prodotti + FAQ)
- `GetAllProducts`: 3 casi (lista categorie)
- `GetAllCategories`: 2 casi (categorie disponibili)
- `GetProductsByCategory`: 3 casi (prodotti per categoria)
- `GetServices`: 2 casi (lista servizi)
- `GetActiveOffers`: 1 caso (offerte attive)
- `GetOrdersListLink`: 6 casi
- `GetShipmentTrackingLink`: 3 casi
- `GetCustomerProfileLink`: 1 caso
- `ContactOperator`: 1 caso

## 📊 **REPORT IN TEMPO REALE:**
**MANTENGO SEMPRE AGGIORNATO** il report durante i test con:

### ✅ **NUOVO SISTEMA CATEGORIE:**
- **GetAllProducts**: Mostra categorie con icone e conteggio prodotti
- **GetProductsByCategory**: Mostra tutti i prodotti di una categoria specifica
- **SearchRag**: Ricerca semantica per prodotti specifici e FAQ
- **SearchRag (cart-aware)**: Aggiunge automaticamente al carrello

### 🎯 **TEST CASES AGGIORNATI:**
- **Totale test cases**: 40+ (organizzati per flusso categorie)
- **Categorie**: 6 (Utente, Carrello, Ordini, Catalogo, FAQ, Profilo)
- **Lingue**: Italiano, Inglese, Spagnolo
- **Flusso**: Categorie → Prodotti per categoria → Ricerca specifica

### 🚨 **PROBLEMI DA RISOLVERE:**
1. **SearchRag_faq**: Errore "Unknown function" - deve essere `SearchRag`
2. **Temperature**: Main LLM 0.0, Formatter 0.3 (✅ CORRETTO)
3. **Prompt structure**: Regole per domande sui prodotti aggiunte

## 🚀 **STATO SISTEMA:**
**AGGIORNATO CON NUOVO FLUSSO CATEGORIE** - 40+ test cases organizzati per flusso categorie
**TEMPERATURE CORRETTE** - Main LLM 0.0, Formatter 0.3
**PROBLEMA SearchRag_faq** - Da correggere nel prompt


il report lo devi salvare dentro chek_report.md dentro docs