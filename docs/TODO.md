# 🚀 TODO - Implementazioni Shopme Platform

**Aggiornato**: 02 Gennaio 2025  
**Ciao Andrea!** Questo TODO contiene tutte le implementazioni mancanti basate su PRD e analisi del sistema.

---

## 🔐 **1. SICUREZZA N8N & TOKEN INTEGRATION**

### ✅ **COMPLETED**
- ✅ Backend CF endpoints con validazione token (`/api/cf/products`, `/api/cf/services`, `/api/cf/callOperator`)
- ✅ SessionTokenService con generazione sicura (SHA256, 48 char, 1h scadenza)
- ✅ Token validation middleware per tutti gli endpoint CF

### ❌ **TODO - PRIORITÀ ALTA**

#### **1.1 N8N Token Integration**
- [ ] **Aggiornare workflow N8N** per passare `sessionToken` nelle chiamate `/internal/rag-search`
  ```json
  // Current N8N HTTP Request Tool payload (MANCANTE sessionToken)
  {
    "query": "{{ $('prepare-data').item.json.chatInput }}",
    "workspaceId": "{{ $('prepare-data').item.json.workspaceId }}", 
    "customerId": "{{ $('prepare-data').item.json.customerid }}"
    // MISSING: "sessionToken": "{{ $('prepare-data').item.json.sessionId }}"
  }
  ```
- [ ] **Testare validazione token** end-to-end tra WhatsApp → N8N → Backend
- [ ] **Rimuovere backward compatibility** da `/internal/rag-search` (rendere token obbligatorio)

#### **1.2 N8N Security Hardening**
- [ ] **Configurare HTTPS** per N8N (attualmente HTTP)
- [ ] **Basic Auth** per accesso N8N UI (username/password)
- [ ] **Network isolation** - N8N solo accessible da backend
- [ ] **Rate limiting** per N8N webhooks
- [ ] **Audit logging** per modifiche workflow
- [ ] **Backup automatico** workflow N8N (export JSON periodico)

---

## 🔧 **2. IMPLEMENTAZIONI CALLING FUNCTIONS N8N**

### ✅ **COMPLETED - Backend CF Endpoints**
- ✅ `GET /api/cf/products` - Prodotti attivi con categorie attive, stock > 1
- ✅ `GET /api/cf/services` - Tutti servizi workspace
- ✅ `POST /api/cf/callOperator` - Richiesta operatore umano

### ❌ **TODO - N8N Workflow Integration**

#### **2.1 CF Products Tool**
- [ ] **Creare HTTP Request Tool** in N8N per `GET /api/cf/products`
- [ ] **Configurare authentication** con token validation
- [ ] **Tool description** per AI Agent:
  ```
  "Get available products. Use when customer asks about products, catalog, prices, availability. 
  Examples: 'what products do you have?', 'show me wines', 'avete mozzarella?'"
  ```
- [ ] **Testing** con diverse query prodotti

#### **2.2 CF Services Tool**  
- [ ] **Creare HTTP Request Tool** in N8N per `GET /api/cf/services`
- [ ] **Configurare authentication** con token validation
- [ ] **Tool description** per AI Agent:
  ```
  "Get available services. Use when customer asks about services, delivery, packaging, support.
  Examples: 'what services do you offer?', 'quanto costa la spedizione?', 'che servizi avete?'"
  ```
- [ ] **Testing** con diverse query servizi

#### **2.3 CF CallOperator Tool**
- [ ] **Creare HTTP Request Tool** in N8N per `POST /api/cf/callOperator`
- [ ] **Configurare authentication** con token validation  
- [ ] **Tool description** per AI Agent:
  ```
  "Request human operator assistance. Use when customer explicitly asks to speak with a human operator.
  Examples: 'voglio parlare con un operatore', 'need human help', 'chiama qualcuno'"
  ```
- [ ] **Testing** richieste operatore end-to-end

#### **2.4 Workflow Structure Update**
- [ ] **Aggiornare AI Agent** con tutti e 3 i CF tools
- [ ] **Configurare tool calling** nel LangChain Agent
- [ ] **Testare function selection** automatica dell'AI
- [ ] **Error handling** per CF failures

---

## 📧 **3. EMAIL NOTIFICATIONS SISTEMA**

### ❌ **TODO - Email quando chiamato operatore**

#### **3.1 Email Service Setup**
- [ ] **Installare email dependencies**
  ```bash
  npm install nodemailer @types/nodemailer
  ```
