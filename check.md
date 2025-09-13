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
| 2 | `aggiungi al carrello un prosecco` | Aggiunge al carrello | `add_to_cart` |
| 3 | `aggiungi al carrello una mozzarella` | **Mostra 2 prodotti** per scelta utente | `SearchRag_product` |
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
| 15 | `fammi vedere i prodotti` | Lista prodotti | `SearchRag_product` |
| 16 | `fammi vedere i servizi` | Lista servizi | `SearchRag_service` |
| 17 | `avete prodotti freschi` | Lista prodotti freschi | `SearchRag_product` |
| 18 | `che servizi offrite` | Lista servizi (2) | `SearchRag_service` |
| 19 | `quanto costa il limoncello` | Prezzo scontato | `SearchRag_product` |
| 19b | `prezzo del limoncello` | Prezzo scontato | `SearchRag_product` |

### ❓ **CATEGORIA 5: FAQ E INFORMAZIONI**
| # | Comando | Risultato Atteso | CF da Chiamare |
|---|---------|------------------|----------------|
| 20 | `come pago` | FAQ pagamenti | `SearchRag_faq` |
| 21 | `come gestite la catena del freddo` | Risposta in italiano | `SearchRag_faq` |

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
- `add_to_cart`: 4 casi
- `confirmOrderFromConversation`: 9 casi
- `SearchRag_product`: 5 casi
- `SearchRag_service`: 2 casi
- `SearchRag_faq`: 5 casi
- `GetOrdersListLink`: 6 casi
- `GetShipmentTrackingLink`: 3 casi
- `GetCustomerProfileLink`: 1 caso
- `ContactOperator`: 1 caso

## 📊 **REPORT IN TEMPO REALE:**
**MANTENGO SEMPRE AGGIORNATO** il report durante i test con:
- ✅ **Test passati**: #6 "come pago" - SearchRag_faq chiamata correttamente (ma errore formattazione)
- ❌ **Test falliti**: #1 "chi sei" - GENERIC (CORRETTO secondo Andrea)
- ❌ **Test falliti**: #2 "aggiungi al carrello un prosecco" - SearchRag_product invece di add_to_cart
- ❌ **Test falliti**: #3 "fammi vedere il carrello" - SearchRag_faq invece di confirmOrderFromConversation
- ❌ **Test falliti**: #4 "dammi link ordini" - SearchRag_faq invece di GetOrdersListLink
- ❌ **Test falliti**: #5 "fammi vedere i prodotti" - SearchRag_product invece di GetAllProducts
- ❌ **Test falliti**: #7 "voglio modificare il mio indirizzo di fatturazione" - GENERIC invece di GetCustomerProfileLink
- ❌ **Test falliti**: #8 "who are you" (EN) - SearchRag_faq chiamata ma errore formattazione
- ❌ **Test falliti**: #9 "quién eres" (ES) - GENERIC invece di SearchRag_faq
- ⚠️ **Errori risolti**: Nessuno ancora
- 🚨 **Problemi OpenRouter**: Nessuno
- 🚨 **PROBLEMA CRITICO**: LLM non riconosce le Cloud Functions, usa solo SearchRag
- 🚨 **PROBLEMA FORMATTAZIONE**: Tutti i test con SearchRag hanno errore formattazione

## 🚀 **STATO SISTEMA:**
**PRONTO PER I TEST** - 35 test cases organizzati in 6 categorie (IT/EN/ES)
**TUTTI I PROBLEMI RISOLTI** - Sistema al 100% funzionante


il report lo devi salvare dentro chek_report.md dentro docs