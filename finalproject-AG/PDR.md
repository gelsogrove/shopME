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

## Dashboard

The Dashboard provides an at-a-glance overview of key metrics and performance indicators for the WhatsApp e-commerce platform. It is designed to give store administrators quick insights into their business operations.

### Features
- Static visualization of key business metrics
- Simulated charts for conversation volume and conversion rates
- Channel performance comparison table
- Recent activity feed showing latest system events
- Clear "Work in Progress" indicator for future enhancements

### Technical Implementation
- Fully frontend implementation with static mock data
- CSS-based chart visualizations without external dependencies
- Responsive design that adapts to different screen sizes
- Consistent design language with the rest of the application
- Modular component structure for easy extension with real data in the future

### Future Enhancements (Planned)
- Integration with backend API for real-time metrics
- Interactive charts with filtering capabilities
- Time period selection for historical data analysis
- Downloadable reports and data exports
- Custom dashboard layouts and widget configuration

## Special Offers System

The Special Offers system allows store administrators to create time-limited discounts for products, either across all categories or targeting specific product categories.

### Features
- Create, edit, and manage time-limited promotional offers
- Set discount percentages that apply to specific categories or all products
- Enable/disable offers with a simple toggle
- Automatic application of discounts based on current date
- Countdown timer for active offers
- Priority system that applies the best available discount

### Technical Implementation
- Database model `Offers` with the following key fields:
  - `name`: Descriptive name of the offer
  - `description`: Optional detailed description
  - `discountPercent`: Percentage discount to apply
  - `startDate` and `endDate`: Validity period
  - `isActive`: Toggle to enable/disable the offer
  - `categoryId`: Optional link to a specific category (null means all categories)
  - `workspaceId`: Workspace association

### Discount Priority System
- Offer discounts take precedence over customer-specific discounts
- When multiple offers apply to a product (e.g., category-specific and global offers), the highest discount percentage is applied
- The system automatically calculates the best price for each product at runtime
- Original prices are preserved in the database, with discounts applied dynamically

### Integration with Product Display
- Products display both original and discounted prices when offers are active
- Visual indicators show when a product has a special offer applied
- The chatbot automatically provides information about active discounts when discussing products

### User Interface
- Offers management page accessible as a sub-menu under Products
- Consistent design with other system components
- Enable/disable toggle for quick offer management
- Date range selection with calendar picker
- Category selector for targeted promotions

### API Endpoints
- `GET /api/workspaces/:workspaceId/offers`: List all offers
- `GET /api/workspaces/:workspaceId/offers/active`: Get only currently active offers
- `POST /api/workspaces/:workspaceId/offers`: Create a new offer
- `PUT /api/workspaces/:workspaceId/offers/:id`: Update an existing offer
- `DELETE /api/workspaces/:workspaceId/offers/:id`: Remove an offer

## Suppliers Management System

The Suppliers Management system allows store administrators to manage product suppliers and associate products with their respective suppliers.

### Features
- Create, edit, and manage suppliers information
- Associate products with specific suppliers
- Filter products by supplier in product listings
- Enable/disable suppliers with a simple toggle
- Automatically hide products from inactive suppliers in customer-facing interfaces

### Technical Implementation
- Database model `Suppliers` with the following key fields:
  - `name`: Name of the supplier
  - `description`: Optional detailed description
  - `address`: Physical address of the supplier
  - `website`: Supplier's website URL
  - `phone`: Contact phone number
  - `email`: Contact email address
  - `contactPerson`: Name of the primary contact person
  - `notes`: Additional notes about the supplier
  - `isActive`: Toggle to enable/disable the supplier
  - `workspaceId`: Workspace association
  - `slug`: URL-friendly version of the supplier name

### Integration with Products
- Products can be associated with a specific supplier
- Product listing can be filtered by supplier
- When a supplier is marked as inactive, all associated products are hidden from customer-facing interfaces

### User Interface
- Suppliers management page accessible as a sub-menu under Products
- Consistent design with other system components
- Enable/disable toggle for quick supplier management
- Detailed view with all supplier information
- List view showing key information for quick reference

### API Endpoints
- `GET /api/workspaces/:workspaceId/suppliers`: List all suppliers
- `GET /api/workspaces/:workspaceId/suppliers/active`: Get only currently active suppliers
- `GET /api/workspaces/:workspaceId/suppliers/:id`: Get a specific supplier
- `POST /api/workspaces/:workspaceId/suppliers`: Create a new supplier
- `PUT /api/workspaces/:workspaceId/suppliers/:id`: Update an existing supplier
- `DELETE /api/workspaces/:workspaceId/suppliers/:id`: Remove a supplier

## Phone Number Blocklist System

The Phone Number Blocklist system allows administrators to block specific phone numbers from interacting with the WhatsApp chatbot and removes them from the chat history display.

### Features
- Block specific phone numbers from receiving automated responses
- Blocked numbers are automatically hidden from chat history
- Blocked numbers are hidden from new customer lists
- Block users directly from the chat interface
- Manage blocklist through workspace settings

### Technical Implementation
- Workspace model includes a `blocklist` field that stores blocked phone numbers
- Blocked numbers are filtered out from chat history API responses
- Message service checks the blocklist before processing messages
- Block user functionality in chat interface updates the workspace blocklist
- Blocked users receive no response when messaging the system

### User Interface
- Block button in chat interface to quickly block problematic users
- Confirmation dialog before blocking a user
- Immediate removal of blocked users from the chat list
- Blocklist management in workspace settings for adding/removing numbers

### API Integration
- Chat history API automatically filters out blocked numbers
- Message processing skips responses for blocked numbers
- Settings API allows updating the blocklist

### Privacy and Security
- Blocked numbers are still stored in the database but not displayed in the UI
- Admin users can unblock numbers by removing them from the blocklist in settings
- System maintains privacy by not exposing blocked user data in the interface 

## Language Detection and Multilingual Support

The Language Detection and Multilingual Support system allows the WhatsApp chatbot to automatically detect the language of incoming messages and respond in the customer's preferred language.

### Features
- Automatic language detection for incoming WhatsApp messages
- Support for responding in customer's preferred language (English, Italian, Spanish, Portuguese)
- Automatic storage of language preference in customer profile
- Language-specific templates for common responses
- Consistent language experience across all customer interactions

### Technical Implementation
- Pattern-based language detection algorithm that identifies language based on:
  - Common words and phrases
  - Greetings and salutations
  - Question formats
  - Articles and pronouns
- Supported languages:
  - English (en / ENG)
  - Italian (it / IT)
  - Spanish (es / ESP)
  - Portuguese (pt / PRT)
- Language preference stored in customer profile
- Workspace settings include multilingual templates for:
  - Welcome messages
  - Work-in-progress messages
  - Error messages
  - Common responses

### API Integration
- Message processing API returns detected language:
  ```json
  {
    "success": true,
    "data": {
      "processedMessage": "Thank you for your message.",
      "detectedLanguage": "en",
      "customerLanguage": "ENG",
      "sessionId": "session-id",
      "customerId": "customer-id"
    }
  }
  ```
- Language consistency across sessions:
  - First interaction determines initial language preference
  - Subsequent interactions may update language preference if customer switches language
  - System responds in the customer's current language preference

### User Experience
- Seamless language transitions based on customer input
- No explicit language selection required from customers
- Consistent language usage across entire conversation
- Appropriate cultural nuances in greetings and responses 