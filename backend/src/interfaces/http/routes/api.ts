import * as express from 'express';
import { Router } from 'express';
import documentRoutes from '../../../routes/documentRoutes';
import { AuthController } from '../controllers/auth.controller';
import { createAuthRouter } from './auth.routes';
import { categoriesRouter } from './categories.routes';
import { chatRouter } from './chat.routes';
import { customersRouter } from './customers.routes';

import { faqsRouter } from './faqs.routes';
import { offersRouter } from './offers.routes';
import { createOpenAIRouter } from './openai.routes';
import { createOrderRouter } from './order.routes';
import productsRouter from './products.routes';
import { servicesRouter } from './services.routes';
import { settingsRouter } from './settings.routes';

import { createUserRouter } from './user.routes';
// Removed whatsappRouter import
import { workspaceRouter } from './workspace.routes';

import { CategoriesController } from '../controllers/categories.controller';
import { ChatController } from '../controllers/chat.controller';
import { CustomersController } from '../controllers/customers.controller';

import { FaqController } from '../controllers/faq.controller';
// Removed MessageController import
import { OfferController } from '../controllers/offer.controller';
import { OpenAIController } from '../controllers/openai.controller';
import { ProductController } from '../controllers/product.controller';
import { ServicesController } from '../controllers/services.controller';
import { SettingsController } from '../controllers/settings.controller';

import { UserController } from '../controllers/user.controller';
// Removed WhatsAppController import
import { WorkspaceController } from '../controllers/workspace.controller';

import { CustomerService } from '../../../application/services/customer.service';
import { FaqService } from '../../../application/services/faq.service';
// Removed MessageService import
import { OtpService } from '../../../application/services/otp.service';
import { PasswordResetService } from '../../../application/services/password-reset.service';
import { ProductService } from '../../../application/services/product.service';
import ServiceService from '../../../application/services/service.service';

import { UserService } from '../../../application/services/user.service';
import { WorkspaceService } from '../../../application/services/workspace.service';
import { prisma } from '../../../lib/prisma';

// Initialize services
const productService = new ProductService();
const serviceService = ServiceService;
const userService = new UserService();
const workspaceService = new WorkspaceService();
const customerService = new CustomerService();
// Removed messageService
const faqService = new FaqService();

// Initialize controllers
const productController = new ProductController();
const servicesController = new ServicesController();
const userController = new UserController(userService);
const categoriesController = new CategoriesController();
const workspaceController = new WorkspaceController();
const chatController = new ChatController();
const customersController = new CustomersController();
const settingsController = new SettingsController();
// Removed messageController and whatsappController
const authController = new AuthController(userService, new OtpService(prisma), new PasswordResetService(prisma));

const offerController = new OfferController();
const faqController = new FaqController();
const openaiController = new OpenAIController();

export const apiRouter = (): Router => {
  const router = express.Router();

  // Map routes
  router.use('/auth', createAuthRouter(authController));
  router.use('/users', createUserRouter());
  router.use('/products', productsRouter());
  router.use('/services', servicesRouter(servicesController));
  router.use('/categories', categoriesRouter());
  router.use('/workspace', workspaceRouter());
  router.use('/chat', chatRouter(chatController));
  router.use('/settings', settingsRouter(settingsController));

  router.use('/offers', offersRouter());
  router.use('/customers', customersRouter(customersController));
  router.use('/faqs', faqsRouter());
  // Removed messages and whatsapp routes
  router.use('/openai', createOpenAIRouter(openaiController));
  
  // Orders routes
  router.use('/orders', createOrderRouter());
  router.use('/workspaces/:workspaceId/orders', createOrderRouter());
  
  // Mount document routes
  router.use('/workspaces/:workspaceId/documents', documentRoutes);
  router.use('/documents', documentRoutes);
  
  // Mount products routes with workspace context
  router.use('/workspaces/:workspaceId/products', productsRouter());

  return router;
}; 