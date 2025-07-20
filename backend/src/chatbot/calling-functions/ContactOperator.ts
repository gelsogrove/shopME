import { prisma } from '../../lib/prisma';
import { EmailService } from '../../application/services/email.service';
import logger from '../../utils/logger';

/**
 * ContactOperator Calling Function
 *
 * This function is used to handle operator intervention requests from users.
 * When called, it sets the 'activeChatbot' field to false for the customer matching the given phone and workspaceId.
 * It also sends an email notification to the admin with a chat summary.
 * It returns a confirmation message to the user: "Certo, verrà contattato il prima possibile dal nostro operatore."
 *
 * Parameters:
 *   - phone: string (the customer's phone number)
 *   - workspaceId: string (the workspace context)
 *
 * Usage:
 *   - Used by N8N or the chatbot when a user requests to speak with a human operator.
 *   - After this call, the chatbot will no longer respond to the user until reactivated manually.
 *   - An email notification is sent to the admin with chat summary.
 */
export async function ContactOperator({ phone, workspaceId }: { phone: string; workspaceId: string }) {
  if (!phone || !workspaceId) {
    throw new Error('Missing phone or workspaceId');
  }

  try {
    // Find customer
    const customer = await prisma.customers.findFirst({
      where: { phone, workspaceId }
    });
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get workspace and admin email
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        whatsappSettings: true,
      }
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Disable chatbot for this customer
    await prisma.customers.update({
      where: { id: customer.id },
      data: { activeChatbot: false }
    });

    // Get recent chat messages for summary
    const recentMessages = await prisma.messages.findMany({
      where: {
        workspaceId: workspaceId,
        phone: phone,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Create chat summary
    let chatSummary = 'Nessun messaggio recente disponibile.';
    if (recentMessages.length > 0) {
      const messageTexts = recentMessages
        .reverse() // Show oldest first
        .map(msg => `${msg.direction === 'INBOUND' ? '👤 Cliente' : '🤖 Bot'}: ${msg.body}`)
        .join('\n');
      chatSummary = messageTexts;
    }

    // Send email notification to admin if email is configured
    const adminEmail = workspace.whatsappSettings?.adminEmail;
    if (adminEmail) {
      const emailService = new EmailService();
      
      try {
        await emailService.sendOperatorNotificationEmail({
          to: adminEmail,
          customerName: customer.name || phone,
          chatSummary: chatSummary,
          workspaceName: workspace.name,
          // TODO: Add chatId if chat system is available
        });
        
        logger.info(`Operator notification email sent to ${adminEmail} for customer ${customer.name || phone}`);
      } catch (emailError) {
        logger.error(`Failed to send operator notification email: ${emailError}`);
        // Continue execution even if email fails
      }
    } else {
      logger.warn(`No admin email configured for workspace ${workspaceId}, skipping email notification`);
    }

    return {
      message: 'Certo, verrà contattato il prima possibile dal nostro operatore.'
    };
  } catch (error) {
    logger.error(`Error in ContactOperator: ${error}`);
    throw error;
  }
} 