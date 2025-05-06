import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../../lib/prisma';

export class RegistrationController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        email,
        first_name,
        last_name,
        company,
        phone,
        workspace_id,
        language,
        currency,
        gdpr_consent,
        push_notifications_consent
      } = req.body;
      
      // Validate required fields
      if (!email || !first_name || !last_name || !company || !phone || !workspace_id || !gdpr_consent) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      // Create new customer
      const customer = await prisma.customers.create({
        data: {
          name: `${first_name} ${last_name}`,
          email,
          phone,
          company,
          workspaceId: workspace_id,
          language: language || 'English',
          currency: currency || 'EUR',
          last_privacy_version_accepted: gdpr_consent ? '1.0.0' : null,
          privacy_accepted_at: gdpr_consent ? new Date() : null,
          push_notifications_consent: push_notifications_consent || false,
          push_notifications_consent_at: push_notifications_consent ? new Date() : null,
          isActive: true
        }
      });

      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }
} 