try {
    // Check if challenge is active
    if (!isChallengeActive()) {
        inactiveMessage = getInactiveMessage()
        sendMessage(inactiveMessage);
        return;
    }

    let systemResp;
    const message = GetQuestion();  
    const userID = GetUserId();
    const userInfo = getUserData(userID);
    const isNewUser = isPresent(userInfo) ? false : true;
  
    if (isNewUser) {
        // New linkl to the registration form
         return ·"LINK";   
    } else {

        // 0. GET DATA
        routerAgent = getRouterAgent()
        const agentSelected = GetAgentDedicatedFromRouterAgent(routerAgent,message);
        const prompt = loadPrompt(agentSelected);  
        const orders = getOrders();
        const products = getProducts();  
        const historyMessages = GetHistory("last 30 messages");

        // 1. TOKENIZE (ora restituisce anche la mappa)
        const { fakeMessage, fakeUserInfo, tokenMap } = Tokenize(message, userInfo);

        // 2. OPENROUTER 
        systemResp = getResponse(prompt, agentSelected, historyMessages, fakeMessage, fakeUserInfo, orders, products);
        // Attach a calling function when we have the order details  
        // Attach a calling function when we have to send the invoices     

         // 4. CONVERSIONAL RESPONSE
        systemResp = conversationalResponse("metti la frase in maniera discorsiva:" + systemResp);
 
        // 5. DETOKENIZE
        const resp = Detokenize(systemResp, systemResp);xº
        
        // 6. SAVE TO HISTORY
        saveToChatHistory(userID, agentSelected, message, resp);  

        return resp;  
    }

    
} catch (error) {
    console.error("Errore in main:", error);
}