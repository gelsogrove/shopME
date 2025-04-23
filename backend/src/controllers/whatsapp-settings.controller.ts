import { NextFunction, Request, Response } from "express"
import fs from "fs"
import path from "path"
import { prisma } from "../lib/prisma"

export const whatsappSettingsController = {
  async getGdpr(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      
      const settings = await prisma.whatsappSettings.findUnique({
        where: { workspaceId },
        select: { gdpr: true }
      })
      
      res.json(settings || { gdpr: null })
    } catch (error) {
      next(error)
    }
  },

  async updateGdpr(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      const { gdpr } = req.body
      
      const existingSettings = await prisma.whatsappSettings.findUnique({
        where: { workspaceId }
      })
      
      let settings
      
      if (existingSettings) {
        // Update existing settings
        settings = await prisma.whatsappSettings.update({
          where: { workspaceId },
          data: { gdpr }
        })
      } else {
        // Create new settings with empty values for required fields
        settings = await prisma.whatsappSettings.create({
          data: {
            workspaceId,
            gdpr,
            phoneNumber: "",
            apiKey: ""
          }
        })
      }
      
      res.json(settings)
    } catch (error) {
      next(error)
    }
  },
  
  async getDefaultGdpr(_req: Request, res: Response, next: NextFunction) {
    try {
      const filePath = path.join(__dirname, '../../..', 'finalproject-AG', 'GDPR.md')
      const content = fs.readFileSync(filePath, 'utf8')
      res.json({ content })
    } catch (error) {
      next(error)
    }
  }
} 