# ShopMe - AI-Powered WhatsApp E-commerce Platform

A comprehensive WhatsApp e-commerce platform with AI-powered chatbot, simplified LLM architecture, and multi-language support.

## 🚀 Features

- **🤖 AI Chatbot**: Direct LLM integration with intelligent responses
- **🛍️ E-commerce**: Complete product catalog, cart, and order management
- **📊 Analytics**: Usage tracking and business insights
- **🌍 Multi-language**: Native LLM support for Italian, English, Spanish, and Portuguese
- **🔐 Security**: Token-based authentication and workspace isolation
- **📱 Secure Links**: Temporary authenticated access to orders and profiles
- **⚡ Simplified Architecture**: Direct LLM processing without intermediate layers

## 🏗️ Architecture

### Simplified LLM System

- **LLMService**: Direct processing and response generation
- **Cloud Functions**: Specific actions (tracking, orders, operator contact)
- **Variable Replacement**: Dynamic content personalization
- **Link Generation**: Secure temporary access tokens

### Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenRouter integration with GPT-4-mini
- **Authentication**: JWT-based token system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd shop
   ```

2. **Install dependencies**

   ```bash
   # Backend dependencies
   cd backend && npm install

   # Frontend dependencies
   cd ../frontend && npm install
   ```

3. **Environment setup**

   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env

   # Configure your environment variables
   # See backend/.env.example for required variables
   ```

4. **Start the application**
   ```bash
   # Start everything with one command
   npm run dev
   ```

### Access Points

- **Frontend**: http://localhost:3000
  - Login: `admin@shopme.com` / `venezia44`
- **Backend API**: http://localhost:3001
- **Database**: localhost:5434
  - User: `shopmefy` / `shopmefy`

## 📁 Project Structure

```
shop/
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access layer
│   │   ├── domain/          # Domain entities
│   │   └── prisma/          # Database schema and migrations
│   └── package.json
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── hooks/           # Custom React hooks
│   └── package.json
├── scripts/                 # Automation scripts
├── docs/                    # Documentation
└── docker-compose.yml       # Docker services configuration
```

## 🔧 Development

### Available Scripts

```bash
# Start all services
npm run dev

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Database operations
cd backend && npm run db:reset
cd backend && npm run seed

# Testing
cd backend && npm run test
cd frontend && npm run test
```

### Database Management

```bash
# Reset database
cd backend && npm run db:reset

# Run migrations
cd backend && npm run db:migrate

# Seed data
cd backend && npm run seed
```

## 🤖 AI Integration

The platform uses OpenRouter for AI processing:

- **Language Detection**: Automatic detection of user language
- **Intent Classification**: Understanding user requests
- **Response Generation**: Natural language responses
- **Function Calling**: Dynamic API calls based on user intent

## 🔐 Security Features

- **Workspace Isolation**: Complete data separation between workspaces
- **Token Authentication**: Secure token-based access for public pages
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive input sanitization

## 📊 Usage Tracking

- **Message Cost**: €0.005 per AI response
- **Analytics Dashboard**: Complete usage statistics
- **Workspace Filtering**: Isolated tracking per workspace

## 🌍 Multi-language Support

Supported languages:

- **Italian (IT)**: Primary language
- **English (EN)**: International support
- **Spanish (ES)**: Latin American market
- **Portuguese (PT)**: Brazilian market

## 📱 Public Access

Customers can access their data via secure links:

- **Orders**: `/orders-public?token=...`
- **Profile**: `/customer-profile?token=...`
- **Checkout**: `/checkout-public?token=...`

## 🧪 Testing

````bash
```bash
# Run unit tests
cd backend && npm run test:unit
````

# Frontend tests

cd frontend && npm run test

```

## 📚 Documentation

- **PRD**: `docs/PRD.md` - Product Requirements Document
- **API**: Swagger documentation at `/api/docs`
- **Architecture**: `docs/architecture.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:

- Check the documentation in `docs/`
- Review the PRD for feature specifications
- Contact the development team
```
