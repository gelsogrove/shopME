import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import logger from "../utils/logger";

export class UnknownCustomersController {
  /**
   * Count all "Unknown Customer" records in a workspace
   */
  async countUnknownCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      
      logger.info(`Counting unknown customers for workspace: ${workspaceId}`);
      
      const count = await prisma.customers.count({
        where: {
          workspaceId,
          isActive: true,
          name: 'Unknown Customer'
        }
      });
      
      logger.info(`Found ${count} unknown customers for workspace: ${workspaceId}`);
      
      res.json({ count });
    } catch (error) {
      logger.error(`Error counting unknown customers: ${error}`);
      next(error);
    }
  }
} 