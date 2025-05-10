## Agent Configuration

The system now uses a single agent approach instead of multiple agents. This simplifies the user experience and makes the system more maintainable.

### Features
- Single agent configuration page accessible at `/agent`
- Streamlined interface focusing only on essential parameters
- AI model selection with default value "GPT-4.1-mini"
- Temperature, Top-P, Top-K, and Max Tokens controls for fine-tuning AI responses
- Tooltips for each parameter explaining their function and impact
- Rich markdown editor for agent instructions

### Technical Implementation
- Backend stores agent data in the `prompts` table
- Single API endpoint at `/api/agent` for all agent operations
- Frontend uses a simplified form with all parameters in a single row
- Model field added to support different AI models
- All parameters are configured to work with OpenRouter API
- Parameter ranges:
  - Temperature: 0-2 (controls randomness)
  - Top-P: 0-1 (nucleus sampling)
  - Top-K: 0-100 (token selection limit)
  - Max Tokens: 100-8000 (response length limit) 