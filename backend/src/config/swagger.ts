import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "ShopMe API",
      version: '1.0.0',
      description: 'Complete API documentation for the Italian products shop platform',
      contact: {
        name: 'API Support',
        email: 'support@laltroitalia.shop'
      },
      license: {
        name: 'Private',
        url: 'https://laltroitalia.shop/license'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://laltroitalia.shop/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer {token}'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Authentication', description: 'User authentication operations' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Workspaces', description: 'Workspace management operations' },
      { name: 'Products', description: 'Product management operations' },
      { name: 'Categories', description: 'Product category operations' },
      { name: 'Suppliers', description: 'Supplier management operations' },
      { name: 'Offers', description: 'Special offers operations' },
      { name: 'FAQs', description: 'FAQ management operations' },
      { name: 'Chat', description: 'Chat functionality operations' },
      { name: 'Messages', description: 'Message management operations' },
      { name: 'Agents', description: 'AI agent configuration operations' },
      { name: 'Events', description: 'Event management operations' },
      { name: 'Services', description: 'Service management operations' },
      { name: 'WhatsApp', description: 'WhatsApp integration operations' },
      { name: 'Upload', description: 'File upload operations' }
    ],
    externalDocs: {
      description: 'Find out more about the API',
      url: 'https://laltroitalia.shop/api-docs'
    }
  },
  apis: [
    './src/routes/*.ts',
    './src/interfaces/http/routes/*.ts',
    './src/controllers/*.ts',
    './src/interfaces/http/controllers/*.ts',
    './src/domain/entities/*.ts',
    './src/application/dto/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(options); 