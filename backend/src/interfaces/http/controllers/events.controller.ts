import { Request, Response } from "express";
import { eventsService } from "../../../services/events.service";
import { AppError } from "../middlewares/error.middleware";

export class EventsController {
  async getEventsForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params

      const events = await eventsService.getAllForWorkspace(workspaceId)

      return res.status(200).json(events)
    } catch (error) {
      throw new AppError(500, "Failed to get events")
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params

      const event = await eventsService.getById(id, workspaceId)

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      return res.status(200).json(event)
    } catch (error) {
      throw new AppError(500, "Failed to get event")
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      // Estrai il workspaceId dall'URL se non è presente nei parametri
      let workspaceId = req.params.workspaceId;
      
      if (!workspaceId) {
        // Prova a estrarre l'ID dal percorso URL
        const urlParts = req.originalUrl.split('/');
        const workspaceIndex = urlParts.findIndex(part => part === 'workspaces');
        if (workspaceIndex !== -1 && workspaceIndex + 1 < urlParts.length) {
          workspaceId = urlParts[workspaceIndex + 1];
        }
      }
      
      if (!workspaceId) {
        throw new AppError(400, "Workspace ID is required - 1");
      }
      
      const { 
        name, 
        description, 
        startDate, 
        endDate, 
        location, 
        price, 
        currency, 
        isActive,
        maxAttendees 
      } = req.body
      
      // Validazione dei campi obbligatori
      if (!name || !description || !startDate || !endDate || !location || price === undefined) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          required: ["name", "description", "startDate", "endDate", "location", "price"] 
        });
      }

      // Ensure we're handling the date correctly whether it's a string or ISO format
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new AppError(400, "Invalid date format");
      }
      
      // Verifica che la data di inizio sia precedente alla data di fine
      if (parsedStartDate >= parsedEndDate) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }

      const result = await eventsService.create({
        name,
        description,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        location,
        price: parseFloat(price),
        workspaceId,
        currency: currency || "EUR",
        isActive: isActive !== undefined ? isActive : true,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined
      })

      return res.status(201).json(result)
    } catch (error) {
      if (error.message === "workspaceId is required") {
        return res.status(400).json({ message: "Workspace ID is required -  Create" });
      }
      throw new AppError(500, "Failed to create event")
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params
      const { 
        name, 
        description, 
        startDate, 
        endDate, 
        location, 
        price, 
        currency, 
        isActive,
        maxAttendees,
        currentAttendees
      } = req.body

      // Parse dates if they exist
      let parsedStartDate, parsedEndDate;
      
      if (startDate) {
        parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
          throw new AppError(400, "Invalid start date format");
        }
      }
      
      if (endDate) {
        parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          throw new AppError(400, "Invalid end date format");
        }
      }
      
      // Verifica che la data di inizio sia precedente alla data di fine se entrambe sono presenti
      if (parsedStartDate && parsedEndDate && parsedStartDate >= parsedEndDate) {
        return res.status(400).json({ message: "Start date must be before end date" });
      }

      const priceValue = price !== undefined ? parseFloat(price) : undefined
      
      const result = await eventsService.update(id, workspaceId, {
        name,
        description,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        location,
        price: priceValue,
        currency,
        isActive,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        currentAttendees: currentAttendees ? parseInt(currentAttendees) : undefined
      })

      if (!result) {
        return res.status(404).json({ message: "Event not found" })
      }

      return res.status(200).json(result)
    } catch (error) {
      if (error.message === "Event not found") {
        return res.status(404).json({ message: "Event not found" })
      }
      throw new AppError(500, "Failed to update event")
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params

      const event = await eventsService.getById(id, workspaceId)

      if (!event) {
        return res.status(404).json({ message: "Event not found" })
      }

      await eventsService.delete(id, workspaceId)

      return res.status(204).send()
    } catch (error) {
      throw new AppError(500, "Failed to delete event")
    }
  }
} 