# 🔒 WhatsApp Webhook Security Analysis

## 🚨 **PROBLEMI DI SICUREZZA ATTUALI**

### **1. Autenticazione Debole**
```typescript
// PROBLEMA: Solo verifica del verify_token in GET
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "test-verify-token"
if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified")
    res.status(200).send(challenge)
}
```

**Rischi:**
- ❌ **Nessuna verifica signature** sui messaggi POST
- ❌ **Token statico** facilmente intercettabile
- ❌ **Possibili attacchi replay** con messaggi falsificati

### **2. Validazione Insufficiente**
```typescript
// PROBLEMA: Accetta qualsiasi numero di telefono senza validazione
phoneNumber = data.entry[0].changes[0].value.messages[0].from;
messageContent = data.entry[0].changes[0].value.messages[0].text?.body;
```

**Rischi:**
- ❌ **Spoofing numeri telefono** - attaccante può fingere identità
- ❌ **Nessun rate limiting** - possibili attacchi DoS
- ❌ **Dati non sanitizzati** - rischio injection

### **3. Accesso Database Diretto**
```typescript
// PROBLEMA: Customer lookup solo su numero telefono
customer = await prisma.customers.findFirst({
    where: {
        phone: phoneNumber,
        workspaceId: workspaceId,
        isActive: true
    }
});
```

**Rischi:**
- ❌ **Enumerazione utenti** - attaccante può testare numeri
- ❌ **Accesso non autorizzato** se numero è compromesso
- ❌ **Nessun tracking tentativi** di accesso sospetti

---

## ✅ **SOLUZIONI PROPOSTE**

### **🔐 Livello 1: Webhook Signature Verification**

**Implementazione:**
```typescript
import crypto from 'crypto';

function verifyWhatsAppSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
        .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
        .update(payload)
        .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(`sha256=${expectedSignature}`, 'utf8'),
        Buffer.from(signature, 'utf8')
    );
}

// Nel webhook
router.post("/whatsapp/webhook", async (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    
    if (!verifyWhatsAppSignature(payload, signature)) {
        console.log('🚨 INVALID SIGNATURE - Request rejected');
        return res.status(401).send('Unauthorized');
    }
    
    // Continua con elaborazione...
});
```

### **🛡️ Livello 2: Rate Limiting & IP Whitelist**

**Implementazione:**
```typescript
import rateLimit from 'express-rate-limit';

// Rate limiting specifico per webhook
const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // max 30 richieste per minuto
    message: 'Too many webhook requests',
    standardHeaders: true,
    legacyHeaders: false,
});

// IP Whitelist Facebook/Meta
const WHATSAPP_IPS = [
    '173.252.74.0/24',
    '173.252.75.0/24',
    '31.13.64.0/18',
    // Altri IP WhatsApp/Meta
];

function isWhatsAppIP(clientIP: string): boolean {
    // Implementa controllo CIDR
    return WHATSAPP_IPS.some(range => ipInRange(clientIP, range));
}

router.post("/whatsapp/webhook", 
    webhookLimiter,
    (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress;
        if (!isWhatsAppIP(clientIP)) {
            return res.status(403).send('IP not whitelisted');
        }
        next();
    },
    async (req, res) => {
        // Webhook processing...
    }
);
```

### **🔍 Livello 3: Enhanced Phone Validation**

**Implementazione:**
```typescript
interface SecurityContext {
    phoneNumber: string;
    timestamp: number;
    messageId: string;
    attempts: number;
}

class PhoneSecurityService {
    private attempts: Map<string, number> = new Map();
    private lastMessage: Map<string, string> = new Map();
    
    async validatePhoneAccess(phoneNumber: string, messageId: string): Promise<boolean> {
        // 1. Controlla formato numero
        if (!this.isValidPhoneFormat(phoneNumber)) {
            console.log('🚨 Invalid phone format:', phoneNumber);
            return false;
        }
        
        // 2. Controlla rate limiting per numero
        const attempts = this.attempts.get(phoneNumber) || 0;
        if (attempts > 10) {
            console.log('🚨 Too many attempts from:', phoneNumber);
            return false;
        }
        
        // 3. Controlla messaggi duplicati
        const lastMsgId = this.lastMessage.get(phoneNumber);
        if (lastMsgId === messageId) {
            console.log('🚨 Duplicate message detected:', messageId);
            return false;
        }
        
        // 4. Aggiorna tracking
        this.attempts.set(phoneNumber, attempts + 1);
        this.lastMessage.set(phoneNumber, messageId);
        
        return true;
    }
    
    private isValidPhoneFormat(phone: string): boolean {
        // Regex per formato WhatsApp (country code + numero)
        return /^\d{10,15}$/.test(phone);
    }
}
```

