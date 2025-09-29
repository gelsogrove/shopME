import { PrismaClient } from '@prisma/client';
import { pushMessagingService } from '../../services/push-messaging.service';
import logger from '../../utils/logger';

export class WelcomeService {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }
  
  async sendWelcomeMessage(customerId: string): Promise<boolean> {
    try {
      const customer = await this.prisma.customers.findUnique({
        where: { id: customerId },
        include: { workspace: true }
      });
      
      if (!customer) {
        logger.error(`[WELCOME] Customer ${customerId} not found`);
        return false;
      }
      
      if (!customer.phone) {
        logger.error(`[WELCOME] Customer ${customerId} has no phone`);
        return false;
      }

      const success = await pushMessagingService.sendUserWelcome(
        customer.id,
        customer.phone,
        customer.workspaceId
      );

      if (success) {
        logger.info(`[WELCOME] Welcome push sent to customer ${customerId}`);
      } else {
        logger.error(`[WELCOME] Failed to send welcome push to customer ${customerId}`);
      }

      return success;
    } catch (error) {
      logger.error(`[WELCOME] Error sending welcome message to customer ${customerId}:`, error);
      return false;
    }
  }
}
