import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "L'Altra Italia Shop API",
      version: '1.0.0',
      description: 'API documentation for the Italian products shop',
      contact: {
        name: 'API Support',
        email: 'support@laltroitalia.shop'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
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
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/interfaces/http/routes/*.ts',
    './src/controllers/*.ts',
    './src/interfaces/http/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(options); 