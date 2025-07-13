import { prisma } from '../../lib/prisma';

/**
 * ContactOperator Calling Function
 *
 * This function is used to handle operator intervention requests from users.
 * When called, it sets the 'activeChatbot' field to false for the customer matching the given phone and workspaceId.
 * It returns a confirmation message to the user: "Certo, verrà contattato il prima possibile dal nostro operatore."
 *
 * Parameters:
 *   - phone: string (the customer's phone number)
 *   - workspaceId: string (the workspace context)
 *
 * Usage:
 *   - Used by N8N or the chatbot when a user requests to speak with a human operator.
 *   - After this call, the chatbot will no longer respond to the user until reactivated manually.
 */
export async function ContactOperator({ phone, workspaceId }: { phone: string; workspaceId: string }) {
  if (!phone || !workspaceId) {
    throw new Error('Missing phone or workspaceId');
  }
  const customer = await prisma.customers.findFirst({
    where: { phone, workspaceId }
  });
  if (!customer) {
    throw new Error('Customer not found');
  }
  await prisma.customers.update({
    where: { id: customer.id },
    data: { activeChatbot: false }
  });
  return {
    message: 'Certo, verrà contattato il prima possibile dal nostro operatore.'
  };
} 