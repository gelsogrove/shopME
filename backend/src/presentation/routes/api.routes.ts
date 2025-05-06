import express from 'express';
import { MessagesController } from '../controllers/messages.controller';
import { RegistrationController } from '../controllers/registration.controller';

const router = express.Router();
const messagesController = new MessagesController();
const registrationController = new RegistrationController();

// Routes for messages
router.post('/messages', messagesController.handleMessage.bind(messagesController));

// Registration routes
router.get('/token/:token', registrationController.validateToken);
router.post('/register', registrationController.register);
router.get('/data-protection', registrationController.getDataProtectionInfo);

export default router; 