- [ ] **Configurare SMTP settings** in `.env`
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=noreply@shopme.com
  SMTP_PASS=your_app_password
  EMAIL_FROM=ShopMe Platform <noreply@shopme.com>
  ```

#### **3.2 Email Templates**
- [ ] **Template HTML** richiesta operatore
  ```html
  <h2>🆘 Richiesta Operatore - {{workspaceName}}</h2>
  <p><strong>Cliente:</strong> {{customerName}} ({{phoneNumber}})</p>
  <p><strong>Messaggio:</strong> "{{message}}"</p>
  <p><strong>Timestamp:</strong> {{timestamp}}</p>
  <a href="{{chatUrl}}">Prendi controllo chat</a>
  ```
- [ ] **Template testo** per fallback
- [ ] **Template multilingua** (IT, EN, ES)

#### **3.3 Email Trigger Implementation**
- [ ] **Aggiornare CF callOperator** per inviare email
  ```typescript
  // In calling-function.controller.ts callOperator()
  await emailService.sendOperatorRequest({
    workspaceId,
    customerPhone: phoneNumber,
    customerMessage: message,
    workspaceEmail: workspace.notificationEmail
  });
  ```
- [ ] **Email queue system** per reliability (Redis/Bull)
- [ ] **Retry logic** per email fallite
- [ ] **Unsubscribe mechanism** per compliance

#### **3.4 Email Settings UI**
- [ ] **Frontend settings page** per configurazione email
- [ ] **Test email** button per verificare SMTP
- [ ] **Email templates editor** per customizzazione
- [ ] **Notification preferences** per workspace

---

## 🛡️ **4. OWASP SECURITY COMPLIANCE**

### ❌ **TODO - Security Assessment & Implementation**

#### **4.1 OWASP Top 10 2021 Compliance Check**

##### **A01: Broken Access Control**
- [ ] **Audit permission system** - verificare workspace isolation
- [ ] **Testare privilege escalation** - user non dovrebbe accedere admin endpoints
- [ ] **Path traversal protection** - file upload sicurezza
- [ ] **Direct object reference** - ID prediction attacks

##### **A02: Cryptographic Failures**
- [ ] **Encryption audit** - passwords, tokens, sensitive data
- [ ] **SSL/TLS configuration** - force HTTPS in production
- [ ] **Key management** - rotation automatica token/secrets
- [ ] **Secure random generation** - crypto.randomBytes() usage

##### **A03: Injection Attacks**  
- [ ] **SQL injection testing** - Prisma ORM queries
- [ ] **NoSQL injection** - JSON input validation
- [ ] **Command injection** - shell script executions
- [ ] **Input sanitization** - XSS prevention

##### **A04: Insecure Design**
- [ ] **Threat modeling** - architecture security review
- [ ] **Rate limiting** - prevent abuse/DoS
- [ ] **Business logic flaws** - payment/discount manipulation
- [ ] **Secure development lifecycle** implementation

##### **A05: Security Misconfiguration**
- [ ] **Default credentials audit** - N8N, database, admin accounts
- [ ] **Error message sanitization** - no stack traces in production  
- [ ] **Unnecessary features removal** - unused endpoints/services
- [ ] **Security headers** - HSTS, CSP, X-Frame-Options

##### **A06: Vulnerable and Outdated Components**
- [ ] **Dependency vulnerability scan**
  ```bash
  npm audit --audit-level=moderate
  npm outdated
  ```
- [ ] **Regular updates schedule** - security patches
- [ ] **Third-party service monitoring** - OpenRouter, WhatsApp API
- [ ] **Container security** - Docker image scanning

##### **A07: Identification and Authentication Failures**
- [ ] **Password policy enforcement** - strength requirements
- [ ] **Multi-factor authentication** - 2FA implementation
- [ ] **Session management** - secure tokens, expiration
- [ ] **Brute force protection** - account lockout

##### **A08: Software and Data Integrity Failures**
- [ ] **Code signing** - NPM package verification
- [ ] **CI/CD pipeline security** - secure deployment
- [ ] **Data validation** - input/output integrity
- [ ] **Backup verification** - data corruption detection

##### **A09: Security Logging and Monitoring Failures**
- [ ] **Security event logging** - login attempts, admin actions
- [ ] **Log aggregation** - centralized security monitoring
- [ ] **Anomaly detection** - unusual patterns/behaviors
- [ ] **Incident response plan** - security breach procedures

##### **A10: Server-Side Request Forgery (SSRF)**
- [ ] **URL validation** - external API calls
- [ ] **Network segmentation** - internal service protection
- [ ] **Whitelist approach** - allowed external domains
- [ ] **Request monitoring** - suspicious outbound calls

#### **4.2 Security Testing Tools**
- [ ] **Install security scanners**
  ```bash
  npm install --save-dev jest-security
  npm install -g safety-cli
  npm install --save-dev snyk
  ```
- [ ] **Automated security tests** in CI/CD
- [ ] **Penetration testing** checklist
- [ ] **Vulnerability disclosure** process

---

## 🎯 **5. PROMPT ENGINEERING & AI OPTIMIZATION**

### ❌ **TODO - Systematic Prompt Improvement**

#### **5.1 Agent Prompt Consistency**
- [ ] **Audit all prompts** nel sistema (agent, formatter, router)
- [ ] **Standardize prompt structure** - role, context, instructions, examples
- [ ] **Multilingual prompt templates** - IT, EN, ES consistency
- [ ] **Function calling instructions** - clear tool usage guidelines

#### **5.2 Context Enhancement**
- [ ] **Business context injection** - dynamic company info
- [ ] **Conversation history optimization** - relevant context selection
- [ ] **Product context** - inventory, pricing, categories integration
- [ ] **Customer personalization** - preferences, history, language

#### **5.3 Response Quality Control**
- [ ] **Response validation** - format checking, length limits
- [ ] **Tone consistency** - brand voice alignment
- [ ] **Error message templates** - user-friendly fallbacks
- [ ] **A/B testing framework** - prompt performance comparison

#### **5.4 Advanced Features**
- [ ] **Intent detection** improvement - better query classification
- [ ] **Sentiment analysis** - customer satisfaction tracking
- [ ] **Conversation routing** - escalation triggers
- [ ] **Response caching** - common queries optimization

---

## 🎨 **6. USER EXPERIENCE & FRONTEND ENHANCEMENTS**

### ❌ **TODO - Based on PRD Requirements**

#### **6.1 Operator Requests Visual Enhancements**
- [ ] **Real-time notifications** - WebSocket per richieste operator
- [ ] **Sound alerts** - audio notification per urgency
- [ ] **Mobile optimization** - responsive operator dashboard
- [ ] **Bulk operations** - gestione multipla richieste

#### **6.2 Analytics Dashboard**
- [ ] **Conversation metrics** - response times, satisfaction
- [ ] **Operator performance** - resolution times, ratings
- [ ] **System health monitoring** - N8N, database, API status
- [ ] **Business intelligence** - sales patterns, popular products

#### **6.3 Settings & Configuration**
- [ ] **N8N workflow editor** integration in admin UI
- [ ] **Email templates editor** - drag & drop WYSIWYG
- [ ] **Security settings page** - token management, IP whitelist
- [ ] **Backup & restore** - workspace configuration export

---

## 📱 **7. WHATSAPP INTEGRATION COMPLETENESS**

### ❌ **TODO - WhatsApp Business API Features**

#### **7.1 Rich Media Support**
- [ ] **Image/document upload** handling in chat
- [ ] **Voice message** transcription (Whisper AI)
- [ ] **Location sharing** for delivery services
- [ ] **Contact card** sharing for business info

#### **7.2 WhatsApp Business Features**
- [ ] **Catalog integration** - WhatsApp native product catalog
- [ ] **Payment integration** - WhatsApp Pay support
- [ ] **Quick replies** - predefined response buttons
- [ ] **List messages** - structured product/service lists

#### **7.3 Webhook Reliability**
- [ ] **Webhook signature verification** - Meta/WhatsApp security
- [ ] **Message deduplication** - prevent duplicate processing
- [ ] **Delivery status tracking** - read receipts, delivery confirmations
- [ ] **Error handling** - webhook failures, retries

---

## 🔄 **8. SYSTEM RELIABILITY & PERFORMANCE**

### ❌ **TODO - Production Readiness**

#### **8.1 Database Optimization**
- [ ] **Query performance audit** - slow query identification
- [ ] **Index optimization** - database performance tuning
- [ ] **Connection pooling** - Prisma connection management
- [ ] **Database backup strategy** - automated backups, point-in-time recovery

#### **8.2 Caching Strategy**
- [ ] **Redis implementation** - session storage, rate limiting
- [ ] **API response caching** - RAG results, product data
- [ ] **Static content CDN** - images, documents delivery
- [ ] **Cache invalidation** - real-time data updates

#### **8.3 Monitoring & Observability**
- [ ] **Application monitoring** - APM (Application Performance Monitoring)
- [ ] **Error tracking** - Sentry/similar error aggregation
- [ ] **Log management** - structured logging, log rotation
- [ ] **Health checks** - service availability monitoring

#### **8.4 Scalability Preparation**
- [ ] **Load testing** - stress testing con Artillery/k6
- [ ] **Database sharding** strategy for multi-tenancy
- [ ] **Microservices migration** path (se necessario)
- [ ] **Container orchestration** - Docker Swarm/Kubernetes

---

## 🚀 **9. DEPLOYMENT & DEVOPS**

### ❌ **TODO - Production Deployment**

#### **9.1 CI/CD Pipeline**
- [ ] **GitHub Actions** setup per automated testing
- [ ] **Docker images** optimization per production
- [ ] **Database migrations** automated deployment
- [ ] **Zero-downtime deployment** strategy

#### **9.2 Environment Management**  
- [ ] **Production environment** setup (AWS/Digital Ocean)
- [ ] **Environment variables** management (secrets/config)
- [ ] **SSL certificates** automated renewal
- [ ] **Domain configuration** - custom domains per workspace

#### **9.3 Backup & Disaster Recovery**
- [ ] **Database backup** automated (daily/weekly/monthly)
- [ ] **File storage backup** - documents, images
- [ ] **Configuration backup** - N8N workflows, settings
- [ ] **Disaster recovery plan** - RTO/RPO definitions

---

## 📋 **10. COMPLIANCE & LEGAL**

### ❌ **TODO - GDPR & Privacy**

#### **10.1 GDPR Compliance**
- [ ] **Data mapping** - personal data inventory
- [ ] **Consent management** - opt-in/opt-out mechanisms
- [ ] **Right to erasure** - delete customer data
- [ ] **Data portability** - export customer data
- [ ] **Privacy policy** - GDPR compliant documentation

#### **10.2 WhatsApp Business Compliance**
- [ ] **Meta Business verification** - official business account
- [ ] **WhatsApp Business Policy** compliance check
- [ ] **Opt-in requirements** - explicit consent for messaging
- [ ] **Message categories** - proper template classifications

#### **10.3 International Compliance**
- [ ] **Multi-jurisdiction privacy** - CCPA (California), LGPD (Brazil)
- [ ] **Data residency** - EU data staying in EU
- [ ] **Cross-border data transfer** - Standard Contractual Clauses
- [ ] **Audit trail** - compliance documentation

---

## 🎯 **PRIORITÀ DI IMPLEMENTAZIONE**

### **🔥 SETTIMANA 1 - SECURITY & N8N**
1. N8N token integration nel workflow
2. N8N security hardening (HTTPS, Basic Auth)
3. CF Tools implementation in N8N (products, services, callOperator)

### **⚡ SETTIMANA 2 - EMAIL & OWASP**
1. Email service per richieste operatore
2. OWASP Top 10 security audit
3. Security testing implementation

### **🚀 SETTIMANA 3 - UX & PERFORMANCE**  
1. Operator requests UX enhancements
2. Analytics dashboard
3. Database optimization

### **📈 SETTIMANA 4 - PRODUCTION READY**
1. CI/CD pipeline setup
2. Monitoring & observability
3. GDPR compliance implementation

---

## 🔍 **ANALISI MANCANZE vs PRD**

### **PRD Requirements Not Yet Implemented:**

#### **From PRD Section "Main Features":**
- [ ] **Push Notification System** - Real-time notifications mancanti
- [ ] **Advanced Analytics** - Business intelligence dashboard
- [ ] **Multi-workspace Management** - Enterprise features

#### **From PRD Section "Technical Architecture":**
- [ ] **Full N8N Integration** - Visual workflow editor embedded
- [ ] **Token Security** - Complete end-to-end token validation
- [ ] **OWASP Compliance** - Security assessment completare

#### **From PRD Section "WhatsApp Features":**
- [ ] **Rich Media Support** - Images, voice, location
- [ ] **WhatsApp Catalog** - Native product integration
- [ ] **Payment Integration** - WhatsApp Pay support

#### **From PRD Section "Business Model":**
- [ ] **Multi-plan Support** - Subscription tier limitations
- [ ] **Usage Tracking** - API calls, message limits monitoring
- [ ] **Billing Integration** - Automated subscription management

---

**🎯 TOTALE TODO ITEMS: 89**  
**⏱️ STIMA COMPLETAMENTO: 4-6 settimane**  
**👥 TEAM SUGGERITO: 2-3 sviluppatori + 1 security specialist**

---

**Andrea, questo TODO è il blueprint completo per portare ShopMe da MVP a prodotto enterprise-ready! Ogni sezione è prioritizzata e include implementazioni dettagliate.** 🚀