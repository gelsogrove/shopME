import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

// Read the base YAML file if exists
let swaggerDocument = {};
const yamlPath = path.join(__dirname, '..', 'swagger.yaml');

if (fs.existsSync(yamlPath)) {
  const yaml = require('js-yaml');
  const yamlContent = fs.readFileSync(yamlPath, 'utf8');
  swaggerDocument = yaml.load(yamlContent);
}

// Options for the swagger specification
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopMe API',
      version: version,
      description: 'API Documentation for ShopMe',
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.laltroitalia.shop',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth_token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
        cookieAuth: [],
      },
    ],
    ...swaggerDocument,
  },
  apis: [
    './src/routes/*.ts', 
    './src/routes/*.js', 
    './src/interfaces/http/controllers/**/*.ts',
    './src/interfaces/http/routes/**/*.ts',
    './src/interfaces/http/routes/**/*.js'
  ],
};

export const swaggerSpec = process.env.NODE_ENV === 'test' 
  ? { openapi: '3.0.0', info: { title: 'Test API', version: '1.0.0' } } // Simple mock for tests
  : swaggerJsdoc(options); 