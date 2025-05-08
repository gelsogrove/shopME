```mermaid
flowchart TD
    Start([Inizio]) --> CheckWorkspace{Workspace\nesiste e attivo?}

    CheckWorkspace -->|No| ReturnError[Ritorna errore workspace]
    CheckWorkspace -->|Sì| CheckBlacklist{Cliente nella\nblacklist?}

    CheckBlacklist -->|Sì| IgnoreMessage[Ignora messaggio\nSenza risposta]
    CheckBlacklist -->|No| CheckCustomer{Cliente\nesiste?}

    CheckCustomer -->|No| CreateTempCustomer[Crea cliente temporaneo]
    CreateTempCustomer --> SendRegistrationLink[Invia link registrazione]

    CheckCustomer -->|Sì| CheckActiveChatbot{activeChatbot\n== false?}

    CheckActiveChatbot -->|Sì| SkipResponse[Salta risposta\nOperatore manuale]

    CheckActiveChatbot -->|No| CheckRegistration{Cliente\nregistrato?}

    CheckRegistration -->|No| SendRegistrationLink

    CheckRegistration -->|Sì| ProcessMessage[Elabora messaggio]

    ProcessMessage --> GetData[Ottieni dati\n- Router Agent\n- Prodotti\n- Servizi\n- Cronologia chat]

    GetData --> SelectAgent[Seleziona agente\ncon router]

    SelectAgent --> ReplaceVariables[Sostituisci variabili\n{customerLanguage}, etc.]

    ReplaceVariables --> GeneratePrompt[Genera prompt\ncon RAG]

    GeneratePrompt --> GetResponse[Ottieni risposta\nconversazionale]

    GetResponse --> SaveMessage[Salva messaggio\ne risposta]

    SaveMessage --> ReturnResponse[Ritorna risposta]

    SendRegistrationLink --> SaveMessage
    SkipResponse --> End([Fine])
    IgnoreMessage --> End
    ReturnError --> End
    ReturnResponse --> End
```

try {
// 1. WORKSPACE CHECK
const workspaceSettings = getWorkspaceSettings(workspaceId);
if (!workspaceSettings) {
return 'Workspace not found. Please contact support.';
}

    if (!workspaceSettings.isActive) {
        // NEW: Multilingua WIP message
        // Se il workspace è disabilitato, restituisci il messaggio di Work in Progress nella lingua dell’utente se disponibile, altrimenti in inglese
        // Esempio:
        //   let userLang = customer?.language?.toLowerCase().slice(0,2);
        //   let msg = (userLang && workspaceSettings.wipMessages[userLang]) ? workspaceSettings.wipMessages[userLang] : workspaceSettings.wipMessages['en'] || 'WhatsApp channel is inactive';
        return msg;
    }

    // 2. BLACKLIST CHECK
    const isBlacklisted = isCustomerBlacklisted(phoneNumber);
    if (isBlacklisted) {
        // Silently ignore the message without responding
        saveMessage(workspaceId, phoneNumber, message, '', 'Blacklisted');
        return '';
    }

    // 3. CUSTOMER CHECK
    const customer = findCustomerByPhone(phoneNumber, workspaceId);

    // 4. OPERATOR MANUAL CONTROL CHECK
    if (customer && customer.activeChatbot === false) {
        // Save the message without response (only store the user message)
        saveMessage(workspaceId, phoneNumber, message, '', 'Manual Operator Control');
        return '';
    }

    // 5. REGISTRATION CHECK
    if (!customer) {
        // New user detected - sending registration link with secure token
        const token = createRegistrationToken(phoneNumber, workspaceId);
        const baseUrl = workspaceSettings.url || process.env.FRONTEND_URL || 'https://laltroitalia.shop';
        const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}`;

        // Get workspace name for personalized message
        let workspaceName = workspaceSettings.name || "our service";

        // Create welcome message with registration link
        const response = `Welcome to ${workspaceName}! To continue with our service, please complete your registration here: ${registrationUrl}`;

        // Create temporary customer record if needed
        if (!findCustomerByPhone(phoneNumber, workspaceId)) {
            createCustomer({
                name: 'Unknown Customer',
                email: `customer-${Date.now()}@example.com`,
                phone: phoneNumber,
                workspaceId
            });
        }

        saveMessage(workspaceId, phoneNumber, message, response, 'Registration');
        return response;
    }

    // 6. INCOMPLETE REGISTRATION CHECK
    if (customer.name === 'Unknown Customer') {
        // User is still unregistered - showing registration link again
        const token = createRegistrationToken(phoneNumber, workspaceId);
        const baseUrl = workspaceSettings.url || process.env.FRONTEND_URL || 'https://laltroitalia.shop';
        const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}`;

        const response = `Per favore completa la registrazione prima di continuare: ${registrationUrl}`;

        saveMessage(workspaceId, phoneNumber, message, response, 'Registration');
        return response;
    }

    // 7. PROCESS MESSAGE FOR REGISTERED CUSTOMER
    try {
        // 7.1 Get necessary data
        const routerAgentPrompt = getRouterAgent();
        const products = getProducts();
        const services = getServices();
        const chatHistory = getLatesttMessages(phoneNumber, 30);

        // 7.2 Select the appropriate agent with the router
        const selectedAgent = getResponseFromAgentRouter(routerAgentPrompt, message);
        let agentSelected = selectedAgent.name || "Unknown";

        // 7.3 Process agent prompt to replace variables
        if (selectedAgent.content && customer) {
            const customerLanguage = customer.language || 'Italian';
            selectedAgent._replacedPrompt = selectedAgent.content.replace(/\{customerLanguage\}/g, customerLanguage);
        }

        // 7.4 Generate the prompt enriched with context
        const systemPrompt = getResponseFromRag(
            selectedAgent,
            message,
            products,
            services,
            chatHistory,
            customer
        );

        // 7.5 Convert systemPrompt to conversation prompt
        const response = getConversationResponse(chatHistory, message, systemPrompt);

        // 7.6 Save message and response
        saveMessage(workspaceId, phoneNumber, message, response, agentSelected);

        return response;
    } catch (processingError) {
        const errorResponse = "Error processing customer message:" + processingError;
        saveMessage(workspaceId, phoneNumber, message, errorResponse, "Error");
        return errorResponse;
    }

} catch (error) {
console.error("Error processing message:", error);
const errorResponse = "Sorry, there was an error processing your message. Please try again later.";
saveMessage(workspaceId, phoneNumber, message, errorResponse, "System");
return errorResponse;
}
