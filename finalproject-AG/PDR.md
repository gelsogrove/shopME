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
- `GET /api/offers`: List all offers
- `GET /api/offers/active`: Get only currently active offers
- `POST /api/offers`: Create a new offer
- `PUT /api/offers/:id`: Update an existing offer
- `DELETE /api/offers/:id`: Remove an offer 