# Active Context - ShopMe Project

## 🎯 CURRENT STATUS: SYSTEM ARCHITECTURE UNIFICATION

**Date**: December 2024  
**Status**: 🔄 Architecture unification in progress  
**Priority**: Token replacement system implementation  

## 🚨 CRITICAL TASK: Token Replacement System Implementation

### **Problem Identified**
1. **Formatter inventa contenuti**: Token `[LIST_CATEGORIES]` non sostituito, OpenRouter inventa categorie
2. **Architettura non unificata**: Discrepanze tra PRD, RULES_PROMPT e TODO.MD
3. **Temperature non ottimali**: LLM e Formatter con temperature non corrette
4. **Token system confuso**: Sistema token non unificato

### **Solution Implemented**
- **Architettura unificata**: `TranslationService → DualLLMService → SearchRag → FormatterService`
- **Temperature corrette**: LLM 0.1 (deterministico), Formatter 0.5 (creativo)
- **Sistema token unificato**: Token generici + specifici gestiti nel formatter
- **Replace PRIMA di OpenRouter**: Tutti i token sostituiti prima della chiamata LLM
- **Parametri obbligatori**: customerId, workspaceId, language, originalQuestion sempre passati

### **Token System Details**
- **Token generici**: `[LINK_WITH_TOKEN]` per FAQ
- **Token specifici**: `[LIST_CATEGORIES]`, `[USER_DISCOUNT]`, `[LINK_ORDERS_WITH_TOKEN]`, etc.
- **Gestione dati vuoti**: Messaggi di cortesia quando database vuoto
- **Nomi propri**: Non tradotti (Mozzarella di Bufala rimane Mozzarella di Bufala)

### **Impact**
- **Zero invenzioni**: Solo dati reali dal database
- **Architettura pulita**: Flusso unificato e chiaro
- **Performance ottimale**: Temperature corrette per ogni componente
- **Manutenibilità**: Sistema token centralizzato nel formatter

## 📋 ACTIVE TASKS

**📋 RIFERIMENTO**: Per User Stories complete con Acceptance Criteria e Test Cases, vedere `userStories.md`

### CURRENT USER STORY: US1 - Variable Replacement System Implementation
1. **Implementare `replaceAllVariables()` nel formatter** - Sostituire tutte le **VARIABLES** con dati reali dal database PRIMA di OpenRouter
2. **Implementare replace `[LIST_CATEGORIES]` VARIABLE** - Query database per categorie reali
3. **Implementare replace `[USER_DISCOUNT]` VARIABLE** - Query customer per sconto reale
4. **Implementare replace `[LINK_ORDERS_WITH_TOKEN]` VARIABLE** - Generare link sicuri
5. **Aggiungere gestione graceful** - Messaggi di cortesia per database vuoto
6. **EXCEPTION HANDLING**: Validazione parametri con errori espliciti
7. **EXCEPTION HANDLING**: Gestione errori database con dettagli
8. **Testare con Acceptance Criteria US1** - Verificare tutti i test cases

## ✅ RECENTLY COMPLETED

### TASK COMPLETIONS
- **Architecture Unification**: Unificata architettura tra PRD, RULES_PROMPT e TODO.MD
- **Temperature Settings**: Corrette temperature LLM (0.1) e Formatter (0.5)
- **Token System Unification**: Sistema token unificato con generici + specifici
- **Documentation Update**: Aggiornati PRD e Memory Bank con architettura corretta
- **Acceptance Criteria**: Create 10 Acceptance Criteria complete e strutturate
- **Obsolete Features Removal**: Rimosse funzionalità obsolete (multi-business, priorità dinamica)
- **Flow Documentation**: Documentato flusso corretto con Mermaid diagram

## 🏗️ SYSTEM ARCHITECTURE

### Unified Architecture
- **Flow**: `USER INPUT → TranslationService → DualLLMService → SearchRag → FormatterService`
- **Temperature**: LLM 0.1 (deterministic), Formatter 0.5 (creative)
- **Token System**: Unified system with generic + specific tokens
- **Replace Strategy**: All tokens replaced in FormatterService BEFORE OpenRouter

### Core Components
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + TailwindCSS
- **LLM**: OpenRouter integration with unified dual-LLM architecture
- **Workflow**: N8N automation
- **Database**: PostgreSQL with workspace isolation

### Key Features
- **Multilingual Support**: Italian, English, Spanish, Portuguese
- **WhatsApp Integration**: Complete chatbot functionality with token replacement
- **Order Management**: Full CRUD operations
- **Product Management**: Catalog with embeddings
- **Customer Management**: Profile and registration system
- **Token Management**: Unified system for FAQ and database data

## 🔧 DEVELOPMENT ENVIRONMENT

### Standard Test User
- **Customer ID**: `test-customer-123`
- **Phone**: `+393451234567`
- **Email**: `test-customer-123@shopme.com`
- **Workspace ID**: `cm9hjgq9v00014qk8fsdy4ujv`

### Key Commands
- `npm run dev` - Start development servers
- `npm run seed` - Seed database
- `npm run test:integration` - Run integration tests
- `npm run build` - Build for production

## 📊 SYSTEM HEALTH

### ✅ OPERATIONAL COMPONENTS
- API Endpoints: Working correctly
- Database: Working correctly
- Backend Services: Working correctly
- N8N Workflow: Working correctly
- Frontend: Working correctly
- Integration Tests: All passing

### 🔍 MONITORING
- System health tests implemented
- Error detection and logging active
- Performance monitoring in place

## 🎯 NEXT PRIORITIES

1. **HIGH**: Implement token replacement in FormatterService
2. **HIGH**: Update FormatterService signature with mandatory parameters
3. **MEDIUM**: Test unified system with all test cases
4. **MEDIUM**: Verify no content inventions

---

**Last Updated**: December 2024  
**Status**: Architecture unified, token replacement system implementation in progress
