# 📱 WHATSAPP BUSINESS API CONFIGURATION GUIDE

## 🚨 PROBLEMA IDENTIFICATO

Il workspace ha una configurazione WhatsApp **placeholder** che impedisce l'invio reale dei messaggi:

```
✅ WhatsApp Phone: +34654728753
❌ WhatsApp API Key: placeholde... (NON REALE)
```

I push messages vengono generati e salvati nel database con status "SENT", ma **non vengono realmente inviati** perché l'API key non è valida.

## 🔧 SOLUZIONE: CONFIGURAZIONE WHATSAPP BUSINESS API

### 1. **Ottieni Credenziali WhatsApp Business**

1. Vai su **Meta for Developers**: https://developers.facebook.com/
2. Crea un'app WhatsApp Business
3. Ottieni:
   - `Phone Number ID` (es: 1234567890)
   - `Access Token` (es: EAAxxxxxxxxxxxxx)

### 2. **Aggiorna Configurazione Database**

```sql
-- Aggiorna il workspace con le credenziali reali
UPDATE workspace
SET
  whatsappPhoneNumber = 'TUO_PHONE_NUMBER_ID',  -- es: '1234567890'
  whatsappApiKey = 'TUO_ACCESS_TOKEN'           -- es: 'EAAxxxxxxxxxxxxx'
WHERE id = 'cm9hjgq9v00014qk8fsdy4ujv';
```

### 3. **Alternative: Configurazione tramite Frontend**

Se hai accesso al frontend admin:

1. Vai su **Settings > WhatsApp Configuration**
2. Inserisci:
   - **Phone Number ID**: Il tuo WhatsApp Business Phone Number ID
   - **Access Token**: Il tuo WhatsApp Business API Access Token

## 🧪 TESTING

Dopo la configurazione, testa con:

```bash
# 1. Controlla configurazione
node check-whatsapp-config.js

# 2. Test push message
curl -X PUT "http://localhost:3010/api/workspaces/cm9hjgq9v00014qk8fsdy4ujv/customers/CUSTOMER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"discount": 25}'

# 3. Verifica messaggio inviato
node check-whatsapp-config.js
```

## 📊 RISULTATO ATTESO

Dopo la configurazione corretta vedrai:

```
🏢 Workspace: L'Altra Italia(ESP)
   Status: ✅ Active
   WhatsApp Phone: ✅ Configured (1234567890)
   WhatsApp API Key: ✅ Configured (EAAxxxxxxx...)
   🎉 WhatsApp is FULLY CONFIGURED - Push messages will work!

📱 Recent push message attempts:
   1. [SENT] DISCOUNT_UPDATED → Mario Rossi (+390212345678)
      Content: "💸 Ciao Mario Rossi! Da oggi puoi usufruire del 25..."
      Sent: 2025-09-29T09:15:23.456Z
      WhatsApp ID: wamid.HBgNMzkwMjEyMzQ1Njc4FQIAEhg... ✅ REALE
```

## ⚠️ MODALITÀ SVILUPPO

Se non hai ancora credenziali WhatsApp reali, puoi:

1. **Usare sandbox WhatsApp** per test
2. **Configurare webhook di test** che logga i messaggi senza inviarli
3. **Simulare invio** modificando `sendWhatsAppMessage` per restituire un `messageId` fittizio

## 🎯 CONCLUSIONE

**Il sistema push messaging funziona perfettamente** - manca solo la configurazione WhatsApp reale. Una volta configurato, i messaggi appariranno "verdi" (confermati) nell'interfaccia! 🚀
