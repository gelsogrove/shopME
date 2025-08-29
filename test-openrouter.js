const axios = require('axios');

async function testOpenRouter() {
  console.log('🚀 Testing OpenRouter with hardcoded values...\n');

  const payload = {
    model: "openai/gpt-4o",
    messages: [
      {
        role: "system",
        content: "Sei un Assistente virtuale della sociata' L'Altra Italia specializzata in prodotti italiani grazie a questa chatbot possiamo gestire ordini, fatture e rispondere a domande inerenti alla nostra attivitá\n\n\n**Website**: https://laltrait.com/\n📍 **Address**: C/ Ull de Llebre 7, 08758, Cervelló (Barcelona)\n📞 **Phone**: (+34) 93 15 91 221\n📧 **Email**: info@laltrait.com\n\n\n**GetOrdersListLink()**\nse un utente vuole vedere o chiede la lista degli ordini dobbiamo lanciare la Calling function  `GetOrdersListLink()` che ritorna il link da mosteare  al cliente, e con una frase provessionale gli diciamo che in questo link puo' vedere tutti i suoi ordini effettuati .\n\n**TRIGGERS:**\n- \"i miei ordini\"\n- \"lista ordini\"\n- \"storico ordini\"\n- \"dammi ordini\"\n- \"dammi link ordini\"\n- \"give me the list of orders\"\n- \"show me the list of orders\"\n"
      },
      {
        role: "user",
        content: "show me the list of orders"
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "getOrdersListLink",
          description: "secure link to view orders or specific order by code",
          parameters: {
            type: "object",
            properties: {
              workspaceId: { type: "string", description: "The workspace ID" },
              customerId: { type: "string", description: "The customer ID" },
              query: { type: "string", description: "Search query for ragSearch" },
              orderCode: { type: "string", description: "Order code for specific order requests" },
              messages: { type: "array", description: "Conversation history for context" }
            },
            required: ["workspaceId", "customerId"]
          }
        }
      }
    ],
    tool_choice: "required",
    temperature: 0,
    max_tokens: 1000
  };

  console.log('📤 Payload being sent to OpenRouter:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n🔧 Making request to OpenRouter...\n');

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'ShopMe RAG Processor'
      },
      timeout: 30000
    });

    console.log('✅ OpenRouter Response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      const message = response.data.choices[0].message;
      console.log('\n🎯 Message Content:');
      console.log(message.content);
      
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log('\n🔧 Tool Calls Found:');
        message.tool_calls.forEach((toolCall, index) => {
          console.log(`Tool Call ${index + 1}:`);
          console.log(`  Function: ${toolCall.function.name}`);
          console.log(`  Arguments: ${toolCall.function.arguments}`);
        });
      } else {
        console.log('\n❌ No tool calls found!');
      }
    }

  } catch (error) {
    console.error('❌ Error calling OpenRouter:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testOpenRouter();
