import express, { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { createAuthRouter } from './auth.routes';
import { categoriesRouter } from './categories.routes';
import { chatRouter } from './chat.routes';
import { customersRouter } from './customers.routes';
import { eventsRouter } from './events.routes';
import { faqsRouter } from './faqs.routes';
import { messagesRouter } from './messages.routes';
import { offersRouter } from './offers.routes';
import { createOpenAIRouter } from './openai.routes';
import productsRouter from './products.routes';
import { servicesRouter } from './services.routes';
import { settingsRouter } from './settings.routes';
import { suppliersRouter } from './suppliers.routes';
import { createUserRouter } from './user.routes';
import { whatsappRouter } from './whatsapp.routes';
import { workspaceRouter } from './workspace.routes';

import { CategoriesController } from '../controllers/categories.controller';
import { ChatController } from '../controllers/chat.controller';
import { CustomersController } from '../controllers/customers.controller';
import { EventsController } from '../controllers/events.controller';
import { FaqController } from '../controllers/faq.controller';
import { MessageController } from '../controllers/message.controller';
import { OfferController } from '../controllers/offer.controller';
import { OpenAIController } from '../controllers/openai.controller';
import { ProductController } from '../controllers/product.controller';
import { ServicesController } from '../controllers/services.controller';
import { SettingsController } from '../controllers/settings.controller';
import { SuppliersController } from '../controllers/suppliers.controller';
import { UserController } from '../controllers/user.controller';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { WorkspaceController } from '../controllers/workspace.controller';

import { CustomerService } from '../../../application/services/customer.service';
import { FaqService } from '../../../application/services/faq.service';
import { MessageService } from '../../../application/services/message.service';
import { OtpService } from '../../../application/services/otp.service';
import { PasswordResetService } from '../../../application/services/password-reset.service';
import { ProductService } from '../../../application/services/product.service';
import ServiceService from '../../../application/services/service.service';
import { SupplierService } from '../../../application/services/supplier.service';
import { UserService } from '../../../application/services/user.service';
import { WorkspaceService } from '../../../application/services/workspace.service';
import { prisma } from '../../../lib/prisma';

// Initialize services
const productService = new ProductService();
const serviceService = ServiceService;
const userService = new UserService();
const workspaceService = new WorkspaceService();
const customerService = new CustomerService();
const messageService = new MessageService();
const supplierService = new SupplierService();
const faqService = new FaqService();

// Initialize controllers
const productController = new ProductController();
const servicesController = new ServicesController();
const userController = new UserController(userService);
const categoriesController = new CategoriesController();
const workspaceController = new WorkspaceController();
const chatController = new ChatController();
const customersController = new CustomersController();
const messageController = new MessageController();
const suppliersController = new SuppliersController();
const settingsController = new SettingsController();
const whatsappController = new WhatsAppController();
const authController = new AuthController(userService, new OtpService(prisma), new PasswordResetService(prisma));
const eventsController = new EventsController();
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
  router.use('/messages', messagesRouter(messageController));
  router.use('/settings', settingsRouter(settingsController));
  router.use('/suppliers', suppliersRouter(suppliersController));
  router.use('/events', eventsRouter(eventsController));
  router.use('/offers', offersRouter());
  router.use('/customers', customersRouter(customersController));
  router.use('/faqs', faqsRouter());
  router.use('/whatsapp', whatsappRouter(whatsappController));
  router.use('/openai', createOpenAIRouter(openaiController));

  return router;
}; 