# ShopMe API Documentation

## Overview

This document provides comprehensive information about the ShopMe API, which powers the Italian products e-commerce platform. The API follows RESTful principles and uses JSON for data exchange.

## API Versioning

The API supports versioning to ensure backward compatibility as new features are added. The current version is `v1`.

### Version Format

API versions are specified in the URL path:

```
https://api.laltroitalia.shop/api/v1/resource
```

If no version is specified, the latest stable version is used:

```
https://api.laltroitalia.shop/api/resource
```

### Available Versions

- **v1** - Current stable version

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT).

### Obtaining a Token

1. Send a POST request to `/api/auth/login` with your credentials:
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```

2. The server will respond with a token:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

### Using the Token

Include the token in the `Authorization` header of your requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Workspace Context

Many endpoints require a workspace context. This can be provided in two ways:

1. In the URL path for workspace-specific resources:
   ```
   /api/workspaces/{workspaceId}/resource
   ```

2. Using the `x-workspace-id` header:
   ```
   x-workspace-id: workspace-uuid
   ```

## Interactive API Documentation

The API includes interactive documentation using Swagger/OpenAPI:

- **Development**: http://localhost:3001/api/docs
- **Production**: https://laltroitalia.shop/api/docs

The interactive documentation allows you to:
- Explore available endpoints
- View request/response formats
- Test API calls directly from the browser
- Understand authentication requirements
- See all available parameters and options

## Common Response Formats

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. The current limits are:

- 100 requests per minute per IP address
- 1000 requests per hour per user

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed in the period
- `X-RateLimit-Remaining`: Requests remaining in the period
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

## Pagination

List endpoints support pagination using the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Example:
```
GET /api/products?page=2&limit=50
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 320,
    "page": 2,
    "limit": 50,
    "pages": 7
  }
}
```

## Main API Resources

The API provides access to the following main resources:

- **Authentication**: User registration, login, and token management
- **Users**: User account management
- **Workspaces**: Multi-tenant workspace management
- **Products**: Product catalog management
- **Categories**: Product categorization
- **Suppliers**: Supplier management
- **Offers**: Special offers and discounts
- **FAQs**: Frequently asked questions
- **Chat**: WhatsApp chat functionality
- **Messages**: Message management
- **Agents**: AI agent configuration
- **Events**: Event management
- **Services**: Service offerings
- **Upload**: File upload management

## API Health Check

The API provides a health check endpoint at `/health` that returns basic status information:

```json
{
  "status": "ok",
  "timestamp": "2023-05-15T10:30:00.000Z",
  "version": "1.0.0",
  "apiVersion": "v1"
}
```

## Support

For API support, please contact:

- Email: support@laltroitalia.shop
- Documentation: https://laltroitalia.shop/api-docs 