### **🏪 Livello 4: Customer Authentication Token**

**Implementazione:**
```typescript
interface CustomerSession {
    customerId: string;
    phoneNumber: string;
    sessionToken: string;
    expiresAt: Date;
    verified: boolean;
}

class CustomerAuthService {
    async createSecureSession(customerId: string, phoneNumber: string): Promise<string> {
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        
        await prisma.customerSession.create({
            data: {
                customerId,
                phoneNumber,
                sessionToken,
                expiresAt,
                verified: false
            }
        });
        
        return sessionToken;
    }
    
    async verifyCustomerMessage(phoneNumber: string): Promise<CustomerSession | null> {
        return await prisma.customerSession.findFirst({
            where: {
                phoneNumber,
                expiresAt: { gt: new Date() },
                verified: true
            }
        });
    }
}
```

### **📊 Livello 5: Security Monitoring & Alerting**

**Implementazione:**
```typescript
class SecurityMonitorService {
    async logSecurityEvent(event: string, details: any) {
        await prisma.securityLog.create({
            data: {
                event,
                details: JSON.stringify(details),
                timestamp: new Date(),
                severity: this.calculateSeverity(event)
            }
        });
        
        // Alert su eventi critici
        if (this.isCriticalEvent(event)) {
            await this.sendSecurityAlert(event, details);
        }
    }
    
    async detectSuspiciousActivity(phoneNumber: string): Promise<boolean> {
        const recentLogs = await prisma.securityLog.findMany({
            where: {
                details: { contains: phoneNumber },
                timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) } // 1h
            }
        });
        
        // Rileva pattern sospetti
        return recentLogs.length > 50; // > 50 eventi in 1h
    }
}
```

---

## 🎯 **IMPLEMENTAZIONE PRIORITARIA**

### **🚨 URGENT (Implementare subito):**
1. ✅ **Webhook Signature Verification** - Previene 90% degli attacchi
2. ✅ **Rate Limiting** - Protegge da DoS
3. ✅ **IP Whitelist** - Solo traffico legittimo Meta/WhatsApp

### **🔒 HIGH (Prossime settimane):**
4. ✅ **Phone Validation Enhanced** - Previene spoofing
5. ✅ **Security Logging** - Monitoring attacchi

### **🛡️ MEDIUM (Lungo termine):**
6. ✅ **Customer Session Tokens** - Autenticazione avanzata
7. ✅ **Behavioral Analysis** - Machine learning per rilevare anomalie

---

## 📋 **CHECKLIST SICUREZZA WEBHOOK**

```bash
# 1. Environment Variables Required
WHATSAPP_APP_SECRET=your_app_secret_here
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
WEBHOOK_IP_WHITELIST=173.252.74.0/24,173.252.75.0/24

# 2. Database Schema Updates
# Aggiungi tabelle per security logging e customer sessions

# 3. Monitoring Setup
# Configura alerting per eventi di sicurezza

# 4. Testing
# Testa signature verification con dati reali WhatsApp
# Verifica rate limiting funziona correttamente
# Controlla IP whitelist blocca traffico non autorizzato
```

---

## 🔗 **RIFERIMENTI**

- [WhatsApp Business API Security](https://developers.facebook.com/docs/whatsapp/webhooks/security)
- [OWASP Webhook Security](https://owasp.org/www-project-web-security-testing-guide/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Status**: 🚧 **PENDING IMPLEMENTATION**  
**Priority**: 🚨 **CRITICAL**  
**Estimated Time**: 2-3 giorni per livelli 1-3
